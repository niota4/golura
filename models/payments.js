module.exports = function(sequelize, DataTypes) {
  const Payment = sequelize.define('Payment', {
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    estimateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estimates',
        key: 'id'
      }
    },
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'invoices',
        key: 'id'
      }
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'items',
        key: 'id'
      }
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    stripeChargeId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    stripeCustomerId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    stripeConnectedAccountId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    paymentMethodId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'paymentMethods',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending'
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stripePaymentMethodId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    achBankName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    achAccountNumberLast4: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    achAccountType: {
      type: DataTypes.ENUM('checking', 'savings'),
      allowNull: true
    },
    paymentType: {
      type: DataTypes.ENUM('card', 'ach', 'wire'),
      allowNull: false,
      defaultValue: 'card'
    },
    achStatus: {
      type: DataTypes.ENUM('pending', 'processing', 'succeeded', 'failed', 'canceled'),
      allowNull: true
    },
    achFailureReason: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    expectedSettlementDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    tableName: 'payments',
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
        name: "clientId",
        using: "BTREE",
        fields: [
          { name: "clientId" }
        ]
      },
      {
        name: "estimateId",
        using: "BTREE",
        fields: [
          { name: "estimateId" }
        ]
      },
      {
        name: "invoiceId",
        using: "BTREE",
        fields: [
          { name: "invoiceId" }
        ]
      },
      {
        name: "itemId",
        using: "BTREE",
        fields: [
          { name: "itemId" }
        ]
      },
      {
        name: "stripePaymentIntentId",
        using: "BTREE",
        fields: [
          { name: "stripePaymentIntentId" }
        ]
      },
      {
        name: "stripeChargeId",
        using: "BTREE",
        fields: [
          { name: "stripeChargeId" }
        ]
      },
      {
        name: "stripeCustomerId",
        using: "BTREE",
        fields: [
          { name: "stripeCustomerId" }
        ]
      },
      {
        name: "stripeConnectedAccountId",
        using: "BTREE",
        fields: [
          { name: "stripeConnectedAccountId" }
        ]
      },
      {
        name: "paymentMethodId",
        using: "BTREE",
        fields: [
          { name: "paymentMethodId" }
        ]
      },
      {
        name: "stripePaymentMethodId",
        using: "BTREE",
        fields: [
          { name: "stripePaymentMethodId" }
        ]
      },
      {
        name: "paymentType",
        using: "BTREE",
        fields: [
          { name: "paymentType" }
        ]
      },
      {
        name: "achStatus",
        using: "BTREE",
        fields: [
          { name: "achStatus" }
        ]
      }
    ]
  });

  Payment.associate = models => {
    Payment.belongsTo(models.Client, { foreignKey: 'clientId', as: 'Client' });
    Payment.belongsTo(models.Estimate, { foreignKey: 'estimateId', as: 'Estimate' });
    Payment.belongsTo(models.Invoice, { foreignKey: 'invoiceId', as: 'Invoice' });
  };

  return Payment;
};
