const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')


const validateToken = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.headers.Authorization || req.headers.authorization
        
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            res.status(401)
            next(new Error('User is not authorized or token is missing'))
        }
        
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.ACCESS_TOKEN_SECRET)
        if (!decoded) {
            res.status(401)
            next(new Error('Invalid token payload'))
        }
        
        req.user = decoded
        next()
    } catch (error) {
        res.status(401)
        next(new Error(error.message || 'User is not authorized'))
    }
})

module.exports = validateToken