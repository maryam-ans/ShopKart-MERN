import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById, addProductToWishlist, getWishlist } from "../servies/api";
import { useCart } from "../../context/useCart";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const { addToCart } = useCart() || {};

  useEffect(() => {
    const controller = new AbortController();

    getProductById(id, controller.signal)
      .then(setProduct)
      .catch((requestError) => {
        if (requestError.name !== "CanceledError" && requestError.code !== "ERR_CANCELED") {
          setError("Something went wrong while loading this product.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    getWishlist(controller.signal)
      .then((wishlist) => {
        const found = (wishlist || []).some((item) => item._id === id);
        setIsWishlisted(found);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0 || cartLoading || !addToCart) return;
    setCartLoading(true);
    setCartSuccess(false);
    const res = await addToCart(product._id);
    setCartLoading(false);
    if (res?.success) {
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2000);
    }
  };

  const handleAddToWishlist = async () => {
    if (isWishlisted || wishlistLoading) return;
    setWishlistLoading(true);
    try {
      await addProductToWishlist(product._id);
      setIsWishlisted(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add to wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 lg:px-12">
        <Link to="/home" className="text-2xl font-bold text-slate-900">
          ShopKart
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/products" className="font-semibold text-violet-600 hover:text-violet-500">
            Back to products
          </Link>
          <Link to="/cart" className="font-semibold text-slate-700 hover:text-slate-900">
            View Cart
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        {loading && <p className="py-16 text-center text-lg text-slate-600">Loading product...</p>}
        {!loading && error && (
          <p className="py-16 text-center text-lg text-rose-600" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && product && (
          <article className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
            <img
              src={product.image}
              alt={product.name}
              className="h-full min-h-80 w-full object-cover"
            />
            <div className="p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  {product.category}
                </p>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
                  {product.name}
                </h1>
                <p className="mt-6 text-3xl font-bold text-slate-950">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
                <p className="mt-6 leading-7 text-slate-600">{product.description}</p>
                <p
                  className={`mt-6 font-semibold ${
                    product.stock > 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || cartLoading}
                  className={`w-full rounded-xl px-5 py-3 font-semibold text-white transition ${
                    product.stock === 0
                      ? "cursor-not-allowed bg-slate-300"
                      : cartSuccess
                      ? "bg-emerald-600"
                      : "bg-violet-600 hover:bg-violet-500"
                  }`}
                >
                  {product.stock === 0
                    ? "Out of Stock"
                    : cartLoading
                    ? "Adding..."
                    : cartSuccess
                    ? "✓ Added to Cart!"
                    : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  disabled={isWishlisted || wishlistLoading}
                  className={`w-full rounded-xl border px-5 py-3 font-semibold transition ${
                    isWishlisted
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : wishlistLoading
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-600"
                  }`}
                >
                  {wishlistLoading
                    ? "⏳ Saving..."
                    : isWishlisted
                    ? "♥️ Added to Wishlist"
                    : "♡ Add to Wishlist"}
                </button>
              </div>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

export default ProductDetails;