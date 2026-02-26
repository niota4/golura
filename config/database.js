const { Sequelize } = require('sequelize');
const env = process.env;

const sequelize = new Sequelize(
    env.DB_NAME, 
    env.DB_USER, 
    env.DB_PASS, 
    {
        host: env.DB_HOST,
        port: env.DB_PORT,
        dialect: 'mysql',
        dialectOptions: {
            charset: "utf8mb4",
            connectTimeout: 60000
        }
    }
);

module.exports = sequelize;