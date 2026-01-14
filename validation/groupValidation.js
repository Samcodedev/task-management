const { body, validationResult } = require('express-validator');

const validateCreateGroup = [
    body('groupName')
        .notEmpty().withMessage('groupName is required')
        .isString().withMessage("Group name can only be a string")
        .trim()
        .escape(),

    body('description')
        .notEmpty().withMessage('group description is required')
        .isString().withMessage("Group description can only be a string")
        .isLength({ max: 100 }).withMessage('Group description should not exceed 100 characters long')
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
];

const validateUpdateGroup = [
    body('groupName')
        .isString().withMessage("Group name can only be a string")
        .trim()
        .escape(),

    body('description')
        .isString().withMessage("Group description can only be a string")
        .isLength({ max: 100 }).withMessage('Group description should not exceed 100 characters long')
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
    validateCreateGroup,
    validateUpdateGroup
}