const express = require('express')
const router = express.Router()
const { registerUser, loginUser, getUser, forgetPassword, resetPassword, verifyAccount, resendOTP } = require('../controller/userController')
const validateToken = require('../middleWare/validateToken')

// public route
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/forgetPassword', forgetPassword)
router.post('/resetPassword', resetPassword)
router.post('/verify', verifyAccount)
router.post('/resend-otp', resendOTP)

// private route
router.get('/getUser', validateToken, getUser)

module.exports = router