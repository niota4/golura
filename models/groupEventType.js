const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('groupEventType', {
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'groups',
        key: 'id'
      }
    },
    eventTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'eventTypes',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'groupEventType',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "groupId" },
          { name: "eventTypeId" },
        ]
      },
      {
        name: "eventTypeId",
        using: "BTREE",
        fields: [
          { name: "eventTypeId" },
        ]
      },
    ]
  });
};
