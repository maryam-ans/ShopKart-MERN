import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getWishlist, removeProductFromWishlist } from '../servies/api';
import { useAuth } from '../../context/useAuth';
import { axiosInstance } from '../../axios/axiosCalls';

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const { setCustomer } = useAuth();
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');

    try {
      const products = await getWishlist();
      setWishlist(products);
    } catch {
      setError('Unable to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    if (removingId) {
      return;
    }

    setRemovingId(productId);

    try {
      await removeProductFromWishlist(productId);
      setWishlist((previous) => previous.filter((product) => product._id !== productId));
    } catch {
      setError('Unable to remove product. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/customers/logout');
      setCustomer(null);
      navigate('/login', { replace: true });
    } catch {
      setError('Unable to log out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {loading && (
          <div className="py-16 text-center">
            <p className="text-lg text-slate-600">Loading your wishlist...</p>
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <p className="text-5xl">⚠️</p>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Something went wrong.</h2>
            <p className="mt-3 text-slate-600">We couldn't load your wishlist.</p>
            <button
              type="button"
              onClick={fetchWishlist}
              className="mt-6 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-500"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">❤️</div>
            <h2 className="mt-6 text-3xl font-bold text-slate-900">Your wishlist is empty ❤️</h2>
            <p className="mt-3 text-slate-600">Start saving products you love.</p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-500"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-black tracking-tight text-slate-950">My Wishlist</h1>
              <p className="mt-2 text-slate-600">{wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlist.map((product) => (
                <article key={product._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <img src={product.image} alt={product.name} className="h-52 w-full object-cover" />
                  <div className="p-5">
                    <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">{product.category}</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">{product.name}</h3>
                    <p className="mt-3 text-2xl font-bold text-slate-950">₹{product.price.toLocaleString('en-IN')}</p>
                    <p className={product.stock > 0 ? 'mt-2 text-sm font-medium text-emerald-600' : 'mt-2 text-sm font-medium text-rose-600'}>
                      {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
                    </p>

                    <div className="mt-5 space-y-3">
                      <Link
                        to={`/products/${product._id}`}
                        className="block rounded-xl bg-violet-600 px-4 py-3 text-center font-semibold text-white hover:bg-violet-500"
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(product._id)}
                        disabled={removingId === product._id}
                        className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed"
                      >
                        {removingId === product._id ? 'Removing...' : 'Remove from Wishlist'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Wishlist;