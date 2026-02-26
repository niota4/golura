const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const InvoiceLineItems = sequelize.define('InvoiceLineItems', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
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
      invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'invoices',
          key: 'id',
        },
      },
      lineItemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'lineItems',
          key: 'id',
        },
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'items',
          key: 'id',
        },
      },
      laborId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'labor',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      taxable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      markup: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      unit: {
        type: DataTypes.ENUM('job', 'set', 'hour', 'foot', 'each', 'portion','gallon'),
        allowNull: false
      },
      subTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      salesTaxRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      salesTaxTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      lineItemPrice: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      category: {
        type: DataTypes.ENUM('Material', 'Labor', 'Equipment', 'Miscellaneous'),
        allowNull: false,
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      hours: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
      },
      useOvertimeRate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      standardHours: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
      },
      overtimeHours: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
  }, {
    sequelize,
    tableName: 'invoiceLineItems',
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
        name: "invoice_lineitem_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "invoiceId" },
          { name: "lineItemId" }
        ]
      }
    ]
  });

  InvoiceLineItems.associate = models => {
    InvoiceLineItems.belongsTo(models.Invoice, { foreignKey: 'invoiceId', as: 'Invoice' });
    InvoiceLineItems.belongsTo(models.LineItem, { foreignKey: 'lineItemId', as: 'LineItem' });
  };

  return InvoiceLineItems;
};
