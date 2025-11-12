const router = require('express').Router()
const {register}= require('../controller/auth.controllers')
router.post('/register',register )


module.exports=router