const express=require('express')
const controller=require('../controller/userController')
const expenseController=require('../controller/expenseController')
const middleware=require('../middleware/auth')

const router=express.Router()

router.post('/user/signup',controller.signup)

router.post('/user/login',controller.login)

router.get('/user/getuser',middleware.authenticate,controller.getuser)

router.get('/user/download',middleware.authenticate,expenseController.downloadexpense)

module.exports=router
