const messageModel = require('../models/message.model')
module.exports.createMessage = async(payLoad) =>{
    const {content,user,chat,role} = payLoad
    try {
        const message = await messageModel.create({content,chat,user,role})
        return message
    } catch (error) {
        return {error:error.message}
    }
}

module.exports.fetchHistory = async (chatId) =>{
    try {
        const chatHistory = await messageModel.find({chat:chatId})
        return chatHistory.map((message)=>{
            return {
                role:message.role,
                content:message.content
            }
        })
        
    } catch (error) {
        return {error:error.message}
    }
}