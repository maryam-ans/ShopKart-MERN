import mongoose from 'mongoose'

import Product from '../models/product.model.js'
import customer from '../models/customer.model.js'

export const addProductToWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      })
    }

    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    const user = await customer.findById(req.customer._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const alreadyWishlisted = user.wishlist.some(
      (item) => item.toString() === productId
    )

    if (alreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist'
      })
    }

    user.wishlist.push(product._id)
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist'
    })
  } catch (error) {
    console.error('Add Wishlist Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist'
    })
  }
}

export const getWishlist = async (req, res) => {
  try {
    const user = await customer.findById(req.customer._id).populate({
      path: 'wishlist',
      select: 'name price category image stock'
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    return res.status(200).json({
      success: true,
      count: user.wishlist.length,
      wishlist: user.wishlist
    })
  } catch (error) {
    console.error('Get Wishlist Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist'
    })
  }
}

export const removeProductFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      })
    }

    const user = await customer.findById(req.customer._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const exists = user.wishlist.some((item) => item.toString() === productId)

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist'
      })
    }

    user.wishlist = user.wishlist.filter(
      (item) => item.toString() !== productId
    )
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    })
  } catch (error) {
    console.error('Remove Wishlist Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist'
    })
  }
}