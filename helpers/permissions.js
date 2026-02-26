const {
    User,
    Role,
    Permission,
    Page,
} = require('../models');

const hasPermission = async (userId, pageName, action) => {
    try {
        const user = await User.findByPk(
            userId, {
                include: [{
                        model: Role,
                        as: 'Role',
                        include: [{
                            model: Permission,
                            as: 'Permissions',
                            include: [{
                                model: Page,
                                as: 'Page',
                            }]
                        }]
                    },
                    {
                        model: Permission,
                        as: 'Permissions',
                        include: [{
                            model: Page,
                            as: 'Page',
                        }]
                    }
                ]
            }
        );

        if (!user) {
            return false;
        }

        const checkPermissions = (permissions, action, pageName) => {
            if (Array.isArray(pageName)) {
                return permissions.some(
                    permission => permission.action === action && pageName.includes(permission.Page.name)
                );
            } else {
                return permissions.some(
                    permission => permission.action === action && permission.Page.name === pageName
                );
            }
        };

        const hasUserPermission = checkPermissions(user.Permissions, action, pageName);
        const hasRolePermission = checkPermissions(user.Role.Permissions, action, pageName);

        return hasUserPermission || hasRolePermission;
    } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
    }
};

module.exports = {
    hasPermission
};
