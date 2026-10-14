import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/useCart";
import { useAuth } from "../../context/useAuth";
import { axiosInstance } from "../../axios/axiosCalls";

function Cart() {
  const {
    cart,
    cartCount,
    cartTotal,
    loading,
    error,
    setError,
    updateQuantity,
    removeFromCart,
    fetchCart,
  } = useCart();
  const { setCustomer } = useAuth();
  const navigate = useNavigate();

  const [modifyingId, setModifyingId] = useState(null);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/customers/logout");
      setCustomer(null);
      navigate("/login", { replace: true });
    } catch {
      setError("Unable to log out. Please try again.");
    }
  };

  const handleQuantityChange = async (productId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxStock) {
      setError(`Cannot exceed available stock of ${maxStock}`);
      return;
    }
    setModifyingId(productId);
    setError("");
    await updateQuantity(productId, { quantity: newQty });
    setModifyingId(null);
  };

  const handleRemove = async (productId) => {
    setModifyingId(productId);
    setError("");
    await removeFromCart(productId);
    setModifyingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Shopping Cart
          </h1>
          <p className="mt-2 text-slate-600">
            {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
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
            <p className="text-lg text-slate-600">Loading your cart...</p>
          </div>
        )}

        {!loading && cart.length === 0 && (
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">🛒</div>
            <h2 className="mt-6 text-3xl font-bold text-slate-900">
              Your cart is empty
            </h2>
            <p className="mt-3 text-slate-600">
              Looks like you haven't added any products yet.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && cart.length > 0 && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items List */}
            <div className="space-y-4 lg:col-span-2">
              {cart.map((item) => {
                const product = item.product || {};
                const isItemModifying = modifyingId === product._id;
                const itemTotal = (product.price || 0) * item.quantity;

                return (
                  <article
                    key={product._id}
                    className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-28 w-28 rounded-xl object-cover"
                    />

                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                        {product.category}
                      </p>
                      <Link
                        to={`/products/${product._id}`}
                        className="mt-1 block text-lg font-bold text-slate-900 hover:text-violet-600"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        ₹{(product.price || 0).toLocaleString("en-IN")} each
                      </p>
                      <p className="mt-1 text-xs font-medium text-emerald-600">
                        {product.stock} units available
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            product._id,
                            item.quantity,
                            -1,
                            product.stock
                          )
                        }
                        disabled={item.quantity <= 1 || isItemModifying}
                        className="h-9 w-9 rounded-lg border border-slate-300 font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            product._id,
                            item.quantity,
                            1,
                            product.stock
                          )
                        }
                        disabled={item.quantity >= product.stock || isItemModifying}
                        className="h-9 w-9 rounded-lg border border-slate-300 font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Price and remove */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-950">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemove(product._id)}
                        disabled={isItemModifying}
                        className="mt-2 text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50"
                      >
                        {isItemModifying ? "Updating..." : "Remove"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Order Summary */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
              <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>

              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Items ({cartCount})</span>
                  <span className="font-semibold text-slate-900">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex justify-between text-base font-bold text-slate-950">
                  <span>Total Amount</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="mt-8 w-full rounded-xl bg-violet-600 px-6 py-3.5 font-bold text-white transition hover:bg-violet-500"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="mt-4 block text-center text-sm font-semibold text-violet-600 hover:underline"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
