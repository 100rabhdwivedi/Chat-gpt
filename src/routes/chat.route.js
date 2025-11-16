const router = require('express').Router()
const { createChat } = require('../controllers/chat.controllers')
const authUser = require('../middlewares/auth.middleware')


router.post('/',authUser,createChat)


module.exports=router