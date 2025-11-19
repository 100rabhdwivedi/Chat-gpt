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