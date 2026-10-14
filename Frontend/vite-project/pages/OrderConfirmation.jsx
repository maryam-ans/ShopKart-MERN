import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getOrderById } from "../servies/api";
import { useAuth } from "../../context/useAuth";
import { axiosInstance } from "../../axios/axiosCalls";

function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { setCustomer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    getOrderById(id, controller.signal)
      .then(setOrder)
      .catch((err) => {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          setError("Failed to load order details.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/customers/logout");
      setCustomer(null);
      navigate("/login", { replace: true });
    } catch {
      setError("Unable to log out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onLogout={handleLogout} />

      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        {loading && (
          <div className="py-20 text-center">
            <p className="text-lg text-slate-600">Loading order details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <p className="text-4xl">⚠️</p>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Unable to load order</h2>
            <p className="mt-2 text-slate-600">{error}</p>
            <Link
              to="/orders"
              className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500"
            >
              View My Orders
            </Link>
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-8">
            {/* Success Hero */}
            <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 text-center shadow-sm">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
                ✓
              </div>
              <h1 className="mt-6 text-3xl sm:text-4xl font-black text-slate-950">
                Order Placed Successfully!
              </h1>
              <p className="mt-3 text-slate-600">
                Thank you for your purchase. We have received your order and payment.
              </p>
              <div className="mt-6 inline-flex flex-wrap justify-center gap-3 text-sm">
                <span className="rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-700">
                  Order ID: {order._id}
                </span>
                <span className="rounded-full bg-emerald-50 px-4 py-1.5 font-bold text-emerald-700">
                  Payment: {order.paymentStatus}
                </span>
                <span className="rounded-full bg-violet-50 px-4 py-1.5 font-bold text-violet-700">
                  Status: {order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Items Ordered</h2>

              <div className="mt-6 divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-500">
                        Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span className="font-bold text-slate-950">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4 flex justify-between text-lg font-bold text-slate-950">
                <span>Total Amount Paid</span>
                <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Delivery Address</h2>
              <div className="mt-4 text-sm text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/orders"
                className="rounded-xl bg-violet-600 px-6 py-3 text-center font-bold text-white transition hover:bg-violet-500"
              >
                View All Orders
              </Link>
              <Link
                to="/products"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrderConfirmation;
