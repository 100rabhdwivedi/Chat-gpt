const router = require('express').Router()
const {register,login}= require('../controllers/auth.controllers')
const authUser = require('../middlewares/auth.middleware')
 
router.post('/register', authUser, register)
router.post('/login',login)


module.exports=router