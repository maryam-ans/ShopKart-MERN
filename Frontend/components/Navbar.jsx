import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/useCart";

function Navbar({ onLogout }) {
  const { cartCount = 0 } = useCart() || {};

  const navItems = [
    { label: "Home", to: "/home" },
    { label: "Products", to: "/products" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Cart", to: "/cart", isCart: true },
    { label: "Orders", to: "/orders" },
  ];

  return (
    <nav className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-white px-6 py-4 lg:px-12 gap-4">
      <Link
        to="/home"
        className="text-2xl font-bold tracking-tight text-slate-900 transition hover:text-slate-700"
      >
        ShopKart
      </Link>

      <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
                  isActive
                    ? "bg-violet-50 font-semibold text-violet-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <span>{item.label}</span>
              {item.isCart && cartCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {onLogout && (
          <div className="flex items-center pl-2 sm:pl-4 sm:border-l sm:border-slate-200">
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
