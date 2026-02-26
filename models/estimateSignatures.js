const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const EstimateActivity = sequelize.models.EstimateActivity;

  const EstimateSignature = sequelize.define('EstimateSignature', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    estimateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'estimates',
        key: 'id',
      },
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    collectedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now')
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now')
    }
  }, {
    tableName: 'estimateSignatures',
    timestamps: true,
    hooks: {
      afterCreate: async (signature, options) => {
        await EstimateActivity.create({
          relatedModel: 'EstimateSignature',
          relatedModelId: signature.id,
          estimateId: signature.estimateId,
          action: 'CREATE',
          description: `Estimate Signature was created.`,
          changedBy: signature.collectedBy || null,
          stateAfter: signature.toJSON(),
        });
      },
      afterUpdate: async (signature, options) => {
        const changes = options.context?.changes || {};
        const changedBy = options.context?.changedBy || null;

        for (const [field, change] of Object.entries(changes)) {
          if (change.oldValue === change.newValue) continue;

          await EstimateActivity.create({
            relatedModel: 'EstimateSignature',
            relatedModelId: signature.id,
            estimateId: signature.estimateId,
            action: 'UPDATE',
            description: `${field} was updated from ${change.oldValue} to ${change.newValue}.`,
            fieldName: field,
            oldValue: change.oldValue,
            newValue: change.newValue,
            changedBy: signature.collectedBy,
          });
        }
      },
      afterDestroy: async (signature, options) => {
        await EstimateActivity.create({
          relatedModel: 'EstimateSignature',
          relatedModelId: signature.id,
          estimateId: signature.estimateId,
          action: 'DELETE',
          description: `Estimate Signature was deleted.`,
          changedBy: signature.collectedBy || null,
          stateBefore: signature.toJSON(),
        });
      },
    },
  });

  return EstimateSignature;
};
