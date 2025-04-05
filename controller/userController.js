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

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            next(new Error("User already exists"))
        }

        let userData = {
            firstName,
            lastName,
            UserName,
            email,
            phoneNumber,
            password: await bcrypt.hash(password, 10),
            isVerified: false
        };

        const user = await User.create(userData);

        const otp = await user.generateOTP();

        await sendEmail(
            user.email,
            'verifyAccount',
            { otp: otp }
        );

        res.status(201).json({ 
            message: "Registration successful! Please check your email to verify your account."
        });
    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
});

const verifyAccount = asyncHandler(async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify the OTP
        const isValid = await user.verifyOTP(otp);
        if (!isValid) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        // Update user verification status
        await User.findByIdAndUpdate(user._id, { isVerified: true });

        res.status(200).json({ 
            message: "Account verified successfully",
            isVerified: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error("User does not exist");
    }

    if (!user.isVerified) {
        res.status(401);
        throw new Error("Please verify your email before logging in");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(400);
        throw new Error("Invalid password");
    }

    const token = jwt.sign(
        { id: user._id }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: "15d" }
    );
    
    res.status(200).json({ token });
});

const getUser = asyncHandler(async (req, res) => {
    // const userId = req.user.userId;
    const user = await User.findById(req.user.userId)
    if(!user){
        res.status(400)
        throw new Error("User not found")
    }
    res.status(200).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        UserName: user.UserName,
        email: user.email,
        phoneNumber: user.phoneNumber
    })
})

const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({email})
    if(!user){
        res.status(400)
        throw new Error("Email not link to any account")
    }
    const token = jwt.sign({ userId: user._id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "20min" });
    await sendEmail(
        user.email,
        'resetPassword',
        { resetToken: token }
    );
    res.status(200).json({ 
        message: `Check your mail ${email} to reset password.`
    })
})

const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decoded.userId)
    if(!user){
        res.status(400)
        throw new Error("User not found")
    }
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    res.status(200).json({ message: "Password reset successfully" })
})

// This function is used during user registration
const generateOTP = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const otp = await user.generateOTP();
        
        // Send email with OTP
        await sendEmail(
            user.email,
            'verifyAccount',
            { otp: otp }
        );

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// This function is used to resend OTP if needed
const resendOTP = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const otp = await user.generateOTP();

        await sendEmail(
            user.email,
            'verifyAccount',
            { otp: otp }
        );

        res.status(200).json({
            message: `New OTP has been sent to your mail ${email}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
