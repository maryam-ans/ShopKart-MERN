import express from 'express'
import {customerRegister, customerLogin , getCustomer ,customerLogout, changePassword} from '../controllers/customer.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

export const customerRouter = express.Router()

customerRouter.post("/register" , customerRegister )
customerRouter.post('/login', customerLogin)
customerRouter.get('/me', isAuthenticated ,getCustomer)
customerRouter.post("/logout", customerLogout)
customerRouter.patch("/change-password",isAuthenticated , changePassword)