import customer from "../models/customer.model.js"
import jwt from 'jsonwebtoken'

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Not Authorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_secret);
        const new_customer = await customer.findById(decoded.customerId);

        if (!new_customer) {
            return res.status(401).json({ message: "Customer Not Found Token Invalid" });
        }

        req.customer = new_customer;
        req.user = new_customer;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};