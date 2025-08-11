const express = require('express')
const router = express.Router()
const { createGroup, updateGroup } = require('../controller/groupController')
const validateToken = require('../middleWare/validateToken')

// private route
router.use(validateToken) 
router.post('/register', createGroup)
router.put('/:id', updateGroup)

module.exports = router