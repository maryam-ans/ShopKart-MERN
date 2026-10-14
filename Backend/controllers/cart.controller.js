import mongoose from "mongoose";
import customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// POST /cart/:productId - Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    const user = await customer.findById(req.customer?._id || req.user?._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const existingIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    let newQuantity = 1;
    if (existingIndex > -1) {
      newQuantity = user.cart[existingIndex].quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${product.stock})`,
        });
      }
      user.cart[existingIndex].quantity = newQuantity;
    } else {
      user.cart.push({ product: product._id, quantity: 1 });
    }

    await user.save();

    const populatedUser = await customer.findById(user._id).populate({
      path: "cart.product",
      select: "name price category image stock",
    });

    const validCart = (populatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: validCart,
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

// GET /cart - Get current user's cart
export const getCart = async (req, res) => {
  try {
    const user = await customer.findById(req.customer?._id || req.user?._id).populate({
      path: "cart.product",
      select: "name price category image stock",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      cart: validCart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

// PATCH /cart/:productId - Update item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const user = await customer.findById(req.customer?._id || req.user?._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const itemIndex = (user.cart || []).findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let targetQuantity;
    if (quantity !== undefined) {
      targetQuantity = parseInt(quantity, 10);
      if (isNaN(targetQuantity)) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a valid number",
        });
      }
    } else if (action === "increase") {
      targetQuantity = user.cart[itemIndex].quantity + 1;
    } else if (action === "decrease") {
      targetQuantity = user.cart[itemIndex].quantity - 1;
    } else {
      return res.status(400).json({
        success: false,
        message: "Must provide quantity or valid action ('increase' / 'decrease')",
      });
    }

    if (targetQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be less than 1",
      });
    }

    if (targetQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock})`,
      });
    }

    user.cart[itemIndex].quantity = targetQuantity;
    await user.save();

    const populatedUser = await customer.findById(user._id).populate({
      path: "cart.product",
      select: "name price category image stock",
    });

    const validCart = (populatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: validCart,
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

// DELETE /cart/:productId - Remove product from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const user = await customer.findById(req.customer?._id || req.user?._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const itemExists = (user.cart || []).some(
      (item) => item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    await user.save();

    const populatedUser = await customer.findById(user._id).populate({
      path: "cart.product",
      select: "name price category image stock",
    });

    const validCart = (populatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: validCart,
    });
  } catch (error) {
    console.error("Remove From Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
    });
  }
};
