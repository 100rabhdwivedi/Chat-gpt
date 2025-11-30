const {userModel,validateUser} = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

module.exports.register= async(req,res)=>{
    const { error } = validateUser(req.body);
    if (error) return res.status(400).json({message: error.details[0].message});

    const {fullName,email,password}=req.body

    let user = await userModel.findOne({email})
    if(user) return res.status(409).json({message:"User already exists"})
    
    let hashedPassword = await bcrypt.hash(password,10)

    user = await userModel.create({
        fullName,
        email,
        password:hashedPassword
    })

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"24h"})
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

module.exports.login = async (req,res) =>{

    const {email,password} = req.body
    let user =await userModel.findOne({email})
    if(!user) {
        return res.status(401).json({
        message:"Invalid email or password:"
    })}

    const isvalidPass = await bcrypt.compare(password,user.password)

    if(!isvalidPass){
        return res.status(401).json({
            message:"Invalid email or password:"
        })
    }

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"24h"})

    res.cookie("token",token)

    return res.status(200).json({
        message:"Loginn successfully:",
        token,
        user:{
            id:user._id,
            email:user.email,
            fullName:user.fullName
        }
    })
}