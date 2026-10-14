import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cart.controller.js";

export const cartRouter = express.Router();

cartRouter.post("/:productId", isAuthenticated, addToCart);
cartRouter.get("/", isAuthenticated, getCart);
cartRouter.patch("/:productId", isAuthenticated, updateCartItem);
cartRouter.delete("/:productId", isAuthenticated, removeFromCart);

export default cartRouter;
