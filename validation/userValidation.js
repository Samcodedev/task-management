const { body, validationResult } = require('express-validator');

const validateRegistration = [
    body('firstName')
        .notEmpty().withMessage('First Name is required')
        .trim()
        .escape(),

    body('lastName')
        .notEmpty().withMessage('Last Name is required')
        .trim()
        .escape(),

    body('UserName')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 4 }).withMessage('Username must be at least 4 characters long')
        .trim()
        .escape(),

    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),

    body('phoneNumber')
        .notEmpty().withMessage('phoneNumber is required')
        .isMobilePhone().withMessage('Please enter a valid PhoneNumber'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

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

const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

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

const validateVerifyAccount = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .normalizeEmail(),

    body('otp')
        .notEmpty().withMessage('OTP is required')
        .isInt().withMessage('OTP must be an integer'),

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

const validateResetPassword = [
    body('token')
        .notEmpty().withMessage('token is required'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

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

const validateEmail = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .normalizeEmail(),

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
    validateRegistration,
    validateLogin,
    validateVerifyAccount,
    validateEmail,
    validateResetPassword
}