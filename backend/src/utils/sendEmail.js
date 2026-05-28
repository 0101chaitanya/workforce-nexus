const { Resend } = require("resend");
require("dotenv").config();

/**
 * Resend email client instance.
 * Reads authentication details from `process.env.RESEND_API_KEY`.
 * @type {Resend}
 */
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = resend;
