const {
    User,
    Company,
    Role,
    Permission, 
    RolePermission,
    UserPreference,
    Group,
    EventType,
    GroupEventType,
    Event,
    EstimateStatus // Add this import
} = require('../models');
const randomColor = require('randomcolor');

const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {

        // Check if admin user exists, if not create it
        const adminUser = await User.findOne({
            where: {
                email: 'admin@example.com',
            }
        });
        const adminRole = await Role.findOne({
            where: {
                name: 'administrator',
            }
        });
        const company = await Company.findByPk(res.companyId);

        const password = await bcrypt.hash('password', 10);

        const createDefaultUser = async () => {
            if (!adminUser) {
                const newUser = await User.create({
                    firstName: 'system',
                    lastName: 'administrator',
                    email: 'admin@example.com',
                    password: password,
                    roleId: adminRole.id
                });
                await UserPreference.create({
                    userId: newUser.id,
                    backgroundColor: randomColor()
                });
                return newUser;
            }
            return adminUser;
        };
        
        const createDefaultCompany = async () => {
            if (!company) {
                // Ensure the referenced estimate status exists
                const defaultEstimateStatus = await EstimateStatus.findOne({ where: { name: 'active' } });
                if (!defaultEstimateStatus) {
                    throw new Error('Default estimate status not found');
                }

                const newCompany = await Company.create({
                    name: 'New Company',
                    estimateDefaultStatusId: defaultEstimateStatus.id // Reference the existing estimate status
                });
                return newCompany;
            }
            return company;
        };

        const ensureAdminHasAllPermissions = async () => {
            try {
                // Fetch the admin role
                const adminRole = await Role.findOne({ where: { name: 'administrator' } });
                if (!adminRole) {
                    console.error('Admin role not found!');
                    return;
                }
        
                // Fetch all permissions
                const allPermissions = await Permission.findAll({ attributes: ['id'] });
                const allPermissionIds = allPermissions.map(p => p.id);
        
                // Fetch permissions assigned to the admin role
                const assignedPermissions = await RolePermission.findAll({
                    where: { roleId: adminRole.id },
                    attributes: ['permissionId']
                });
                const assignedPermissionIds = assignedPermissions.map(rp => rp.permissionId);
        
                // Determine missing permissions
                const missingPermissions = allPermissionIds.filter(id => !assignedPermissionIds.includes(id));
        
                // Add missing permissions
                if (missingPermissions.length > 0) {
                    const newRolePermissions = missingPermissions.map(permissionId => ({
                        roleId: adminRole.id,
                        permissionId
                    }));
                    await RolePermission.bulkCreate(newRolePermissions);
                    return `Added ${newRolePermissions.length} missing permissions to admin role.`;
                } else {
                    return 'Admin role already has all permissions.';
                }
            } catch (error) {
                return error
            }
        };

        const findAdminGroup = async () => {
            const adminGroup = await Group.findOne({
                where: { name: 'Administrative Staff' }
            });
            return adminGroup;
        };

        const createDefaultEventType = async (adminGroup) => {
            const eventTypeCount = await EventType.count();
            if (eventTypeCount === 0) {
                const defaultEventType = await EventType.create({
                    name: 'Default EventType',
                    backgroundColor: '#FFFFFF',
                    isActive: true
                });
                await GroupEventType.create({
                    groupId: adminGroup.id,
                    eventTypeId: defaultEventType.id
                });
                return defaultEventType;
            }
            return null;
        };

        const createDefaultEvent = async (adminGroup, defaultEventType) => {
            const eventCount = await Event.count();
            if (eventCount === 0) {
                await Event.create({
                    title: 'Default Event',
                    startDate: new Date(),
                    endDate: new Date(),
                    priorityId: 1, // Assuming priorityId 1 exists
                    statusId: 1, // Assuming statusId 1 exists
                    isActive: true,
                    groupId: adminGroup.id,
                    eventTypeId: defaultEventType.id
                });
            }
        };

        await createDefaultUser();
        await createDefaultCompany();
        await ensureAdminHasAllPermissions();

        const adminGroup = await findAdminGroup();
        if (adminGroup) {
            const defaultEventType = await createDefaultEventType(adminGroup);
            if (defaultEventType) {
                await createDefaultEvent(adminGroup, defaultEventType);
            }
        }

        console.log('Database seeding completed successfully');
    }
    catch (error) {
        console.error(
            'Error seeding database:',
            error
        );
    }
};
seedDatabase()
    .then(
        () => {
            console.log('Seeding completed!');
        }
    )
    .catch(
        err => {
            console.error('Seeding failed:', err);
            process.exit(1);
        }
    );