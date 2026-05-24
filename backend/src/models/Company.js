const mongoose = require('mongoose');

/**
 * @typedef {Object} CompanySchema
 * @property {string} companyName - Unique name of the organization.
 * @property {string} email - Corporate contact email address.
 * @property {boolean} [isVerified] - Verification state of the company.
 * @property {mongoose.Types.ObjectId} [owner] - Reference to the User owner of the company.
 * @property {mongoose.Types.ObjectId} [logo] - File upload reference to the corporate logo.
 * @property {string} [address] - Physical corporate headquarters address.
 * @property {string} [phone] - Corporate phone number.
 * @property {number} [latitude] - Geolocation latitude of the office.
 * @property {number} [longitude] - Geolocation longitude of the office.
 * @property {number} [proximityRadius] - Allowed physical radius in meters for location checks.
 */
const companySchema = new mongoose.Schema({
    companyName: {
        type: String, required: true, trim: true, unique: true
    },
    email: {
        type: String, required: true, unique: true, lowercase: true
    },
    isVerified: {
        type: Boolean, default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    logo: {
        type: mongoose.Schema.Types.ObjectId
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    proximityRadius: {
        type: Number,
        default: 200
    },
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
module.exports = Company;

