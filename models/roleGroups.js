module.exports = (sequelize, DataTypes) => {
    const RoleGroup = sequelize.define('RoleGroup', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
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
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'groups',
          key: 'id'
        }
      }
    }, {
      tableName: 'roleGroups',
      timestamps: false
    });
  
    return RoleGroup;
  };
