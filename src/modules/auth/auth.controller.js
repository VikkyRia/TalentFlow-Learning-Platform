const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require("../../config/db");
const redisClient = require('../../config/redis');
const sendEmail = require('../../utils/mailer'); // Import the mailer
const { success, error } = require("../../utils/response");

// Helper to generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// ── REGISTER ────────────────────────────────────────────────────────
exports.register = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return error(res, "User already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, name, email, role, is_verified",
            [email, hashedPassword, name]
        );
        const user = result.rows[0];

        // Redis: Store a 6-digit OTP for 10 minutes
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redisClient.setEx(`otp:${email}`, 600, otp);
        
        // Send Email
        const emailContent = `<h1>Welcome to TalentFlow</h1><p>Your verification code is: <b>${otp}</b>. It expires in 10 minutes.</p>`;
        await sendEmail(email, "Verify Your Account - TalentFlow", `Your OTP is ${otp}`, emailContent);

        console.log(`OTP for ${email} is: ${otp}`); 

        return success(res, "Registration successful. OTP sent to email.", {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }, 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

// ── VERIFY OTP ──────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // 1. Get OTP from Redis
        const storedOtp = await redisClient.get(`otp:${email}`);

        if (!storedOtp) {
            return error(res, "OTP expired or not found. Please register again.", 400);
        }

        // 2. Check if OTP matches
        if (storedOtp !== otp) {
            return error(res, "Invalid OTP code", 400);
        }

        // 3. Update User in Postgres
        const result = await db.query(
            "UPDATE users SET is_verified = true WHERE email = $1 RETURNING id, name, email, is_verified",
            [email]
        );

        if (result.rowCount === 0) {
            return error(res, "User not found", 404);
        }

        // 4. Delete OTP from Redis (so it can't be used again)
        await redisClient.del(`otp:${email}`);

        return success(res, "Account verified successfully! You can now login.", {
            user: result.rows[0]
        });
    } catch (err) {
        return error(res, err.message, 500);
    }
};

// ── LOGIN ───────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return error(res, "Invalid email or password", 401);
        }

        const token = generateToken(user);
        return success(res, "Login successful", {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified
            }
        });
    } catch (err) {
        return error(res, err.message, 500);
    }
};

// ── LOGOUT ──────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
    try {
        // This clears the cookie named 'token' on the user's browser
        res.clearCookie('token'); 
        
        return success(res, "Logged out successfully");
    } catch (err) {
        return error(res, err.message, 500);
    }
};

// ── FORGOT PASSWORD ─────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return error(res, "User not found", 404);
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redisClient.setEx(`otp_reset:${email}`, 900, otp);

        // Send Reset Email
        await sendEmail(
            email, 
            "Password Reset - TalentFlow", 
            `Your password reset OTP is ${otp}`, 
            `<p>You requested a password reset. Use this code: <b>${otp}</b></p>`
        );

        return success(res, "Password reset OTP sent to email"); 
    } catch (err) {
        return error(res, err.message, 500);
    }
};

// ── RESET PASSWORD ──────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const storedOtp = await redisClient.get(`otp_reset:${email}`);
        if (!storedOtp || storedOtp !== otp) {
            return error(res, "Invalid or expired OTP", 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

        if (result.rowCount === 0) {
            return error(res, "User not found", 404);
        }

        await redisClient.del(`otp_reset:${email}`);
        return success(res, "Password reset successful. You can now login.");
    } catch (err) {
        return error(res, err.message, 500);
    }
};