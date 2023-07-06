const express=require('express')
const controller=require('../controller/purchaseController')
const middleware=require('../middleware/auth')

const router=express.Router()

router.get('/purchase/premium',middleware.authenticate,controller.purchasepremium)

router.post('/purchase/updatepremium',middleware.authenticate,controller.updatepurchasepremium)

module.exports=router