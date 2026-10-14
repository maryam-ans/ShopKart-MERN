import { axiosInstance } from "../../axios/axiosCalls";

// PRODUCTS
export const getProducts = async ({ search = "", category = "", signal } = {}) => {
  const params = {};

  if (search.trim()) {
    params.search = search.trim();
  }

  if (category) {
    params.category = category;
  }

  const response = await axiosInstance.get("/products", { params, signal });
  return response.data.products;
};

export const getProductById = async (id, signal) => {
  const response = await axiosInstance.get(`/products/${id}`, { signal });
  return response.data.product;
};

// WISHLIST
export const addProductToWishlist = async (productId) => {
  const response = await axiosInstance.post(`/wishlist/${productId}`);
  return response.data;
};

export const getWishlist = async (signal) => {
  const response = await axiosInstance.get("/wishlist", { signal });
  return response.data.wishlist;
};

export const removeProductFromWishlist = async (productId) => {
  const response = await axiosInstance.delete(`/wishlist/${productId}`);
  return response.data;
};

// CART
export const getCart = async (signal) => {
  const response = await axiosInstance.get("/cart", { signal });
  return response.data.cart;
};

export const addToCart = async (productId) => {
  const response = await axiosInstance.post(`/cart/${productId}`);
  return response.data;
};

export const updateCartItem = async (productId, { quantity, action }) => {
  const payload = {};
  if (quantity !== undefined) payload.quantity = quantity;
  if (action !== undefined) payload.action = action;

  const response = await axiosInstance.patch(`/cart/${productId}`, payload);
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await axiosInstance.delete(`/cart/${productId}`);
  return response.data;
};

// ORDERS & CHECKOUT
export const createPaymentOrder = async (shippingAddress) => {
  const response = await axiosInstance.post("/orders/create-payment-order", {
    shippingAddress,
  });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await axiosInstance.post("/orders/verify-payment", paymentData);
  return response.data;
};

export const getUserOrders = async (signal) => {
  const response = await axiosInstance.get("/orders", { signal });
  return response.data.orders;
};

export const getOrderById = async (id, signal) => {
  const response = await axiosInstance.get(`/orders/${id}`, { signal });
  return response.data.order;
};

export const updateOrderStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/orders/${id}/status`, { status });
  return response.data;
};