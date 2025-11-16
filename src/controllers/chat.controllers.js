const chatModel = require("../models/chat.model")

module.exports.createChat = async (req,res)=>{
    const {title} = req.body ||{}
    const user = req.user._id

    if(!title){
        return res.status(400).json({
            message:"Missing required parameter",
            filed:['title']
        })
    }

    const chat = await chatModel.create({user,title})

    res.status(201).json({
        message:"Chat created successfully",
        chat
    })
} 