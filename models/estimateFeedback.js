const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('EstimateFeedback', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    estimateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'estimates',
        key: 'id'
      }
    },
    feedbackType: {
      type: DataTypes.ENUM('approve', 'reject', 'request_changes', 'general'),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    clientEmail: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    clientName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'estimateFeedback',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" }
        ]
      },
      {
        name: "estimateId",
        using: "BTREE",
        fields: [
          { name: "estimateId" }
        ]
      }
    ]
  });
};
