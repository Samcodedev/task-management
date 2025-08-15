const express = require('express')
const router = express.Router()
const { createGroup, updateGroup } = require('../controller/groupController')
const validateToken = require('../middleWare/validateToken')
const { validateCreateGroup, validateUpdateGroup } = require('../validation/groupValidation')

// private route
router.use(validateToken) 
router.post('/register', validateCreateGroup, createGroup)
router.put('/:id', validateUpdateGroup, updateGroup)

module.exports = router