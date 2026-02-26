const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('addresses', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    street1: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'Street address is required'
        }
      }
    },
    street2: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'City is required'
        }
      }
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'states',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: {
          args: /^[0-9]{5}(-[0-9]{4})?$/,
          msg: 'ZIP code must be in format 12345 or 12345-6789'
        }
      }
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      validate: {
        min: {
          args: -90,
          msg: 'Latitude must be between -90 and 90'
        },
        max: {
          args: 90,
          msg: 'Latitude must be between -90 and 90'
        }
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      validate: {
        min: {
          args: -180,
          msg: 'Longitude must be between -180 and 180'
        },
        max: {
          args: 180,
          msg: 'Longitude must be between -180 and 180'
        }
      }
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Soft delete fields
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Soft delete timestamp'
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who deleted this address'
    }
  }, {
    sequelize,
    tableName: 'addresses',
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
        name: "idx_addresses_state_id",
        using: "BTREE",
        fields: [
          { name: "stateId" },
        ]
      },
      {
        name: "idx_addresses_company_id",
        using: "BTREE",
        fields: [
          { name: "companyId" },
        ]
      },
      {
        name: "idx_addresses_soft_delete",
        using: "BTREE",
        fields: [
          { name: "deletedAt" },
        ]
      },
      {
        name: "idx_addresses_coordinates",
        using: "BTREE",
        fields: [
          { name: "latitude" },
          { name: "longitude" },
        ]
      }
    ],
    // Enable soft deletes
    paranoid: true,
    deletedAt: 'deletedAt'
  });
};
