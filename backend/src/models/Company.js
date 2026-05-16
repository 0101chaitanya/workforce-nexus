const mongoose = require('mongoose');

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
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
