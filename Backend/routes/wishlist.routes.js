import express from 'express'

import { isAuthenticated } from '../middlewares/auth.middleware.js'
import {
  addProductToWishlist,
  getWishlist,
  removeProductFromWishlist
} from '../controllers/wishlist.controller.js'

export const wishlistRouter = express.Router()

wishlistRouter.post('/:productId', isAuthenticated, addProductToWishlist)
wishlistRouter.get('/', isAuthenticated, getWishlist)
wishlistRouter.delete('/:productId', isAuthenticated, removeProductFromWishlist)

export default wishlistRouter