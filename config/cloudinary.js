// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const env = process.env;

cloudinary.config({
    cloud_name: env.CLOUDINARY_NAME,
    api_key: env.CLOUDINARY_KEY,
    api_secret: env.CLOUDINARY_SECRET
});

module.exports = cloudinary;