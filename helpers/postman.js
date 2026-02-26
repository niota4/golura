// Small script to help set up Postman environment for testing
const jwt = require('jsonwebtoken');
const env  = process.env;

// Generate a JWT with no expiration
const token = jwt.sign(
    {userId: 1}, 
    env.JWT_ACCESS_TOKEN
);

console.log('Generated JWT for Postman:', token);