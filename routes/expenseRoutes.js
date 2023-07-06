const express = require('express')
const controller = require('../controller/expenseController')
const userauthenticate = require('../middleware/auth')

const router = express.Router()

router.post('/expense/addexpense', userauthenticate.authenticate, controller.addexpense)
router.get('/expense/getexpense', userauthenticate.authenticate, controller.getexpense)
router.delete('/expense/delexpense/:id', userauthenticate.authenticate, controller.delexpense)

module.exports = router