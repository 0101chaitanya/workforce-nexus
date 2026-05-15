const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    accessToken: {
        type: String,
    }, address: {
        type: String,
    }, bankAccount: {
        type: String,
    }, branch: {
        type: String,
    }, company: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Company',
    }, dateOfBirth: {
        type: Date,
    }, email: {
        type: String, required: true, unique: true, lowercase: true,
    }, fullName: {
        type: String,
    }, isVerified: {
        type: Boolean, default: false
    }, joinDate: {
        type: Date, default: new Date(),
    }, otp: {
        type: Number,
    },
    otpExpiry: {
        type: Date,
    }, password: {
        type: String,
    }, phone: {
        type: String,
    }, photo: {
        type: mongoose.Schema.Types.ObjectId,
    }, roleDescription: {
        type: String,
    }, refreshToken: {
        type: String,
    }, role: {
        type: String,
        enum: ["hr", "manager", "staff", "owner"],
        default: "staff"
    }, salary: {
        type: Number,
    },
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = User;
