const express=require('express')
const controller=require('../controller/premiumController')
const middleware=require('../middleware/auth')

const router=express.Router()

router.get('/premium/leaderboard',middleware.authenticate,controller.getleaderboard)

module.exports=router