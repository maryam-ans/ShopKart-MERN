import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getUserOrders, updateOrderStatus } from "../servies/api";
import { useAuth } from "../../context/useAuth";
import { axiosInstance } from "../../axios/axiosCalls";

const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const { setCustomer } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const data = await getUserOrders(signal);
      setOrders(data || []);
    } catch (err) {
      if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
        setError("Failed to load your orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/customers/logout");
      setCustomer(null);
      navigate("/login", { replace: true });
    } catch {
      setError("Unable to log out. Please try again.");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res?.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
        );
      }
    } catch (err) {
      setError("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            My Orders
          </h1>
          <p className="mt-2 text-slate-600">
            View, track, and manage your purchase history
          </p>
        </div>

        {error && (
          <div
            className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="py-20 text-center">
            <p className="text-lg text-slate-600">Loading your orders...</p>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">📦</div>
            <h2 className="mt-6 text-3xl font-bold text-slate-900">
              No orders yet
            </h2>
            <p className="mt-3 text-slate-600">
              You haven't placed any orders with ShopKart yet.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-8">
            {orders.map((order) => {
              const currentStepIndex = STATUS_STEPS.indexOf(order.status);

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Order Placed
                      </span>
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Total
                      </span>
                      <p className="text-sm font-bold text-slate-950">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Order #
                      </span>
                      <p className="text-sm font-mono text-slate-600">{order._id}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Progression Stepper (Bonus Challenge) */}
                  <div className="border-b border-slate-100 bg-slate-50/30 px-6 py-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                      <span>Order Progress</span>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">Simulate status:</label>
                        <select
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-violet-500"
                        >
                          {STATUS_STEPS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = currentStepIndex >= idx;
                        const isCurrent = currentStepIndex === idx;

                        return (
                          <div key={step} className="text-center">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : "bg-slate-200"
                              }`}
                            />
                            <p
                              className={`mt-1.5 text-[11px] font-semibold ${
                                isCurrent
                                  ? "text-violet-600 font-bold"
                                  : isCompleted
                                  ? "text-emerald-700"
                                  : "text-slate-400"
                              }`}
                            >
                              {step}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-6">
                    <div className="divide-y divide-slate-100">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row items-center gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-20 w-20 rounded-xl object-cover"
                            />
                          )}
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-bold text-slate-900">{item.name}</h4>
                            <p className="text-sm text-slate-500">
                              Quantity: {item.quantity} × ₹
                              {item.price.toLocaleString("en-IN")} (purchase price)
                            </p>
                          </div>
                          <span className="font-bold text-slate-950">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping summary & link */}
                    <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-slate-500">
                      <div>
                        <span className="font-semibold text-slate-700">Delivered to: </span>
                        {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1},{" "}
                        {order.shippingAddress.city} ({order.shippingAddress.pincode})
                      </div>
                      <Link
                        to={`/order-confirmation/${order._id}`}
                        className="font-semibold text-violet-600 hover:underline"
                      >
                        View Receipt →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
