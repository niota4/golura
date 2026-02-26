const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pages', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "name_21"
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "icon_21"
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "url_21"
    },
    requiredFeature: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Feature required to access this page, e.g., "dashboard"'
    },
    order: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    tableName: 'pages',
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
        name: "name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_2",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_2",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_2",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_3",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_3",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_3",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_4",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_4",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_4",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_5",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_5",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_5",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_6",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_6",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_6",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_7",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_7",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_7",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_8",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_8",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_8",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_9",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_9",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_9",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_10",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_10",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_10",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_11",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_11",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_11",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_12",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_12",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_12",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_13",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_13",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_13",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_14",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_14",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_14",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_15",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_15",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_15",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_16",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_16",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_16",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_17",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_17",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_17",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_18",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_18",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_18",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_19",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_19",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_19",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_20",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_20",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_20",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
      {
        name: "name_21",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "icon_21",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "icon" },
        ]
      },
      {
        name: "url_21",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "url" },
        ]
      },
    ]
  });
};
