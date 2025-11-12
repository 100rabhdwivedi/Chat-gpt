const {userModel,validateUser} = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

module.exports.register= async(req,res)=>{
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const {fullName,email,password}=req.body

    let user = await userModel.findOne({email})
    if(user) return res.status(409).json({message:"User already exists"})
    
    let hashedPassword = await bcrypt.hash(password,10)

    user = await userModel.create({
        fullName,
        email,
        password:hashedPassword
    })

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
    res.cookie("token",token)

    return res.status(201).json({
        message:"User created successfully:",
        users:{
            fullName:fullName,
            email:email,
            id:user._id    
        }
    })
}