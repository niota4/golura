const { Op } = require('sequelize');
const {
    User,
    Role,
    Permission,
    Page,
    UserPermissions,
    RolePermissions,
    Priority
} = require('../models');
const { createNotification } = require('../functions/notifications');

// Get users with the specified permission level on a given page
const getUsersByPermission = async (pageName, companyId, permissions = ['read', 'write', 'admin']) => {
    try {
        const page = await Page.findOne({ where: { name: pageName } });
        if (!page) return [];

        const users = await User.findAll({
            where: { 
                companyId: companyId,
                isActive: true 
            },
            include: [
                {
                    model: UserPermissions,
                    as: 'UserPermissions',
                    required: false,
                    include: [
                        {
                            model: Permission,
                            as: 'Permission',
                            where: {
                                pageId: page.id,
                                action: { [Op.in]: permissions }
                            },
                            required: false
                        }
                    ]
                },
                {
                    model: Role,
                    as: 'Role',
                    required: false,
                    include: [
                        {
                            model: RolePermissions,
                            as: 'RolePermissions',
                            required: false,
                            include: [
                                {
                                    model: Permission,
                                    as: 'Permission',
                                    where: {
                                        pageId: page.id,
                                        action: { [Op.in]: permissions }
                                    },
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        return users.filter(user => {
            // Check direct user permissions
            const hasUserPermission = user.UserPermissions?.some(up => 
                up.Permission && permissions.includes(up.Permission.action)
            );
            
            // Check role-based permissions
            const hasRolePermission = user.Role?.RolePermissions?.some(rp => 
                rp.Permission && permissions.includes(rp.Permission.action)
            );
            
            return hasUserPermission || hasRolePermission;
        });
    } catch (error) {
        console.error('Error getting users by permission:', error);
        return [];
    }
};

// Collect users who should receive task notifications
const getTaskNotificationUsers = async (companyId, assignedUserId = null, creatorUserId = null) => {
    try {
        // Get users with task management permissions
        const taskUsers = await getUsersByPermission('toDos', companyId, ['read', 'write', 'admin']);
        
        // Add specific users if provided
        const specificUsers = [];
        if (assignedUserId) {
            const assignedUser = await User.findByPk(assignedUserId);
            if (assignedUser) specificUsers.push(assignedUser);
        }
        if (creatorUserId) {
            const creatorUser = await User.findByPk(creatorUserId);
            if (creatorUser) specificUsers.push(creatorUser);
        }
        
        // Combine and deduplicate users
        const allUsers = [...taskUsers, ...specificUsers];
        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
        
        return uniqueUsers;
    } catch (error) {
        console.error('Error getting task notification users:', error);
        return [];
    }
};

// Collect users who should receive event notifications
const getEventNotificationUsers = async (companyId, participants = [], assignedUsers = [], clientId = null) => {
    try {
        // Get users with event management permissions
        const eventUsers = await getUsersByPermission('events', companyId, ['read', 'write', 'admin']);
        
        // Get users with calendar permissions
        const calendarUsers = await getUsersByPermission('calendar', companyId, ['read', 'write', 'admin']);
        
        // Add specific participants and assigned users
        const specificUsers = [];
        
        // Add participants
        if (participants.length > 0) {
            const participantUsers = await User.findAll({
                where: { id: { [Op.in]: participants } }
            });
            specificUsers.push(...participantUsers);
        }
        
        // Add assigned users
        if (assignedUsers.length > 0) {
            const assignedUserObjects = await User.findAll({
                where: { id: { [Op.in]: assignedUsers } }
            });
            specificUsers.push(...assignedUserObjects);
        }
        
        // Add client-related users if client is specified
        if (clientId) {
            const clientUsers = await getUsersByPermission('clients', companyId, ['read', 'write', 'admin']);
            specificUsers.push(...clientUsers);
        }
        
        // Combine and deduplicate users
        const allUsers = [...eventUsers, ...calendarUsers, ...specificUsers];
        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
        
        return uniqueUsers;
    } catch (error) {
        console.error('Error getting event notification users:', error);
        return [];
    }
};

// Collect users who should receive estimate notifications
const getEstimateNotificationUsers = async (companyId, assignedEstimatorId = null, clientId = null) => {
    try {
        // Get users with estimate permissions
        const estimateUsers = await getUsersByPermission('estimates', companyId, ['read', 'write', 'admin']);
        
        // Get users with sales-related permissions
        const salesUsers = await getUsersByPermission('reports', companyId, ['write', 'admin']); // Sales team usually has report access
        
        // Get accounting users for financial notifications
        const accountingUsers = await getUsersByPermission('invoices', companyId, ['write', 'admin']);
        
        // Add specific users if provided
        const specificUsers = [];
        if (assignedEstimatorId) {
            const estimatorUser = await User.findByPk(assignedEstimatorId);
            if (estimatorUser) specificUsers.push(estimatorUser);
        }
        
        // Combine and deduplicate users
        const allUsers = [...estimateUsers, ...salesUsers, ...accountingUsers, ...specificUsers];
        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
        
        return uniqueUsers;
    } catch (error) {
        console.error('Error getting estimate notification users:', error);
        return [];
    }
};

// Collect users who should receive work order notifications
const getWorkOrderNotificationUsers = async (companyId, assignedUserIds = [], clientId = null) => {
    try {
        // Get users with work order permissions
        const workOrderUsers = await getUsersByPermission('workOrders', companyId, ['read', 'write', 'admin']);
        
        // Get project managers (usually have work order admin permissions)
        const projectManagers = await getUsersByPermission('workOrders', companyId, ['admin']);
        
        // Add specific assigned users
        const specificUsers = [];
        if (assignedUserIds.length > 0) {
            const assignedUsers = await User.findAll({
                where: { id: { [Op.in]: assignedUserIds } }
            });
            specificUsers.push(...assignedUsers);
        }
        
        // Add client-related users if client is specified
        if (clientId) {
            const clientUsers = await getUsersByPermission('clients', companyId, ['read', 'write', 'admin']);
            specificUsers.push(...clientUsers);
        }
        
        // Combine and deduplicate users
        const allUsers = [...workOrderUsers, ...projectManagers, ...specificUsers];
        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
        
        return uniqueUsers;
    } catch (error) {
        console.error('Error getting work order notification users:', error);
        return [];
    }
};

// Collect chat participants for notification
const getChatNotificationUsers = async (companyId, participantIds = []) => {
    try {
        // Get specific participants
        const participants = [];
        if (participantIds.length > 0) {
            const participantUsers = await User.findAll({
                where: { 
                    id: { [Op.in]: participantIds },
                    companyId: companyId,
                    isActive: true
                }
            });
            participants.push(...participantUsers);
        }
        
        return participants;
    } catch (error) {
        console.error('Error getting chat notification users:', error);
        return [];
    }
};

// Collect users who should receive communication notifications
const getCommunicationNotificationUsers = async (companyId, clientId = null) => {
    try {
        // Get account managers and customer service team
        const accountManagers = await getUsersByPermission('clients', companyId, ['write', 'admin']);
        
        // Get users with communication permissions
        const commUsers = await getUsersByPermission('communications', companyId, ['read', 'write', 'admin']);
        
        // Combine and deduplicate users
        const allUsers = [...accountManagers, ...commUsers];
        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
        
        return uniqueUsers;
    } catch (error) {
        console.error('Error getting communication notification users:', error);
        return [];
    }
};

// Collect users who should receive estimator-related notifications
const getEstimatorNotificationUsers = async (companyId) => {
    try {
        // Get users with estimator/AI permissions
        const estimatorUsers = await getUsersByPermission('estimators', companyId, ['read', 'write', 'admin']);
        
        // Get administrators
        const adminUsers = await getUsersByPermission('settings', companyId, ['admin']);
        
        // Combine and deduplicate users
        const allUsers = [...estimatorUsers, ...adminUsers];
        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
        
        return uniqueUsers;
    } catch (error) {
        console.error('Error getting estimator notification users:', error);
        return [];
    }
};

// Collect users who should receive form notifications
const getFormNotificationUsers = async (companyId, formId = null) => {
    try {
        // Get users with form permissions
        const formUsers = await getUsersByPermission('forms', companyId, ['write', 'admin']);
        
        // Get project managers if form is related to projects
        const projectManagers = await getUsersByPermission('workOrders', companyId, ['admin']);
        
        // Get administrators for form creation notifications
        const adminUsers = await getUsersByPermission('settings', companyId, ['admin']);
        
        // Combine and deduplicate users
        const allUsers = [...formUsers, ...projectManagers, ...adminUsers];
        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
        
        return uniqueUsers;
    } catch (error) {
        console.error('Error getting form notification users:', error);
        return [];
    }
};

// Collect users who should receive inventory notifications
const getInventoryNotificationUsers = async (companyId) => {
    try {
        // Get users with inventory permissions
        const inventoryUsers = await getUsersByPermission('inventory', companyId, ['read', 'write', 'admin']);
        
        // Get purchasing team (usually have invoice or vendor permissions)
        const purchasingUsers = await getUsersByPermission('invoices', companyId, ['write', 'admin']);
        
        // Get warehouse/operations managers
        const opsUsers = await getUsersByPermission('workOrders', companyId, ['admin']);
        
        // Combine and deduplicate users
        const allUsers = [...inventoryUsers, ...purchasingUsers, ...opsUsers];
        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
        
        return uniqueUsers;
    } catch (error) {
        console.error('Error getting inventory notification users:', error);
        return [];
    }
};

// Send notifications to a list of users
const sendNotificationsToUsers = async (users, notificationData, excludeUserId = null) => {
    try {
        for (const user of users) {
            if (excludeUserId && user.id === excludeUserId) continue; // Don't notify the person who triggered the action
            
            await createNotification({
                body: {
                    ...notificationData,
                    targetUserId: user.id
                }
            });
        }
    } catch (error) {
        console.error('Error sending notifications to users:', error);
    }
};

module.exports = {
    getUsersByPermission,
    getTaskNotificationUsers,
    getEventNotificationUsers,
    getEstimateNotificationUsers,
    getWorkOrderNotificationUsers,
    getChatNotificationUsers,
    getCommunicationNotificationUsers,
    getEstimatorNotificationUsers,
    getFormNotificationUsers,
    getInventoryNotificationUsers,
    sendNotificationsToUsers
};
