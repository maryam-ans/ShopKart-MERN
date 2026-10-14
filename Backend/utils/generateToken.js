import jwt from 'jsonwebtoken'



export const gentoken = (customerId)=>{
    const token = jwt.sign({customerId},process.env.JWT_secret , {expiresIn:'10d'})
    return token 
}