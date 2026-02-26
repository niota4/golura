const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ClientAddress = sequelize.define('clientAddresses', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    street1: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    street2: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'states',
        key: 'id'
      }
    },
    zipCode: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    latitude: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    longitude: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clients',
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'clientAddresses',
    timestamps: true,
    hooks: {
      beforeSave: async (clientAddress, options) => {
        if (clientAddress.isPrimary) {
          await ClientAddress.update(
            { isPrimary: false },
            { where: { clientId: clientAddress.clientId, id: { [Sequelize.Op.ne]: clientAddress.id } } }
          );
        } else {
          const existingAddresses = await ClientAddress.count({ where: { clientId: clientAddress.clientId, isActive: true } });
          if (existingAddresses === 0) {
            clientAddress.isPrimary = true;
          }
        }
      },
      afterCreate: async (address, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        await ClientActivity.create({
          clientId: address.clientId,
          relatedModel: 'ClientAddress',
          relatedModelId: address.id,
          action: 'CREATE',
          description: `Address was created: ${address.address}.`,
          changedBy: options.userId || null,
          stateAfter: address.toJSON(),
        });
      },
      afterUpdate: async (address, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        const changes = options.context?.changes || {};
        const changedBy = options.context?.changedBy || null;

        try {
          for (const [field, change] of Object.entries(changes)) {
            if (change.oldValue === change.newValue) continue;

            await ClientActivity.create({
              clientId: address.clientId,
              relatedModel: 'ClientAddress',
              relatedModelId: address.id,
              action: 'UPDATE',
              description: change.description || `Updated ${field} on client address.`,
              fieldName: field,
              oldValue: change.oldValue,
              newValue: change.newValue,
              changedBy,
              timestamp: new Date(),
            });
          }
        } catch (error) {
          console.error('Error in afterUpdate hook for ClientAddress:', error);
        }
      },
      afterDestroy: async (address, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        await ClientActivity.create({
          clientId: address.clientId,
          relatedModel: 'ClientAddress',
          relatedModelId: address.id,
          action: 'DELETE',
          description: `Address was deleted: ${address.address}.`,
          changedBy: options.userId || null,
          stateBefore: address.toJSON(),
        });
      },
    },
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
        name: "stateId",
        using: "BTREE",
        fields: [
          { name: "stateId" },
        ]
      },
      {
        name: "clientId",
        using: "BTREE",
        fields: [
          { name: "clientId" },
        ]
      },
    ]
  });

  return ClientAddress;
};
