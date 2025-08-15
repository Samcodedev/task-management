const { body, validationResult } = require('express-validator');

const validateCreateTask = [
    body('title')
        .notEmpty().withMessage('Task title is required')
        .isString().withMessage("Task title can only be a string")
        .trim()
        .escape(),

    body('description')
        .notEmpty().withMessage('Task description is required')
        .isString().withMessage("Task description can only be a string")
        .isLength({ max: 200 }).withMessage('Task description should not exceed 200 characters long')
        .trim()
        .escape(),

    body('status')
        .trim()
        .isIn(["pending", "in-progress", "completed", "on-hold"]).withMessage('Status can be only one of the following "pending", "in-progress", "completed", "on-hold"'),

    body('priority')
        .trim()
        .isIn(["low", "medium", "high", "urgent"]).withMessage('Priority can be only one of the following "low", "medium", "high", "urgent"'),

    body('dueDate')
        .notEmpty().withMessage('Task due date is required')
        .isDate().withMessage('Input a valid date format dd-mm-yy'),

    body('tasksList')
        .notEmpty().withMessage('Task List is required')
        .isArray().withMessage('Task list should be in an Array format'),
    

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }));

            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: formattedErrors
            });
        }
        next();
    }
];

const validateUpdateTask = [
    body('title')
        .isString().withMessage("Task title can only be a string")
        .trim()
        .escape(),

    body('description')
        .isString().withMessage("Task description can only be a string")
        .isLength({ max: 200 }).withMessage('Task description should not exceed 200 characters long')
        .trim()
        .escape(),

    body('status')
        .trim()
        .isIn(["pending", "in-progress", "completed", "on-hold"]).withMessage('Status can be only one of the following "pending", "in-progress", "completed", "on-hold"'),

    body('priority')
        .trim()
        .isIn(["low", "medium", "high", "urgent"]).withMessage('Priority can be only one of the following "low", "medium", "high", "urgent"'),

    body('dueDate')
        .isDate().withMessage('Input a valid date format dd-mm-yy'),

    body('tasksList')
        .isArray().withMessage('Task list should be in an Array format'),

    body('message')
        .isAlphanumeric().withMessage('Task comment can only be Alphanumeric')
        .trim()
        .escape(),
    

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }));

            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: formattedErrors
            });
        }
        next();
    }
]


module.exports = {
    validateCreateTask,
    validateUpdateTask
}