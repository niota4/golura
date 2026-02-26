const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const EstimateActivity = sequelize.models.EstimateActivity;
  
  return sequelize.define('EstimatePreference', {
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
    estimateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estimates',
        key: 'id'
      }
    },
    handlerUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    email: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    call: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    emailDate: {
      allowNull: true,
      type: DataTypes.DATE
    },
    callDate: {
      allowNull: true,
      type: DataTypes.DATE
    },

  }, {
    sequelize,
    tableName: 'estimatePreferences',
    timestamps: true,
    hooks: {
      afterCreate: async (preferences, options) => {
        const EstimateActivity = sequelize.models.EstimateActivity;
        const Estimate = sequelize.models.Estimate;
        
        if (EstimateActivity && Estimate) {
          // Find the estimate that references this preference
          const estimate = await Estimate.findOne({
            where: { estimatePreferenceId: preferences.id }
          });
          
          if (estimate && estimate.id) {
            await EstimateActivity.create({
              estimateId: estimate.id,
              relatedModel: 'EstimatePreference',
              relatedModelId: preferences.id,
              action: 'CREATE',
              description: `Estimate Preferences created.`,
              changedBy: options.userId || null,
            });
          }
        }
      },
      afterUpdate: async (preferences, options) => {
        const EstimateActivity = sequelize.models.EstimateActivity;
        const Estimate = sequelize.models.Estimate;
        
        if (EstimateActivity && Estimate) {
          // Find the estimate that references this preference
          const estimate = await Estimate.findOne({
            where: { estimatePreferenceId: preferences.id }
          });
          
          if (estimate && estimate.id) {
            const changes = options.context?.changes || {};

            for (const [field, change] of Object.entries(changes)) {
              await EstimateActivity.create({
                estimateId: estimate.id,
                relatedModel: 'EstimatePreference',
                relatedModelId: preferences.id,
                action: 'UPDATE',
                description: `${field} updated from ${change.oldValue} to ${change.newValue}.`,
                changedBy: options.userId || null,
              });
            }
          }
        }
      },
      afterDestroy: async (preferences, options) => {
        const EstimateActivity = sequelize.models.EstimateActivity;
        const Estimate = sequelize.models.Estimate;
        
        if (EstimateActivity && Estimate) {
          // Find the estimate that references this preference
          const estimate = await Estimate.findOne({
            where: { estimatePreferenceId: preferences.id }
          });
          
          if (estimate && estimate.id) {
            await EstimateActivity.create({
              estimateId: estimate.id,
              relatedModel: 'EstimatePreference',
              relatedModelId: preferences.id,
              action: 'DELETE',
              description: `Estimate Preferences deleted.`,
              changedBy: options.userId || null,
            });
          }
        }
      },
    },
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" }
        ]
      }
    ]
  });
};
