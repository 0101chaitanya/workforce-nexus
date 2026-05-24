const generator = require('generate-password');

/**
 * Generates a cryptographically secure, random **12-character** password.
 * Contains uppercase letters, numbers, and symbols under strict criteria.
 * @returns {string} Plain text temporary password.
 */
const generateSecurePassword = () => {
    return generator.generate({
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
        strict: true // Ensures at least one character from each set is present
    });
};

/**
 * Generates a randomized **10-digit** number structure to simulate bank account numbers.
 * @returns {string} Simulated bank account numeric string.
 */
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

