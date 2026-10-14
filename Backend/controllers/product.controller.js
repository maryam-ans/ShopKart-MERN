import mongoose from "mongoose";
import Product from "../models/product.model.js";

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const query = {};

    // Search by product name
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.name = {
        $regex: escapedSearch,
        $options: "i",
      };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query).select(
      "name price category image stock"
    );

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    // Product doesn't exist
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};