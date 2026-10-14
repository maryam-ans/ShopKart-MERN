import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";

export const orderRouter = express.Router();

orderRouter.post("/create-payment-order", isAuthenticated, createPaymentOrder);
orderRouter.post("/verify-payment", isAuthenticated, verifyPayment);
orderRouter.get("/", isAuthenticated, getUserOrders);
orderRouter.get("/:id", isAuthenticated, getOrderById);
orderRouter.patch("/:id/status", updateOrderStatus);

export default orderRouter;
