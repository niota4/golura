'use strict';

const initModels = require('./init-models');
const sequelize = require('../config/database'); // Ensure this points to your Sequelize instance

const db = initModels(sequelize);

module.exports = db;
