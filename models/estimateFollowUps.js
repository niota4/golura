const { event } = require('jquery');
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const EstimateFollowUp = sequelize.define('EstimateFollowUp', {
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
        key: 'id',
      },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'events',
        key: 'id'
      },
    },
    parentEventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'events',
        key: 'id'
      },
    },
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'clients',
            key: 'id'
        },
    },
    type: {
      type: DataTypes.ENUM('call', 'text', 'email', 'in person'),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    tableName: 'estimateFollowUps',
    timestamps: true,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }]
      },
      {
        name: 'estimateId',
        using: 'BTREE',
        fields: [{ name: 'estimateId' }]
      },
      {
        name: 'createdBy',
        using: 'BTREE',
        fields: [{ name: 'createdBy' }]
      }
    ]
  });

  EstimateFollowUp.associate = models => {
    EstimateFollowUp.belongsTo(models.Estimate, {
      foreignKey: 'estimateId',
      as: 'Estimate'
    });
    EstimateFollowUp.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'Creator'
    });
  };

  return EstimateFollowUp;
};
