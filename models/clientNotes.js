const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('clientNotes', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      charset: 'utf8mb4', // Support emojis
      collate: 'utf8mb4_unicode_ci', // Support emojis
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isImportant: {
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
    tableName: 'clientNotes',
    timestamps: true,hooks: {
      afterCreate: async (note, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        await ClientActivity.create({
          clientId: note.clientId,
          relatedModel: 'ClientNote',
          relatedModelId: note.id,
          action: 'CREATE',
          description: `Note was created.`,
          changedBy: options.userId || null,
          stateAfter: note.toJSON(),
        });
      },
      afterUpdate: async (note, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        const changes = options.context?.changes || {};
        const changedBy = options.context?.changedBy || null;

        try {
          for (const [field, change] of Object.entries(changes)) {
            if (change.oldValue === change.newValue) continue;

            await ClientActivity.create({
              clientId: note.clientId,
              relatedModel: 'ClientNote',
              relatedModelId: note.id,
              action: 'UPDATE',
              description: change.description || `Updated ${field} on client note.`,
              fieldName: field,
              oldValue: change.oldValue,
              newValue: change.newValue,
              changedBy,
              timestamp: new Date(),
            });
          }
        } catch (error) {
          console.error('Error in afterUpdate hook for ClientNote:', error);
        }
      },
      afterDestroy: async (note, options) => {
        const ClientActivity = sequelize.models.ClientActivity;
        await ClientActivity.create({
          clientId: note.clientId,
          relatedModel: 'ClientNote',
          relatedModelId: note.id,
          action: 'DELETE',
          description: `Note was deleted.`,
          changedBy: options.userId || null,
          stateBefore: note.toJSON(),
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
};
