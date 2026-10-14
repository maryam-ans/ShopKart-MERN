import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import SearchBar from "../../components/SerchBar";
import { axiosInstance } from "../../axios/axiosCalls";
import { useAuth } from "../../context/useAuth";
import { addProductToWishlist, getProducts, getWishlist } from "../servies/api";

const categories = ["Electronics", "Fashion", "Books", "Home"];

function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingProductId, setPendingProductId] = useState(null);
  const [wishlistedProductIds, setWishlistedProductIds] = useState([]);
  const { setCustomer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    getProducts({ search, category, signal: controller.signal })
      .then(setProducts)
      .catch((requestError) => {
        if (requestError.name !== "CanceledError" && requestError.code !== "ERR_CANCELED") {
          setError("Something went wrong while loading products.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [search, category]);

  useEffect(() => {
    const controller = new AbortController();

    getWishlist(controller.signal)
      .then((wishlist) => {
        setWishlistedProductIds(wishlist.map((product) => product._id));
      })
      .catch(() => {
        setWishlistedProductIds([]);
      });

    return () => controller.abort();
  }, []);

  const handleAddToWishlist = async (productId) => {
    if (pendingProductId || wishlistedProductIds.includes(productId)) {
      return;
    }

    setPendingProductId(productId);
    setError("");

    try {
      await addProductToWishlist(productId);
      setWishlistedProductIds((previous) => [...previous, productId]);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Unable to save product. Please try again.";
      setError(message);
    } finally {
      setPendingProductId(null);
    }
  };

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

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Discover something new</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Product catalogue</h1>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <SearchBar
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setLoading(true);
                setError("");
              }}
            />
            <label className="sr-only" htmlFor="product-category">Filter by category</label>
            <select
              id="product-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setLoading(true);
                setError("");
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="">All Categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-10">
          {loading && <p className="py-16 text-center text-lg text-slate-600">Loading products...</p>}
          {!loading && error && !error.includes("save product") && (
            <p className="py-16 text-center text-lg text-rose-600" role="alert">{error}</p>
          )}
          {!loading && !error && products.length === 0 && (
            <p className="py-16 text-center text-lg text-slate-600">No products found.</p>
          )}
          {!loading && !error && products.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToWishlist={handleAddToWishlist}
                  isWishlisted={wishlistedProductIds.includes(product._id)}
                  wishlistLoading={pendingProductId === product._id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Products;