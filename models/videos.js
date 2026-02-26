const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Video = sequelize.define('video', {
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    url: DataTypes.STRING,
    marketingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'marketing',
        key: 'id',
      },
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'events',
        key: 'id',
      },
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id',
      },
    },
    estimateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estimates',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    originalVideoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'videos',
        key: 'id',
      },
    },
    publicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    duration: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    resolution: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    format: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    frameRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  }, {});
  return Video;
};
