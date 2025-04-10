const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require('../model/userModel');
const { sendEmail } = require('../middleware/handleMail');


const registerUser = asyncHandler(async (req, res, next) => {
    try {
        const { 
            firstName,
            lastName,
            UserName,
            email,
            phoneNumber,
            password
        } = req.body;
        
        if (!firstName || !lastName || !UserName || !email || !phoneNumber || !password) {
            res.status(400);
            next(new Error("All input field are required"))
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400);
            next(new Error("Invalid email format"))
        }

        if (password.length < 8) {
            res.status(400);
            next(new Error("Password must be at least 8 characters long"))
        }

        if (await User.findOne({ email })) {
            res.status(400);
            next(new Error("User already exists"))
        }

        const user = await User.create({
            firstName,
            lastName,
            UserName,
            email,
            phoneNumber,
            password: await bcrypt.hash(password, 10),
            isVerified: false
        })

        await sendEmail(
            user.email,
            'verifyAccount',
            { otp: await user.generateOTP() }
        );

        res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email to verify your account."
        });
    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
});

const verifyAccount = asyncHandler(async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(404)
            next(new Error('User not found'))
        }

        if (!await user.verifyOTP(otp)) {
            res.status(400)
            next(new Error('Invalid or expired OTP'))
        }

        await User.findByIdAndUpdate(user._id, { isVerified: true });

        res.status(200).json({
            success: true,
            message: "Account verified successfully",
            data: [{
                isVerified: true
            }]
        });
    } catch (error) {
        res.status(500)
        next(new Error(err.message))
    }
});

const loginUser = asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            res.status(400);
            next(new Error("All fields are required"))
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400);
            next(new Error("User does not exist"))
        }

        if (!user.isVerified) {
            res.status(401);
            next(new Error("Please verify your email before logging in"))
        }

        if (!await bcrypt.compare(password, user.password)) {
            res.status(400);
            next(new Error("Invalid password"))
        }

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: "15d" }
        );
        
        res.status(200).json({ 
            success: true,
            message: "Login successful",
            data: [{
                token
            }]
        });
    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
});

const getUser = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId)
        if(!user){
            res.status(400)
            next(new Error("User not found"))
        }
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: [
                {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    UserName: user.UserName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    groups: user.groups,
                    tasksAssigned: user.tasksAssigned
                }
            ]
            
        })
    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
})

const forgetPassword = asyncHandler(async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({email})
        if(!user){
            res.status(400)
            next(new Error("Email not link to any account"))
        }
        const token = jwt.sign({ userId: user._id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "20min" });
        await sendEmail(
            user.email,
            'resetPassword',
            { resetToken: token }
        );
        res.status(200).json({ 
            success: true,
            message: `Check your mail ${email} to reset password.`
        })
    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
})

const resetPassword = asyncHandler(async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decoded.userId)
        if(!user){
            res.status(400)
            next(new Error("User not found"))
        }
        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()
        res.status(200).json({ 
            success: true,
            message: "Password reset successfully" 
        })
    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
})

const generateOTP = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        
        await sendEmail(
            user.email,
            'verifyAccount',
            { otp: await user.generateOTP() }
        );

        res.status(200).json({ 
            success: true,
            message: "OTP sent successfully" 
        });
    } catch (error) {
        res.status(500)
        next(new Error(err.message))
    }
};

const resendOTP = asyncHandler(async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(404)
            next(new Error('User not found'))
        }

        await sendEmail(
            user.email,
            'verifyAccount',
            { otp: await user.generateOTP() }
        );

        res.status(200).json({
            success: true,
            message: `New OTP has been sent to your mail ${email}`
        });
    } catch (error) {
        res.status(500)
        next(new Error(err.message))
    }
});

module.exports = { 
    registerUser, 
    loginUser, 
    getUser, 
    forgetPassword, 
    resetPassword,
    verifyAccount,
    resendOTP,
    generateOTP
};
