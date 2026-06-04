const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // or use 'smtp.ethereal.email' or your SMTP host
    auth: {
        user: process.env.EMAIL_USER,      // your email
        pass: process.env.EMAIL_PASSWORD   // your email app password or real password (not recommended)
    }
});

const sendEmail = async ({ to, subject, html }) => {
    if (!to || typeof to !== 'string' || !to.includes('@')) {
        throw new Error('Invalid recipient email');
    }
    const mailOptions = {
        from: `"Happy Child" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to', to);
    } catch (err) {
        console.error('Error sending email:', err);
        throw err;
    }
};

module.exports = sendEmail;