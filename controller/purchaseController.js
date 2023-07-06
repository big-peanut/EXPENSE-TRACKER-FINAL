const Razorpay = require('razorpay')
const Order = require('../models/orders')
const dotenv=require('dotenv')

dotenv.config()
const purchasepremium = (req, res, next) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 9900

        rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err))
            }
            req.user.createOrder({ orderid: order.id, status: 'PENDING' })
                .then(() => {
                    return res.status(201).json({ order, key_id: rzp.key_id })
                })
                .catch(err => {
                    throw new Error(err)
                })
        })
    }
    catch (err) {
        console.log(err)
        res.status(403).json({ message: "Something went wrong", error: err })
    }
}

const updatepurchasepremium = async (req, res, next) => {
    try {
        console.log(req.body)
        const { payment_id, orderid } = req.body
        const order = await Order.findOne({ where: { orderid: orderid } })
        const promise1=order.update({ paymentid: payment_id, status: "SUCCESSFUL" })
        const promise2=req.user.update({ ispremium: true })

        Promise.all([promise1,promise2])
            .then(()=>{
                return res.status(202).json({ success: true, message: "Transaction Successfull" })
            })
            .catch((err)=>{
                throw new Error(err)
            })
        
    }
    catch (err) {
        console.log(err)
        res.status(403).json({error:err,message:'Something went wrong'})
    }
}

module.exports={
    purchasepremium,
    updatepurchasepremium
}