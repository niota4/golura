const env = process.env;
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const randomcolor = require('randomcolor');
const { getCompletePayStubData } = require('./payrolls');
const {
    User,
    Address,
    ChatMessage,
    ChatRoom,
    ChatParticipant,
    ChatType,
    Role,
    Page,
    Group,
    State,
    Estimate,
    Estimator,
    Event,
    EventType,
    EventParticipant,
    GroupEventType,
    UserWidget,
    Permission,
    UserOnboard,
    UserPermission,
    UserPayRate,
    UserCredentials,
    UserCheckIn,
    UserPreference,
    UserGroup,
    RoleGroup,
    Widget,
    Notification,
    Priority,
    Payroll,
    PayrollItem,
    UserDevice,
    BlacklistedToken,
    Reminder,
    ReminderType,
    UserReminder, // Add this import
    UserFolder,
    UserDocument,
    EstimatePreference,
    EstimateStatus,
    EstimateFollowUp,
    Client,
    ClientAddress,
    ClientEmail,
    ClientPhoneNumber,
    UserLastReadChat,
    EstimateSignature
} = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const socket = require('../sockets');
const { 
    sendUserCreationEmail, 
    sendUserVerificationEmail,
    sendUserPasswordResetEmail
} = require('../helpers/emails');
const { getWeatherByLatLong, getWeatherByIP } = require('../helpers/weather');
const e = require('cors');

// Utility function to check user permissions
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
const create = async (req, res) => {
    const { email, firstName, lastName, roleId, permissions } = req.body;
    const subPages = [
        'dashboard',
        'estimators',
    ]
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (
            existingUser && existingUser.isActive ||
            existingUser && existingUser.isActive == null
        ) {
            return res.status(201).json({
                err: true,
                msg: 'Email is already in use. Please use a different email.'
            });
        }
        const randomNumber = Math.floor(Math.random() * 900000) + 100000;
        const pwdChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const pwdLen = 18;
        const randPassword = Array.from({ length: pwdLen }, () => pwdChars.charAt(Math.floor(Math.random() * pwdChars.length))).join('');

        // Generate a security token
        const securityToken = jwt.sign({
            email,
            randomNumber
        }, env.JWT_ACCESS_TOKEN, {
            expiresIn: '1h'
        });

        // Hash the generated password with increased rounds for security
        const hashedPassword = await bcrypt.hash(randPassword, 12);

        const user = await User.create({
            email,
            firstName,
            lastName,
            roleId,
            securityToken,
            password: hashedPassword,
            isActive: null,
        });

        // Add permissions to UserPermissions
        if (permissions && permissions.length > 0) {
            const userPermissions = permissions.map(permission => ({
                userId: user.id,
                permissionId: permission.id,
                pageId: permission.pageId,
                action: permission.action
            }));
            await UserPermission.bulkCreate(userPermissions);
        }

        const pages = await Page.findAll();

        await Promise.all(pages.map(async (page) => {
            await UserOnboard.create({
                userId: newUser.id,
                pageId: page.id,
                skip: false,
                completed: false,
                completedAt: null
            });
        }));
        // set up onboarding for subPages without pageId
        await Promise.all(subPages.map(async (subPage) => {
            await UserOnboard.create({
                userId: user.id,
                subPage: subPage,
                skip: false,
                completed: false,
                completedAt: null
            });
        }));

        // Set up UserPreferences
        await UserPreference.create({
            userId: user.id,
            notifyByEmail: false,
            notifyByText: false,
            backgroundColor: randomcolor({ luminosity: 'dark', format: 'hex' }),
            darkMode: false,
            minimizeSidebar: false,
            eventMap: 'unit',
        });
        await UserCredentials.create({
            userId: user.id,
            ssn: null,
            birthDate: null,
            street1: null,
            street2: null,
            city: null,
            stateId: null,
            zipCode: null,
            emergencyContactName: null,
            emergencyContactPhone: null,
            emergencyContactRelationship: null,
            hireDate: null,
            terminationDate: null,
            employmentStatus: 'active',
            taxFilingStatus: null,
            federalAllowances: null,
            stateAllowances: null,
            additionalFederalWithholding: null,
            additionalStateWithholding: null,
            bankName: null,
            bankAccountType: null,
            routingNumber: null,
            accountNumber: null,
            driverLicenseNumber: null,
            driverLicenseStateId: null,
            driverLicenseExpiration: null,
            w4OnFile: null,
            i9OnFile: null,
            notes: null,
            createdBy: req.user ? req.user.id : null,
            updatedBy: null
        });

        await sendUserCreationEmail(user, securityToken, randomNumber);

        res.status(201).json({
            err: false,
            msg: 'User created successfully',
            user: user
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createUserReminder = async (req, res) => {
    const { 
        title, 
        description, 
        reminderTypes, 
        userId, 
        date,
        clientId,
        eventId,
        addressId,
        emailId,
        phoneNumberId
    } = req.body;

    try {
        // Ensure the user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ err: true, msg: 'User not found' });
        }

        // Create the user reminder
        const userReminder = await UserReminder.create({
            title,
            description,
            userId,
            date,
            clientId,
            eventId,
            addressId,
            emailId,
            phoneNumberId,
            isActive: true,
            creatorId: req.userId
        });

        // Create reminders for each reminder type
        const reminders = await Promise.all(reminderTypes.map(async (reminderTypeId) => {
            const reminderType = await ReminderType.findByPk(reminderTypeId);
            if (!reminderType) {
                throw new Error(`Reminder type with ID ${reminderTypeId} not found`);
            }

            await Reminder.create({
                reminderTypeId,
                userId,
                userReminderId: userReminder.id,
                clientId,
                eventId,
                addressId,
                emailId,
                phoneNumberId,
                date,
                isActive: true,
                creatorId: req.userId
            });
            console.log({
                reminderTypeId,
                userId,
                userReminderId: userReminder.id,
                clientId,
                eventId,
                addressId,
                emailId,
                phoneNumberId,
                isActive: true,
                creatorId: req.userId
            })
        }));
        socket.sendToSpecific(userId, 'updateReminder', { userReminder, reminders });

        res.status(201).json({
            err: false,
            msg: 'User reminder and associated reminders created successfully',
            userReminder,
            reminders
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createUserFolder = async (req, res) => {
  try {
    const { name, description, parentFolderId } = req.body;
    const userId = req.userId;

    const folder = await UserFolder.create({
      name,
      description,
      parentFolderId,
      userId,
      isActive: true
    });

    res.status(201).json({ err: false, msg: 'Folder created successfully', folder });
  } catch (err) {
    res.status(500).json({ err: true, msg: err.message });
  }
};
const createUserDocument = async (req, res) => {
  try {
    const { url, title, description, folderId, size, format, width, height, duration, resolution, frameRate, pageCount, author, textPreview } = req.body;
    const userId = req.userId;

    const document = await UserDocument.create({
      url,
      title,
      description,
      folderId,
      userId,
      size,
      format,
      width,
      height,
      duration,
      resolution,
      frameRate,
      pageCount,
      author,
      textPreview,
      isActive: true
    });

    res.status(201).json({ err: false, msg: 'Document created successfully', document });
  } catch (err) {
    res.status(500).json({ err: true, msg: err.message });
  }
};
const createUserDeviceToken = async (req, res) => {
    const { expoPushToken, deviceType } = req.body;
    const userId = req.userId;

    try {
        // Check if the user already has a token for this device
        const existingToken = await UserDevice.findOne({
            where: {
                userId: userId,
                pushToken: expoPushToken
            }
        });

        if (existingToken) {
            existingToken.isActive = true; // Ensure the token is marked as active
            existingToken.deviceType = deviceType;
            await existingToken.save();
            return res.status(200).json({
                err: false,
                msg: 'User device token updated successfully',
                userDevice: existingToken
            });
        }

        // Create a new UserDevice entry
        const userDevice = await UserDevice.create({
            userId: userId,
            pushToken: expoPushToken,
            deviceType: deviceType,
            isActive: true
        });

        res.status(201).json({
            err: false,
            msg: 'User device token created successfully',
            userDevice: userDevice
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const login = async (req, res) => {
    let { companyId, email, password, device, pushToken } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Extract device type from user-agent
    let deviceType = 'Unknown';
    if (userAgent.includes('iPhone') ||
        userAgent.includes('iPod') ||
        userAgent.includes('iOS')){
        deviceType = 'iOS';
    } else if (userAgent.includes('Mobile')) {
        deviceType = 'Mobile';
    } else if (userAgent.includes('iPad')) {
        deviceType = 'iPad';
    } else if (userAgent.includes('Tablet') || 
        userAgent.includes('Android')
    ) {
        deviceType = 'Tablet';
    }
    else if (userAgent.includes('Windows') || userAgent.includes('Linux')) {
        deviceType = 'Desktop';
    } else if (userAgent.includes('Macintosh')) {
        deviceType = 'Mac';
    }
    if (device) {
        deviceType = device || deviceType;
    }
    // Fix: Don't reassign pushToken (const), use a new variable
    const trimmedPushToken = typeof pushToken === 'string' ? pushToken.trim() : pushToken;

    const user = await User.findOne(
        { 
            where: { 
                email, 
                companyId,
                isActive: true 
            },
            include: [
                {
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
            ]
        }
    );
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({
                userId: user.id,
                companyId: user.companyId,
                iat: Math.floor(Date.now() / 1000),
                jti: require('crypto').randomBytes(16).toString('hex') // Unique token ID
            },
            env.JWT_ACCESS_TOKEN, {
                expiresIn: '120h', // Reduced from 5 days
                issuer: 'golura-app',
                audience: 'golura-users'
            }
        );
        
        const { password, ...userWithoutPassword } = user.toJSON();

        // Find existing user device by userId, deviceType, and userAgent
        const existingDevice = await UserDevice.findOne({
            where: {
                userId: user.id,
                type: deviceType,
                userAgent: userAgent
            }
        });

        if (existingDevice) {
            // Update the existing device
            existingDevice.token = token;
            existingDevice.ipAddress = ipAddress;
            existingDevice.lastLogin = new Date();
            // Save pushToken if provided
            if (trimmedPushToken) {
                existingDevice.pushToken = trimmedPushToken;
            }
            await existingDevice.save();
        } else {
            // Create a new device entry
            await UserDevice.create({
                userId: user.id,
                type: deviceType,
                userAgent: userAgent,
                token: token,
                ipAddress: ipAddress,
                lastLogin: new Date(),
                pushToken: trimmedPushToken || null
            });
        }

        // Only create onboarding records for missing pages
        const pages = await Page.findAll();
        const existingOnboarding = await UserOnboard.findAll({
            where: { userId: user.id },
            attributes: ['pageId']
        });
        const existingPageIds = new Set(existingOnboarding.map(o => o.pageId));
        const missingPages = pages.filter(page => !existingPageIds.has(page.id));
        await Promise.all(missingPages.map(async (page) => {
            await UserOnboard.create({
                userId: user.id,
                pageId: page.id,
                skip: false,
                completed: false,
                completedAt: null
            });
        }));
        res.status(200).json({
            err: false,
            msg: 'Credentials Valid',
            user: userWithoutPassword,
            token: token
        });
    } else {
        res.status(201).json({
            err: true,
            msg: 'Either username or password is incorrect'
        });
    }
};
const logout = async (req, res) => {
    try {
        const userId = req.userId;
        const userAgent = req.headers['user-agent'];
        const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

        // Find the user device by userId and userAgent
        const userDevice = await UserDevice.findOne({
            where: {
                userId: userId,
                userAgent: userAgent
            }
        });

        if (userDevice) {
            // Remove the user device
            await userDevice.destroy();

            // Add the token to the blacklist
            await BlacklistedToken.create({
                token: token,
                expiresAt: new Date(jwt.decode(token).exp * 1000) // Decode the token to get the expiration time
            });

            res.status(200).json({
                err: false,
                msg: 'User logged out successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'User device not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const get = async (req, res) => {
    try {
        const userId = req.body.id;
        if (!userId) {
            return res.status(400).json({ err: true, msg: 'User ID is required' });
        }

        // Fetch the user and their base associations
        const user = await User.findOne({
            where: { id: userId, isActive: true },
            include: [
                {
                    model: UserPreference,
                    as: 'Preferences'
                },
                {
                    model: UserPayRate,
                    as: 'PayRates',
                    where: { isActive: true },
                    required: false
                },
                {
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
        });

        if (!user) {
            return res.status(404).json({ err: true, msg: 'User not found' });
        }

        // Extract and merge permissions
        const userPermissions = user.Permissions;
        const rolePermissions = user.Role.Permissions;
        const allPermissions = [...userPermissions, ...rolePermissions];
        const permissions = _.uniqBy(allPermissions.map(permission => permission), 'id');

        // Fetch groups associated with the user
        const userGroupRecords = await UserGroup.findAll({
            where: { userId: userId },
            attributes: ['groupId']
        });
        const userGroupIds = userGroupRecords.map(record => record.groupId);

        const groups = await Group.findAll({
            where: { id: userGroupIds, isActive: true },
        });

        // Fetch event types based on user's groups
        const groupEventTypeRecords = await GroupEventType.findAll({
            where: { groupId: userGroupIds },
            attributes: ['eventTypeId']
        });
        const eventTypeIds = groupEventTypeRecords.map(record => record.eventTypeId);

        const eventTypes = await EventType.findAll({
            where: { id: eventTypeIds, isActive: true }
        });

        // Extract pages from permissions
        const pages = _.uniqBy(allPermissions.map(permission => permission.Page), 'id');

        const { password, ...userWithoutPassword } = user.toJSON();
        
        userWithoutPassword.Groups = groups;
        userWithoutPassword.EventTypes = eventTypes;
        userWithoutPassword.Permissions = permissions;
        userWithoutPassword.Pages = pages;

        res.status(200).json({
            err: false,
            msg: 'User successfully retrieved',
            user: userWithoutPassword,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const getReminder = async (req, res) => {
  try {
    const reminderId = req.body.id;
    if (!reminderId) {
      return res.status(400).json({ err: true, msg: 'Reminder ID is required' });
    }

    // Fetch the reminder
    const reminder = await UserReminder.findOne({
      where: { id: reminderId, userId: req.userId, isActive: true },
      include: [
        {
          model: Reminder,
          as: 'Reminders', // Changed alias to match the updated association
          include: [
            {
              model: ReminderType,
              as: 'ReminderType',
              attributes: ['id', 'name']
            },
            {
              model: User,
              as: 'User',
              attributes: ['id', 'firstName', 'lastName', 'email'],
              include: [
                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] }
              ]
            },
            {
              model: User,
              as: 'Creator',
              attributes: ['id', 'firstName', 'lastName', 'email'],
              include: [
                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] }
              ]
            }
          ]
        }
      ]
    });

    if (!reminder) {
      return res.status(404).json({ err: true, msg: 'Reminder not found' });
    }

    res.status(200).json({
      err: false,
      msg: 'Reminder successfully retrieved',
      reminder,
    });
  } catch (err) {
    res.status(500).json({
      err: true,
      msg: err.message
    });
  }
};
const getUserFolder = async (req, res) => {
    try {
        const folderId = req.body.id;
        if (!folderId) {
            return res.status(400).json({ err: true, msg: 'Folder ID is required' });
        }

        const folder = await UserFolder.findOne({
            where: { id: folderId, isActive: true },
            include: [{ model: UserDocument, as: 'UserDocuments' }]
        });

        if (!folder) {
            return res.status(404).json({ err: true, msg: 'Folder not found' });
        }

        res.status(200).json({ err: false, msg: 'Folder retrieved successfully', folder });
    } catch (err) {
        res.status(500).json({ err: true, msg: err.message });
    }
};  
const getUserDocument = async (req, res) => {
    try {
        const documentId = req.body.id;
        if (!documentId) {
            return res.status(400).json({ err: true, msg: 'Document ID is required' });
        }

        const document = await UserDocument.findOne({
            where: { id: documentId, isActive: true },
            include: [
                { model: UserFolder, as: 'Folder' },
                { model: User, as: 'User' }
            ]
        });

        if (!document) {
            return res.status(404).json({ err: true, msg: 'Document not found' });
        }

        res.status(200).json({ err: false, msg: 'Document retrieved successfully', document });
    } catch (err) {
        res.status(500).json({ err: true, msg: err.message });
    }
};
const getUserWeather = async (req, res) => {
    try {
        const { id, latitude, longitude, ip } = req.body;
        let userId = req.userId;
        let ipAddress = ip || req.ip || req.connection.remoteAddress;
        let weatherData = null;

        if (id) {
            userId = id;
        };
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ err: true, msg: 'User not found' });
        }

        if (!latitude || !longitude) {
            if (userId !== user.id) {
                // Check if the user is online
                const onlineUser = socket.getOnlineUser(id);

                if (!onlineUser) {
                    return res.status(400).json({
                        err: true,
                        msg: 'User is not online. Cannot fetch weather data without location.'
                    });
                }
                const getOnlineUser = socket.getOnlineUser(id);
                ipAddress = getOnlineUser.ip;
            }
            // Fetch weather data based on user's IP address
            weatherData = await getWeatherByIP(ipAddress);
        } else {
            // Fetch weather data based on provided latitude and longitude
            weatherData = await getWeatherByLatLong(latitude, longitude);
        }
        res.status(200).json({
            err: false,
            msg: 'Users Weather data retrieved successfully',
            weather: weatherData
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
}
const getUserPayStub = async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.body.userId || req.userId;
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll Item ID is required'
            });
        }
        if (!userId) {
            return res.status(400).json({
                err: true,
                msg: 'User ID is required'
            });
        }

        if (req.userId !== userId) {
            // If not, verify permissions
            const hasPermissionResult = await hasPermission(req.userId, 'payroll', 'view');
            if (!hasPermissionResult) {
                return res.status(403).json({
                    err: true,
                    msg: 'You do not have permission to view this user\'s payroll information.',
                });
            }
        }
        const payrollItem = await PayrollItem.findByPk(id);

        if (!payrollItem) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll Item not found'
            });
        }
        const payStub = await getCompletePayStubData(id);
        
        res.status(200).json({
            err: false,
            msg: 'User pay stub successfully retrieved',
            payStub
        });
    } catch (error) {
        console.error('Error getting user pay stub:', error);
        res.status(500).json({
            err: true,
            msg: 'Error getting user pay stub',
            error: error.message
        });
    }
};
const getUserStatistics = async (req, res) => {
    try {
        const { id, startDate, endDate } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'User ID is required.',
            });
        }

        // Fetch user
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                err: true,
                msg: 'User not found.',
            });
        }

        // Fetch user estimates
        const userEstimates = await Estimate.findAll({
            where: {
                assignedUserId: id,
                isActive: true,
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            }
        });

        // Fetch user events
        const userEvents = await Event.findAll({
            where: {
                creatorId: id,
                isActive: true,
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            }
        });

        // Calculate statistics
        const completedEvents = userEvents.filter(event => event.completed).length;
        const signedButNotConvertedEstimates = userEstimates.filter(estimate => estimate.estimateSignatureId && !estimate.converted).length;
        const convertedEstimates = userEstimates.filter(estimate => estimate.converted).length;

        res.status(200).json({
            err: false,
            msg: 'User statistics successfully retrieved',
            statistics: {
                totalEstimates: userEstimates.length,
                totalEvents: userEvents.length,
                completedEvents,
                convertedEstimates,
                signedButNotConvertedEstimates
            }
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const getUserCredentials = async (req, res) => {
    try {
        const userId = req.body.id || req.userId;
        const credentials = await UserCredentials.findOne({
            where: {
                userId: userId
            }
        });
        if (!credentials) {
            return res.status(404).json({
                err: true,
                msg: 'User credentials not found.'
            });
        }
        res.status(200).json({
            err: false,
            msg: 'User credentials retrieved successfully.',
            credentials: credentials
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const list = async (req, res) => {
    const includeInactive = req.body.includeInactive || false;
    try {
        const users = await User.findAll({
            where: includeInactive ? {} : { isActive: true },
            attributes: [
                'id',
                'email',
                'firstName',
                'lastName',
                'roleId',
                'lastSeen',
                'profilePictureUrl',
                'online',
                'createdAt'
            ],
            include: [
                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                { model: Role, as: 'Role' }
            ]
        });

        res.status(201).json({
            err: false,
            msg: 'Users successfully retrieved',
            users: users
        });
    } catch (err) {
        res.json({
            err: true,
            msg: err.message
        });
    }
};
const listPreferences = async (req, res) => {
    try {
        // Log generated SQL by using logging option
        let preferences = await UserPreference.findOne({
            where: { 
                userId: req.userId
            },
        });


        if (!preferences) {
            try {
                preferences = await UserPreference.create({
                    userId: req.userId,
                    notifyByEmail: false,
                    notifyByText: false,
                    backgroundColor: randomcolor({ luminosity: 'dark', format: 'hex' }),
                    darkMode: false,
                    minimizeSidebar: false,
                    eventMap: 'unit',
                });
            } catch (err) {
                res.status(400).json({
                    err: true,
                    msg: 'Error creating default preferences: ' + err.message
                });
            }
        }
        res.status(201).json({
            err: false,
            msg: 'Preferences successfully retrieved',
            preferences: preferences
        });
    } catch (err) {
        console.error('listPreferences error:', err);
        res.status(400).json({
            err: true,
            msg: err
        });
    }
};
const listOnboarding = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ err: true, msg: 'User ID is required' });
        } 
        const onboarding = await UserOnboard.findAll({
            where: { userId },
            include: [{ model: Page, as: 'Page' }]
        });
        if (onboarding) {
            return res.status(200).json({
                err: false,
                msg: 'Onboarding data retrieved successfully',
                onboarding: onboarding
            });
        } else {

            // If no onboarding data found, create a new ones
            const pages = await Page.findAll();

            await Promise.all(pages.map(async (page) => {
                await UserOnboard.create({
                    userId: newUser.id,
                    pageId: page.id,
                    skip: false,
                    completed: false,
                    completedAt: null
                });
            }));
            // Fetch the newly created onboarding data
            const newOnboarding = await UserOnboard.findAll({
                where: { userId, skip: false, completed: false },
                include: [{ model: Page, as: 'Page' }]
            });
            return res.status(200).json({
                err: false,
                msg: 'Onboarding data created successfully',
                onboarding: newOnboarding
            });
        }
    } catch (err) {
        console.error('Error retrieving onboarding data:', err);
        res.status(500).json({
            err: true,
            msg: 'Failed to retrieve onboarding data',
            error: err.message,
        });
    }
};
const listPages = async (req, res) => {
    try {

        const user = await User.findByPk(
            req.userId, {
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
            res.json({
                err: true,
                msg: 'User not found'
            });
        }
        // Extract permissions from user and role
        const userPermissions = user.Permissions.filter(permission => permission.action === 'view');
        const rolePermissions = user.Role.Permissions.filter(permission => permission.action === 'view');

        // Merge the permissions and get unique pages
        const allPermissions = [...userPermissions, ...rolePermissions];
        const pages = _.uniqBy(allPermissions.map(permission => permission.Page), 'id');


        res.status(201)
            .json({
                err: false,
                msg: 'Pages successfully retrieved',
                pages: pages
            });
    }
    catch (err) {

        res.status(400)
            .json({
                err: true,
                msg: err.message
            });
    };
};
const listPermissions = async (req, res) => {
    try {
        const user = await User.findByPk(
            req.userId, {
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
        // Extract permissions from user and role
        const userPermissions = user.Permissions;
        const rolePermissions = user.Role.Permissions;

        // Merge the permissions
        const allPermissions = [...userPermissions, ...rolePermissions];
        const permissions = _.uniqBy(allPermissions.map(permission => permission), 'id');
        res.status(201)
            .json({
                err: false,
                msg: 'Permissions successfully retrieved',
                permissions: permissions
            });
    }
    catch (err) {

        res.status(400)
            .json({
                err: true,
                msg: err.message
            });
    };
};
const listEventTypes = async (req, res) => {
    try {
        const userId = req.userId;

        const userGroupRecords = await UserGroup.findAll({
            where: { userId: userId },
            attributes: ['groupId']
        });
        const userGroupIds = userGroupRecords.map(record => record.groupId);

        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'Role' }]
        });

        let roleGroupIds = [];
        if (user && user.Role) {
            const roleGroupRecords = await RoleGroup.findAll({
                where: { roleId: user.Role.id },
                attributes: ['groupId']
            });
            roleGroupIds = roleGroupRecords.map(record => record.groupId);
        }

        // Merge and deduplicate
        const combinedGroupIds = [...new Set([...userGroupIds, ...roleGroupIds])];

        console.log('Combined Group IDs:', combinedGroupIds);
        const groupEventTypeRecords = await GroupEventType.findAll({
            where: { groupId: combinedGroupIds },
            attributes: ['eventTypeId']
        });
        const eventTypeIds = groupEventTypeRecords.map(record => record.eventTypeId);
        const eventTypes = await EventType.findAll({
            where: {
                id: eventTypeIds,
                isActive: true  // Only return active event types
            },
            include: [{
                model: Group,
                as: 'Groups',
            }]
        });

        res.status(201).send({
            err: false,
            msg: 'Event Types successfully retrieved',
            eventTypes
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching event types', error: error.message });
    }
};
const listUserEstimates = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.send({
            err: true,
            msg: 'userId is required'
        });
    }
    try {
        const estimates = await Estimate.findAll({
            where: {
                isActive: true,
                assignedUserId: id
            },
            include: [
                {
                    model: EstimatePreference,
                    as: 'EstimatePreference'
                },
                {
                    model: EstimateStatus,
                    as: 'EstimateStatus'
                },
                {
                    model: Client,
                    as: 'Client',
                    include: [
                        {
                            model: ClientAddress,
                            as: 'ClientAddresses',
                            include: [
                                {
                                    model: State,
                                    as: 'State'
                                }
                            ]
                        },
                        {
                            model: ClientEmail,
                            as: 'ClientEmails'
                        },
                        {
                            model: ClientPhoneNumber,
                            as: 'ClientPhoneNumbers'
                        }
                    ]
                },
                {
                    model: EstimateFollowUp,
                    as: 'EstimateFollowUps',
                    include: [
                        {
                            model: User,
                            as: 'CompletedBy',
                            attributes: ['id', 'firstName', 'lastName', 'email'],
                            include: [
                                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                            ]
                        },
                        {
                            model: User,
                            as: 'Creator',
                            attributes: ['id', 'firstName', 'lastName', 'email'],
                            include: [
                                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                            ]
                        }
                    ]
                },
                {
                    model: Event,
                    as: 'Event'
                },
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'AssignedUser',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: EstimateSignature,
                    as: 'EstimateSignature'
                },
            ]
        });

        res.status(201).send({
            err: false,
            msg: 'User Estimates successfully retrieved',
            estimates: estimates
        });
    } catch (err) {
        console.error('Error retrieving estimates:', err);
        res.send({
            err: true,
            msg: 'Error retrieving estimates',
            details: err
        });
    }
};
const listUserEstimators = async (req, res) => {
    try {
        const userId = req.userId;

        const userGroupRecords = await UserGroup.findAll({
            where: { userId: userId },
            attributes: ['groupId']
        });
        const userGroupIds = userGroupRecords.map(record => record.groupId);

        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'Role' }]
        });

        let roleGroupIds = [];
        if (user && user.Role) {
            const roleGroupRecords = await RoleGroup.findAll({
                where: { roleId: user.Role.id },
                attributes: ['groupId']
            });
            roleGroupIds = roleGroupRecords.map(record => record.groupId);
        }

        // Merge and deduplicate
        const combinedGroupIds = [...new Set([...userGroupIds, ...roleGroupIds])];

        const groupEventTypeRecords = await GroupEventType.findAll({
            where: { groupId: combinedGroupIds },
            attributes: ['eventTypeId']
        });
        const eventTypeIds = groupEventTypeRecords.map(record => record.eventTypeId);
        const estimators = await Estimator.findAll({
            where: {
                [Op.or]: [
                    { eventTypeId: eventTypeIds },
                    { eventTypeId: null }
                ],
                isActive: true  // Only return active estimators
            },
            include: [{
                model: EventType,
                as: 'EventType',
            }]
        });

        res.status(201).send({
            err: false,
            msg: 'Estimators successfully retrieved',
            estimators
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching estimators', error: error.message });
    }
};
const listUserEvents = async (req, res) => {
    const { id, limit, offset } = req.body;

    if (!id) {
        return res.send({
            err: true,
            msg: 'userId is required'
        });
    }

    try {
        // Find all eventIds where the user is a participant
        const participantRecords = await EventParticipant.findAll({
            as: 'EventParticipants',
            where: { userId: id },
            attributes: ['eventId']
        });
        const participantEventIds = participantRecords.map(r => r.eventId);

        // Get total count for pagination
        const totalCount = await Event.count({
            where: {
                isActive: true,
                [Op.or]: [
                    { targetUserId: id },
                    { id: { [Op.in]: participantEventIds } }
                ]
            }
        });

        // Fetch events where assignedUserId = id OR user is a participant
        const events = await Event.findAll({
            where: {
                isActive: true,
                [Op.or]: [
                    { targetUserId: id },
                    { id: { [Op.in]: participantEventIds } }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                {
                    model: User,
                    as: 'TargetUser',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                {
                    model: EventParticipant,
                    as: 'EventParticipants',
                    include: [
                        {
                            model: User,
                            as: 'User',
                            attributes: ['id', 'firstName', 'lastName', 'email'],
                            include: [
                                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                            ]
                        }
                    ]
                },
                {
                    model: Group,
                    as: 'Group',
                },
                {
                    model: EventType,
                    as: 'EventType'
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Remove duplicates by event id
        const seen = new Set();
        const uniqueEvents = [];
        for (let i = 0; i < events.length; i++) {
            // Convert event to plain object to allow mutation
            let event = events[i].get ? events[i].get({ plain: true }) : events[i];
            let eventAddress = await Address.findOne({
                where: { id: event.addressId },
                include: [
                    {
                        model: State,
                        as: 'State'
                    }
                ]
            });
            if (event.clientId) {
                eventAddress = await ClientAddress.findOne({
                    where: { id: event.addressId },
                    include: [
                        {
                            model: State,
                            as: 'State'
                        }
                    ]
                });
            }
            event.Address = eventAddress ? eventAddress.get({ plain: true }) : null;
            if (event.Address && event.Address.State && typeof event.Address.State.get === 'function') {
                event.Address.State = event.Address.State.get({ plain: true });
            }
            if (!seen.has(event.id)) {
                seen.add(event.id);
                uniqueEvents.push(event);
            }
        }

        res.status(201).send({
            err: false,
            msg: 'User Events successfully retrieved',
            events: uniqueEvents,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: (parseInt(offset) + uniqueEvents.length) < totalCount
            }
        });
    } catch (err) {
        console.log('Error processing events:', err);
        res.send({
            err: true,
            msg: 'Error processing events',
            details: err
        });
    }
};
const listGroups = async (req, res) => {
    try {
        const userId = req.userId;

        const userGroupRecords = await UserGroup.findAll({
            where: { userId: userId },
            attributes: ['groupId']
        });
        const userGroupIds = userGroupRecords.map(record => record.groupId);

        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'Role' }]
        });
        let roleGroupIds = [];
        console.log('User Role:', user.Role.id);
        if (user && user.Role) {
            const roleGroupRecords = await RoleGroup.findAll({
                where: { roleId: user.Role.id },
                attributes: ['groupId']
            });
            console.log('Role Group Records:', roleGroupRecords);
            roleGroupIds = roleGroupRecords.map(record => record.groupId);
        }
        console.log('User Group IDs:', userGroupIds);
        console.log('Role Group IDs:', roleGroupIds);
        // Merge and deduplicate
        const combinedGroupIds = [...new Set([...userGroupIds, ...roleGroupIds])];
        const groups = await Group.findAll({
            where: {
                id: combinedGroupIds,
                isActive: true  // Only return active groups
            },
            include: [
                {
                    model: UserGroup, // Association with users
                    as: 'UserGroups',
                }
            ]
        });

        res.status(201).send({
            err: false,
            msg: 'Groups successfully retrieved',
            groups
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
};
const listChatRooms = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ err: true, msg: 'User ID is required.' });
        }

        const chatRooms = await ChatRoom.findAll({
            where: { isActive: true },
            include: [
                {
                    model: ChatParticipant,
                    as: 'ChatParticipants',
                    attributes: ['userId']
                },
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] }
                    ]
                },
                {
                    model: ChatMessage,
                    as: 'LastMessage',
                    include: [
                        {
                            model: User,
                            as: 'User',
                            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePictureUrl'],
                            include: [
                                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] }
                            ]
                        }
                    ]
                },
                {
                    model: ChatType,
                    as: 'ChatType',
                    attributes: ['id', 'name']
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        // Get new messages count for each chat room
        const chatRoomIds = chatRooms.map(room => room.id);

        const unreadMessagesCount = await Promise.all(chatRoomIds.map(async (chatRoomId, idx) => {
            const room = chatRooms[idx];
            const lastMsg = room.LastMessage;
            let lastReadChat = await UserLastReadChat.findOne({
                where: { chatRoomId, userId }
            });
            let lastReadMessageId = lastReadChat ? lastReadChat.lastReadMessageId : 0;

            // If the last message is by the current user, mark as read up to that message
            if (lastMsg && lastMsg.userId === userId) {
                // Update or create the UserLastReadChat record to the latest message
                if (lastReadChat) {
                    lastReadChat.lastReadMessageId = lastMsg.id;
                    await lastReadChat.save();
                } else {
                    await UserLastReadChat.create({
                        chatRoomId,
                        userId,
                        lastReadMessageId: lastMsg.id
                    });
                }
                lastReadMessageId = lastMsg.id;
            }

            // Count unread messages after updating lastReadMessageId
            const unreadCount = await ChatMessage.count({
                where: {
                    chatRoomId,
                    id: { [Op.gt]: lastReadMessageId }
                }
            });
            return unreadCount;
        }));

        // Add unread messages count to each chat room
        chatRooms.forEach((room, index) => {
            room.dataValues.unreadMessagesCount = unreadMessagesCount[index];
        });

        // Sort chat rooms by last message date
        chatRooms.sort((a, b) => {
            const aLastMessageDate = a.LastMessage ? a.LastMessage.createdAt : a.createdAt;
            const bLastMessageDate = b.LastMessage ? b.LastMessage.createdAt : b.createdAt;
            return new Date(bLastMessageDate) - new Date(aLastMessageDate);
        });

        // Send the response
        res.status(200).json({
            err: false,
            msg: 'Chat rooms retrieved successfully',
            chatRooms
        });

    } catch (error) {
        console.error('Error retrieving chat rooms:', error);
        return res.status(500).json({ err: true, msg: 'Failed to retrieve chat rooms.', error: error.message });
    }
}
const listNotifications = async (req, res) => {
    try {

        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ err: true, msg: 'User ID is required.' });
        }

        const notifications = await Notification.findAll({
            where: { read: false, targetUserId: userId },
            limit: 100,
            include: [
                { model: User,
                    as: 'User', 
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] }
                    ]
                },
                { model: Priority, as: 'Priority', attributes: ['id', 'level'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json({
            err: false,
            msg: 'Notifications retrieved successfully',
            notifications,
        });
    } catch (error) {
        console.error('Error retrieving notifications:', error);
        return res.status(500).json({ err: true, msg: 'Failed to retrieve notifications.', error: error.message });
    }
};
const listReadNotifications = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ err: true, msg: 'User ID is required.' });
        }

        // Get the date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const notifications = await Notification.findAll({
            where: {
                targetUserId: userId,
                read: true,
                readAt: { [Op.gte]: thirtyDaysAgo } // Notifications from the last 30 days
            },
            limit: 100, // Optional limit for performance
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] }
                    ]
                },
                { model: Priority, as: 'Priority', attributes: ['id', 'level'] },
            ],
            order: [['createdAt', 'DESC']], // Order by most recent first
        });

        return res.status(200).json({
            err: false,
            msg: 'Read notifications retrieved successfully',
            notifications,
        });
    } catch (error) {
        console.error('Error retrieving read notifications:', error);
        return res.status(500).json({ err: true, msg: 'Failed to retrieve read notifications.', error: error.message });
    }
};
const listWidgets = async (req, res) => {
    try {
      const userId = req.userId;
      const widgets = await UserWidget.findAll({
        where: { userId },
        include: [{ model: Widget, as: 'Widget' }]
      });
      res.status(200).json({ err: false, msg: 'User widgets retrieved successfully', widgets });
    } catch (err) {
      res.status(400).json({ err: true, msg: err.message });
    }
};
const listUserCounts = async (req, res) => {
    try {
        const userId = req.userId;

        // Count unread notifications
        const notificationCount = await Notification.count({
            where: { targetUserId: userId, read: false },
        });

        // Count unread chat messages
        const chatRooms = await ChatParticipant.findAll({
            where: { userId },
            attributes: ['chatRoomId']
        });

        const chatRoomIds = chatRooms.map(room => room.chatRoomId);

        const unreadMessagesCount = await Promise.all(chatRoomIds.map(async (chatRoomId) => {
            const lastReadChat = await UserLastReadChat.findOne({
                where: { chatRoomId, userId }
            });

            const lastReadMessageId = lastReadChat ? lastReadChat.lastReadMessageId : 0;

            const unreadCount = await ChatMessage.count({
                where: {
                    chatRoomId,
                    id: { [Op.gt]: lastReadMessageId }
                }
            });

            return unreadCount;
        }));

        const totalUnreadMessages = unreadMessagesCount.reduce((acc, count) => acc + count, 0);

        const counts = {
            notificationCount,
            unreadMessagesCount: totalUnreadMessages
        };

        res.status(200).json({ err: false, msg: 'User Counts retrieved successfully', counts });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const listUserDevices = async (req, res) => {
    try {
        const userId = req.userId;

        const userDevices = await UserDevice.findAll({
            where: { userId },
            attributes: { exclude: ['token'] } // Exclude the token from the response
        });

        res.status(200).json({
            err: false,
            msg: 'User devices retrieved successfully',
            devices: userDevices
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const listUserReminders = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ err: true, msg: 'User ID is required.' });
        }

        const userReminders = await UserReminder.findAll({
            where: { userId, isActive: true },
            include: [
                {
                    model: Reminder,
                    as: 'Reminders',
                    include: [
                        {
                            model: ReminderType,
                            as: 'ReminderType',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });

        res.status(200).json({
            err: false,
            msg: 'User reminders retrieved successfully',
            reminders: userReminders
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const listUserFolders = async (req, res) => {
    try {
        
        let { id } = req.body;

        if (!id) {
            id = req.userId;
        }
        if (!id) {
            return res.status(400).json({ err: true, msg: 'User ID is required' });
        }
        // Fetch the user
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ err: true, msg: 'User not found' });
        }

        // Retrieve all folders from the database with their children
        const folders = await UserFolder.findAll({
            where: { userId: id, isActive: true },
            include: [
                {
                    model: UserFolder,
                    as: 'ChildFolders',
                    where: { isActive: true },
                    separate: true, // Ensures proper ordering of child folders
                    order: [['createdAt', 'ASC']],
                    required: false // Allows for folders without children
                },
            ],
            order: [['createdAt', 'ASC']], // Ensures proper ordering of parent folders
        });

        const buildFolderHierarchy = (folders, parentId = null) => {
            return folders
                .filter(folder => folder.parentFolderId === parentId)
                .map(folder => ({
                    ...folder.dataValues,
                    ChildFolders: buildFolderHierarchy(folders, folder.id),
                }));
        };
        const nestedFolders = buildFolderHierarchy(folders);

        // Respond with both flat and nested folder structures
        res.status(201).json({
            err: false,
            msg: 'Folders successfully retrieved',
            folders: folders, // Flat structure
            nestedFolders: nestedFolders, // Nested structure
        });
    } catch (err) {
        // Error handling
        res.status(500).json({
            err: true,
            msg: 'Error retrieving folders',
            details: err.message || err,
        });
    }
};
const listUserDocuments = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ err: true, msg: 'User ID is required' });
        }

        const documents = await UserDocument.findAll({
            where: { userId, isActive: true }
        });

        res.status(200).json({ err: false, msg: 'Documents retrieved successfully', documents });
    } catch (err) {
        res.status(500).json({ err: true, msg: err.message });
    }
};
const listUserPayRates = async (req, res) => {
    try {
        const userId = req.body.id || req.userId;
        if (!userId) {
            return res.status(400).json({ err: true, msg: 'User ID is required' });
        }
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ err: true, msg: 'User not found' });
        }
        const userPayRates = await UserPayRate.findAll({
            where: {
                userId: user.id
            }
        });
        res.status(200).json({
            err: false,
            msg: 'User pay rates retrieved successfully',
            payRates: userPayRates
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const listUserPayStubs = async (req, res) => {
    try {
        const userId = req.body.id || req.userId;
        let paystub = null;
        let paystubs = [];
        if (!userId) {
            return res.status(400).json({ err: true, msg: 'User ID is required' });
        }
        if (req.userId !== userId) {
            // If not, verify permissions
            const hasPermissionResult = await hasPermission(req.userId, 'payroll', 'view');
            if (!hasPermissionResult) {
                return res.status(403).json({
                    err: true,
                    msg: 'You do not have permission to view this user\'s payroll information.',
                });
            }
        }
        
        let payrollItems = await PayrollItem.findAll({
            where: { employeeId: userId, isActive: true, },
            include: [{ model: Payroll, as: 'Payroll' }]
        });
        // For each payroll item, filter from the Payroll.status = 'approved', and 'paid

        for (let i = payrollItems.length - 1; i >= 0; i--) {
            if (!payrollItems[i].Payroll || (payrollItems[i].Payroll.status !== 'approved' && payrollItems[i].Payroll.status !== 'paid')) {
                payrollItems.splice(i, 1);
            }
        }
        for (let item of payrollItems) {
            paystub = await getCompletePayStubData(item.dataValues.id);
            paystubs.push(paystub);
        }
        // Respond with the paystubs
        res.status(200).json({
            err: false,
            msg: 'Pay stubs retrieved successfully',
            paystubs: paystubs
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const update = async (req, res) => {
    const { id, email, firstName, lastName, phoneNumber, Preferences } = req.body;

    try {
        // Check if the user is updating their own data
        if (req.userId !== id) {
            // If not, verify permissions
            const hasPermissionResult = await hasPermission(req.userId, 'users', 'edit');
            if (!hasPermissionResult) {
                return res.status(403).json({
                    err: true,
                    msg: 'You do not have permission to edit this user.',
                });
            }
        }

        // Fetch the user
        const user = await User.findOne({
            where: { id },
        });

        if (!user) {
            return res.status(404).json({
                err: true,
                msg: 'User not found.',
            });
        }

        // Update basic user fields
        user.email = email || user.email;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phoneNumber = phoneNumber || user.phoneNumber;

        await user.save();

        // Fetch or create user preferences
        let preferences = await UserPreference.findOne({ where: { userId: id } });

        if (!preferences) {
            preferences = await UserPreference.create({ userId: id });
        }

        // Update preferences fields
        if (Preferences) {
            preferences.backgroundColor = Preferences.backgroundColor ?? preferences.backgroundColor;
            preferences.notifyByEmail = Preferences.notifyByEmail ?? preferences.notifyByEmail;
            preferences.notifyByText = Preferences.notifyByText ?? preferences.notifyByText;
            await preferences.save();
        }

        // Fetch updated user data
        const updatedUser = await User.findOne({
            where: { id },
            include: [
                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor', 'notifyByEmail', 'notifyByText'] },
            ],
        });

        res.status(200).json({
            err: false,
            msg: 'User successfully updated.',
            user: updatedUser,
        });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({
            err: true,
            msg: 'Failed to update user.',
            error: err.message,
        });
    }
};
const updatePreferences = async (req, res) => {
    const {
        userId,
        notifyByEmail,
        notifyByText,
        darkMode,
        minimizeSidebar,
        eventSchedulerGroups,
        eventTypes,
        defaultLocation,
        eventCategory,
        backgroundColor,
        eventMap,
        syncCalendar,
        realTimeActivityUpdates,
        activityLimit,
        activityPeriod,
        upcomingEventsPeriod,
        upcomingEventsLimit,
        upcomingEventsIncludeAllUsers,
        salesOverviewPeriod,
        salesOverviewLimit,
        salesOverviewIncludeAllUsers,
        workOrdersSummaryPeriod,
        workOrdersSummaryIncludeAllUsers,
        clientInsightsPeriod,
        clientInsightsLimit,
        invoiceStatusPeriod,
        invoiceStatusIncludeAllUsers,
        estimateAnalyticsPeriod,
        estimateAnalyticsIncludeAllUsers,
        activitySummaryPeriod,
        activitySummaryLimit
    } = req.body;

    let relativeUserId = userId;

    if (!relativeUserId) {
        relativeUserId = req.userId;
    }

    const preferences = await UserPreference.findOne({
        where: {
            userId: relativeUserId
        }
    });

    try {
        if (preferences) {
            // Basic preferences
            preferences.notifyByEmail = notifyByEmail !== undefined ? notifyByEmail : preferences.notifyByEmail;
            preferences.notifyByText = notifyByText !== undefined ? notifyByText : preferences.notifyByText;
            preferences.minimizeSidebar = minimizeSidebar !== undefined ? minimizeSidebar : preferences.minimizeSidebar;
            preferences.eventSchedulerGroups = eventSchedulerGroups !== undefined ? eventSchedulerGroups : preferences.eventSchedulerGroups;
            preferences.eventTypes = eventTypes !== undefined ? eventTypes : preferences.eventTypes;
            preferences.eventCategory = eventCategory !== undefined ? eventCategory : preferences.eventCategory;
            preferences.darkMode = darkMode !== undefined ? darkMode : preferences.darkMode;
            preferences.backgroundColor = backgroundColor !== undefined ? backgroundColor : preferences.backgroundColor;
            preferences.eventMap = eventMap !== undefined ? eventMap : preferences.eventMap;
            preferences.defaultLocation = defaultLocation !== undefined ? defaultLocation : preferences.defaultLocation;
            preferences.syncCalendar = syncCalendar !== undefined ? syncCalendar : preferences.syncCalendar;
            preferences.realTimeActivityUpdates = realTimeActivityUpdates !== undefined ? realTimeActivityUpdates : preferences.realTimeActivityUpdates;
            preferences.activityPeriod = activityPeriod !== undefined ? activityPeriod : preferences.activityPeriod;
            preferences.activityLimit = activityLimit !== undefined ? activityLimit : preferences.activityLimit;
            preferences.upcomingEventsPeriod = upcomingEventsPeriod !== undefined ? upcomingEventsPeriod : preferences.upcomingEventsPeriod;
            preferences.upcomingEventsLimit = upcomingEventsLimit !== undefined ? upcomingEventsLimit : preferences.upcomingEventsLimit;
            preferences.upcomingEventsIncludeAllUsers = upcomingEventsIncludeAllUsers !== undefined ? upcomingEventsIncludeAllUsers : preferences.upcomingEventsIncludeAllUsers;
            preferences.salesOverviewPeriod = salesOverviewPeriod !== undefined ? salesOverviewPeriod : preferences.salesOverviewPeriod;
            preferences.salesOverviewLimit = salesOverviewLimit !== undefined ? salesOverviewLimit : preferences.salesOverviewLimit;
            preferences.salesOverviewIncludeAllUsers = salesOverviewIncludeAllUsers !== undefined ? salesOverviewIncludeAllUsers : preferences.salesOverviewIncludeAllUsers;
            preferences.workOrdersSummaryPeriod = workOrdersSummaryPeriod !== undefined ? workOrdersSummaryPeriod : preferences.workOrdersSummaryPeriod;
            preferences.workOrdersSummaryIncludeAllUsers = workOrdersSummaryIncludeAllUsers !== undefined ? workOrdersSummaryIncludeAllUsers : preferences.workOrdersSummaryIncludeAllUsers;
            preferences.clientInsightsPeriod = clientInsightsPeriod !== undefined ? clientInsightsPeriod : preferences.clientInsightsPeriod;
            preferences.clientInsightsLimit = clientInsightsLimit !== undefined ? clientInsightsLimit : preferences.clientInsightsLimit;
            preferences.invoiceStatusPeriod = invoiceStatusPeriod !== undefined ? invoiceStatusPeriod : preferences.invoiceStatusPeriod;
            preferences.invoiceStatusIncludeAllUsers = invoiceStatusIncludeAllUsers !== undefined ? invoiceStatusIncludeAllUsers : preferences.invoiceStatusIncludeAllUsers;
            preferences.estimateAnalyticsPeriod = estimateAnalyticsPeriod !== undefined ? estimateAnalyticsPeriod : preferences.estimateAnalyticsPeriod;
            preferences.estimateAnalyticsIncludeAllUsers = estimateAnalyticsIncludeAllUsers !== undefined ? estimateAnalyticsIncludeAllUsers : preferences.estimateAnalyticsIncludeAllUsers;
            preferences.activitySummaryPeriod = activitySummaryPeriod !== undefined ? activitySummaryPeriod : preferences.activitySummaryPeriod;
            preferences.activitySummaryLimit = activitySummaryLimit !== undefined ? activitySummaryLimit : preferences.activitySummaryLimit;

            await preferences.save();
            res.status(201)
                .json({
                    err: false,
                    msg: 'Preferences successfully updated',
                    preferences: preferences
                });
        }
    }
    catch (err) {
        res.status(400)
            .json({
                err: true,
                msg: err.message
            });
    }
};
const updateOnboard = async (req, res) => {
    try {
        const { id, skip, completed } = req.body;
        const userId = req.userId;
        
        if (!userId) {
            return res.status(400).json({ err: true, msg: 'User ID is required' });
        };

        const userOnboard = await UserOnboard.findByPk(id);

        if (!userOnboard) {
            return res.status(404).json({ err: true, msg: 'User onboard not found' });
        }   
        // Update the onboard status
        userOnboard.skip = skip !== undefined ? skip : userOnboard.skip;
        userOnboard.completed = completed !== undefined ? completed : userOnboard.completed;

        await userOnboard.save();
        res.status(200).json({
            err: false,
            msg: 'User onboard updated successfully',
            userOnboard
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};      
const updateWidget = async (req, res) => {
    try {
        const userId = req.userId;
        const { widgetId, size, position, desktopSettings, tabletSettings, mobileSettings } = req.body;

        const userWidget = await UserWidget.findOne({ where: { userId, widgetId } });

        if (!userWidget) {
            return res.status(404).json({ err: true, msg: 'User widget not found' });
        }

        // Update the widget's size and position if provided
        if (size) {
            userWidget.size = size;
        }
        if (position) {
            userWidget.position = position;
        }

        // Update the settings for different devices if provided
        if (desktopSettings) {
            userWidget.desktopSettings = desktopSettings;
        }
        if (tabletSettings) {
            userWidget.tabletSettings = tabletSettings;
        }
        if (mobileSettings) {
            userWidget.mobileSettings = mobileSettings;
        }

        await userWidget.save();

        res.status(200).json({ err: false, msg: 'User widget updated successfully', userWidget });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const updateUserFolder = async (req, res) => {
    try {
        const folderId = req.body.id;
        const { name, description, parentFolderId } = req.body;

        if (!folderId) {
            return res.status(400).json({ err: true, msg: 'Folder ID is required' });
        }

        const folder = await UserFolder.findOne({ where: { id: folderId, isActive: true } });
        if (!folder) {
            return res.status(404).json({ err: true, msg: 'Folder not found' });
        }

        folder.name = name || folder.name;
        folder.description = description || folder.description;
        folder.parentFolderId = parentFolderId || folder.parentFolderId;

        await folder.save();

        res.status(200).json({ err: false, msg: 'Folder updated successfully', folder });
    } catch (err) {
        res.status(500).json({ err: true, msg: err.message });
    }
};
const updateUserDocument = async (req, res) => {
    try {
        const documentId = req.body.id;
        const { title, description, folderId } = req.body;

        if (!documentId) {
            return res.status(400).json({ err: true, msg: 'Document ID is required' });
        }

        const document = await UserDocument.findOne({ where: { id: documentId, isActive: true } });
        if (!document) {
            return res.status(404).json({ err: true, msg: 'Document not found' });
        }

        document.title = title || document.title;
        document.description = description || document.description;
        document.folderId = folderId || document.folderId;

        await document.save();

        res.status(200).json({ err: false, msg: 'Document updated successfully', document });
    } catch (err) {
        res.status(500).json({ err: true, msg: err.message });
    }
};
const updateUserPermissions = async (req, res) => {
    try {
        const { id, permissions } = req.body;

        try {
            // Check if the user is updating their own data
            if (req.userId !== id) {
                // If not, verify permissions
                const hasPermissionResult = await hasPermission(req.userId, 'users', 'edit');
                if (!hasPermissionResult) {
                    return res.status(403).json({
                        err: true,
                        msg: 'You do not have permission to edit this user.',
                    });
                }
            }
            // Fetch the user
            const user = await User.findOne({
                where: { id },
                include: [{ model: Role, as: 'Role' }]
            });
            if (!user) {
                return res.status(404).json({
                    err: true,
                    msg: 'User not found.'
                });
            }
            // find the user permissions associated with the user
            const userPermissions = await UserPermission.findAll({
                where: { userId: user.id }
            });
            // If permissions are provided, update or create them
            if (permissions && permissions.length > 0) {
                // First, delete existing permissions for the user
                await UserPermission.destroy({
                    where: { userId: user.id }
                });

                // Then, create new permissions
                const newPermissions = permissions.map(permission => ({
                    userId: user.id,
                    permissionId: permission.id,
                    canView: permission.canView || false,
                    canEdit: permission.canEdit || false,
                    canDelete: permission.canDelete || false
                }));

                await UserPermission.bulkCreate(newPermissions);
            }
            // return the updated permissions
            const updatedPermissions = await UserPermission.findAll({
                where: { userId: user.id },
                include: [{ model: Permission, as: 'Permission' }]
            });
            res.status(200).json({
                err: false,
                msg: 'User permissions updated successfully',
                permissions: updatedPermissions
            });
        } catch (error) {
            return res.status(400).json({
                err: true,
                msg: error.message
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateUserPayRate = async (req, res) => {
    try {
        const { 
            id,
            userId,
            rate,
            overtimeRate,
            rateType,
            effectiveDate,
            endDate,
            isActive,
            isPrimary,
            notes
        } = req.body;

        if (!id) {
            return res.status(400).json({ err: true, msg: 'Pay rate ID is required' });
        };

        const userPayRate = await UserPayRate.findOne({ 
            where: { 
                id,
                userId: userId || req.userId 
            } 
        });

        if (!userPayRate) {
            return res.status(404).json({ err: true, msg: 'User pay rate not found' });
        };

        // Validate dates
        if (effectiveDate && endDate && new Date(endDate) < new Date(effectiveDate)) {
            return res.status(400).json({ err: true, msg: 'End date cannot be before effective date' });
        };
        if (isPrimary) {
            await UserPayRate.update({ isPrimary: false }, { where: { userId: userPayRate.userId } });
        };
        // Update fields
        if (rate !== undefined) userPayRate.rate = rate;
        if (overtimeRate !== undefined) userPayRate.overtimeRate = overtimeRate;
        if (rateType !== undefined) userPayRate.rateType = rateType;
        if (effectiveDate !== undefined) userPayRate.effectiveDate = effectiveDate;
        if (endDate !== undefined) userPayRate.endDate = endDate;
        if (isActive !== undefined) userPayRate.isActive = isActive;
        if (isPrimary !== undefined) userPayRate.isPrimary = isPrimary;
        if (notes !== undefined) userPayRate.notes = notes;
        
        userPayRate.updatedBy = req.userId;

        await userPayRate.save();

        res.status(200).json({ 
            err: false, 
            msg: 'User pay rate updated successfully', 
            userPayRate 
        });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const updateUserCredentials = async (req, res) => {
    const { 
        id,
        ssn,
        birthDate,
        street1,
        street2,
        city,
        stateId,
        zipCode,
        employeeId,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
        hireDate,
        terminationDate,
        employmentStatus,
        taxFilingStatus,
        federalAllowances,
        stateAllowances,
        additionalFederalWithholding,
        additionalStateWithholding,
        bankName,
        bankAccountType,
        routingNumber,
        accountNumber,
        driverLicenseNumber,
        driverLicenseStateId,
        driverLicenseExpiration,
        w4OnFile,
        i9OnFile,
        notes,
    } = req.body;

    try {
        // Check if the user is updating their own data
        if (req.userId !== employeeId) {
            // If not, verify permissions
            const hasPermissionResult = await hasPermission(req.userId, 'payroll', 'edit');
            if (!hasPermissionResult) {
                return res.status(403).json({
                    err: true,
                    msg: 'You do not have permission to edit this user.',
                });
            }
        }

        // Fetch the user
        const userCredentials = await UserCredentials.findOne({
            where: { id },
        });

        if (!userCredentials) {
            return res.status(404).json({
                err: true,
                msg: 'User Credentials not found.',
            });
        }
        let hashedSSN = await bcrypt.hash(ssn, 10);
        if (ssn) {
            // Check to see if ssn has changed
            const ssnMatch = await bcrypt.compare(ssn, userCredentials.ssn);
            if (!ssnMatch) {
                // If it has changed, check for uniqueness
                const existingSSN = await UserCredentials.findOne({ where: { ssn: userCredentials.ssn } });
                if (existingSSN) {
                    return res.status(400).json({
                        err: true,
                        msg: 'SSN already in use by another user.',
                    });
                }
            } else {
                // If it hasn't changed, keep the existing hashed SSN
                hashedSSN = userCredentials.ssn;
            }
        }
        userCredentials.ssn = hashedSSN || userCredentials.ssn;
        userCredentials.birthDate = birthDate || userCredentials.birthDate;
        userCredentials.street1 = street1 || userCredentials.street1;
        userCredentials.street2 = street2 || userCredentials.street2;
        userCredentials.city = city || userCredentials.city;
        userCredentials.stateId = stateId || userCredentials.stateId;
        userCredentials.zipCode = zipCode || userCredentials.zipCode;
        userCredentials.emergencyContactName = emergencyContactName || userCredentials.emergencyContactName;
        userCredentials.emergencyContactPhone = emergencyContactPhone || userCredentials.emergencyContactPhone;
        userCredentials.emergencyContactRelationship = emergencyContactRelationship || userCredentials.emergencyContactRelationship;
        userCredentials.hireDate = hireDate || userCredentials.hireDate;
        userCredentials.terminationDate = terminationDate || userCredentials.terminationDate;
        userCredentials.employmentStatus = employmentStatus || userCredentials.employmentStatus;
        userCredentials.taxFilingStatus = taxFilingStatus || userCredentials.taxFilingStatus;
        userCredentials.federalAllowances = federalAllowances !== undefined ? federalAllowances : userCredentials.federalAllowances;
        userCredentials.stateAllowances = stateAllowances !== undefined ? stateAllowances : userCredentials.stateAllowances;
        userCredentials.additionalFederalWithholding = additionalFederalWithholding !== undefined ? additionalFederalWithholding : userCredentials.additionalFederalWithholding;
        userCredentials.additionalStateWithholding = additionalStateWithholding !== undefined ? additionalStateWithholding : userCredentials.additionalStateWithholding;
        userCredentials.bankName = bankName || userCredentials.bankName;
        userCredentials.bankAccountType = bankAccountType || userCredentials.bankAccountType;
        userCredentials.routingNumber = routingNumber || userCredentials.routingNumber;
        userCredentials.accountNumber = accountNumber || userCredentials.accountNumber;
        userCredentials.driverLicenseNumber = driverLicenseNumber || userCredentials.driverLicenseNumber;
        userCredentials.driverLicenseStateId = driverLicenseStateId || userCredentials.driverLicenseStateId;
        userCredentials.driverLicenseExpiration = driverLicenseExpiration || userCredentials.driverLicenseExpiration;
        userCredentials.w4OnFile = w4OnFile !== undefined ? w4OnFile : userCredentials.w4OnFile;
        userCredentials.i9OnFile = i9OnFile !== undefined ? i9OnFile : userCredentials.i9OnFile;
        userCredentials.notes = notes || userCredentials.notes;

        await userCredentials.save();

        res.status(200).json({
            err: false,
            msg: 'User credentials successfully updated.',
            credentials: userCredentials,
        });
        

    } catch (err) {
        console.error('Error updating user credentials:', err);
        res.status(500).json({
            err: true,
            msg: 'Failed to update user credentials.',
            error: err.message,
        });
    }
};
const addWidget = async (req, res) => {
    try {
      const userId = req.userId;
      const { widgetId, settings, mobileSettings, tabletSettings, desktopSettings, size, position } = req.body;
      const userWidget = await UserWidget.create({
        userId,
        widgetId,
        settings,
        mobileSettings,
        tabletSettings,
        desktopSettings,
        size,
        position
      });
      res.status(201).json({ err: false, msg: 'User widget added successfully', userWidget });
    } catch (err) {
      res.status(400).json({ err: true, msg: err.message });
    }
};
const addUserPayRate = async (req, res) => {
    try {
        const { 
            id,
            rate,
            overtimeRate,
            rateType,
            effectiveDate,
            endDate,
            isPrimary,
            notes
         } = req.body;

        const creatorId = req.userId;

        if (!id) {
            return res.status(400).json({ err: true, msg: 'User is required' });
        };
        
        // Validate dates
        if (effectiveDate && new Date(effectiveDate) < new Date()) {
            return res.status(400).json({ err: true, msg: 'Effective date cannot be in the past' });
        };
        if (endDate && effectiveDate && new Date(endDate) < new Date(effectiveDate)) {
            return res.status(400).json({ err: true, msg: 'End date cannot be before effective date' });
        };
        if (isPrimary) {
            await UserPayRate.update({ isPrimary: false }, { where: { userId: id } });
        };
        const userPayRate = await UserPayRate.create({
            userId: id,
            rate,
            overtimeRate,
            rateType: rateType || 'hourly',
            effectiveDate,
            endDate,
            isPrimary: isPrimary || false,
            isActive: true,
            notes,
            creatorId
        });

        res.status(201).json({ err: false, msg: 'User pay rate added successfully', userPayRate });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const deleteUser = async (req, res) => {
    const { id } = req.body;
    try {
        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ err: true, msg: 'User not found' });
        };
        user.online = false;
        user.isActive = false;
        await user.save();

        // Emit a socket event if the user does not have permission
        socket.sendToSpecific(user.id, 'logOut', {
            err: true,
            msg: 'Your account has been deleted. Please contact an administrator for more information.'
        });
        res.status(200).json({ err: false, msg: 'User deleted successfully' });
    }
    catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const deleteUserReminder = async (req, res) => {
    const { id } = req.body;
    try {
        const userReminder = await UserReminder.findOne({ where: { id, userId: req.userId } });

        if (!userReminder) {
            return res.status(404).json({ err: true, msg: 'User reminder not found' });
        }

        // Delete associated reminders
        await Reminder.destroy({ where: { userReminderId: userReminder.id } });

        // Delete the user reminder
        await userReminder.update({ isActive: false });

        res.status(200).json({ err: false, msg: 'User reminder and associated reminders deleted successfully' });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const deleteUserReminders = async (req, res) => {
    const { ids } = req.body;
    try {
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ err: true, msg: 'Invalid request. IDs must be an array.' });
        }

        // Find and delete user reminders
        const userReminders = await UserReminder.findAll({
            where: {
                id: ids,
                userId: req.userId
            }
        });

        if (userReminders.length === 0) {
            return res.status(404).json({ err: true, msg: 'No user reminders found for the given IDs.' });
        }

        // Delete associated reminders
        await Reminder.destroy({ where: { userReminderId: ids } });

        // Change the user reminders to inactive
        await UserReminder.update({ isActive: false }, { where: { id: ids } });

        res.status(200).json({ err: false, msg: 'User reminders and associated reminders deleted successfully' });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const deleteUserFolder = async (req, res) => {
  try {
    const folderId = req.body.id;

    const folder = await UserFolder.findOne({ where: { id: folderId, isActive: true } });
    if (!folder) {
      return res.status(404).json({ err: true, msg: 'Folder not found' });
    }

    folder.isActive = false;
    await folder.save();

    res.status(200).json({ err: false, msg: 'Folder deleted successfully' });
  } catch (err) {
    res.status(500).json({ err: true, msg: err.message });
  }
};
const deleteUserDocument = async (req, res) => {
    try {
      const documentId = req.body.id;
  
      const document = await UserDocument.findOne({ where: { id: documentId, isActive: true } });
      if (!document) {
        return res.status(404).json({ err: true, msg: 'Document not found' });
      }
  
      document.isActive = false;
      await document.save();
  
      res.status(200).json({ err: false, msg: 'Document deleted successfully' });
    } catch (err) {
      res.status(500).json({ err: true, msg: err.message });
    }
};
const removeWidget = async (req, res) => {
    try {
      const userId = req.userId;
      const { widgetId } = req.body;
      const userWidget = await UserWidget.findOne({ where: { userId, widgetId } });
      if (userWidget) {
        await userWidget.destroy();
        res.status(200).json({ err: false, msg: 'User widget removed successfully' });
      } else {
        res.status(404).json({ err: true, msg: 'User widget not found' });
      }
    } catch (err) {
      res.status(400).json({ err: true, msg: err.message });
    }
};
const removeDevice = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.body;

        const device = await UserDevice.findOne({
            where: {
                id,
                userId
            }
        });

        if (device) {
            // Add the token to the blacklist
            await BlacklistedToken.create({
                token: device.token,
                expiresAt: new Date(jwt.decode(device.token).exp * 1000) // Decode the token to get the expiration time
            });

            // Remove the user device
            await device.destroy();

            res.status(200).json({
                err: false,
                msg: 'Device removed successfully'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Device not found'
            });
        }
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const removeUserPayRate = async (req, res) => {
    const { id } = req.body;
    try {
        const userPayRate = await UserPayRate.findOne({ where: { id, userId: req.userId } });

        if (!userPayRate) {
            return res.status(400).json({ err: true, msg: 'User pay rate not found' });
        }
        // Mark the pay rate as inactive instead of deleting
        userPayRate.isActive = false;
        await userPayRate.save();

        res.status(200).json({ err: false, msg: 'User pay rate removed successfully' });
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const removeProfilePicture = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ err: true, msg: 'User not found' });
        }
        user.profilePictureUrl = null;
        await user.save();
        res.status(200).json({ err: false, msg: 'Profile picture removed successfully' });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const assignRole = async (req, res) => {
    const {
        userId
    } = req.body;
    const {
        roleId
    } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (user) {
            user.roleId = roleId;
            await user.save();
            res.json({
                err: false,
                msg: 'Role assigned to user successfully',
                user: user
            });
        }
        else {
            res.status(404)
                .json({
                    err: true,
                    msg: 'User not found'
                });
        }
    }
    catch (error) {
        res.status(400)
            .json({
                err: true,
                msg: error.message
            });
    }
};
const assignPermission = async (req, res) => {
    const {
        userId,
        pageId,
        action
    } = req.body;
    try {
        const permission = await UserPermission.create({
            userId,
            pageId,
            action
        });
        res.status(201)
            .json({
                err: false,
                msg: 'Permission assigned to user successfully',
                permission: permission
            })
    }
    catch (error) {
        res.status(400)
            .json({
                msg: error.message
            });
    }
};
const setup = async (req, res) => {
    const {
        id,
        firstName,
        lastName,
        password,
        phoneNumber,
        profilePictureUrl,
        darkMode,
        notifyByEmail,
        notifyByText
    } = req.body;

    const backgroundColor = randomcolor({
        luminosity: 'dark',
        format: 'hex'
    });
    try {
        const user = await User.findByPk(id);
        if (user) {
            user.firstName = firstName !== undefined ? firstName : user.firstName;
            user.lastName = lastName !== undefined ? lastName : user.lastName;
            user.password = password !== undefined ? await bcrypt.hash(password, 12) : user.password;
            user.phoneNumber = phoneNumber !== undefined ? phoneNumber : null;
            user.profilePictureUrl = profilePictureUrl !== undefined ? profilePictureUrl : false;
            user.notifyByEmail = notifyByEmail !== undefined ? notifyByEmail : false;
            user.notifyByText = notifyByText !== undefined ? notifyByText : false;
            user.darkMode = darkMode !== undefined ? darkMode : false;

            await user.save();

            let userPreferences = await UserPreference.findOne({ where: { userId: user.id } });

            if (userPreferences) {
                userPreferences.backgroundColor = backgroundColor;
                userPreferences.darkMode = darkMode;
                userPreferences.notifyByEmail = notifyByEmail;
                userPreferences.notifyByText = notifyByText;
                userPreferences.eventMap = 'unit';
                userPreferences.minimizeSidebar = false;

                await userPreferences.save();
            } else {
                await UserPreference.create({
                    userId: user.id,
                    notifyByEmail: user.notifyByEmail,
                    notifyByText: user.notifyByText,
                    backgroundColor,
                    darkMode: user.darkMode,
                    minimizeSidebar: false,
                    eventMap: 'unit',
                });
            }

            // Fetch updated user data with associations
            const updatedUser = await User.findOne({
                where: { id: user.id },
                include: [
                    {
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
                ]
            });

            const token = jwt.sign({
                    userId: user.id
                },
                env.JWT_ACCESS_TOKEN, {
                    expiresIn: '5d'
                }
            );

            res.json({
                err: false,
                msg: 'User setup successfully',
                user: updatedUser,
                token
            });
        }
        else {
            res.status(404)
                .json({
                    err: true,
                    msg: 'User not found'
                });
        }
    }
    catch (error) {
        res.status(400)
            .json({
                err: true,
                msg: error.message
            });
    }
};
const restore = async (req, res) => {
    const {
        id
    } = req.body;
    try {
        const user = await User.findByPk(id);
        if (user) {
            
            const takenEmail = await User.findOne({ where: { email: user.email } });
            if (takenEmail) {
                return res.status(400).json(
                    { 
                        err: true, 
                        msg: 'Email has already been taken by an active user' 
                    }
                );
            };
            user.isActive = true;
            await user.save();
            res.json({
                err: false,
                msg: 'User restored successfully'
            });
        }
        else {
            res.status(404)
                .json({
                    err: true,
                    msg: 'User not found'
                });
        }
    }
    catch (error) {
        res.status(400)
            .json({
                err: true,
                msg: error.message
            });
    }
};
const resetPassword = async (req, res) => {
    const { id, password } = req.body;
    try {
        const user = await User.findOne({ where: { id } });
        if (user) {
            const passwordComparison = bcrypt.compare(password, user.password);
            if (passwordComparison) {
                return res.status(400).json(
                    { 
                        err: true, 
                        msg: 'Password cannot be the same as the current password' 
                    }
                );
            }
            user.password = await bcrypt.hash(password, 12);
            await user.save();
            res.json({
                err: false,
                msg: 'Password reset successfully'
            });
        }
        else {
            res.status(404)
                .json({
                    err: true,
                    msg: 'User not found'
                });
        }
    }
    catch (error) {
        res.status(400)
            .json({
                err: true,
                msg: error.message
            });
    }
};
const sendVericationEmail = async (req, res) => {
    const { id, expired } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
        return res.status(404).json({
            err: true,
            msg: 'User not found'
        });
    }
    const randomNumber = Math.floor(Math.random() * 900000) + 100000;
    const email = user.email;

    // Generate a security token
    const securityToken = jwt.sign({
        email,
        randomNumber
    }, env.JWT_ACCESS_TOKEN, {
        expiresIn: '1h'
    });
    try {
        await user.update({
            securityToken: securityToken,
        });
        await sendUserVerificationEmail(user, securityToken, randomNumber);

        if (expired) {
            return;
        } else {
            return res.status(201).json({
                err: false,
                msg: 'Verification email sent successfully'
            });
        };
    } catch (error) {
        res.status(400).json({
            err: true,
            msg: error.message
        });
    }
};
const sendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ err: true, msg: 'Email is required' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return res.status(201).json({ err: true, msg: 'User that belongs to this email not found' });
    }
    const randomNumber = Math.floor(Math.random() * 900000) + 100000;
    const securityToken = jwt.sign({
        email,
        userId: user.id,
        randomNumber
    }, env.JWT_ACCESS_TOKEN, {
        expiresIn: '1h'
    });
    if (user.isActive === null) {
        user.securityToken = securityToken;
        
        await user.save();
        await sendUserCreationEmail(user, securityToken, randomNumber);

        return res.status(201).json({ err: false, msg: 'User that belongs received an email to finish setting up their accound' });
    } else if (user.isActive === false) {
        return res.status(201).json({ err: true, msg: 'User that belongs to this email not found' });
    }
    try {
        await user.update({
            securityToken: securityToken
        });
        await sendUserPasswordResetEmail(user, securityToken);
        return res.status(201).json({ err: false, msg: 'Password reset email sent successfully' });
    } catch (error) {
        return res.status(400).json({ err: true, msg: error.message });
    }
};
const readNotification = async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.userId;

        if (!id) {
            return res.status(400).json({ err: true, msg: 'Notification ID is required' });
        }

        const notification = await Notification.findOne({
            where: {
                id: id,
                targetUserId: userId
            }
        });

        if (!notification.readAt) {
            await notification.update(
                {
                    read: true,
                    readAt: new Date()
                }
            );
        }

        const notificationCount = await Notification.count({
            where: { targetUserId: userId, read: false },
        });

        // Emit a socket event if the user does not have permission
        socket.updateCount(req.userId, 'notification', notificationCount);

        res.status(200).json({
            err: false,
            msg: 'User Notification read',
        });
    } catch (err) {
        console.error('Error reading notification:', err);
        res.status(500).json({ err: true, msg: 'Failed to reading notification.', err: err.message });
    }
};
const readNotifications = async (req, res) => {
    try {
        const userId = req.userId;

        const notifications = await Notification.findAll({
            where: {
                id: req.body,
                targetUserId: userId,
            },
        });

        if (!notifications.length) {
            return res.status(400).json({ err: true, msg: 'No notifications found' });
        }

        await Notification.update(
            { 
                read: true, 
                readAt: new Date()
             },
            {
                where: {
                    id: req.body,
                    targetUserId: userId,
                },
            }
        );
        const notificationCount = await Notification.count({
            where: { targetUserId: userId, read: false },
        });

        // Emit a socket event if the user does not have permission
        socket.updateCount(userId, 'notification', notificationCount);

        res.status(200).json({
            err: false,
            msg: 'User Notifications read',
        });
    } catch (error) {
        console.error('Error reading notifications:', error);
        throw error;
    }
};

module.exports = {
    create,
    createUserReminder,
    createUserFolder,
    createUserDocument,
    createUserDeviceToken,
    login,
    logout,
    get,
    getReminder,
    getUserFolder,
    getUserDocument,
    getUserWeather,
    getUserStatistics,
    getUserCredentials,
    getUserPayStub,
    list,
    listPreferences,
    listOnboarding,
    listPages,
    listPermissions,
    listGroups,
    listNotifications,
    listChatRooms,
    listReadNotifications,
    listEventTypes,
    listUserEstimates,
    listUserEstimators,
    listUserEvents,
    listUserPayRates,
    listWidgets,
    listChatRooms,
    listUserCounts,
    listUserDevices,
    listUserReminders,
    listUserFolders,
    listUserDocuments,
    listUserPayStubs,
    update,
    updatePreferences,
    updateOnboard,
    updateWidget,
    updateUserFolder,
    updateUserDocument,
    updateUserPermissions,
    updateUserPayRate,
    updateUserCredentials,
    setup,
    restore,
    sendVericationEmail,
    sendPasswordResetEmail,
    deleteUser,
    deleteUserReminder,
    deleteUserReminders,
    deleteUserFolder,
    deleteUserDocument,
    addWidget,
    addUserPayRate,
    removeUserPayRate,
    removeWidget,
    removeDevice,
    resetPassword,
    removeProfilePicture,
    assignRole,
    assignPermission,
    readNotification,
    readNotifications,
}