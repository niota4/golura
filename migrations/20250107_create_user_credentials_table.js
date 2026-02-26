const Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable() => "userCredentials", deps: [users]
 *
 */

const info = {
    "revision": 1,
    "name": "create-user-credentials-table",
    "created": "2025-01-07T12:00:00.000Z",
    "comment": "Create userCredentials table for storing sensitive user information"
};

const migrationCommands = function(transaction) {
    return [{
        fn: "createTable",
        params: [
            "userCredentials",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "userId": {
                    "type": Sequelize.INTEGER,
                    "field": "userId",
                    "allowNull": false,
                    "unique": true,
                    "references": {
                        "model": "users",
                        "key": "id"
                    },
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE"
                },
                "ssn": {
                    "type": Sequelize.STRING(11),
                    "field": "ssn",
                    "allowNull": true
                },
                "birthDay": {
                    "type": Sequelize.DATEONLY,
                    "field": "birthDay",
                    "allowNull": true
                },
                "street1": {
                    "type": Sequelize.STRING(255),
                    "field": "street1",
                    "allowNull": true
                },
                "street2": {
                    "type": Sequelize.STRING(255),
                    "field": "street2",
                    "allowNull": true
                },
                "city": {
                    "type": Sequelize.STRING(100),
                    "field": "city",
                    "allowNull": true
                },
                "stateId": {
                    "type": Sequelize.INTEGER,
                    "field": "stateId",
                    "allowNull": true,
                    "references": {
                        "model": "states",
                        "key": "id"
                    },
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL"
                },
                "zipCode": {
                    "type": Sequelize.STRING(10),
                    "field": "zipCode",
                    "allowNull": true
                },
                "country": {
                    "type": Sequelize.STRING(100),
                    "field": "country",
                    "allowNull": true,
                    "defaultValue": "United States"
                },
                "emergencyContactName": {
                    "type": Sequelize.STRING(255),
                    "field": "emergencyContactName",
                    "allowNull": true
                },
                "emergencyContactPhone": {
                    "type": Sequelize.STRING(20),
                    "field": "emergencyContactPhone",
                    "allowNull": true
                },
                "emergencyContactRelationship": {
                    "type": Sequelize.STRING(100),
                    "field": "emergencyContactRelationship",
                    "allowNull": true
                },
                "hireDate": {
                    "type": Sequelize.DATEONLY,
                    "field": "hireDate",
                    "allowNull": true
                },
                "terminationDate": {
                    "type": Sequelize.DATEONLY,
                    "field": "terminationDate",
                    "allowNull": true
                },
                "employmentStatus": {
                    "type": Sequelize.ENUM('active', 'inactive', 'terminated', 'on_leave'),
                    "field": "employmentStatus",
                    "allowNull": true,
                    "defaultValue": "active"
                },
                "taxFilingStatus": {
                    "type": Sequelize.ENUM('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow'),
                    "field": "taxFilingStatus",
                    "allowNull": true
                },
                "federalAllowances": {
                    "type": Sequelize.INTEGER,
                    "field": "federalAllowances",
                    "allowNull": true,
                    "defaultValue": 0
                },
                "stateAllowances": {
                    "type": Sequelize.INTEGER,
                    "field": "stateAllowances",
                    "allowNull": true,
                    "defaultValue": 0
                },
                "additionalFederalWithholding": {
                    "type": Sequelize.DECIMAL(10, 2),
                    "field": "additionalFederalWithholding",
                    "allowNull": true,
                    "defaultValue": 0.00
                },
                "additionalStateWithholding": {
                    "type": Sequelize.DECIMAL(10, 2),
                    "field": "additionalStateWithholding",
                    "allowNull": true,
                    "defaultValue": 0.00
                },
                "bankName": {
                    "type": Sequelize.STRING(255),
                    "field": "bankName",
                    "allowNull": true
                },
                "bankAccountType": {
                    "type": Sequelize.ENUM('checking', 'savings'),
                    "field": "bankAccountType",
                    "allowNull": true
                },
                "routingNumber": {
                    "type": Sequelize.STRING(9),
                    "field": "routingNumber",
                    "allowNull": true
                },
                "accountNumber": {
                    "type": Sequelize.STRING(20),
                    "field": "accountNumber",
                    "allowNull": true
                },
                "healthInsuranceProvider": {
                    "type": Sequelize.STRING(255),
                    "field": "healthInsuranceProvider",
                    "allowNull": true
                },
                "healthInsurancePolicyNumber": {
                    "type": Sequelize.STRING(100),
                    "field": "healthInsurancePolicyNumber",
                    "allowNull": true
                },
                "healthInsuranceGroupNumber": {
                    "type": Sequelize.STRING(100),
                    "field": "healthInsuranceGroupNumber",
                    "allowNull": true
                },
                "driverLicenseNumber": {
                    "type": Sequelize.STRING(50),
                    "field": "driverLicenseNumber",
                    "allowNull": true
                },
                "driverLicenseState": {
                    "type": Sequelize.STRING(50),
                    "field": "driverLicenseState",
                    "allowNull": true
                },
                "driverLicenseExpiration": {
                    "type": Sequelize.DATEONLY,
                    "field": "driverLicenseExpiration",
                    "allowNull": true
                },
                "w4OnFile": {
                    "type": Sequelize.BOOLEAN,
                    "field": "w4OnFile",
                    "allowNull": true,
                    "defaultValue": false
                },
                "i9OnFile": {
                    "type": Sequelize.BOOLEAN,
                    "field": "i9OnFile",
                    "allowNull": true,
                    "defaultValue": false
                },
                "notes": {
                    "type": Sequelize.TEXT,
                    "field": "notes",
                    "allowNull": true
                },
                "createdBy": {
                    "type": Sequelize.INTEGER,
                    "field": "createdBy",
                    "allowNull": true,
                    "references": {
                        "model": "users",
                        "key": "id"
                    },
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL"
                },
                "updatedBy": {
                    "type": Sequelize.INTEGER,
                    "field": "updatedBy",
                    "allowNull": true,
                    "references": {
                        "model": "users",
                        "key": "id"
                    },
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL"
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {
                "transaction": transaction
            }
        ]
    }];
};

const rollbackCommands = function(transaction) {
    return [{
        fn: "dropTable",
        params: ["userCredentials", {
            transaction: transaction
        }]
    }];
};

module.exports = {
    pos: 0,
    useTransaction: true,
    execute: function(queryInterface, Sequelize) {
        const migrationCommands = function(transaction) {
            return [{
                fn: "createTable",
                params: [
                    "userCredentials",
                    {
                        "id": {
                            "type": Sequelize.INTEGER,
                            "field": "id",
                            "autoIncrement": true,
                            "primaryKey": true,
                            "allowNull": false
                        },
                        "userId": {
                            "type": Sequelize.INTEGER,
                            "field": "userId",
                            "allowNull": false,
                            "unique": true,
                            "references": {
                                "model": "users",
                                "key": "id"
                            },
                            "onUpdate": "CASCADE",
                            "onDelete": "CASCADE"
                        },
                        "ssn": {
                            "type": Sequelize.STRING(11),
                            "field": "ssn",
                            "allowNull": true
                        },
                        "dateOfBirth": {
                            "type": Sequelize.DATEONLY,
                            "field": "dateOfBirth",
                            "allowNull": true
                        },
                        "streetAddress": {
                            "type": Sequelize.STRING(255),
                            "field": "streetAddress",
                            "allowNull": true
                        },
                        "addressLine2": {
                            "type": Sequelize.STRING(255),
                            "field": "addressLine2",
                            "allowNull": true
                        },
                        "city": {
                            "type": Sequelize.STRING(100),
                            "field": "city",
                            "allowNull": true
                        },
                        "state": {
                            "type": Sequelize.STRING(50),
                            "field": "state",
                            "allowNull": true
                        },
                        "zipCode": {
                            "type": Sequelize.STRING(10),
                            "field": "zipCode",
                            "allowNull": true
                        },
                        "country": {
                            "type": Sequelize.STRING(100),
                            "field": "country",
                            "allowNull": true,
                            "defaultValue": "United States"
                        },
                        "emergencyContactName": {
                            "type": Sequelize.STRING(255),
                            "field": "emergencyContactName",
                            "allowNull": true
                        },
                        "emergencyContactPhone": {
                            "type": Sequelize.STRING(20),
                            "field": "emergencyContactPhone",
                            "allowNull": true
                        },
                        "emergencyContactRelationship": {
                            "type": Sequelize.STRING(100),
                            "field": "emergencyContactRelationship",
                            "allowNull": true
                        },
                        "employeeId": {
                            "type": Sequelize.STRING(50),
                            "field": "employeeId",
                            "allowNull": true,
                            "unique": true
                        },
                        "hireDate": {
                            "type": Sequelize.DATEONLY,
                            "field": "hireDate",
                            "allowNull": true
                        },
                        "terminationDate": {
                            "type": Sequelize.DATEONLY,
                            "field": "terminationDate",
                            "allowNull": true
                        },
                        "employmentStatus": {
                            "type": Sequelize.ENUM('active', 'inactive', 'terminated', 'on_leave'),
                            "field": "employmentStatus",
                            "allowNull": true,
                            "defaultValue": "active"
                        },
                        "taxFilingStatus": {
                            "type": Sequelize.ENUM('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow'),
                            "field": "taxFilingStatus",
                            "allowNull": true
                        },
                        "federalAllowances": {
                            "type": Sequelize.INTEGER,
                            "field": "federalAllowances",
                            "allowNull": true,
                            "defaultValue": 0
                        },
                        "stateAllowances": {
                            "type": Sequelize.INTEGER,
                            "field": "stateAllowances",
                            "allowNull": true,
                            "defaultValue": 0
                        },
                        "additionalFederalWithholding": {
                            "type": Sequelize.DECIMAL(10, 2),
                            "field": "additionalFederalWithholding",
                            "allowNull": true,
                            "defaultValue": 0.00
                        },
                        "additionalStateWithholding": {
                            "type": Sequelize.DECIMAL(10, 2),
                            "field": "additionalStateWithholding",
                            "allowNull": true,
                            "defaultValue": 0.00
                        },
                        "bankName": {
                            "type": Sequelize.STRING(255),
                            "field": "bankName",
                            "allowNull": true
                        },
                        "bankAccountType": {
                            "type": Sequelize.ENUM('checking', 'savings'),
                            "field": "bankAccountType",
                            "allowNull": true
                        },
                        "routingNumber": {
                            "type": Sequelize.STRING(9),
                            "field": "routingNumber",
                            "allowNull": true
                        },
                        "accountNumber": {
                            "type": Sequelize.STRING(20),
                            "field": "accountNumber",
                            "allowNull": true
                        },
                        "healthInsuranceProvider": {
                            "type": Sequelize.STRING(255),
                            "field": "healthInsuranceProvider",
                            "allowNull": true
                        },
                        "healthInsurancePolicyNumber": {
                            "type": Sequelize.STRING(100),
                            "field": "healthInsurancePolicyNumber",
                            "allowNull": true
                        },
                        "healthInsuranceGroupNumber": {
                            "type": Sequelize.STRING(100),
                            "field": "healthInsuranceGroupNumber",
                            "allowNull": true
                        },
                        "driverLicenseNumber": {
                            "type": Sequelize.STRING(50),
                            "field": "driverLicenseNumber",
                            "allowNull": true
                        },
                        "driverLicenseState": {
                            "type": Sequelize.STRING(50),
                            "field": "driverLicenseState",
                            "allowNull": true
                        },
                        "driverLicenseExpiration": {
                            "type": Sequelize.DATEONLY,
                            "field": "driverLicenseExpiration",
                            "allowNull": true
                        },
                        "isEmployee": {
                            "type": Sequelize.BOOLEAN,
                            "field": "isEmployee",
                            "allowNull": true,
                            "defaultValue": false
                        },
                        "canAccessPayroll": {
                            "type": Sequelize.BOOLEAN,
                            "field": "canAccessPayroll",
                            "allowNull": true,
                            "defaultValue": false
                        },
                        "w4OnFile": {
                            "type": Sequelize.BOOLEAN,
                            "field": "w4OnFile",
                            "allowNull": true,
                            "defaultValue": false
                        },
                        "i9OnFile": {
                            "type": Sequelize.BOOLEAN,
                            "field": "i9OnFile",
                            "allowNull": true,
                            "defaultValue": false
                        },
                        "notes": {
                            "type": Sequelize.TEXT,
                            "field": "notes",
                            "allowNull": true
                        },
                        "lastUpdatedBy": {
                            "type": Sequelize.INTEGER,
                            "field": "lastUpdatedBy",
                            "allowNull": true,
                            "references": {
                                "model": "users",
                                "key": "id"
                            },
                            "onUpdate": "CASCADE",
                            "onDelete": "SET NULL"
                        },
                        "createdAt": {
                            "type": Sequelize.DATE,
                            "field": "createdAt",
                            "allowNull": false
                        },
                        "updatedAt": {
                            "type": Sequelize.DATE,
                            "field": "updatedAt",
                            "allowNull": false
                        }
                    },
                    {
                        "transaction": transaction
                    }
                ]
            }];
        };

        return queryInterface.sequelize.transaction(function(transaction) {
            const commands = migrationCommands(transaction);
            return Promise.all(commands.map(function(command) {
                return queryInterface[command.fn].apply(queryInterface, command.params);
            }));
        });
    },
    up: function(queryInterface, Sequelize) {
        return this.execute(queryInterface, Sequelize);
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(function(transaction) {
            const commands = rollbackCommands(transaction);
            return Promise.all(commands.map(function(command) {
                return queryInterface[command.fn].apply(queryInterface, command.params);
            }));
        });
    },
    info: info
};
