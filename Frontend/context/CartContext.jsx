import { useEffect, useState, useCallback } from "react";
import { CartContext } from "./cart-context";
import { useAuth } from "./useAuth";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
} from "../vite-project/servies/api";

export const CartProvider = ({ children }) => {
  const { customer } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCart = useCallback(async () => {
    if (!customer) {
      setCart([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const items = await getCart();
      setCart(items || []);
    } catch (err) {
      // Don't show critical error on initial background fetch
      console.warn("Could not load cart:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId) => {
    setError("");
    try {
      const res = await apiAddToCart(productId);
      if (res?.cart) {
        setCart(res.cart);
      } else {
        await fetchCart();
      }
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add product to cart";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (productId, { quantity, action }) => {
    setError("");
    try {
      const res = await apiUpdateCartItem(productId, { quantity, action });
      if (res?.cart) {
        setCart(res.cart);
      } else {
        await fetchCart();
      }
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update item quantity";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const removeFromCart = async (productId) => {
    setError("");
    try {
      const res = await apiRemoveFromCart(productId);
      if (res?.cart) {
        setCart(res.cart);
      } else {
        setCart((prev) => prev.filter((item) => (item.product?._id || item.product) !== productId));
      }
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to remove item from cart";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // Derived calculations
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  const cartTotal = cart.reduce(
    (total, item) => total + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        loading,
        error,
        setError,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
