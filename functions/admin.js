const {
    Company,
    CompanyType,
    State,
    Group,
    EventType,
    Role,
    Template,
    RolePermission,
    User,
    Event,
    UserGroup,
    RoleGroup,
    Widget,
    RoleWidget,
    GroupEventType,
    Permission,
    Estimate,
    Client,
    EstimateStatus,
    RecurrencePattern,
    UserPreference,
    UserCredentials,
    UserOnboard,
    ShortCode,
    Variable,
    Integration, 
    CompanyIntegration,
    SubscriptionPlan,
    CompanySubscription,
    Labor,
    Page,
    PaymentMethod,
    PhoneNumber,
    TextMessage
} = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const randomcolor = require('randomcolor');
const { sendCompanyVerificationEmail } = require('../helpers/emails');
const { 
  createConnectAccount,
  createAccountLink,
  getConnectAccount
} = require('../helpers/stripe');
const {
  searchAvailablePhoneNumbers,
  purchasePhoneNumber,
  releasePhoneNumber,
  updatePhoneNumber,
  getPhoneNumber,
  listOwnedPhoneNumbers
} = require('../helpers/twilio');

// Import centralized helpers for Phase 1 refactor
const { authenticate } = require('../helpers/validate');
const { hasPermission } = require('../helpers/permissions');
const { ValidationRunner } = require('../helpers/validationSchemas');
const { createPIIField } = require('../helpers/piiHelper');

const getCompany = async (req, res) => {
    try {
        // Check permissions using centralized helper
        const hasCompanyViewPermission = await hasPermission(req.userId, 'admin', 'view_company');
        if (!hasCompanyViewPermission) {
            return res.status(403).json({
                err: true,
                msg: 'Insufficient permissions to view company details'
            });
        }

        const company = await Company.findByPk(res.companyId,{
            include: [{
                model: State,
                as: 'State'
            }, {
                model: EstimateStatus,
                as: 'DefaultEstimateStatus'
            },
            {
                model: CompanyIntegration,
                as: 'Integrations',
            }
        ]
        });
        if (company) {
            // Apply PII protection to company data
            const companyData = company.toJSON();
            companyData.name = createPIIField(companyData.name, 'companyName');
            companyData.address = createPIIField(companyData.address, 'address');
            companyData.email = createPIIField(companyData.email, 'email');
            
            res.status(201)
                .json({
                    err: false,
                    msg: 'Company successfully retrieved',
                    company: companyData
                });
        }
        else {
            res.json({
                err: true,
                msg: 'Groups not found'
            });
        }
    }
    catch (err) {
        res.json({
            err: true,
            msg: err.message
        });
    }
};
const getWidget = async (req, res) => {
    try {
      // Validate input parameters
      const validationResult = await ValidationRunner.validate(req.body, 'GET_WIDGET');
      if (!validationResult.isValid) {
        return res.status(400).json({
          err: true,
          msg: 'Invalid request parameters',
          errors: validationResult.errors
        });
      }

      // Check permissions using centralized helper
      const hasWidgetViewPermission = await hasPermission(req.userId, 'admin', 'view_widgets');
      if (!hasWidgetViewPermission) {
        return res.status(403).json({
          err: true,
          msg: 'Insufficient permissions to view widgets'
        });
      }

      const { id } = req.body;
      const widget = await Widget.findByPk(id);
      if (widget) {
        res.status(200).json({ err: false, msg: 'Widget retrieved successfully', widget });
      } else {
        res.status(404).json({ err: true, msg: 'Widget not found' });
      }
    } catch (err) {
      res.status(400).json({ err: true, msg: err.message });
    }
};
const getRoleWidget = async (req, res) => {
    try {
      // Validate input parameters
      const validationResult = await ValidationRunner.validate(req.body, 'GET_ROLE_WIDGET');
      if (!validationResult.isValid) {
        return res.status(400).json({
          err: true,
          msg: 'Invalid request parameters',
          errors: validationResult.errors
        });
      }

      // Check permissions using centralized helper
      const hasRoleWidgetViewPermission = await hasPermission(req.userId, 'admin', 'view_role_widgets');
      if (!hasRoleWidgetViewPermission) {
        return res.status(403).json({
          err: true,
          msg: 'Insufficient permissions to view role widgets'
        });
      }

      const { roleId } = req.body;
      const roleWidgets = await RoleWidget.findAll({
        where: { roleId },
        include: [{ model: Widget, as: 'Widget' }]
      });
      res.status(200).json({ err: false, msg: 'Role widgets retrieved successfully', roleWidgets });
    } catch (err) {
      res.status(400).json({ err: true, msg: err.message });
    }
};
const getTemplate = async (req, res) => {
    try {
        const template = await Template.findOne({
            where: { id: req.body.id, isActive: true }
        });
        if (template) {
            res.status(200)
                .json({
                    err: false,
                    msg: 'Template retrieved successfully',
                    template
                });
        } else {
            res.json({
                err: true,
                msg: 'Template not found'
            });
        }
    } catch (err) {
        res.status(400)
            .json({
                err: true,
                msg: err.message
            });
    }
};
const getIntegration = async (req, res) => {
    try {
        const integration = await Integration.findOne({
            where: { id: req.body.id }
        });
        if (integration) {
            res.status(200)
                .json({
                    err: false,
                    msg: 'Integration retrieved successfully',
                    integration
                });
        } else {
            res.json({
                err: true,
                msg: 'Integration not found'
            });
        }
    } catch (err) {
        res.status(400)
            .json({
                err: true,
                msg: err.message
            });
    }
};
const getLabor = async (req, res) => {
    const { id } = req.body;

    try {
        const labor = await Labor.findByPk(id);

        if (!labor) {
            return res.status(404).json({
                err: true,
                msg: 'Labor entry not found'
            });
        }

        res.status(200).json({
            err: false,
            msg: 'Labor entry successfully retrieved',
            labor
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const getStripeAccount = async (req, res) => {
    try {
        const company = await Company.findByPk(res.companyId);
        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }

        if (!company.stripeAccountId) {
            return res.status(200).json({
                err: false,
                msg: 'No Stripe account connected',
                account: null
            });
        }

        const account = await getConnectAccount(company.stripeAccountId);
        
        res.status(200).json({
            err: false,
            msg: 'Stripe account retrieved successfully',
            account
        });
    } catch (error) {
        console.error('Error retrieving Stripe account:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to retrieve Stripe account',
            error: error.message
        });
    }
};
const getStripeSettings = async (req, res) => {
    try {
        const company = await Company.findByPk(res.companyId);
        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }

        // Get Stripe account info
        let account = null;
        if (company.stripeAccountId) {
            try {
                account = await getConnectAccount(company.stripeAccountId);
            } catch (error) {
                console.error('Error retrieving Stripe account:', error);
            }
        }

        // Get payment methods
        const paymentMethods = await PaymentMethod.findAll({
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            err: false,
            msg: 'Stripe settings retrieved successfully',
            account,
            paymentMethods,
            achSettings: {
                enabled: company.achPaymentsEnabled || false,
                processingFee: company.achProcessingFee || 0.80,
                requireVerification: company.achRequireVerification || true
            }
        });
    } catch (error) {
        console.error('Error retrieving Stripe settings:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to retrieve Stripe settings',
            error: error.message
        });
    }
};
const listTemplates = async (req, res) => {
    try {
        // Check permissions using centralized helper
        const hasTemplateListPermission = await hasPermission(req.userId, 'admin', 'list_templates');
        if (!hasTemplateListPermission) {
            return res.status(403).json({
                err: true,
                msg: 'Insufficient permissions to list templates'
            });
        }

        const templates = await Template.findAll({
            where: { isActive: true }
        });
        if (templates) {
            res.status(200)
                .json({
                    err: false,
                    msg: 'Templates retrieved successfully',
                    templates
                });
        } else {
            res.json({
                err: true,
                msg: 'Templates not found'
            });
        }
    } catch (err) {
        res.status(400)
            .json({
                err: true,
                msg: err.message
            });
    }
};
const listWidgets = async (req, res) => {
    try {
      const widgets = await Widget.findAll();
      res.status(200).json({ err: false, msg: 'Widgets retrieved successfully', widgets });
    } catch (err) {
      res.status(400).json({ err: true, msg: err.message });
    }
};
const listShortCodes = async (req, res) => {
    try {
      const shortCodes = await ShortCode.findAll();
      res.status(200).json({ err: false, msg: 'Short Codes retrieved successfully', shortCodes });
    } catch (err) {
      res.status(400).json({ err: true, msg: err.message });
    }
};
const listRoleWidgets = async (req, res) => {
    try {
      const widgets = await RoleWidget.findAll({
        include: [{ model: Widget, as: 'Widget' }]
      });
      res.status(200).json({ err: false, msg: 'Role Widgets retrieved successfully', widgets });
    } catch (err) {
      res.status(400).json({ err: true, msg: err.message });
    }
};
const listGroups = async (req, res) => {
    try {
        const groups = await Group.findAll({
            where: { isActive: true },
            include: [
                {
                  model: UserGroup,
                  as: "UserGroups"
                },
                {
                  model: RoleGroup,
                  as: "RoleGroups"
                }
            ]
        });
        if (groups) {
            res.status(201)
                .json({
                    err: false,
                    msg: 'Groups successfully retrieved',
                    groups
                });
        }
        else {
            res.json({
                err: true,
                msg: 'Groups not found'
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
const listRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({
            where: { isActive: true }
        });
        if (roles) {
            res.status(201)
                .json({
                    err: false,
                    msg: 'Roles successfully retrieved',
                    roles
                });
        }
        else {
            res.json({
                err: true,
                msg: 'Roles not found'
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
const listEventTypes = async (req, res) => {
    try {
        const eventTypes = await EventType.findAll({
            where: { isActive: true },
            include: [{
              model: Group,
              as: 'Groups',
            }]
          });
      
        if (eventTypes) {
            res.status(201)
                .json({
                    err: false,
                    msg: 'Event Types successfully retrieved',
                    eventTypes
                });
        }
        else {
            res.json({
                err: true,
                msg: 'Event Types not found'
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
const listPermissions = async (req, res) => {
    try {
        const permissions = await Permission.findAll();
        res.status(200).json({
            err: false,
            permissions: permissions
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listRolePermissions = async (req, res) => {
    try {
        const roles = await Role.findAll({
            include: [{
                model: Permission,
                through: RolePermission,
                as: 'Permissions'
            }]
        });
        res.status(200).json({
            err: false,
            roles: roles
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listArchivedEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            where: { isActive: false },
            include: [
                {
                    model: EventType,  // Include event type
                    as: 'EventType'
                },
                {
                    model: Group,
                    as: 'Group',
                },
                {
                    model: RecurrencePattern,
                    as: 'RecurrencePattern',
                },
                { 
                    model: User, 
                    as: 'Creator', 
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
            ]
        });
        res.status(200).json({
            err: false,
            msg: 'Archived events successfully retrieved',
            events,
        });
    } catch (err) {
        console.error('Error retrieving archived events:', err);
        res.status(500).json({
            err: true,
            msg: 'Error retrieving archived events',
        });
    }
};
const listArchivedEstimates = async (req, res) => {
    try {
        const estimates = await Estimate.findAll({
            where: { isActive: false },
        });
        res.status(200).json({
            err: false,
            msg: 'Archived estimates successfully retrieved',
            estimates,
        });
    } catch (err) {
        console.error('Error retrieving archived estimates:', err);
        res.status(500).json({
            err: true,
            msg: 'Error retrieving archived estimates',
        });
    }
};
const listArchivedUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { isActive: false },
        });
        res.status(200).json({
            err: false,
            msg: 'Archived users successfully retrieved',
            users,
        });
    } catch (err) {
        console.error('Error retrieving archived users:', err);
        res.status(500).json({
            err: true,
            msg: 'Error retrieving archived users',
        });
    }
};
const listArchivedClients = async (req, res) => {
    try {
        const clients = await Client.findAll({
            where: { isActive: false },
        });
        res.status(200).json({
            err: false,
            msg: 'Archived clients successfully retrieved',
            clients,
        });
    } catch (err) {
        console.error('Error retrieving archived clients:', err);
        res.status(500).json({
            err: true,
            msg: 'Error retrieving archived clients',
        });
    }
};
const listIntegrations = async (req, res) => {
    try {
        const integrations = await Integration.findAll();
        res.status(200).json({
            err: false,
            msg: 'Integrations successfully retrieved',
            integrations
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const listVariables = async (req, res) => {
    try {
        const variables = await Variable.findAll();
        res.status(200).json({
            err: false,
            msg: 'Variables successfully retrieved',
            variables
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const listLabor = async (req, res) => {
    try {
        const labor = await Labor.findAll({
            order: [['role', 'ASC']]
        });

        res.status(200).json({
            err: false,
            msg: 'Labor entries successfully retrieved',
            labor
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const setupCompany = async (req, res) => {
    try {
        const {
            name,
            description,
            typeId,
            street1,
            street2,
            city,
            stateId,
            zipCode,
            latitude,
            longitude,
            logoUrl,
        } = req.body;

        const admin = req.body.User;
        
        const company = await Company.findByPk(req.companyId);

        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }
        company.name = name;
        company.description = description;
        company.typeId = typeId;
        company.street1 = street1;
        company.street2 = street2;
        company.city = city;
        company.stateId = stateId;
        company.zipCode = zipCode;
        company.latitude = latitude;
        company.longitude = longitude;
        company.logoUrl = logoUrl;
        await company.save();
        
        // Generate roles and permissions for the company first
        const createdRoles = await generateRolesAndPermissions(company.id);
        
        // Create the admin user
        const hashedPassword = await bcrypt.hash(admin.password, 12);

        // Find the administrator role that was created for this company
        const adminRole = await Role.findOne({ 
            where: { 
                name: 'administrator', 
                companyId: company.id 
            } 
        });
        
        const newUser = await User.create({
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            password: hashedPassword,
            companyId: company.id,
            roleId: adminRole ? adminRole.id : null
        }, {
            skipActivityLogging: true // Skip activity logging during company setup
        });

        // Set up UserPreferences
        await UserPreference.create({
            userId: newUser.id,
            notifyByEmail: false,
            notifyByText: false,
            backgroundColor: randomcolor({ luminosity: 'dark', format: 'hex' }),
            darkMode: false,
            minimizeSidebar: false,
            eventMap: 'unit',
        });
        await UserCredentials.create({
            userId: newUser.id,
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
            createdBy: null,
            updatedBy: null
        });
        const pages = await Page.findAll();
        const subPages = [
            'dashboard',
            'estimators',
        ];

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
                userId: newUser.id,
                subPage: subPage,
                skip: false,
                completed: false,
                completedAt: null
            });
        }));
        const starterPlan = await SubscriptionPlan.findOne({
            where: { name: "starter" }
        });

        if (!starterPlan) {
            return res.status(400).json({
                err: true,
                msg: 'Starter subscription plan not found'
            });
        }

        // Start the 14-day trial on the starter plan
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);

        await CompanySubscription.create({
            companyId: company.id,
            subscriptionPlanId: starterPlan.id,
            status: "trialing",
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEndDate,
            trialStart: new Date(),
            trialEnd: trialEndDate
        });

        await generateEventTypesAndGroups(company.id, company.typeId);

        res.status(201).json({
            err: false,
            msg: "Company and admin user setup successfully",
            company: company,
            user: newUser
        });
    } catch (err) {
        console.error("Error setting up company:", err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createGroup = async (req, res) => {
    try {
        const { name, description, calendar } = req.body;
        const users = req.body.UserGroup ? req.body.UserGroup.map(id => parseInt(id, 10)) : [];  // Convert user IDs to integers
        const roles = req.body.RoleGroup ? req.body.RoleGroup.map(id => parseInt(id, 10)) : [];  // Convert role IDs to integers

        // Create the group with basic details
        const newGroup = await Group.create({
            name,
            description,
            calendar
        });

        // If users are provided, associate them with the group
        if (users.length > 0) {
            await UserGroup.bulkCreate(users.map(userId => ({ groupId: newGroup.id, userId })));
        }

        // If roles are provided, associate them with the group
        if (roles.length > 0) {
            await RoleGroup.bulkCreate(roles.map(roleId => ({ groupId: newGroup.id, roleId })));
        }

        // Fetch the newly created group with associations
        const createdGroup = await Group.findByPk(newGroup.id, {
            include: [
                { model: UserGroup, as: 'UserGroups' },
                { model: RoleGroup, as: 'RoleGroups' }
            ]
        });

        return res.status(201).json({ msg: 'Group created successfully', group: createdGroup });
    } catch (error) {
        return res.status(500).json({ msg: 'Error creating group', error: error.message });
    }
};
const createEventType = async (req, res) => {
    const { name, backgroundColor, tags, map, requireCheckIn, requireCheckOut, active } = req.body;

    try {
        const eventType = await EventType.create({
            name,
            backgroundColor,
            tags,
            requireCheckIn: requireCheckIn !== undefined ? requireCheckIn : false,
            requireCheckOut: requireCheckOut !== undefined ? requireCheckOut : false,
            map,
            active
        });

        res.status(201).json({
            err: false,
            msg: 'EventType successfully created',
            eventType: eventType
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createRole = async (req, res) => {
    const { name, permissions, widgets } = req.body;

    try {
        const newRole = await Role.create({ name: name });

        // Add Permissions
        if (permissions && permissions.length > 0) {
            const permissionIds = permissions.map(p => p.id);
            await Promise.all(permissionIds.map(permissionId => 
                RolePermission.create({ roleId: newRole.id, permissionId: permissionId })
            ));
        }

        // Add Widgets
        if (widgets && widgets.length > 0) {
            const widgetIds = widgets.map(w => w.id);
            await Promise.all(widgetIds.map(widgetId => 
                RoleWidget.create({ roleId: newRole.id, widgetId: widgetId })
            ));
        }

        res.status(201)
        .json(
            { 
                err: false,
                msg: 'Role created with permissions and widgets successfully', 
                role: newRole 
            }
        );
    } catch (error) {
        res.status(500).json({ 
            err: true,
            msg: error.message 
        });
    }
};
const createTemplate = async (req, res) => {
    try {
        const { name, description, data, type } = req.body;
        const userId = req.userId;

        const newTemplate = await Template.create({ name, description, data, type, userId, isActive: true });
        
        res.status(201)
            .json({
                err: false,
                msg: 'Template created successfully',
                newTemplate
            });
    } catch (err) {
        res.status(400)
            .json({
                err: true,
                msg: err.message
            });
    }
};
const createVariable = async (req, res) => {
    try {
        const { name, value, description } = req.body;
        
        // Check if the variable already exists
        const existingVariable = await Variable.findOne({ where: { name } });
        if (existingVariable) {
            return res.status(400).json({
                err: true,
                msg: 'Variable with this name already exists true another name'
            });
        }
        const variable = await Variable.create({ name, value, description, isActive: true });
        res.status(200)
            .json({
                err: false,
                msg: 'Variable created successfully',
                variable
            });
    } catch (err) {
        res.status(400)
            .json({
                err: true,
                msg: err.message
            });
    }
};
const createStripeConnectedAccount = async (req, res) => {
    const { email, firstName, lastName, refreshUrl, returnUrl } = req.body;
    let account = null;
    try {
        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({
                err: true,
                msg: 'User not found'
            });
        }
        
        // check if company already has a Stripe account
        const company = await Company.findByPk(res.companyId);
        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        };
        if (!company.stripeAccountId) {
            // Create a Stripe Connect account
            account = await createConnectAccount({
                email: email || user.email,
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName
            });
            // Save the Stripe account ID to the company record
            company.stripeAccountId = account.id;
            await company.save();

        } else if (company.stripeAccountId) {
            // Retrieve existing Stripe Connect account
            account = await getConnectAccount(company.stripeAccountId);
        };
        // Create an account link for onboarding
        const accountLink = await createAccountLink(account.id, refreshUrl, returnUrl);

        res.status(201).json({
            err: false,
            msg: 'Stripe connected account created successfully',
            account,
            accountLink
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createStripeOnboardingLink = async (req, res) => {
    try {
        const { refreshUrl, returnUrl } = req.body;
        const company = await Company.findByPk(res.companyId);
        
        if (!company || !company.stripeAccountId) {
            return res.status(404).json({
                err: true,
                msg: 'No Stripe account found for this company'
            });
        }

        const accountLink = await createAccountLink(
            company.stripeAccountId,
            refreshUrl || `${process.env.APP_URL}/admin?tab=stripe`,
            returnUrl || `${process.env.APP_URL}/admin?tab=stripe&onboarded=true`
        );

        res.status(200).json({
            err: false,
            msg: 'Onboarding link created successfully',
            accountLink
        });
    } catch (error) {
        console.error('Error creating onboarding link:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to create onboarding link',
            error: error.message
        });
    }
};
const createStripeTestPayment = async (req, res) => {
    try {
        // Only allow in development environment
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                err: true,
                msg: 'Test payments are only allowed in development environment'
            });
        }

        const company = await Company.findByPk(res.companyId);
        if (!company || !company.stripeAccountId) {
            return res.status(404).json({
                err: true,
                msg: 'No Stripe account found for this company'
            });
        }

        // Create a test payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 2000, // $20.00
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
                type: 'test_payment',
                company_id: res.companyId,
                created_by: req.userId
            }
        }, {
            stripeAccount: company.stripeAccountId
        });

        res.status(201).json({
            err: false,
            msg: 'Test payment created successfully',
            paymentIntent: {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                client_secret: paymentIntent.client_secret
            }
        });
    } catch (error) {
        console.error('Error creating test payment:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to create test payment',
            error: error.message
        });
    }
};
const updateCompany = async (req, res) => {
    const { 
        name, 
        description, 
        street1, 
        street2, 
        city, 
        stateId, 
        zipCode, 
        latitude, 
        longitude, 
        logoUrl, 
        hours, 
        eventExpirePast,
        eventRequireChecklist,
        eventChecklistFolderId,
        estimateDefaultMarkup,
        estimateDefaultSalesTaxRate,
        estimateDefaultStatusId,
        estimateEmailNotification,
        estimateCallNotification,
        estimateEmailNotificationDelay,
        estimateCallNotificationDelay,
        minimumEstimatePaymentPercentage,
        lineItemPrice,
        estimateTermsAndConditions,
        invoiceDefaultMarkup,
        invoiceDefaultSalesTaxRate,
        invoiceEmailNotification,
        invoiceCallNotification,
        invoiceEmailNotificationDelay,
        invoiceCallNotificationDelay,
        invoiceTermsAndConditions,
        defaultEventClientTitle,
        defaultEventUserTitle,
        defaultEventGroupTitle,
        defaultEventCompanyTitle,
        eventClientRequireType,
        eventUserRequireType,
        eventGroupRequireType,
        eventCompanyRequireType,
        estimateEmailTemplateId,
        estimatePdfTemplateId,
        estimateSmsTemplateId,
        eventEmailTemplateId,
        eventPdfTemplateId,
        eventSmsTemplateId,
        workOrderEmailTemplateId,
        workOrderPdfTemplateId,
        workOrderSmsTemplateId,
        invoiceEmailTemplateId,
        invoicePdfTemplateId,
        invoiceSmsTemplateId,
        purchaseOrderEmailTemplateId,
        purchaseOrderPdfTemplateId,
        purchaseOrderSmsTemplateId,
        companyDefaultEmailTemplateId,
        companyDefaultPdfTemplateId,
        companyDefaultSmsTemplateId,
        workOrderDefaultWarningReminder,
        workOrderDefaultAlertReminder,
        workOrderDefaultEmergencyReminder,
        workOrderDefaultStatusId,
        workOrderDefaultPriorityId,
        workOrderDefaultEstimatedHours,
        workOrderDefaultHourlyRate,
        workOrderDefaultAssignedUserId,
        workOrderAutoAssignmentMethod,
        workOrderEmailNotification,
        workOrderSmsNotification,
        workOrderAutoAssign,
        workOrderRequireApproval,
        
    } = req.body;

    try {

        // Get first company record
        const company = await Company.findByPk(res.companyId);

        if (company) {
            company.name = name !== undefined ? name : company.name;
            company.description = description !== undefined ? description : company.description;
            company.street1 = street1 !== undefined ? street1 : company.street1;
            company.street2 = street2 !== undefined ? street2 : company.street2;
            company.city = city !== undefined ? city : company.city;
            company.stateId = stateId !== undefined ? stateId : company.stateId;
            company.zipCode = zipCode !== undefined ? zipCode : company.zipCode;
            company.latitude = latitude !== undefined ? latitude : company.latitude;
            company.longitude = longitude !== undefined ? longitude : company.longitude;
            company.hours = hours !== undefined ? hours : company.hours;
            company.logoUrl = logoUrl !== undefined ? logoUrl : company.logoUrl;
            company.eventExpirePast = eventExpirePast !== undefined ? eventExpirePast : company.eventExpirePast;
            company.eventRequireChecklist = eventRequireChecklist !== undefined ? eventRequireChecklist : company.eventRequireChecklist;
            company.eventChecklistFolderId = eventChecklistFolderId !== undefined ? eventChecklistFolderId : company.eventChecklistFolderId;
            company.estimateDefaultMarkup = estimateDefaultMarkup !== undefined ? estimateDefaultMarkup : company.estimateDefaultMarkup;
            company.estimateTermsAndConditions = estimateTermsAndConditions !== undefined ? estimateTermsAndConditions : company.estimateTermsAndConditions;
            company.minimumEstimatePaymentPercentage = minimumEstimatePaymentPercentage !== undefined ? minimumEstimatePaymentPercentage : company.minimumEstimatePaymentPercentage;
            company.estimateDefaultSalesTaxRate = estimateDefaultSalesTaxRate !== undefined ? estimateDefaultSalesTaxRate : company.estimateDefaultSalesTaxRate;
            company.estimateDefaultStatusId = estimateDefaultStatusId !== undefined ? estimateDefaultStatusId : company.estimateDefaultStatusId;
            company.estimateEmailNotification = estimateEmailNotification !== undefined ? estimateEmailNotification : company.estimateEmailNotification;
            company.estimateCallNotification = estimateCallNotification !== undefined ? estimateCallNotification : company.estimateCallNotification;
            company.estimateEmailNotificationDelay = estimateEmailNotificationDelay !== undefined ? estimateEmailNotificationDelay : company.estimateEmailNotificationDelay;
            company.estimateCallNotificationDelay = estimateCallNotificationDelay !== undefined ? estimateCallNotificationDelay : company.estimateCallNotificationDelay;
            company.lineItemPrice = lineItemPrice !== undefined ? lineItemPrice : company.lineItemPrice;
            company.invoiceDefaultMarkup = invoiceDefaultMarkup !== undefined ? invoiceDefaultMarkup : company.invoiceDefaultMarkup;
            company.invoiceDefaultSalesTaxRate = invoiceDefaultSalesTaxRate !== undefined ? invoiceDefaultSalesTaxRate : company.invoiceDefaultSalesTaxRate;
            company.invoiceEmailNotification = invoiceEmailNotification !== undefined ? invoiceEmailNotification : company.invoiceEmailNotification;
            company.invoiceCallNotification = invoiceCallNotification !== undefined ? invoiceCallNotification : company.invoiceCallNotification;
            company.invoiceEmailNotificationDelay = invoiceEmailNotificationDelay !== undefined ? invoiceEmailNotificationDelay : company.invoiceEmailNotificationDelay;
            company.invoiceCallNotificationDelay = invoiceCallNotificationDelay !== undefined ? invoiceCallNotificationDelay : company.invoiceCallNotificationDelay;
            company.invoiceTermsAndConditions = invoiceTermsAndConditions !== undefined ? invoiceTermsAndConditions : company.invoiceTermsAndConditions;
            company.defaultEventClientTitle = defaultEventClientTitle !== undefined ? defaultEventClientTitle : company.defaultEventClientTitle;
            company.defaultEventUserTitle = defaultEventUserTitle !== undefined ? defaultEventUserTitle : company.defaultEventUserTitle;
            company.defaultEventGroupTitle = defaultEventGroupTitle !== undefined ? defaultEventGroupTitle : company.defaultEventGroupTitle;
            company.defaultEventCompanyTitle = defaultEventCompanyTitle !== undefined ? defaultEventCompanyTitle : company.defaultEventCompanyTitle;
            company.eventClientRequireType = eventClientRequireType !== undefined ? eventClientRequireType : company.eventClientRequireType;
            company.eventUserRequireType = eventUserRequireType !== undefined ? eventUserRequireType : company.eventUserRequireType;
            company.eventGroupRequireType = eventGroupRequireType !== undefined ? eventGroupRequireType : company.eventGroupRequireType;
            company.eventCompanyRequireType = eventCompanyRequireType !== undefined ? eventCompanyRequireType : company.eventCompanyRequireType;
            company.estimateEmailTemplateId = estimateEmailTemplateId !== undefined ? estimateEmailTemplateId : company.estimateEmailTemplateId;
            company.estimatePdfTemplateId = estimatePdfTemplateId !== undefined ? estimatePdfTemplateId : company.estimatePdfTemplateId;
            company.estimateSmsTemplateId = estimateSmsTemplateId !== undefined ? estimateSmsTemplateId : company.estimateSmsTemplateId;
            company.eventEmailTemplateId = eventEmailTemplateId !== undefined ? eventEmailTemplateId : company.eventEmailTemplateId;
            company.eventPdfTemplateId = eventPdfTemplateId !== undefined ? eventPdfTemplateId : company.eventPdfTemplateId;
            company.eventSmsTemplateId = eventSmsTemplateId !== undefined ? eventSmsTemplateId : company.eventSmsTemplateId;
            company.workOrderEmailTemplateId = workOrderEmailTemplateId !== undefined ? workOrderEmailTemplateId : company.workOrderEmailTemplateId;
            company.workOrderPdfTemplateId = workOrderPdfTemplateId !== undefined ? workOrderPdfTemplateId : company.workOrderPdfTemplateId;
            company.workOrderSmsTemplateId = workOrderSmsTemplateId !== undefined ? workOrderSmsTemplateId : company.workOrderSmsTemplateId;
            company.invoiceEmailTemplateId = invoiceEmailTemplateId !== undefined ? invoiceEmailTemplateId : company.invoiceEmailTemplateId;
            company.invoicePdfTemplateId = invoicePdfTemplateId !== undefined ? invoicePdfTemplateId : company.invoicePdfTemplateId;
            company.invoiceSmsTemplateId = invoiceSmsTemplateId !== undefined ? invoiceSmsTemplateId : company.invoiceSmsTemplateId;
            company.purchaseOrderEmailTemplateId = purchaseOrderEmailTemplateId !== undefined ? purchaseOrderEmailTemplateId : company.purchaseOrderEmailTemplateId;
            company.purchaseOrderPdfTemplateId = purchaseOrderPdfTemplateId !== undefined ? purchaseOrderPdfTemplateId : company.purchaseOrderPdfTemplateId;
            company.purchaseOrderSmsTemplateId = purchaseOrderSmsTemplateId !== undefined ? purchaseOrderSmsTemplateId : company.purchaseOrderSmsTemplateId;
            company.companyDefaultEmailTemplateId = companyDefaultEmailTemplateId !== undefined ? companyDefaultEmailTemplateId : company.companyDefaultEmailTemplateId;
            company.companyDefaultPdfTemplateId = companyDefaultPdfTemplateId !== undefined ? companyDefaultPdfTemplateId : company.companyDefaultPdfTemplateId;
            company.companyDefaultSmsTemplateId = companyDefaultSmsTemplateId !== undefined ? companyDefaultSmsTemplateId : company.companyDefaultSmsTemplateId;
            
            // Work order settings
            company.workOrderDefaultWarningReminder = workOrderDefaultWarningReminder !== undefined ? workOrderDefaultWarningReminder : company.workOrderDefaultWarningReminder;
            company.workOrderDefaultAlertReminder = workOrderDefaultAlertReminder !== undefined ? workOrderDefaultAlertReminder : company.workOrderDefaultAlertReminder;
            company.workOrderDefaultEmergencyReminder = workOrderDefaultEmergencyReminder !== undefined ? workOrderDefaultEmergencyReminder : company.workOrderDefaultEmergencyReminder;
            company.workOrderDefaultStatusId = workOrderDefaultStatusId !== undefined ? workOrderDefaultStatusId : company.workOrderDefaultStatusId;
            company.workOrderDefaultPriorityId = workOrderDefaultPriorityId !== undefined ? workOrderDefaultPriorityId : company.workOrderDefaultPriorityId;
            company.workOrderDefaultEstimatedHours = workOrderDefaultEstimatedHours !== undefined ? workOrderDefaultEstimatedHours : company.workOrderDefaultEstimatedHours;
            company.workOrderDefaultHourlyRate = workOrderDefaultHourlyRate !== undefined ? workOrderDefaultHourlyRate : company.workOrderDefaultHourlyRate;
            company.workOrderDefaultAssignedUserId = workOrderDefaultAssignedUserId !== undefined ? workOrderDefaultAssignedUserId : company.workOrderDefaultAssignedUserId;
            company.workOrderAutoAssignmentMethod = workOrderAutoAssignmentMethod !== undefined ? workOrderAutoAssignmentMethod : company.workOrderAutoAssignmentMethod;
            company.workOrderEmailNotification = workOrderEmailNotification !== undefined ? workOrderEmailNotification : company.workOrderEmailNotification;
            company.workOrderSmsNotification = workOrderSmsNotification !== undefined ? workOrderSmsNotification : company.workOrderSmsNotification;
            company.workOrderAutoAssign = workOrderAutoAssign !== undefined ? workOrderAutoAssign : company.workOrderAutoAssign;
            company.workOrderRequireApproval = workOrderRequireApproval !== undefined ? workOrderRequireApproval : company.workOrderRequireApproval;

            await company.save();

            res.status(201).json({
                err: false,
                msg: 'Company successfully updated',
                company: company
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateEventType = async (req, res) => {
    const { id, name, backgroundColor, tags, map, requireCheckIn, requireCheckOut, active, groupIds } = req.body;

    try {
        const eventType = await EventType.findOne({ where: { id: id } });

        if (eventType) {
            eventType.name = name !== undefined ? name : eventType.name;
            eventType.backgroundColor = backgroundColor !== undefined ? backgroundColor : eventType.backgroundColor;
            eventType.tags = tags !== undefined ? tags : eventType.tags;
            eventType.map = map !== undefined ? map : eventType.map;
            eventType.requireCheckIn = requireCheckIn !== undefined ? requireCheckIn : eventType.requireCheckIn;
            eventType.requireCheckOut = requireCheckOut !== undefined ? requireCheckOut : eventType.requireCheckOut;
            eventType.isActive = active !== undefined ? active : eventType.isActive;

            await eventType.save();

            if (groupIds && Array.isArray(groupIds)) {
                // Remove existing associations
                await GroupEventType.destroy({ where: { eventTypeId: id } });

                // Add new associations
                for (const groupId of groupIds) {
                    await GroupEventType.findOrCreate({
                        where: { groupId: groupId, eventTypeId: id },
                        defaults: { groupId: groupId, eventTypeId: id }
                    });
                }
            }

            res.status(201).json({
                err: false,
                msg: 'EventType successfully updated',
                eventType: eventType
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'EventType not found'
            });
        }
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateRole = async (req, res) => {
    const { id, name, permissions, widgets } = req.body;

    try {
        const role = await Role.findOne({ where: { id: id } });

        if (!role) {
            return res.status(404).json({
                err: true,
                msg: 'Role not found'
            });
        }

        role.name = name !== undefined ? name : role.name;
        await role.save();

        // Update Permissions
        const permissionIds = permissions.map(p => p.id);

        const currentPermissions = await RolePermission.findAll({ where: { roleId: id } });
        const currentPermissionIds = currentPermissions.map(rp => rp.permissionId);

        const permissionIdsToAdd = permissionIds.filter(p => !currentPermissionIds.includes(p));
        const permissionIdsToRemove = currentPermissionIds.filter(p => !permissionIds.includes(p));

        await Promise.all(permissionIdsToAdd.map(permissionId => 
            RolePermission.create({ roleId: id, permissionId: permissionId })
        ));

        await RolePermission.destroy({ 
            where: { 
                roleId: id, 
                permissionId: permissionIdsToRemove 
            } 
        });

        // Update Widgets
        const widgetIds = widgets.map(w => w.id);

        const currentRoleWidgets = await RoleWidget.findAll({ where: { roleId: id } });
        const currentWidgetIds = currentRoleWidgets.map(rw => rw.widgetId);

        const widgetIdsToAdd = widgetIds.filter(w => !currentWidgetIds.includes(w));
        const widgetIdsToRemove = currentWidgetIds.filter(w => !widgetIds.includes(w));

        await Promise.all(widgetIdsToAdd.map(widgetId => 
            RoleWidget.create({ roleId: id, widgetId: widgetId })
        ));

        await RoleWidget.destroy({ 
            where: { 
                roleId: id, 
                widgetId: widgetIdsToRemove 
            } 
        });

        res.status(201).json({
            err: false,
            msg: 'Role, permissions, and widgets successfully updated',
            role: role
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateGroup = async (req, res) => {
    try {
        const { id, name, description, calendar, UserGroups, RoleGroups } = req.body;

        // Find the group by ID
        const group = await Group.findByPk(id, {
            include: [
                { model: UserGroup, as: 'UserGroups' },
                { model: RoleGroup, as: 'RoleGroups' }
            ]
        });
        if (!group) {
            return res.status(404).json({ err: true, msg: 'Group not found' });
        }

        // Update the group's basic details
        await group.update({ name, description, calendar });

        // Manage users directly in the group
        const currentUsers = await UserGroup.findAll({ where: { groupId: id } });
        const currentUserIds = currentUsers.map(userGroup => userGroup.userId);

        const usersToAdd = UserGroups.filter(userId => !currentUserIds.includes(userId));
        const usersToRemove = currentUserIds.filter(userId => !UserGroups.includes(userId));

        if (usersToAdd.length > 0) {
            await UserGroup.bulkCreate(usersToAdd.map(userId => ({ groupId: id, userId })));
        }
        if (usersToRemove.length > 0) {
            await UserGroup.destroy({ where: { groupId: id, userId: usersToRemove } });
        }

        // Retrieve current roles and determine roles to add and remove
        const currentRoles = await RoleGroup.findAll({ where: { groupId: id } });
        const currentRoleIds = currentRoles.map(roleGroup => roleGroup.roleId);

        const rolesToAdd = RoleGroups.filter(roleId => !currentRoleIds.includes(roleId));
        const rolesToRemove = currentRoleIds.filter(roleId => !RoleGroups.includes(roleId));

        if (rolesToAdd.length > 0) {
            await RoleGroup.bulkCreate(rolesToAdd.map(roleId => ({ groupId: id, roleId })));
        }
        if (rolesToRemove.length > 0) {
            await RoleGroup.destroy({ where: { groupId: id, roleId: rolesToRemove } });
        }

        // Fetch updated group with associations
        const updatedGroup = await Group.findByPk(id, {
            include: [
                { model: UserGroup, as: 'UserGroups' },
                { model: RoleGroup, as: 'RoleGroups' }
            ]
        });

        return res.status(200).json({ err: false, msg: 'Group updated successfully', group: updatedGroup });
    } catch (error) {
        console.error('Error in updateGroup:', error);
        return res.status(500).json({ err: true, msg: 'Error updating group', error: error.message });
    }
};
const updateTemplate = async (req, res) => {
    try {
        const { name, description, data } = req.body;
        const [updated] = await Template.update({ name, description, data }, {
            where: { id: req.body.id, isActive: true }
        });
        if (updated) {
            res.status(200)
                .json({
                    err: false,
                    msg: 'Template updated successfully'
                });
        } else {
            res.json({
                err: true,
                msg: 'Template not found or inactive'
            });
        }
    } catch (err) {
        res.status(400)
            .json({
                err: true,
                msg: err.message
            });
    }
};
const updateVariable = async (req, res) => {
    try {
        const { id, name, value, description } = req.body;

        const variable = await Variable.findOne({ where: { id: id } });

        if (!variable) {
            res.status(404)
                .json({
                    err: true,
                    msg: 'Variable not found'
                });
        }

        // Check if the variable already exists with a different id
        const existingVariable = await Variable.findOne({ where: { name } });
        
        if (existingVariable) {
            // Check if the existing variable is not the same as the one being updated
            if (existingVariable.id !== id) {
                return res.status(400).json({
                    err: true,
                    msg: 'Variable with this name already exists true another name'
                });
            }
        }

        variable.name = name !== undefined ? name : variable.name;
        variable.value = value !== undefined ? value : variable.value;
        variable.description = description !== undefined ? description : variable.description;

        await variable.save();

        res.status(200)
            .json({
                err: false,
                msg: 'Variable updated successfully',
                variable: variable
            });
    } catch (err) {
        res.status(400)
            .json({
                err: true,
                msg: err.message
            });
    }
}
const updateLabor = async (req, res) => {
    const {
        id,
        role,
        rate,
        overtimeRate,
        standardHoursPerDay
    } = req.body;

    try {
        const labor = await Labor.findByPk(id);

        if (!labor) {
            return res.status(404).json({
                err: true,
                msg: 'Labor entry not found'
            });
        }

        await labor.update({
            role,
            rate,
            overtimeRate,
            standardHoursPerDay
        });

        res.status(200).json({
            err: false,
            msg: 'Labor entry successfully updated',
            labor
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const deleteGroup = async (req, res) => {
    try {
      const { id } = req.body;  // Group ID
  
      // Find the group by ID
      const group = await Group.findByPk(id);
      if (!group) {
        return res.status(404).json({ msg: 'Group not found' });
      }
  
      // Set isActive to false to archive the group
      await group.update({ isActive: false });
  
      return res.status(200).json({ msg: 'Group archived successfully', group });
    } catch (error) {
      return res.status(500).json({ msg: 'Error archiving group', error: error.message });
    }
};
const deleteEventType = async (req, res) => {
    try {
      const { id } = req.body;  // Event Type ID
  
      // Find the event type by ID
      const eventType = await EventType.findByPk(id);
      if (!eventType) {
        return res.status(404).json({ msg: 'Event type not found' });
      }
  
      // Set isActive to false to deactivate the event type
      await eventType.update({ isActive: false });
  
      return res.status(200).json({ msg: 'Event type archived successfully', eventType });
    } catch (error) {
      return res.status(500).json({ msg: 'Error archiving event type', error: error.message });
    }
};
const deleteRole = async (req, res) => {
    try {
      const { id } = req.body;  // Role ID
  
      // Find the role by ID
      const role = await Role.findByPk(id);
      if (!role) {
        return res.status(404).json({ msg: 'Role not found' });
      }
  
      // Set isActive to false to deactivate the role
      await role.update({ isActive: false });
  
      return res.status(200).json({ msg: 'Role archived successfully', role });
    } catch (error) {
      return res.status(500).json({ msg: 'Error archiving role', error: error.message });
    }
};
const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.body;
        const template = await Template.findByPk(id);

        if (!template) {
            return res.status(404)
                .json({
                    err: true,
                    msg: 'Template not found'
                });
        }

        await template.update({ isActive: false });

        res.status(200)
            .json({
                err: false,
                msg: 'Template deleted successfully (soft delete)'
            });
    } catch (err) {
        res.status(500)
            .json({
                err: true,
                msg: 'Error deleting template',
                details: err
            });
    }
};
const deleteVariable = async (req, res) => {
    try {
        const { id } = req.body;
        const variable = await Variable.findByPk(id);

        if (!variable) {
            return res.status(404)
                .json({
                    err: true,
                    msg: 'Variable not found'
                });
        }

        await variable.update({ isActive: false });

        res.status(200)
            .json({
                err: false,
                msg: 'Variable deleted successfully (soft delete)'
            });
    } catch (err) {
        res.status(500)
            .json({
                err: true,
                msg: 'Error deleting variable',
                details: err
            });
    }
}
const addRoleWidget = async (req, res) => {
    try {
      const { roleId, widgetId, settings, mobileSettings, tabletSettings, desktopSettings, size, position } = req.body;
      const roleWidget = await RoleWidget.create({
        roleId,
        widgetId,
        settings,
        mobileSettings,
        tabletSettings,
        desktopSettings,
        size,
        position
      });
      res.status(201).json({ err: false, msg: 'Role widget added successfully', roleWidget });
    } catch (err) {
      res.status(400).json({ err: true, msg: err.message });
    }
};
const addIntegration = async (req, res) => {
    try {
        const { companyId, integrationId, settings } = req.body;
        const companyIntegration = await CompanyIntegration.create({
            companyId,
            integrationId,
            settings
        });
        res.status(201).json({
            err: false,
            msg: 'Integration successfully added to company',
            companyIntegration
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const addLabor = async (req, res) => {
    const { role, rate, overtimeRate, standardHoursPerDay } = req.body;

    try {
        const newLabor = await Labor.create({
            role,
            rate,
            overtimeRate,
            standardHoursPerDay,
            companyId: req.companyId // Add company context
        });

        res.status(201).json({
            err: false,
            msg: 'Labor entry successfully added',
            labor: newLabor
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const removeRoleWidget = async (req, res) => {
    try {
      const { roleId, widgetId } = req.body;
      const roleWidget = await RoleWidget.findOne({ where: { roleId, widgetId } });
      if (roleWidget) {
        await roleWidget.destroy();
        res.status(200).json({ err: false, msg: 'Role widget removed successfully' });
      } else {
        res.status(404).json({ err: true, msg: 'Role widget not found' });
      }
    } catch (err) {
      res.status(400).json({ err: true, msg: err.message });
    }
};
const removeIntegration = async (req, res) => {
    try {
        const { companyId, integrationId } = req.body;
        const result = await CompanyIntegration.destroy({
            where: {
                companyId,
                integrationId
            }
        });
        if (result) {
            res.status(200).json({
                err: false,
                msg: 'Integration successfully removed from company'
            });
        } else {
            res.status(404).json({
                err: true,
                msg: 'Integration not found for the company'
            });
        }
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const removeLabor = async (req, res) => {
    const { id } = req.body;

    try {
        const labor = await Labor.findByPk(id);

        if (!labor) {
            return res.status(404).json({
                err: true,
                msg: 'Labor entry not found'
            });
        }

        await labor.destroy();

        res.status(200).json({
            err: false,
            msg: 'Labor entry successfully removed'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const sendVerificationEmail = async (req, res) => {
    const { companyId, expired } = req.body;

    try {
        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }

        // Generate random 6-digit number
        const randomNumber = Math.floor(Math.random() * 900000) + 100000;
        // Generate JWT token for company verification
        const securityToken = jwt.sign({
            companyId: company.id,
            randomNumber
        }, process.env.JWT_ACCESS_TOKEN, {
            expiresIn: '24h'
        });

        // Save token to company
        company.securityToken = securityToken;
        await company.save();

        // Send verification email
        await sendCompanyVerificationEmail(company, securityToken, randomNumber);

        if (expired) {
            return;
        } else {
            return res.status(201).json({
                err: false,
                msg: 'Verification email sent successfully'
            });
        };
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message
        });
    }
};
const generateRolesAndPermissions = async (companyId) => {
    // Define roles with their hierarchy and access levels
    const roleDefinitions = [
        {
            name: 'representative',
            description: 'Sales representative with limited access',
            accessLevel: 1,
            allowedPages: ['notifications', 'chats', 'events', 'estimates', 'clients'],
            permissions: ['view', 'create', 'edit'] // No archive permissions
        },
        {
            name: 'technician', 
            description: 'Field technician with operational access',
            accessLevel: 2,
            allowedPages: ['notifications', 'chats', 'events', 'work-orders', 'inventory', 'clients'],
            permissions: ['view', 'create', 'edit'] // No archive permissions
        },
        {
            name: 'customer support',
            description: 'Customer service representative',
            accessLevel: 2,
            allowedPages: ['notifications', 'chats', 'events', 'estimates', 'invoices', 'clients'],
            permissions: ['view', 'create', 'edit'] // No archive permissions
        },
        {
            name: 'manager',
            description: 'Department manager with extended access',
            accessLevel: 3,
            allowedPages: ['notifications', 'chats', 'events', 'estimates', 'users', 'reports', 'work-orders', 'invoices', 'clients', 'inventory'],
            permissions: ['view', 'create', 'edit', 'archive']
        },
        {
            name: 'hr',
            description: 'Human resources with payroll and user management',
            accessLevel: 4,
            allowedPages: ['notifications', 'chats', 'events', 'users', 'reports', 'payroll', 'clients'],
            permissions: ['view', 'create', 'edit', 'archive']
        },
        {
            name: 'administrator',
            description: 'Full system administrator access',
            accessLevel: 5,
            allowedPages: ['notifications', 'chats', 'events', 'estimates', 'users', 'reports', 'payroll', 'work-orders', 'invoices', 'learning-center', 'admin-settings', 'clients', 'inventory'],
            permissions: ['view', 'create', 'edit', 'archive']
        }
    ];

    // Create roles for the company
    const createdRoles = [];
    for (const roleDefinition of roleDefinitions) {
        const role = await Role.create({
            name: roleDefinition.name,
            companyId,
            isActive: true
        });
        createdRoles.push(role);
    }

    // Fetch all pages to get their IDs
    const pages = await Page.findAll({
        attributes: ['id', 'url']
    });
    
    // Create a map of page URLs to IDs
    const pageMap = {};
    pages.forEach(page => {
        pageMap[page.url] = page.id;
    });

    // Fetch all permissions to get their IDs  
    const permissions = await Permission.findAll({
        attributes: ['id', 'action', 'pageId']
    });

    // Create role-permission associations
    for (let i = 0; i < roleDefinitions.length; i++) {
        const roleDefinition = roleDefinitions[i];
        const role = createdRoles[i];
        
        // Get permissions for pages this role can access
        for (const pageUrl of roleDefinition.allowedPages) {
            const pageId = pageMap[pageUrl];
            if (pageId) {
                // Find permissions for this page that match allowed actions
                const pagePermissions = permissions.filter(permission => 
                    permission.pageId === pageId && 
                    roleDefinition.permissions.includes(permission.action)
                );
                
                // Create role-permission associations
                for (const permission of pagePermissions) {
                    await RolePermission.create({
                        companyId,
                        roleId: role.id,
                        permissionId: permission.id
                    });
                }
            }
        }
    }

    return createdRoles;
};
const generateEventTypesAndGroups = async (companyId, companyTypeId) => {
    const companyType = await CompanyType.findByPk(companyTypeId);
    if (!companyType) {
        throw new Error('Company type not found');
    }
    
    // Find admin user and role
    const adminRole = await Role.findOne({ where: { name: 'administrator', companyId } });
    let adminUser = null;
    
    if (adminRole) {
        adminUser = await User.findOne({ 
            where: { 
                companyId,
                roleId: adminRole.id
            } 
        });
    }
    
    // Map of company type keywords to event types
    const eventTypeMap = {
        'General Contractor': [
            'Project Kickoff', 'Site Inspection', 'Subcontractor Meeting', 'Change Order Review', 'Final Walkthrough'
        ],
        'Home Builder': [
            'Groundbreaking', 'Framing Inspection', 'Client Walkthrough', 'Punch List Review', 'Closing Meeting'
        ],
        'Commercial Construction': [
            'Bid Meeting', 'Permit Review', 'Safety Meeting', 'Progress Inspection', 'Tenant Handover'
        ],
        'Remodeling Contractor': [
            'Initial Consultation', 'Demo Day', 'Design Review', 'Progress Check', 'Final Reveal'
        ],
        'Electrical Contractor': [
            'Wiring Inspection', 'Panel Upgrade', 'Lighting Install', 'Code Compliance Check', 'Service Call'
        ],
        'Solar Installer': [
            'Site Assessment', 'System Design', 'Installation', 'Inspection', 'Commissioning'
        ],
        'Plumbing Contractor': [
            'Leak Detection', 'Fixture Install', 'Pipe Replacement', 'Inspection', 'Emergency Call'
        ],
        'Water Damage Restoration': [
            'Assessment', 'Water Extraction', 'Drying', 'Mold Remediation', 'Final Inspection'
        ],
        'HVAC Contractor': [
            'System Install', 'Seasonal Maintenance', 'Repair Call', 'Duct Cleaning', 'Inspection'
        ],
        'Ductwork Specialist': [
            'Duct Design', 'Installation', 'Sealing', 'Cleaning', 'Inspection'
        ],
        'Roofing Contractor': [
            'Roof Inspection', 'Tear Off', 'Installation', 'Leak Repair', 'Final Walk'
        ],
        'Siding Contractor': [
            'Site Prep', 'Siding Install', 'Trim Work', 'Inspection', 'Repair Call'
        ],
        'Gutter Specialist': [
            'Gutter Install', 'Cleaning', 'Repair', 'Inspection', 'Leaf Guard Install'
        ],
        'Window & Door Installer': [
            'Measurement', 'Removal', 'Installation', 'Sealing', 'Inspection'
        ],
        'Flooring Contractor': [
            'Demo', 'Subfloor Prep', 'Install', 'Finishing', 'Inspection'
        ],
        'Painting Contractor': [
            'Color Consultation', 'Prep Work', 'Painting', 'Touch Up', 'Final Walk'
        ],
        'Cabinet Installer': [
            'Measurement', 'Demo', 'Install', 'Adjustment', 'Inspection'
        ],
        'Countertop Installer': [
            'Template', 'Fabrication', 'Install', 'Sealing', 'Inspection'
        ],
        'Landscaping Company': [
            'Design Consult', 'Planting', 'Maintenance', 'Irrigation Install', 'Cleanup'
        ],
        'Lawn Care Service': [
            'Mowing', 'Fertilization', 'Aeration', 'Weed Control', 'Cleanup'
        ],
        'Tree Service': [
            'Assessment', 'Trimming', 'Removal', 'Stump Grinding', 'Cleanup'
        ],
        'Hardscaping Contractor': [
            'Design', 'Excavation', 'Install', 'Sealing', 'Inspection'
        ],
        'Pool Contractor': [
            'Design', 'Excavation', 'Install', 'Startup', 'Inspection'
        ],
        'Fence Contractor': [
            'Layout', 'Post Setting', 'Panel Install', 'Gate Install', 'Inspection'
        ],
        'Concrete Contractor': [
            'Forming', 'Pouring', 'Finishing', 'Curing', 'Inspection'
        ],
        'Masonry Contractor': [
            'Layout', 'Bricklaying', 'Tuckpointing', 'Cleaning', 'Inspection'
        ],
        'Cleaning Service': [
            'Initial Clean', 'Recurring Clean', 'Deep Clean', 'Move Out Clean', 'Inspection'
        ],
        'Pressure Washing': [
            'Assessment', 'Prep', 'Washing', 'Cleanup', 'Inspection'
        ],
        'Handyman Service': [
            'Assessment', 'Repair', 'Install', 'Maintenance', 'Inspection'
        ],
        'Insulation Contractor': [
            'Assessment', 'Install', 'Sealing', 'Inspection', 'Repair'
        ],
        'Security System Installer': [
            'Site Survey', 'Install', 'Programming', 'Testing', 'Inspection'
        ],
        'Pest Control Service': [
            'Inspection', 'Treatment', 'Follow Up', 'Prevention', 'Emergency Call'
        ],
        'Appliance Repair': [
            'Diagnosis', 'Repair', 'Testing', 'Maintenance', 'Emergency Call'
        ],
        'Garage Door Service': [
            'Inspection', 'Repair', 'Install', 'Maintenance', 'Emergency Call'
        ],
        'Moving Company': [
            'Estimate', 'Packing', 'Loading', 'Transport', 'Unloading'
        ],
        'Junk Removal': [
            'Estimate', 'Pickup', 'Sorting', 'Disposal', 'Cleanup'
        ],
        'IT Services': [
            'Assessment', 'Setup', 'Maintenance', 'Upgrade', 'Support Call'
        ],
        'Audio/Visual Installer': [
            'Site Survey', 'Install', 'Programming', 'Testing', 'Support Call'
        ],
        'Auto Repair Shop': [
            'Diagnosis', 'Repair', 'Parts Order', 'Testing', 'Pickup'
        ],
        'Mobile Mechanic': [
            'Assessment', 'Repair', 'Parts Order', 'Testing', 'Follow Up'
        ],
        'Personal Trainer': [
            'Assessment', 'Goal Setting', 'Training Session', 'Progress Check', 'Follow Up'
        ],
        'Tutoring Service': [
            'Assessment', 'Lesson', 'Homework Help', 'Progress Check', 'Parent Meeting'
        ],
        'Pet Services': [
            'Consultation', 'Grooming', 'Boarding', 'Training', 'Pickup/Dropoff'
        ],
        'Event Planner': [
            'Consultation', 'Venue Tour', 'Vendor Meeting', 'Rehearsal', 'Event Day'
        ],
        'Catering Service': [
            'Menu Planning', 'Tasting', 'Prep', 'Event Service', 'Cleanup'
        ],
        'Photography Service': [
            'Consultation', 'Shoot', 'Editing', 'Proof Review', 'Delivery'
        ]
    };

    // Try to find a direct match, else fallback to generic event types
    let eventTypes = eventTypeMap[companyType.name];
    if (!eventTypes) {
        // Fallback: find by keyword
        const lowerName = companyType.name.toLowerCase();
        eventTypes = Object.entries(eventTypeMap).find(([key]) => lowerName.includes(key.toLowerCase()));
        if (eventTypes) {
            eventTypes = eventTypes[1];
        } else {
            // Fallback: generic event types
            eventTypes = [
                'Consultation', 'Service Call', 'Inspection', 'Follow Up', 'Completion Meeting'
            ];
        }
    }
    // Only use 5 event types
    eventTypes = eventTypes.slice(0, 5);

    // Color palette for event types
    const colorPalette = [
        '#1779ba', '#28a745', '#ffc107', '#e83e8c', '#fd7e14', '#6610f2', '#20c997', '#6c757d', '#343a40', '#007bff'
    ];

    // Helper to determine if an event type should have a map
    const mapKeywords = ['site', 'inspection', 'install', 'location', 'walk', 'survey', 'tour', 'assessment', 'pickup', 'delivery', 'move', 'transport', 'venue', 'excavation', 'service call'];

    // Helper to generate tags
    function generateTags(eventName, companyTypeName) {
        let tags = [];
        if (/inspection|review|assessment|check|walk|survey|tour/i.test(eventName)) tags.push('inspection');
        if (/install|setup|startup|fabrication|mount|panel|system|fixture/i.test(eventName)) tags.push('installation');
        if (/meeting|consult|client|vendor|subcontractor|lesson|training|planning|goal/i.test(eventName)) tags.push('meeting');
        if (/repair|service|emergency|call|maintenance|support|troubleshoot|fix/i.test(eventName)) tags.push('service');
        if (/cleanup|clean|removal|demo|move|packing|unloading|disposal|junk/i.test(eventName)) tags.push('cleanup');
        if (/design|template|edit|proof|color|menu|plan/i.test(eventName)) tags.push('design');
        if (/final|completion|closing|delivery|handover|reveal|punch|touch/i.test(eventName)) tags.push('final');
        if (companyTypeName) tags.push(companyTypeName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
        // Add event name as a tag (slugified)
        tags.push(eventName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
        // Add generic tags if less than 5
        const genericTags = ['event', 'schedule', 'company', 'default', 'workflow', 'task', 'activity', 'project'];
        for (let i = 0; tags.length < 5 && i < genericTags.length; i++) {
            if (!tags.includes(genericTags[i])) tags.push(genericTags[i]);
        }
        // Only return 5 tags
        return tags.slice(0, 5);
    }

    // Create event types for the company
    const createdEventTypes = [];
    for (let i = 0; i < eventTypes.length; i++) {
        const name = eventTypes[i];
        const backgroundColor = colorPalette[i % colorPalette.length];
        const map = mapKeywords.some(keyword => name.toLowerCase().includes(keyword));
        const tags = generateTags(name, companyType.name);
        const eventType = await EventType.create({
            name,
            companyId,
            backgroundColor,
            tags,
            map,
            isActive: true
        });
        createdEventTypes.push(eventType);
    }

    // Create groups for the company based on company type
    const groupMap = {
        'General Contractor': ['Management', 'Field Team', 'Office'],
        'Home Builder': ['Management', 'Construction Crew', 'Sales'],
        'Commercial Construction': ['Project Managers', 'Superintendents', 'Office'],
        'Remodeling Contractor': ['Management', 'Remodel Crew'],
        'Electrical Contractor': ['Electricians', 'Office'],
        'Solar Installer': ['Installers', 'Sales'],
        'Plumbing Contractor': ['Plumbers', 'Office'],
        'Water Damage Restoration': ['Restoration Team', 'Office'],
        'HVAC Contractor': ['Technicians', 'Office'],
        'Ductwork Specialist': ['Duct Crew', 'Office'],
        'Roofing Contractor': ['Roofers', 'Office'],
        'Siding Contractor': ['Siding Crew', 'Office'],
        'Gutter Specialist': ['Gutter Crew', 'Office'],
        'Window & Door Installer': ['Installers', 'Office'],
        'Flooring Contractor': ['Flooring Crew', 'Office'],
        'Painting Contractor': ['Painters', 'Office'],
        'Cabinet Installer': ['Cabinet Crew', 'Office'],
        'Countertop Installer': ['Countertop Crew', 'Office'],
        'Landscaping Company': ['Landscapers', 'Office'],
        'Lawn Care Service': ['Lawn Crew', 'Office'],
        'Tree Service': ['Tree Crew', 'Office'],
        'Hardscaping Contractor': ['Hardscape Crew', 'Office'],
        'Pool Contractor': ['Pool Crew', 'Office'],
        'Fence Contractor': ['Fence Crew', 'Office'],
        'Concrete Contractor': ['Concrete Crew', 'Office'],
        'Masonry Contractor': ['Masons', 'Office'],
        'Cleaning Service': ['Cleaners', 'Office'],
        'Pressure Washing': ['Pressure Washers', 'Office'],
        'Handyman Service': ['Handymen', 'Office'],
        'Insulation Contractor': ['Insulation Crew', 'Office'],
        'Security System Installer': ['Installers', 'Office'],
        'Pest Control Service': ['Technicians', 'Office'],
        'Appliance Repair': ['Repair Techs', 'Office'],
        'Garage Door Service': ['Technicians', 'Office'],
        'Moving Company': ['Movers', 'Office'],
        'Junk Removal': ['Junk Crew', 'Office'],
        'IT Services': ['IT Team', 'Office'],
        'Audio/Visual Installer': ['AV Team', 'Office'],
        'Auto Repair Shop': ['Technicians', 'Office'],
        'Mobile Mechanic': ['Mechanics', 'Office'],
        'Personal Trainer': ['Trainers', 'Office'],
        'Tutoring Service': ['Tutors', 'Office'],
        'Pet Services': ['Pet Team', 'Office'],
        'Event Planner': ['Planners', 'Office'],
        'Catering Service': ['Catering Crew', 'Office'],
        'Photography Service': ['Photographers', 'Office']
    };
    
    let groupNames = groupMap[companyType.name];
    if (!groupNames) {
        // fallback
        groupNames = ['Management', 'Team', 'Office'];
    }

    const createdGroups = [];
    for (const groupName of groupNames) {
        const group = await Group.create({
            name: groupName,
            companyId,
            isActive: true
        });
        createdGroups.push(group);
        
        // Add admin user to group
        if (adminUser) {
            await UserGroup.create({ groupId: group.id, userId: adminUser.id, companyId });
        }
        
        // Add admin role to group
        if (adminRole) {
            await RoleGroup.create({ groupId: group.id, roleId: adminRole.id, companyId });
        }
        
        // Associate all event types to this group
        for (const eventType of createdEventTypes) {
            await GroupEventType.create({
                companyId,
                groupId: group.id,
                eventTypeId: eventType.id
            });
        }
    }

    return { eventTypes: createdEventTypes, groups: createdGroups };
}
const updateStripeACHSettings = async (req, res) => {
    try {
        const { enabled, processingFee, requireVerification } = req.body;
        
        const company = await Company.findByPk(res.companyId);
        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }

        // Update ACH settings
        company.achPaymentsEnabled = enabled;
        company.achProcessingFee = processingFee;
        company.achRequireVerification = requireVerification;
        
        await company.save();

        res.status(200).json({
            err: false,
            msg: 'ACH settings updated successfully',
            achSettings: {
                enabled: company.achPaymentsEnabled,
                processingFee: company.achProcessingFee,
                requireVerification: company.achRequireVerification
            }
        });
    } catch (error) {
        console.error('Error updating ACH settings:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to update ACH settings',
            error: error.message
        });
    }
};
const enableStripePaymentMethod = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payment method ID is required'
            });
        }
        const paymentMethod = await PaymentMethod.findByPk(id);
        if (!paymentMethod) {
            return res.status(404).json({
                err: true,
                msg: 'Payment method not found'
            });
        }

        paymentMethod.isActive = true;
        await paymentMethod.save();

        res.status(201).json({
            err: false,
            msg: 'Payment method enabled successfully',
            paymentMethod
        });
    } catch (error) {
        console.error('Error adding payment method:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to add payment method',
            error: error.message
        });
    }
};
const disableStripePaymentMethod = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payment method ID is required'
            });
        }
        const paymentMethod = await PaymentMethod.findByPk(id);
        if (!paymentMethod) {
            return res.status(404).json({
                err: true,
                msg: 'Payment method not found'
            });
        }
        paymentMethod.isActive = false;
        await paymentMethod.save();
        res.status(200).json({
            err: false,
            msg: 'Payment method disabled successfully',
            paymentMethod
        });
    } catch (error) {
        console.error('Error removing payment method:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to remove payment method',
            error: error.message
        });
    }
};
const getCommunicationsSettings = async (req, res) => {
    try {
        const company = await Company.findByPk(res.companyId);

        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }

        // Get all phone numbers for this company
        const phoneNumbers = await PhoneNumber.findAll({
            where: { 
                companyId: res.companyId,
                isActive: true 
            },
            attributes: ['id', 'number', 'type', 'isActive']
        });

        // Get usage statistics for current month
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const monthlyUsage = await TextMessage.count({
            where: {
                companyId: res.companyId,
                createdAt: {
                    [Op.gte]: currentMonth,
                    [Op.lt]: nextMonth
                }
            }
        });

        res.status(200).json({
            err: false,
            msg: 'Communications settings retrieved successfully',
            settings: {
                communicationsEnabled: company.communicationsEnabled || false,
                setupComplete: company.communicationsSetupComplete || false,
                primaryPhoneNumber: company.PrimaryPhoneNumber || null,
                monthlyLimit: company.monthlyMessageLimit || 1000,
                monthlyUsed: monthlyUsage,
                communicationsSettings: company.communicationsSettings || {}
            },
            phoneNumbers
        });
    } catch (error) {
        console.error('Error getting communications settings:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to get communications settings',
            error: error.message
        });
    }
};

const updateCommunicationsSettings = async (req, res) => {
    try {
        const { 
            communicationsEnabled, 
            primaryPhoneNumberId,
            monthlyMessageLimit,
            communicationsSettings 
        } = req.body;

        const company = await Company.findByPk(res.companyId);
        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }

        // Validate primary phone number belongs to company
        if (primaryPhoneNumberId) {
            const phoneNumber = await PhoneNumber.findOne({
                where: {
                    id: primaryPhoneNumberId,
                    companyId: res.companyId,
                    isActive: true
                }
            });

            if (!phoneNumber) {
                return res.status(400).json({
                    err: true,
                    msg: 'Invalid phone number selected'
                });
            }
        }

        // Update company settings
        await company.update({
            communicationsEnabled: communicationsEnabled !== undefined ? communicationsEnabled : company.communicationsEnabled,
            primaryPhoneNumberId: primaryPhoneNumberId !== undefined ? primaryPhoneNumberId : company.primaryPhoneNumberId,
            monthlyMessageLimit: monthlyMessageLimit !== undefined ? monthlyMessageLimit : company.monthlyMessageLimit,
            communicationsSettings: communicationsSettings !== undefined ? communicationsSettings : company.communicationsSettings
        });

        res.status(200).json({
            err: false,
            msg: 'Communications settings updated successfully',
            settings: {
                communicationsEnabled: company.communicationsEnabled,
                primaryPhoneNumberId: company.primaryPhoneNumberId,
                monthlyMessageLimit: company.monthlyMessageLimit,
                communicationsSettings: company.communicationsSettings
            }
        });
    } catch (error) {
        console.error('Error updating communications settings:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to update communications settings',
            error: error.message
        });
    }
};

const addCompanyPhoneNumber = async (req, res) => {
    try {
        const { 
            number, 
            type = 'Mobile', 
            twilioSid, 
            twilioFriendlyName,
            capabilities,
            locality,
            region,
            postalCode,
            isPurchased = false
        } = req.body;

        if (!number) {
            return res.status(400).json({
                err: true,
                msg: 'Phone number is required'
            });
        }

        // Clean and validate phone number format
        const cleanNumber = number.replace(/\D/g, '');
        if (cleanNumber.length !== 10 && cleanNumber.length !== 11) {
            return res.status(400).json({
                err: true,
                msg: 'Invalid phone number format'
            });
        }

        const formattedNumber = cleanNumber.length === 10 ? `+1${cleanNumber}` : `+${cleanNumber}`;

        // Check if phone number already exists for this company
        const existingNumber = await PhoneNumber.findOne({
            where: {
                number: formattedNumber,
                companyId: res.companyId
            }
        });

        if (existingNumber) {
            return res.status(400).json({
                err: true,
                msg: 'Phone number already exists for this company'
            });
        }

        // Check if this is the first phone number for the company
        const phoneNumberCount = await PhoneNumber.count({
            where: {
                companyId: res.companyId,
                isActive: true
            }
        });

        const phoneNumber = await PhoneNumber.create({
            number: formattedNumber,
            type,
            companyId: res.companyId,
            isActive: true,
            twilioSid,
            twilioFriendlyName,
            capabilities,
            locality,
            region,
            postalCode,
            isPurchased,
            providerSettings: {
                provider: isPurchased ? 'twilio' : 'manual',
                purchasedAt: isPurchased ? new Date() : null
            }
        });

        // If this is the first phone number, set it as primary
        if (phoneNumberCount === 0) {
            await Company.update(
                { primaryPhoneNumberId: phoneNumber.id },
                { where: { id: res.companyId } }
            );
        }

        res.status(201).json({
            err: false,
            msg: 'Phone number added successfully',
            phoneNumber,
            isPrimary: phoneNumberCount === 0
        });
    } catch (error) {
        console.error('Error adding phone number:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to add phone number',
            error: error.message
        });
    }
};

const removeCompanyPhoneNumber = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Phone number ID is required'
            });
        }

        const phoneNumber = await PhoneNumber.findOne({
            where: {
                id,
                companyId: res.companyId
            }
        });

        if (!phoneNumber) {
            return res.status(404).json({
                err: true,
                msg: 'Phone number not found'
            });
        }

        // Check if this is the primary phone number
        const company = await Company.findByPk(res.companyId);
        if (company.primaryPhoneNumberId === id) {
            // Clear primary phone number reference
            await company.update({ primaryPhoneNumberId: null });
        }

        // Soft delete by setting isActive to false
        await phoneNumber.update({ isActive: false });

        res.status(200).json({
            err: false,
            msg: 'Phone number removed successfully'
        });
    } catch (error) {
        console.error('Error removing phone number:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to remove phone number',
            error: error.message
        });
    }
};

const searchTwilioPhoneNumbers = async (req, res) => {
    try {
        const {
            areaCode,
            contains,
            nearLatLong,
            nearNumber,
            distance,
            inRegion,
            inPostalCode,
            inLocality,
            inLata,
            inRateCenter,
            limit = 20
        } = req.body;

        const searchOptions = {
            areaCode,
            contains,
            nearLatLong,
            nearNumber,
            distance,
            inRegion,
            inPostalCode,
            inLocality,
            inLata,
            inRateCenter,
            limit
        };

        // Remove undefined values
        Object.keys(searchOptions).forEach(key => 
            searchOptions[key] === undefined && delete searchOptions[key]
        );

        const availableNumbers = await searchAvailablePhoneNumbers(searchOptions);

        res.status(200).json({
            err: false,
            msg: 'Phone numbers retrieved successfully',
            phoneNumbers: availableNumbers,
            count: availableNumbers.length
        });
    } catch (error) {
        console.error('Error searching phone numbers:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to search phone numbers',
            error: error.message
        });
    }
};

const purchaseTwilioPhoneNumber = async (req, res) => {
    try {
        const { 
            phoneNumber, 
            friendlyName, 
            type = 'Mobile',
            locality,
            region,
            postalCode 
        } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                err: true,
                msg: 'Phone number is required'
            });
        }

        // Check if phone number already exists for this company
        const existingNumber = await PhoneNumber.findOne({
            where: {
                number: phoneNumber,
                companyId: res.companyId
            }
        });

        if (existingNumber) {
            return res.status(400).json({
                err: true,
                msg: 'Phone number already exists for this company'
            });
        }

        // Purchase the phone number from Twilio
        const purchasedNumber = await purchasePhoneNumber(phoneNumber, {
            friendlyName: friendlyName || `${res.companyId} - ${type}`
        });

        // Check if this is the first phone number for the company
        const phoneNumberCount = await PhoneNumber.count({
            where: {
                companyId: res.companyId,
                isActive: true
            }
        });

        // Save to database
        const dbPhoneNumber = await PhoneNumber.create({
            number: purchasedNumber.phoneNumber,
            type,
            companyId: res.companyId,
            isActive: true,
            twilioSid: purchasedNumber.sid,
            twilioFriendlyName: purchasedNumber.friendlyName,
            capabilities: purchasedNumber.capabilities,
            locality,
            region,
            postalCode,
            isPurchased: true,
            providerSettings: {
                provider: 'twilio',
                purchasedAt: new Date(),
                voiceUrl: purchasedNumber.voiceUrl,
                smsUrl: purchasedNumber.smsUrl,
                statusCallback: purchasedNumber.statusCallback
            }
        });

        // If this is the first phone number, set it as primary
        if (phoneNumberCount === 0) {
            await Company.update(
                { primaryPhoneNumberId: dbPhoneNumber.id },
                { where: { id: res.companyId } }
            );
        }

        res.status(201).json({
            err: false,
            msg: 'Phone number purchased and added successfully',
            phoneNumber: dbPhoneNumber,
            twilioInfo: purchasedNumber,
            isPrimary: phoneNumberCount === 0
        });
    } catch (error) {
        console.error('Error purchasing phone number:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to purchase phone number',
            error: error.message
        });
    }
};

const releaseTwilioPhoneNumber = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Phone number ID is required'
            });
        }

        // Find the phone number
        const phoneNumber = await PhoneNumber.findOne({
            where: {
                id,
                companyId: res.companyId,
                isPurchased: true
            }
        });

        if (!phoneNumber) {
            return res.status(404).json({
                err: true,
                msg: 'Phone number not found or not purchasable'
            });
        }

        // Check if this is the primary phone number
        const company = await Company.findByPk(res.companyId);
        if (company.primaryPhoneNumberId === phoneNumber.id) {
            return res.status(400).json({
                err: true,
                msg: 'Cannot release primary phone number. Set another number as primary first.'
            });
        }

        // Release from Twilio if it has a Twilio SID
        if (phoneNumber.twilioSid) {
            try {
                await releasePhoneNumber(phoneNumber.twilioSid);
            } catch (twilioError) {
                console.error('Error releasing from Twilio:', twilioError);
                // Continue with database removal even if Twilio release fails
            }
        }

        // Remove from database
        await phoneNumber.update({ isActive: false });

        res.status(200).json({
            err: false,
            msg: 'Phone number released successfully'
        });
    } catch (error) {
        console.error('Error releasing phone number:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to release phone number',
            error: error.message
        });
    }
};

const completeCommunicationsSetup = async (req, res) => {
    try {
        const company = await Company.findByPk(res.companyId);
        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }

        // Check if company has at least one phone number
        const phoneNumberCount = await PhoneNumber.count({
            where: {
                companyId: res.companyId,
                isActive: true
            }
        });

        if (phoneNumberCount === 0) {
            return res.status(400).json({
                err: true,
                msg: 'At least one phone number is required to complete setup'
            });
        }

        // Mark setup as complete and enable communications
        await company.update({
            communicationsSetupComplete: true,
            communicationsEnabled: true
        });

        res.status(200).json({
            err: false,
            msg: 'Communications setup completed successfully',
            settings: {
                setupComplete: true,
                communicationsEnabled: true
            }
        });
    } catch (error) {
        console.error('Error completing communications setup:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to complete communications setup',
            error: error.message
        });
    }
};

module.exports = {
    getCompany,
    getWidget,
    getRoleWidget,
    getTemplate,
    getIntegration,
    getLabor,
    getStripeAccount,
    getStripeSettings,
    listTemplates, 
    listGroups,
    listRoles,
    listRoleWidgets,
    listPermissions,
    listRolePermissions,
    listEventTypes,
    listWidgets,
    listShortCodes,
    listArchivedEvents,
    listArchivedEstimates,
    listArchivedUsers,
    listArchivedClients,
    listIntegrations,
    listVariables,
    listLabor,
    createRole,
    createGroup,
    createEventType,
    createTemplate,
    createVariable,
    createStripeConnectedAccount,
    createStripeOnboardingLink,
    createStripeTestPayment,
    addRoleWidget,
    addIntegration,
    addLabor,
    removeRoleWidget,
    removeLabor,
    removeIntegration,
    updateTemplate,
    updateCompany,
    updateGroup,
    updateEventType,
    updateRole,
    updateVariable,
    updateLabor,
    updateStripeACHSettings,
    deleteTemplate,
    deleteGroup,
    deleteEventType,
    deleteRole,
    deleteVariable,
    sendVerificationEmail,
    setupCompany,
    generateRolesAndPermissions,
    generateEventTypesAndGroups,
    enableStripePaymentMethod,
    disableStripePaymentMethod,
    // Communications functions
    getCommunicationsSettings,
    updateCommunicationsSettings,
    addCompanyPhoneNumber,
    removeCompanyPhoneNumber,
    completeCommunicationsSetup,
    // Twilio phone number functions
    searchTwilioPhoneNumbers,
    purchaseTwilioPhoneNumber,
    releaseTwilioPhoneNumber,
}