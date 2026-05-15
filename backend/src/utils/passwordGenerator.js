const generator = require('generate-password');

const generateSecurePassword = () => {
    return generator.generate({
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
        strict: true // Ensures at least one character from each set is present
    });
};

const generateBankAccount = () => {
    return generator.generate({
        length: 10,
        numbers: true,
        strict: true
    });
};

module.exports = {
    generateSecurePassword,
    generateBankAccount
};
