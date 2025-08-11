const express = require('express')
const router = express.Router()
const { createTask, updateTask } = require('../../controller/taskController/taskController')
const validateToken = require('../../middleWare/validateToken')
const { taskAssignVerification } = require('../../verification/taskVerification')


router.use(validateToken)
router.post('/create/:id', taskAssignVerification, createTask )
router.put('/update/:id', updateTask)

module.exports = router