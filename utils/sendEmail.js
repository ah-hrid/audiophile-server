"use strict";
const nodemailer = require("nodemailer");

module.exports = async ({ email, subject, html }) => {


    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER,
        port: process.env.SMTP_PORT_KEY,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_API_KEY,
        },
    });

    const options = {
        from: process.env.SMTP_USER,
        to: email,
        subject: subject,
        // text: message,
        html: html,
    }

    await transporter.sendMail(options);
}


