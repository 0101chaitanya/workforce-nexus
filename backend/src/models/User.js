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
    identity: {
        type: String,
        unique: true,
        sparse: true,
    },
}, { timestamps: true });

// Hash password before saving, and assign unique identity if missing
userSchema.pre('save', async function (next) {
    if (!this.identity) {
        const generateIdentity = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 6; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return `EMP-${result}`;
        };

        let unique = false;
        let attempts = 0;
        while (!unique && attempts < 100) {
            const tempIdentity = generateIdentity();
            const existing = await this.constructor.findOne({ identity: tempIdentity });
            if (!existing) {
                this.identity = tempIdentity;
                unique = true;
            }
            attempts++;
        }
        if (!unique) {
            return next(new Error('Failed to generate a unique identity after multiple attempts'));
        }
    }

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
