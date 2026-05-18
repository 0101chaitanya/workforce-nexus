const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    }, position: {
        type: String,
    }, roleDescription: {
        type: String,
    }, refreshToken: {
        type: String,
    }, role: {
        type: String,
        enum: ["employee", "owner"],
        default: "employee"
    }, salary: {
        type: Number,
    },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
