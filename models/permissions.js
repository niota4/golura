const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('permissions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    action: {
      type: DataTypes.ENUM('create','edit','view','archive'),
      allowNull: false
    },
    subAction: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "This is for more granular permissions like for payroll 'approve' and 'process'"
    },
    pageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pages',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'permissions',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "pageId",
        using: "BTREE",
        fields: [
          { name: "pageId" },
        ]
      },
    ]
  });
};
