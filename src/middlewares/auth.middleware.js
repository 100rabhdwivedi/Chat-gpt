const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")

const authUser = async(req,res,next)=>{

    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1]

        if(!token){
            return res.status(401).json({
                message:"Token missing:"
            })
        }
    try {
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({
                message:"Invalid token:"
            })
        }

        const user = await userModel.findById(decoded.id)

        if(!user){
            return res.status(401).json({
                message:"Unauthenticated user:"
            })
        }
        req.user=user
        next()

    } catch (error) {
        return res.status(401).json({
                message:"unauthenticated user:"
            })
    }
}

module.exports = authUser