const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('priorities', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    level: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "level_21"
    },
  }, {
    sequelize,
    tableName: 'priorities',
    timestamps: false,
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
        name: "level",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_2",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_3",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_4",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_5",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_6",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_7",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_8",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_9",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_10",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_11",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_12",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_13",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_14",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_15",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_16",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_17",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_18",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_19",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_20",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "level_21",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
    ]
  });
};
