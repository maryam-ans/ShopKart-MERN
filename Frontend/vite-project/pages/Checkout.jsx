import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/useCart";
import { useAuth } from "../../context/useAuth";
import { createPaymentOrder, verifyPayment } from "../servies/api";
import { axiosInstance } from "../../axios/axiosCalls";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { customer, setCustomer } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: customer?.fullName || "",
    phone: customer?.phone || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [simulatedOrderData, setSimulatedOrderData] = useState(null);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/customers/logout");
      setCustomer(null);
      navigate("/login", { replace: true });
    } catch {
      setApiError("Unable to log out. Please try again.");
    }
  };

  const handleChange = (e) => {
    setShippingAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (formErrors[e.target.name]) {
      setFormErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!shippingAddress.fullName.trim()) errors.fullName = "Full name is required";
    if (!shippingAddress.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      errors.phone = "Phone number must be exactly 10 digits";
    }
    if (!shippingAddress.addressLine1.trim()) errors.addressLine1 = "Street address is required";
    if (!shippingAddress.city.trim()) errors.city = "City is required";
    if (!shippingAddress.state.trim()) errors.state = "State is required";
    if (!shippingAddress.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      errors.pincode = "Pincode must be exactly 6 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSuccess = async (paymentData, orderId) => {
    try {
      const res = await verifyPayment({
        shopKartOrderId: orderId,
        orderId,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });

      if (res?.success) {
        clearCart();
        navigate(`/order-confirmation/${orderId}`, { replace: true });
      } else {
        setApiError("Payment verification failed. Your cart has been preserved.");
      }
    } catch (err) {
      setApiError(
        err?.response?.data?.message || "Payment verification failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!cart || cart.length === 0) {
      setApiError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setApiError("");

    try {
      const orderInit = await createPaymentOrder(shippingAddress);

      if (!orderInit?.success) {
        setApiError("Failed to initiate order. Please try again.");
        setSubmitting(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && window.Razorpay) {
        const options = {
          key: orderInit.key || orderInit.keyId,
          amount: orderInit.amount,
          currency: orderInit.currency || "INR",
          name: "ShopKart",
          description: `Order #${orderInit.orderId || orderInit.shopKartOrderId}`,
          order_id: orderInit.razorpayOrderId,
          prefill: {
            name: shippingAddress.fullName,
            contact: shippingAddress.phone,
            email: customer?.email || "",
          },
          theme: {
            color: "#7c3aed",
          },
          handler: (response) => {
            handlePaymentSuccess(response, orderInit.orderId || orderInit.shopKartOrderId);
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          setApiError(
            "Payment failed. Your cart has not been cleared. Please try again. " +
              (response.error?.description || "")
          );
          setSubmitting(false);
        });
        rzp.open();
      } else {
        // Fallback for sandboxed/offline environment: Provide simulated verification
        setSimulatedOrderData(orderInit);
      }
    } catch (err) {
      setApiError(
        err?.response?.data?.message || "Failed to create order. Please check stock and try again."
      );
      setSubmitting(false);
    }
  };

  const handleSimulatedPayment = () => {
    if (!simulatedOrderData) return;
    handlePaymentSuccess(
      {
        razorpay_order_id: simulatedOrderData.razorpayOrderId,
        razorpay_payment_id: "pay_simulated_" + Date.now(),
        razorpay_signature: "test_signature_valid",
      },
      simulatedOrderData.orderId
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Checkout
          </h1>
          <p className="mt-2 text-slate-600">
            Enter your delivery information and complete payment
          </p>
        </div>

        {apiError && (
          <div
            className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            {apiError}
          </div>
        )}

        {simulatedOrderData && (
          <div className="mb-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-indigo-900 shadow-sm">
            <h3 className="text-lg font-bold">Razorpay Test Mode (Simulation)</h3>
            <p className="mt-1 text-sm">
              Order #{simulatedOrderData.orderId} initialized. Amount: ₹
              {(simulatedOrderData.amount / 100).toLocaleString("en-IN")}.
            </p>
            <button
              type="button"
              onClick={handleSimulatedPayment}
              disabled={submitting}
              className="mt-4 rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? "Verifying..." : "Simulate Successful Test Payment"}
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Shipping Form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">Shipping Details</h2>

            <form onSubmit={handlePlaceOrder} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Address Line
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={handleChange}
                  placeholder="House / Flat No., Street, Area"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
                {formErrors.addressLine1 && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.addressLine1}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                  {formErrors.state && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleChange}
                    placeholder="6-digit PIN"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                  {formErrors.pincode && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.pincode}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 w-full rounded-xl bg-violet-600 px-6 py-3.5 font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
              >
                {submitting ? "Processing Order..." : `Pay ₹${cartTotal.toLocaleString("en-IN")} via Razorpay`}
              </button>
            </form>
          </section>

          {/* Order Review */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>

            <div className="mt-4 divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {cart.map((item) => {
                const prod = item.product || {};
                return (
                  <div key={prod._id} className="py-3 flex justify-between gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{prod.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-slate-950">
                      ₹{((prod.price || 0) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ₹{cartTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-950 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Link
              to="/cart"
              className="mt-6 block text-center text-sm font-semibold text-violet-600 hover:underline"
            >
              ← Back to Cart
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Checkout;
