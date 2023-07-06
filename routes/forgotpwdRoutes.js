
const express = require('express');

const resetpasswordController = require('../controller/forgotpwdController');


const router = express.Router();

router.post('/password/forgotpassword', resetpasswordController.forgotpassword);
router.get('/password/resetpassword/:id', resetpasswordController.resetpassword);
router.get('/password/updatepassword/:resetpasswordid', resetpasswordController.updatepassword);

module.exports = router;