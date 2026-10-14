import express from "express";

import {
  createProduct,
  getProducts,
  getProductById,
} from "../controllers/product.controller.js";

export const productRouter = express.Router();

// POST /products
productRouter.post("/", createProduct);

// GET /products
productRouter.get("/", getProducts);

// GET /products/:id
productRouter.get("/:id", getProductById);

export default productRouter;