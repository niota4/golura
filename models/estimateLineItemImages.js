module.exports = function(sequelize, DataTypes) {
  const EstimateActivity = sequelize.models.EstimateActivity;

  const EstimateLineItemImage = sequelize.define('estimateLineItemImage', {
    estimateLineItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'estimateLineItems',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    imageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'images',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
  }, {
    hooks: {
      afterCreate: async (image, options) => {
        await EstimateActivity.create({
          estimateId: lineItem.estimateId,
          relatedModel: 'EstimateLineItemImage',
          relatedModelId: image.id,
          action: 'CREATE',
          description: `Image added to Estimate Line Item ${image.estimateLineItemId}.`,
          changedBy: options.userId || null,
        });
      },
      afterDestroy: async (image, options) => {
        await EstimateActivity.create({
          estimateId: lineItem.estimateId,
          relatedModel: 'EstimateLineItemImage',
          relatedModelId: image.id,
          action: 'DELETE',
          description: `Image removed from Estimate Line Item ${image.estimateLineItemId}.`,
          changedBy: options.userId || null,
        });
      },
    },
  });

  return EstimateLineItemImage;
};
