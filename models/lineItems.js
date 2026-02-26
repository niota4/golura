const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const LineItem = sequelize.define('LineItem', {
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
    rate: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      validate: {
        min: {
          args: 0,
          msg: 'Rate cannot be negative'
        }
      }
    },
    unit: {
      type: DataTypes.ENUM('linear ft', 'sqft', 'job','set', 'hour', 'foot', 'each', 'portion','gallon'),
      allowNull: false
    },
    subTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: {
          args: 0,
          msg: 'Subtotal cannot be negative'
        }
      }
    },
    pricedBy: {
      type: DataTypes.ENUM('formula', 'question', 'custom'),
      allowNull: false,
      defaultValue: 'custom'
    },
    formulaId: { 
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'formulas',
        key: 'id'
      }
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'questions',
        key: 'id'
      }
    },
    total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: {
          args: 0,
          msg: 'Total cannot be negative'
        }
      }
    },
    taxable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    markup: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: {
          args: 0,
          msg: 'Markup cannot be negative'
        }
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    salesTaxRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'Sales tax rate cannot be negative'
        },
        max: {
          args: 1,
          msg: 'Sales tax rate cannot exceed 100%'
        }
      }
    },
    salesTaxTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'Sales tax total cannot be negative'
        }
      }
    },
    moduleDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adHoc: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    tableName: 'lineItems',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" }
        ]
      },
      {
        name: "userId",
        using: "BTREE",
        fields: [
          { name: "userId" }
        ]
      }
    ]
  });

  LineItem.associate = models => {
    LineItem.belongsToMany(models.Estimate, {
      through: models.EstimateLineItem,
      as: 'Estimates',
      foreignKey: 'lineItemId'
    });
    LineItem.belongsToMany(models.Item, {
      through: models.LineItemItem,
      as: 'AssociatedItems',
      foreignKey: 'lineItemId'
    });
    LineItem.belongsTo(models.Variable, {
        foreignKey: 'variableId',
        as: 'variable',
    });
  };

  return LineItem;
};
