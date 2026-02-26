const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('InvoicePreferences', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    handlerUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    email: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    call: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    emailDate: {
      allowNull: true,
      type: DataTypes.DATE
    },
    callDate: {
      allowNull: true,
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    tableName: 'invoicePreferences',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" }
        ]
      }
    ]
  });
};
