import mongoose from "mongoose";
import Order from "../models/order.model.js";
import customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayConfig,
} from "../utils/razorpay.js";

// POST /orders/create-payment-order
export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const userId = req.customer?._id || req.user?._id;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required",
      });
    }

    if (!/^\d{10}$/.test(String(phone).trim())) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be a valid 10-digit number",
      });
    }

    if (!/^\d{6}$/.test(String(pincode).trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain 6 digits",
      });
    }

    const user = await customer.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Load latest product data from database and verify stock
    const snapshotItems = [];
    let calculatedTotal = 0;

    for (const cartItem of user.cart) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "One or more products in cart no longer exist",
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      calculatedTotal += itemTotal;

      snapshotItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
    }

    // Create pending ShopKart order document
    const order = new Order({
      user: user._id,
      items: snapshotItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      totalAmount: calculatedTotal,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    await order.save();

    // Create Razorpay Order in paise
    const rzpOrder = await createRazorpayOrder({
      amount: calculatedTotal,
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    const { keyId } = getRazorpayConfig();

    return res.status(200).json({
      success: true,
      shopKartOrderId: order._id,
      orderId: order._id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency || "INR",
      key: keyId,
      keyId,
    });
  } catch (error) {
    console.error("Create Payment Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize payment order",
    });
  }
};

// POST /orders/verify-payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    const userId = req.customer?._id || req.user?._id;

    if (!razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters",
      });
    }

    // Find order using shopKartOrderId / orderId or razorpayOrderId
    const targetId = shopKartOrderId || orderId;
    let order;

    if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
      order = await Order.findById(targetId);
    } else if (razorpay_order_id) {
      order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ownership check: customer must own the order
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized order access",
      });
    }

    // Verify signature using the order's trusted razorpayOrderId stored in the database
    const isValid = verifyRazorpaySignature({
      razorpayOrderId: order.razorpayOrderId || razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValid) {
      order.paymentStatus = "FAILED";
      await order.save();
      // SECURITY RULE: Never clear cart if signature verification failed!
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // Mark payment PAID and order PLACED
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    // Decrement stock for purchased items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user cart only after successful payment verification
    const user = await customer.findById(userId);
    if (user) {
      user.cart = [];
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

// GET /orders - Get current user orders (newest first)
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.customer?._id || req.user?._id;

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// GET /orders/:id - Get single order
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.customer?._id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Enforce ownership: user must own the order
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

// BONUS CHALLENGE (+10 Marks): PATCH /orders/:id/status - Update order status progression
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};
