import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { customerRouter } from './routes/customer.routes.js'
import { productRouter } from './routes/product.routes.js'
import { wishlistRouter } from './routes/wishlist.routes.js'
import { cartRouter } from './routes/cart.routes.js'
import { orderRouter } from './routes/order.routes.js'

dotenv.config()

const app = express()
const port = 8008
const dbUrl = process.env.dbURL || process.env.dburl

app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

app.use('/customers', customerRouter)
app.use('/products', productRouter)
app.use('/wishlist', wishlistRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)

if (!dbUrl) {
  console.error('Missing MongoDB connection URL in environment variables.')
} else {
  mongoose.connect(dbUrl).then(() => {
    console.log('DB Connected Successfully')
  }).catch((err) => {
    console.log(err)
  })
}

app.listen(port, () => {
  console.log('Server Has Started at port 8008')
})