// generateKey.js - A simple script to generate a random key
const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');
console.log(secretKey); // This will print the key to the console
