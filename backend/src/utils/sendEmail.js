const nodemailer = require("nodemailer")
require("dotenv").config()

/**
 * Nodemailer Transporter instance configured for SMTP email transfers via Gmail.
 * Reads authentication details from `process.env.EMAIL` and `process.env.PASSWORD`.
 * @type {nodemailer.Transporter}
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

module.exports = transporter

