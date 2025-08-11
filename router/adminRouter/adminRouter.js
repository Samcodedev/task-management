const express = require('express')
const router = express.Router()
const { setRole, addMember, removeMember } = require('../../controller/adminController/adminController')
const validateToken = require('../../middleWare/validateToken')
const { adminVerification } = require('../../verification/adminVerification')

// private route
router.use(validateToken)
router.put('/role/:id', adminVerification, setRole)
router.put('/add/:id', addMember)
router.put('/remove/:id', adminVerification, removeMember)

module.exports = router