module.exports = function(sequelize, DataTypes) {
  const EstimateActivity = sequelize.models.EstimateActivity;

  const EstimateSettings = sequelize.define('EstimateSettings', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
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
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
    markUp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    salesTaxRate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    call: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
    },
    itemize: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
  }, {
    tableName: 'estimateSettings',
    timestamps: true,
    hooks: {
      afterCreate: async (settings, options) => {
        await EstimateActivity.create({
          relatedModel: 'EstimateSettings',
          relatedModelId: settings.id,
          action: 'CREATE',
          description: `Estimate Settings were created.`,
          changedBy: options.userId || null,
          stateAfter: settings.toJSON(),
        });
      },
      afterUpdate: async (settings, options) => {
        const changes = options.context?.changes || {};
        const changedBy = options.context?.changedBy || null;

        for (const [field, change] of Object.entries(changes)) {
          if (change.oldValue === change.newValue) continue;

          await EstimateActivity.create({
            estimateId: lineItem.estimateId,
            relatedModel: 'EstimateSettings',
            relatedModelId: settings.id,
            action: 'UPDATE',
            description: `${field} was updated from ${change.oldValue} to ${change.newValue}.`,
            fieldName: field,
            oldValue: change.oldValue,
            newValue: change.newValue,
            changedBy,
          });
        }
      },
      afterDestroy: async (settings, options) => {
        await EstimateActivity.create({
          estimateId: lineItem.estimateId,
          relatedModel: 'EstimateSettings',
          relatedModelId: settings.id,
          action: 'DELETE',
          description: `Estimate Settings were deleted.`,
          changedBy: options.userId || null,
          stateBefore: settings.toJSON(),
        });
      },
    },
  });

  return EstimateSettings;
};
