const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String, required: true, trim: true, unique: true
    },
    email: {
        type: String, required: true, unique: true, lowercase: true
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
