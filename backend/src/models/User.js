const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * @typedef {Object} UserSchema
 * @property {string} [accessToken] - JWT access token cached on login.
 * @property {string} [address] - Home address of the user.
 * @property {string} [bankAccount] - User's bank account number.
 * @property {string} [branch] - Office branch location (e.g., HQ, Branch A).
 * @property {mongoose.Types.ObjectId} [company] - Reference to the user's Company.
 * @property {Date} [dateOfBirth] - User's date of birth.
 * @property {string} email - Unique, lowercase email address.
 * @property {string} [fullName] - Full name of the user.
 * @property {boolean} [isVerified] - OTP email verification status.
 * @property {Date} [joinDate] - Official employment start date.
 * @property {number} [otp] - 5-digit verification challenge code.
 * @property {Date} [otpExpiry] - OTP code expiry timestamp.
 * @property {string} [password] - Bcrypt hashed password.
 * @property {string} [phone] - Contact phone number.
 * @property {mongoose.Types.ObjectId} [photo] - File upload reference for profile photo.
 * @property {string} [position] - Job role/designation (e.g., Software Developer).
 * @property {string} [roleDescription] - Extended details about job scope.
 * @property {string} [refreshToken] - JWT refresh token.
 * @property {string} role - System permission role (employee or owner).
 * @property {number} [salary] - Annual salary package.
 * @property {string} [identity] - Unique corporate ID (EMP-XXXXXX).
 */
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

/**
 * Pre-save Mongoose hook to auto-generate a unique EMP-XXXXXX corporate identity
 * and hash the user password using bcrypt before saving.
 */
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

/**
 * Compares a candidate plain password against the user's hashed password.
 * @param {string} candidatePassword - Plaintext password candidate.
 * @returns {Promise<boolean>} True if matching, false otherwise.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

