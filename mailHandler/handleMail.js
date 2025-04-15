const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


const emailTemplates = {
    verifyAccount: (data) => ({
        subject: "Verify Your Account",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP Verification</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
                    <tr>
                        <td align="center">
                            <table width="100%" max-width="600px" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td align="center" style="background-color: #2C3E50; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                                        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Welcome to Our Platform</h1>
                                    </td>
                                </tr>
                                <!-- Message -->
                                <tr>
                                    <td style="color: #555555; font-size: 16px; text-align: center; line-height: 1.5; padding: 20px;">
                                        <p>Your One-Time Password (OTP) for account verification:</p>
                                    </td>
                                </tr>
                                <!-- OTP Box -->
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <h2 style="font-size: 24px; font-weight: bold; padding: 15px; background-color: #E74C3C; color: #ffffff; display: inline-block; border-radius: 5px; letter-spacing: 2px; margin: 0;">${data.otp}</h2>
                                    </td>
                                </tr>
                                <!-- Expiry Note -->
                                <tr>
                                    <td style="color: #888888; font-size: 14px; text-align: center; padding: 0 20px;">
                                        <p>This OTP will expire in 60 seconds.</p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td align="center" style="background-color: #2C3E50; padding: 20px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                        <p style="color: #ffffff; font-size: 14px; margin: 0;">If you didn't create an account, please ignore this email.</p>
                                        <p style="color: #cccccc; font-size: 12px; margin-top: 5px;">&copy; 2025 Our Platform. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>

        `
    }),
    
    resetPassword: (resetToken) => ({
        subject: "Reset Your Password",
        html: `
            <h1>Password Reset Request</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${process.env.BASE_URL}/reset-password/${resetToken}">Reset Password</a>
            <p>If you didn't request a password reset, please ignore this email.</p>
        `
    }),
};


const sendEmail = async (to, templateName, data = {}) => {
    try {
        if (!emailTemplates[templateName]) {
            next(new Error(`Email template '${templateName}' not found`))
        }

        const template = emailTemplates[templateName](data);
        
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to,
            subject: template.subject,
            html: template.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Email Error Details:", {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            errorCode: error.code
        });
        throw error;
    }
};


module.exports = { sendEmail };
