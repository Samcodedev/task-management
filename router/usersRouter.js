const express = require('express')
const router = express.Router()
const { registerUser, loginUser, getUser, forgetPassword, resetPassword, verifyAccount, resendOTP } = require('../controller/userController')
const validateToken = require('../middleWare/validateToken')
const { validateRegistration, validateLogin, validateVerifyAccount, validateEmail, validateResetPassword } = require('../validation/userValidation')

// public route
router.post('/register', validateRegistration, registerUser)
router.post('/login', validateLogin, loginUser)
router.post('/forgetPassword', validateEmail, forgetPassword)
router.post('/resetPassword', validateResetPassword, resetPassword)
router.post('/verify', validateVerifyAccount, verifyAccount)
router.post('/resend-otp', validateEmail, resendOTP)

// private route
router.get('/getUser', validateToken, getUser)

module.exports = router