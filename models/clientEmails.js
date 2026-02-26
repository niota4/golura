const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ClientEmail = sequelize.define('clientEmails', {
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Personal','Work','Other'),
      allowNull: true,
      defaultValue: "Personal"
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
    tableName: 'clientEmails',
    timestamps: true,
    hooks: {
      beforeSave: async (clientEmail, options) => {
        if (clientEmail.isPrimary) {
          await ClientEmail.update(
            { isPrimary: false },
            { where: { clientId: clientEmail.clientId, id: { [Sequelize.Op.ne]: clientEmail.id } } }
          );
        } else {
          const existingEmails = await ClientEmail.count({ where: { clientId: clientEmail.clientId, isActive: true } });
          if (existingEmails === 0) {
            clientEmail.isPrimary = true;
          }
        }
      },
      afterCreate: async (email, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        await ClientActivity.create({
          clientId: email.clientId,
          relatedModel: 'ClientEmail',
          relatedModelId: email.id,
          action: 'CREATE',
          description: `Email was created: ${email.email}.`,
          changedBy: options.userId || null,
          stateAfter: email.toJSON(),
        });
      },
      afterUpdate: async (email, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        const changes = options.context?.changes || {};
        const changedBy = options.context?.changedBy || null;

        try {
          for (const [field, change] of Object.entries(changes)) {
            if (change.oldValue === change.newValue) continue;

            await ClientActivity.create({
              clientId: email.clientId,
              relatedModel: 'ClientEmail',
              relatedModelId: email.id,
              action: 'UPDATE',
              description: change.description || `Updated ${field} on client email.`,
              fieldName: field,
              oldValue: change.oldValue,
              newValue: change.newValue,
              changedBy,
              timestamp: new Date(),
            });
          }
        } catch (error) {
          console.error('Error in afterUpdate hook for ClientEmail:', error);
        }
      },
      afterDestroy: async (email, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        await ClientActivity.create({
          clientId: email.clientId,
          relatedModel: 'ClientEmail',
          relatedModelId: email.id,
          action: 'DELETE',
          description: `Email was deleted: ${email.email}.`,
          changedBy: options.userId || null,
          stateBefore: email.toJSON(),
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

  return ClientEmail;
};
