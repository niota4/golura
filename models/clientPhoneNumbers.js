const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ClientPhoneNumber = sequelize.define('clientPhoneNumbers', {
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
    number: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Home','Mobile','Work','Other'),
      allowNull: true,
      defaultValue: "Mobile"
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
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id'
      }
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
    tableName: 'clientPhoneNumbers',
    timestamps: true,
    hooks: {
      beforeSave: async (clientPhoneNumber, options) => {
        if (clientPhoneNumber.isPrimary) {
          await ClientPhoneNumber.update(
            { isPrimary: false },
            { where: { clientId: clientPhoneNumber.clientId, id: { [Sequelize.Op.ne]: clientPhoneNumber.id } } }
          );
        } else {
          const existingPhoneNumbers = await ClientPhoneNumber.count({ where: { clientId: clientPhoneNumber.clientId, isActive: true } });
          if (existingPhoneNumbers === 0) {
            clientPhoneNumber.isPrimary = true;
          }
        }
      },
      afterCreate: async (phoneNumber, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        await ClientActivity.create({
          clientId: phoneNumber.clientId,
          relatedModel: 'ClientPhoneNumber',
          relatedModelId: phoneNumber.id,
          action: 'CREATE',
          description: `Phone number was created: ${phoneNumber.phoneNumber}.`,
          changedBy: options.userId || null,
          stateAfter: phoneNumber.toJSON(),
        });
      },
      afterUpdate: async (phoneNumber, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        const changes = options.context?.changes || {};
        const changedBy = options.context?.changedBy || null;

        try {
          for (const [field, change] of Object.entries(changes)) {
            if (change.oldValue === change.newValue) continue;

            await ClientActivity.create({
              clientId: phoneNumber.clientId,
              relatedModel: 'ClientPhoneNumber',
              relatedModelId: phoneNumber.id,
              action: 'UPDATE',
              description: change.description || `Updated ${field} on client phone number.`,
              fieldName: field,
              oldValue: change.oldValue,
              newValue: change.newValue,
              changedBy,
              timestamp: new Date(),
            });
          }
        } catch (error) {
          console.error('Error in afterUpdate hook for ClientPhoneNumber:', error);
        }
      },
      afterDestroy: async (phoneNumber, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        await ClientActivity.create({
          clientId: phoneNumber.clientId,
          relatedModel: 'ClientPhoneNumber',
          relatedModelId: phoneNumber.id,
          action: 'DELETE',
          description: `Phone number was deleted: ${phoneNumber.phoneNumber}.`,
          changedBy: options.userId || null,
          stateBefore: phoneNumber.toJSON(),
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
        name: "clientId",
        using: "BTREE",
        fields: [
          { name: "clientId" },
        ]
      },
    ]
  });

  return ClientPhoneNumber;
};
