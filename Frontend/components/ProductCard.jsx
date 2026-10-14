import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";

function ProductCard({
  product,
  onAddToWishlist,
  isWishlisted = false,
  wishlistLoading = false,
}) {
  const { addToCart } = useCart() || {};
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  const isInStock = product.stock > 0;
  const isSaving = wishlistLoading && !isWishlisted;

  const handleAddToCart = async () => {
    if (!isInStock || cartLoading || !addToCart) return;
    setCartLoading(true);
    setCartSuccess(false);
    const res = await addToCart(product._id);
    setCartLoading(false);
    if (res?.success) {
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2000);
    }
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <img
        src={product.image}
        alt={product.name}
        className="h-56 w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
          {product.category}
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">{product.name}</h2>
        <p className="mt-3 text-2xl font-bold text-slate-950">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
        <p className={`mt-2 text-sm font-medium ${isInStock ? "text-emerald-600" : "text-rose-600"}`}>
          {isInStock ? `${product.stock} units left` : "Out of stock"}
        </p>

        <div className="mt-5 space-y-3">
          <Link
            to={`/products/${product._id}`}
            className="block rounded-xl bg-slate-900 px-4 py-2.5 text-center font-semibold text-white transition hover:bg-slate-800"
          >
            View Details
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isInStock || cartLoading}
            className={`w-full rounded-xl px-4 py-2.5 font-semibold text-white transition ${
              !isInStock
                ? "cursor-not-allowed bg-slate-300"
                : cartSuccess
                ? "bg-emerald-600"
                : "bg-violet-600 hover:bg-violet-500"
            }`}
          >
            {!isInStock
              ? "Out of Stock"
              : cartLoading
              ? "Adding..."
              : cartSuccess
              ? "✓ Added to Cart"
              : "Add to Cart"}
          </button>

          {onAddToWishlist ? (
            <button
              type="button"
              onClick={() => onAddToWishlist(product._id)}
              disabled={isSaving || isWishlisted}
              className={`w-full rounded-xl border px-4 py-2 font-semibold transition ${
                isWishlisted
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : isSaving
                  ? "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-600"
              }`}
            >
              {isSaving ? "⏳ Saving..." : isWishlisted ? "♥️ Added to Wishlist" : "♡ Add to Wishlist"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;