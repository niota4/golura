const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    const Marketing = sequelize.define('Marketing', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id',
        },
      }
    }, {
      sequelize,
      tableName: 'marketing',
      timestamps: true,
    });
    return Marketing;
  };