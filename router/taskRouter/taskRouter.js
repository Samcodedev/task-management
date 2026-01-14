const express = require('express')
const router = express.Router()
const { createTask, updateTask } = require('../../controller/taskController/taskController')
const validateToken = require('../../middleWare/validateToken')
const { taskAssignVerification } = require('../../verification/taskVerification')
const { validateCreateTask, validateUpdateTask } = require('../../validation/taskValidation')


router.use(validateToken)
router.put('/update/:id', validateUpdateTask, updateTask)
router.use(validateCreateTask)
router.post('/create/:id', taskAssignVerification, createTask )

module.exports = router