import customer from '../models/customer.model.js'
import bcrypt from'bcrypt'
import { gentoken } from '../utils/generateToken.js'


export const customerRegister = async(req , res)=>{
    try{
    const { fullName , email , password , phone } = req.body 

    if(!fullName || !email || ! password || !phone ){
       return res.status(400).json({message : "All fields are mandatory"})
    }

    if(password.length < 6){
       return res.status(400).json({message : "Password must contain at least 6 characters."})
    }
    if (!/^\d{10}$/.test(String(phone).trim())){
        return res.status(400).json({message: 'Phone number invalid'})
    }

    const email_exists = await customer.findOne({email})

    if(email_exists){
       return res.status(409).json({message : "Email already exists"})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedpassword = await bcrypt.hash(password , salt)

    const new_customer =  await customer.create({
    fullName,
    email,
    password : hashedpassword ,
    phone   
    })  //req.body.fullName  not necessary

    res.status(201).json({success : true, message : "Customer registered successfully", customer : {
        '_id' : new_customer._id,
        'fullName' : new_customer.fullName,
        'email' : new_customer.email,
        'phone' : new_customer.phone

    }
 })
}
catch(error){
   if (error.code === 11000) {
       return res.status(409).json({ message: "Email already exists" })
   }
   res.status(500).json({ message : "Internal Server Error" , error:error })
    }
}

export const customerLogin = async (req,res)=>{
    try{
    const { email , password} = req.body

       

    if (!email || !password) {
        return res.status(401).json({ message: "Invalid credentials" })
    }

    const User = await customer.findOne({email})
     
    
    if(!User){
       
        return res.status(401).json({ message: "Invalid credentials" }) 
    }

    const passwordCheck = await bcrypt.compare(password, User.password)
    if (!passwordCheck) {
    return res.status(401).json({ message: "Invalid credentials" })
}
    const cookieOptions={
        httpOnly : true ,
        secure: false
    }
     const token = gentoken(User._id);
    res.cookie("token", token, cookieOptions);

     



    res.status(200).json({"success": true,"message": "Login successful"})

} catch(error){
     res.status(500).json({
      message: 'Internal Server Errorr', error: error})
  }
}

export const getCustomer = (req, res)=>{
    const user = req.user || req.customer
    res.status(200).json({message: "User Authenticated",customerData :{
        "_id": user._id || user.id , 
        "fullName" : user.fullName,
        "email": user.email, 
        "phone" : user.phone,
        "createdAt": user.createdAt 
     }
    })
}

export const customerLogout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "Old password and new password are required"
            });
        }

        const user = req.customer;

        const passwordCheck = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!passwordCheck) {
            return res.status(400).json({
                message: "Old password is incorrect"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must contain at least 6 characters"
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            newPassword,
            salt
        );

   
        user.password = hashedPassword;

        await user.save();


        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};