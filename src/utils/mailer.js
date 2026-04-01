const nodemailer = require('nodemailer');



require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"TalentFlow Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log('📧 Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Nodemailer Error:', error);
        throw error; // Throw so the controller catches it
    }
};

module.exports = sendEmail;