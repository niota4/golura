const { 
    Payment, 
    PaymentMethod,
    Estimate, 
    EstimateStatus,
    Invoice,
    Company,
    EstimateHistory,
    InvoiceHistory,
    User,
    Client,
    Event,
    Role,
    RolePermissions,
    UserPermissions,
    Permissions,
    Page,
    Priority,
} = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Op } = require('sequelize');
const { generateWorkOrder } = require('./workOrders');
const { generateInvoice } = require('./invoices');
const { sendPaymentReceiptEmail } = require('../helpers/emails');
const { createNotification } = require('./notifications');
const {
    createConnectAccount,
    createAccountLink,
    getConnectAccount,
    createACHSetupIntent,
    createACHPaymentIntent,
    createACHCustomer,
    verifyBankAccount,
    getACHPaymentMethod,
    listACHPaymentMethods,
    detachACHPaymentMethod,
    getACHPaymentStatus,
    createACHMandate,
    calculateACHSettlementDate,
    handleACHWebhook,
    attachPaymentMethodToCustomer,
    createACHPaymentMethod
} = require('../helpers/stripe');

const getUsersByPermission = async (pageName, action, subAction = null, companyId) => {
    try {
        // First, find the page
        const page = await Page.findOne({
            where: { name: pageName }
        });
        
        if (!page) {
            console.log(`Page '${pageName}' not found`);
            return [];
        }

        // Build permission criteria
        const permissionWhere = {
            pageId: page.id,
            action: action
        };
        
        if (subAction) {
            permissionWhere.subAction = subAction;
        }

        // Find the permission
        const permission = await Permissions.findOne({
            where: permissionWhere
        });

        if (!permission) {
            console.log(`Permission not found for page '${pageName}', action '${action}'${subAction ? `, subAction '${subAction}'` : ''}`);
            return [];
        }

        // Get users through both direct user permissions and role permissions
        const usersWithDirectPermissions = await User.findAll({
            include: [
                {
                    model: UserPermissions,
                    as: 'UserPermissions',
                    where: {
                        permissionId: permission.id,
                        companyId: companyId
                    },
                    required: true
                }
            ],
            attributes: ['id', 'firstName', 'lastName', 'email']
        });

        const usersWithRolePermissions = await User.findAll({
            include: [
                {
                    model: Role,
                    as: 'Role',
                    include: [
                        {
                            model: RolePermissions,
                            as: 'RolePermissions',
                            where: {
                                permissionId: permission.id
                            },
                            required: true
                        }
                    ],
                    required: true
                }
            ],
            attributes: ['id', 'firstName', 'lastName', 'email']
        });

        // Combine and deduplicate users
        const allUsers = [...usersWithDirectPermissions, ...usersWithRolePermissions];
        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );

        return uniqueUsers;
    } catch (error) {
        console.error('Error getting users by permission:', error);
        return [];
    }
};
const getPaymentNotificationUsers = async (estimateId, invoiceId, companyId) => {
    const usersToNotify = new Set();
    
    try {
        // Get users with payment-related permissions
        const paymentViewUsers = await getUsersByPermission('payments', 'view', null, companyId);
        paymentViewUsers.forEach(user => usersToNotify.add(JSON.stringify({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        })));

        // Get accounting users (users who can view invoices/estimates and have financial permissions)
        if (estimateId) {
            const estimateUsers = await getUsersByPermission('estimates', 'view', null, companyId);
            estimateUsers.forEach(user => usersToNotify.add(JSON.stringify({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            })));

            // Get estimate-specific users (assigned users, creators)
            const estimate = await Estimate.findByPk(estimateId, {
                include: [
                    {
                        model: User,
                        as: 'AssignedUser',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    },
                    {
                        model: User,
                        as: 'Creator',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    },
                    {
                        model: Event,
                        as: 'Event',
                        include: [
                            {
                                model: User,
                                as: 'AssignedUser',
                                attributes: ['id', 'firstName', 'lastName', 'email']
                            }
                        ]
                    }
                ]
            });

            if (estimate) {
                // Add estimate assigned user
                if (estimate.AssignedUser) {
                    usersToNotify.add(JSON.stringify({
                        id: estimate.AssignedUser.id,
                        firstName: estimate.AssignedUser.firstName,
                        lastName: estimate.AssignedUser.lastName,
                        email: estimate.AssignedUser.email
                    }));
                }

                // Add estimate creator
                if (estimate.Creator) {
                    usersToNotify.add(JSON.stringify({
                        id: estimate.Creator.id,
                        firstName: estimate.Creator.firstName,
                        lastName: estimate.Creator.lastName,
                        email: estimate.Creator.email
                    }));
                }

                // Add event assigned user if exists
                if (estimate.Event && estimate.Event.AssignedUser) {
                    usersToNotify.add(JSON.stringify({
                        id: estimate.Event.AssignedUser.id,
                        firstName: estimate.Event.AssignedUser.firstName,
                        lastName: estimate.Event.AssignedUser.lastName,
                        email: estimate.Event.AssignedUser.email
                    }));
                }
            }
        }

        if (invoiceId) {
            const invoiceUsers = await getUsersByPermission('invoices', 'view', null, companyId);
            invoiceUsers.forEach(user => usersToNotify.add(JSON.stringify({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            })));

            // Get invoice-specific users
            const invoice = await Invoice.findByPk(invoiceId, {
                include: [
                    {
                        model: User,
                        as: 'AssignedUser',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    },
                    {
                        model: User,
                        as: 'Creator',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    }
                ]
            });

            if (invoice) {
                // Add invoice assigned user
                if (invoice.AssignedUser) {
                    usersToNotify.add(JSON.stringify({
                        id: invoice.AssignedUser.id,
                        firstName: invoice.AssignedUser.firstName,
                        lastName: invoice.AssignedUser.lastName,
                        email: invoice.AssignedUser.email
                    }));
                }

                // Add invoice creator
                if (invoice.Creator) {
                    usersToNotify.add(JSON.stringify({
                        id: invoice.Creator.id,
                        firstName: invoice.Creator.firstName,
                        lastName: invoice.Creator.lastName,
                        email: invoice.Creator.email
                    }));
                }
            }
        }

        // Convert Set back to array of user objects
        return Array.from(usersToNotify).map(userStr => JSON.parse(userStr));

    } catch (error) {
        console.error('Error getting payment notification users:', error);
        return [];
    }
};
const getPayment = async (req, res) => {
    try {
        const { id } = req.body;
        const payment = await Payment.findByPk(id);
        if (!payment) {
            return res.status(404).json({ err: true, msg: 'Payment not found' });
        }
        res.status(200).json({ err: false, payment });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const getCustomerACHPaymentMethods = async (req, res) => {
    try {
        const { customerId } = req.body;
        
        const paymentMethods = await listACHPaymentMethods(customerId);
        
        res.status(200).json({ 
            err: false, 
            paymentMethods: paymentMethods.data 
        });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const getACHPaymentStatusEndpoint = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        
        const paymentIntent = await getACHPaymentStatus(paymentIntentId);
        
        res.status(200).json({ 
            err: false, 
            paymentIntent 
        });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const listPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll();
        res.status(200).json({ err: false, payments });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const listPaymentMethods = async (req, res) => {
    try {
        const company = await Company.findByPk(res.companyId);
        if (!company) {
            return res.status(404).json({ err: true, msg: 'Company not found' });
        };
        let paymentMethods = await PaymentMethod.findAll();

        if (!company.stripeAccountId) {
            // If no Stripe account, filter out ACH methods and credit card methods
            paymentMethods = paymentMethods.filter(pm => !['ACH Bank Transfer', 'Credit Card'].includes(pm.name));
        }
        _.each(
            paymentMethods,
            function (method) {
                if (!method.isActive) {
                    // filter out inactive methods
                    paymentMethods = _.without(paymentMethods, method);
                }
            }
        )
        res.status(200).json({ err: false, paymentMethods });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const createStripeConnectedAccount = async (req, res) => {
    try {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;

        const account = await stripe.accounts.create({
            type: 'express',
        });

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${baseUrl}/reauth`,
            return_url: `${baseUrl}/return`,
            type: 'account_onboarding',
        });

        res.status(200).json({ err: false, url: accountLink.url });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const createStripePaymentIntent = async (req, res) => {
    try {
        const { amount, currency, clientId, estimateId, invoiceId } = req.body;

        // Convert the amount to the smallest currency unit (e.g., cents for USD)
        const convertedAmount = Math.round(amount * 100); // Assuming the amount is provided in dollars

        // Get the company's connected account ID
        const company = await Company.findByPk(res.companyId);
        const connectedAccountId = company?.stripeAccountId;

        if (!connectedAccountId) {
            return res.status(400).json({
                err: true,
                msg: 'Stripe connected account not set up. Please complete your Stripe onboarding in the admin settings.'
            });
        }

        // Create payment intent with transfer to connected account
        const paymentIntent = await stripe.paymentIntents.create({
            amount: convertedAmount,
            currency,
            transfer_data: {
                destination: connectedAccountId,
            },
            metadata: {
                clientId: clientId?.toString() || '',
                estimateId: estimateId?.toString() || '',
                invoiceId: invoiceId?.toString() || ''
            }
        });

        res.status(200).json({
            err: false,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const createACHSetupIntentForPayment = async (req, res) => {
    try {
        const { customerData, bankDetails } = req.body;
        
        console.log('Creating ACH SetupIntent with bank details:', { customerData, bankDetails });
        
        // Create or get Stripe customer
        const customer = await createACHCustomer(customerData);
        const stripeCustomerId = customer.id;
        
        // Create ACH payment method with bank account details
        const paymentMethod = await createACHPaymentMethod(
            bankDetails,
            {
                name: `${customerData.firstName} ${customerData.lastName}`,
                email: customerData.email
            }
        );
        
        console.log('Created payment method:', paymentMethod.id);
        
        // Create a SetupIntent for ACH verification
        const setupIntent = await createACHSetupIntent(stripeCustomerId, {
            payment_method: paymentMethod.id,
            confirm: true,
            mandate_data: {
                customer_acceptance: {
                    type: 'online',
                    online: {
                        ip_address: req.ip || '127.0.0.1',
                        user_agent: req.get('User-Agent') || 'Unknown'
                    }
                }
            },
            metadata: {
                clientId: customerData.clientId?.toString() || '',
                estimateId: customerData.estimateId?.toString() || '',
                invoiceId: customerData.invoiceId?.toString() || ''
            }
        });
        
        console.log('Created and confirmed SetupIntent:', setupIntent.id, 'with status:', setupIntent.status);
        
        // For testing: automatically verify with standard test amounts [32, 45]
        if (setupIntent.status === 'requires_action') {
            try {
                console.log('Auto-verifying with test amounts [32, 45]...');
                const verification = await verifyBankAccount(setupIntent.id, [32, 45]);
                console.log('Auto-verification result:', verification.status);
                
                res.status(200).json({ 
                    err: false, 
                    customerId: stripeCustomerId,
                    setupIntentId: setupIntent.id,
                    paymentMethodId: paymentMethod.id,
                    clientSecret: setupIntent.client_secret,
                    requiresVerification: false,
                    status: verification.status,
                    autoVerified: true
                });
            } catch (verifyError) {
                console.error('Auto-verification failed:', verifyError);
                // Fall back to manual verification
                res.status(200).json({ 
                    err: false, 
                    customerId: stripeCustomerId,
                    setupIntentId: setupIntent.id,
                    paymentMethodId: paymentMethod.id,
                    clientSecret: setupIntent.client_secret,
                    requiresVerification: true,
                    status: setupIntent.status
                });
            }
        } else {
            res.status(200).json({ 
                err: false, 
                customerId: stripeCustomerId,
                setupIntentId: setupIntent.id,
                paymentMethodId: paymentMethod.id,
                clientSecret: setupIntent.client_secret,
                requiresVerification: false,
                status: setupIntent.status
            });
        }
    } catch (error) {
        console.error('ACH Setup Error:', error);
        res.status(500).json({ err: true, msg: error.message });
    }
};
const createACHPaymentIntentForPayment = async (req, res) => {
    try {
        const { 
            amount, 
            currency, 
            customerId, 
            paymentMethodId, 
            clientId, 
            estimateId, 
            invoiceId
        } = req.body;

        // Get the company's connected account ID
        const company = await Company.findByPk(res.companyId);
        const connectedAccountId = company?.stripeAccountId;

        if (!connectedAccountId) {
            return res.status(400).json({
                err: true,
                msg: 'Stripe connected account not set up. Please complete your Stripe onboarding in the admin settings.'
            });
        }

        const options = {
            transfer_data: {
                destination: connectedAccountId
            },
            metadata: {
                clientId: clientId?.toString() || '',
                estimateId: estimateId?.toString() || '',
                invoiceId: invoiceId?.toString() || ''
            }
        };

        const paymentIntent = await createACHPaymentIntent(
            amount, 
            currency, 
            customerId, 
            paymentMethodId, 
            options
        );

        res.status(200).json({
            err: false,
            paymentIntent,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const addPaymentMethod = async (req, res) => {
    try {
        const { name, description } = req.body;
        const paymentMethod = await PaymentMethod.create({ name, description });
        res.status(201).json({ err: false, paymentMethod });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const removePaymentMethod = async (req, res) => {
    try {
        const { id } = req.body;
        const paymentMethod = await PaymentMethod.findByPk(id);
        if (!paymentMethod) {
            return res.status(404).json({ err: true, msg: 'Payment Method not found' });
        }
        if (!paymentMethod.removable) {
            return res.status(403).json({ err: true, msg: 'This Payment Method cannot be removed' });
        }
        await paymentMethod.destroy();
        res.status(200).json({ err: false, msg: 'Payment Method removed successfully' });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const removeStripeIncompleteTransactions = async () => {
    try {
        // Fetch payment intents with status 'requires_payment_method'
        const paymentIntents = await stripe.paymentIntents.list({
            status: 'requires_payment_method',
            limit: 100 // Adjust limit as necessary
        });

        // Loop through payment intents and delete those without customers
        for (const paymentIntent of paymentIntents.data) {
            if (!paymentIntent.customer) {
                await stripe.paymentIntents.cancel(paymentIntent.id);
                console.log(`Cancelled payment intent: ${paymentIntent.id}`);
            }
        }
    } catch (error) {
        console.error('Error checking incomplete transactions:', error);
    }
}
const removeACHPaymentMethod = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;
        
        const detachedPaymentMethod = await detachACHPaymentMethod(paymentMethodId);
        
        res.status(200).json({ 
            err: false, 
            msg: 'ACH payment method removed successfully',
            paymentMethod: detachedPaymentMethod 
        });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const savePayment = async (req, res) => {
    try {
        const { amount, currency, paymentIntentId, status, clientId, estimateId, invoiceId, firstName, lastName, email, phoneNumber } = req.body;
        const userId = req.userId;

        // Save the payment data in the database
        const payment = await Payment.create({
            amount,
            currency,
            stripePaymentIntentId: paymentIntentId,
            status,
            clientId,
            estimateId,
            invoiceId,
            firstName: firstName || null,
            lastName: lastName || null,
            email: email || null,
            phoneNumber: phoneNumber || null
        });

        // Create histories for estimate or invoice
        if (estimateId) {
            const estimate = await Estimate.findByPk(estimateId, {
                include: [
                    { model: Client, as: 'Client' }
                ]
            });
            const company = await Company.findByPk(res.companyId);

            // Calculate the minimum payment amount based on the company's percentage
            const minimumEstimatePaymentPercentage = company ? company.minimumEstimatePaymentPercentage : 0;
            const minimumPaymentAmount = parseFloat((estimate.total * minimumEstimatePaymentPercentage / 100).toFixed(2));
            let workOrderGenerated = false;
            
            // Check if the payment meets the minimum percentage
            if (amount >= minimumPaymentAmount) {
                // Generate the work order
                const wonStatus = await EstimateStatus.findOne({
                    where: { name: 'won' }
                });

                const workOrder = await generateWorkOrder(estimate.id, userId);
                await generateInvoice(estimate.id, workOrder.dataValues.id, userId);
                // Update the estimate status to 'won' and statusId to 3
                await estimate.update({ won: true, statusId: wonStatus.id });
                workOrderGenerated = true;
            }

            // Create an entry in the EstimateHistory
            await EstimateHistory.create({
                estimateId: estimate.id,
                statusId: estimate.statusId,
                amount: amount,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Create notifications for payment received
            try {
                const usersToNotify = await getPaymentNotificationUsers(estimateId, null, res.companyId);
                const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
                
                const baseMessage = `Payment of $${amount} received for Estimate #${estimate.estimateNumber}`;
                const fullMessage = workOrderGenerated 
                    ? `${baseMessage}. Work order has been generated.`
                    : baseMessage;
                
                for (const targetUserId of usersToNotify) {
                    if (targetUserId !== userId) { // Don't notify the person who processed the payment
                        await createNotification({
                            body: {
                                userId: userId,
                                targetUserId: targetUserId,
                                relatedModel: 'estimates',
                                relatedModelId: estimateId,
                                priorityId: priority.id,
                                title: 'Payment Received',
                                message: fullMessage,
                                type: 'general'
                            }
                        });
                    }
                }
            } catch (notificationError) {
                console.error('Error creating payment notifications:', notificationError);
            }

            // Send payment receipt email
            if (email) {
                try {
                    await sendPaymentReceiptEmail({
                        email,
                        firstName: firstName || 'Customer',
                        lastName: lastName || '',
                        amount,
                        paymentType: 'Estimate',
                        paymentMethod: 'Credit Card',
                        referenceNumber: estimate.estimateNumber,
                        currency: currency || 'USD',
                        transactionId: paymentIntentId,
                        paymentDate: new Date(),
                        companyName: company?.name
                    });
                } catch (emailError) {
                    console.error('Error sending payment receipt email:', emailError);
                }
            }
        }

        if (invoiceId) {
            const invoice = await Invoice.findByPk(invoiceId, {
                include: [
                    { model: Client, as: 'Client' }
                ]
            });
            const company = await Company.findByPk(res.companyId);

            // Create an entry in the InvoiceHistory
            await InvoiceHistory.create({
                invoiceId: invoice.id,
                amount: amount,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Create notifications for payment received
            try {
                const usersToNotify = await getPaymentNotificationUsers(null, invoiceId, res.companyId);
                const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
                
                const message = `Payment of $${amount} received for Invoice #${invoice.invoiceNumber}`;
                
                for (const targetUserId of usersToNotify) {
                    if (targetUserId !== userId) { // Don't notify the person who processed the payment
                        await createNotification({
                            body: {
                                userId: userId,
                                targetUserId: targetUserId,
                                relatedModel: 'invoices',
                                relatedModelId: invoiceId,
                                priorityId: priority.id,
                                title: 'Payment Received',
                                message: message,
                                type: 'general'
                            }
                        });
                    }
                }
            } catch (notificationError) {
                console.error('Error creating payment notifications:', notificationError);
            }

            // Send payment receipt email
            if (email) {
                try {
                    await sendPaymentReceiptEmail({
                        email,
                        firstName: firstName || 'Customer',
                        lastName: lastName || '',
                        amount,
                        paymentType: 'Invoice',
                        paymentMethod: 'Credit Card',
                        referenceNumber: invoice.invoiceNumber,
                        currency: currency || 'USD',
                        transactionId: paymentIntentId,
                        paymentDate: new Date(),
                        companyName: company?.name
                    });
                } catch (emailError) {
                    console.error('Error sending payment receipt email:', emailError);
                }
            }
        }

        res.status(200).json({ err: false, payment });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const saveACHPayment = async (req, res) => {
    try {
        const { 
            amount, 
            currency, 
            paymentIntentId, 
            paymentMethodId,
            status, 
            clientId, 
            estimateId, 
            invoiceId, 
            firstName, 
            lastName, 
            email, 
            phoneNumber 
        } = req.body;
        const userId = req.userId;

        // Get ACH payment method details from Stripe
        const paymentMethod = await getACHPaymentMethod(paymentMethodId);
        const bankAccount = paymentMethod.us_bank_account;
        
        // Calculate expected settlement date
        const expectedSettlementDate = calculateACHSettlementDate();

        // Save the payment data in the database
        const payment = await Payment.create({
            amount,
            currency,
            stripePaymentIntentId: paymentIntentId,
            stripePaymentMethodId: paymentMethodId,
            status,
            paymentType: 'ach',
            clientId,
            estimateId,
            invoiceId,
            firstName: firstName || null,
            lastName: lastName || null,
            email: email || null,
            phoneNumber: phoneNumber || null,
            achBankName: bankAccount.bank_name || null,
            achAccountNumberLast4: bankAccount.last4 || null,
            achAccountType: bankAccount.account_type || null,
            achStatus: 'pending',
            expectedSettlementDate
        });

        // Create histories for estimate or invoice
        if (estimateId) {
            const estimate = await Estimate.findByPk(estimateId);
            const company = await Company.findByPk(res.companyId);

            // Calculate the minimum payment amount based on the company's percentage
            const minimumEstimatePaymentPercentage = company ? company.minimumEstimatePaymentPercentage : 0;
            const minimumPaymentAmount = parseFloat((estimate.total * minimumEstimatePaymentPercentage / 100).toFixed(2));
            
            // Note: For ACH payments, we might want to wait for settlement before generating work orders
            // This depends on business requirements
            
            // Create an entry in the EstimateHistory
            await EstimateHistory.create({
                estimateId: estimate.id,
                statusId: estimate.statusId,
                amount: amount,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Create notifications for ACH payment initiated
            try {
                const usersToNotify = await getPaymentNotificationUsers(estimateId, null, res.companyId);
                const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
                
                const message = `ACH payment of $${amount} initiated for Estimate #${estimate.estimateNumber} (Settlement: 3-5 business days)`;
                
                for (const user of usersToNotify) {
                    if (user.id !== userId) { // Don't notify the person who processed the payment
                        await createNotification({
                            body: {
                                userId: userId,
                                targetUserId: user.id,
                                relatedModel: 'estimates',
                                relatedModelId: estimateId,
                                priorityId: priority.id,
                                title: 'ACH Payment Initiated',
                                message: message,
                                type: 'general'
                            }
                        });
                    }
                }
            } catch (notificationError) {
                console.error('Error creating ACH payment notifications:', notificationError);
            }

            // Send payment receipt email
            if (email) {
                try {
                    await sendPaymentReceiptEmail({
                        email,
                        firstName: firstName || 'Customer',
                        lastName: lastName || '',
                        amount,
                        paymentType: 'Estimate',
                        paymentMethod: 'Bank Transfer',
                        referenceNumber: estimate.estimateNumber,
                        currency: currency || 'USD',
                        transactionId: paymentIntentId,
                        paymentDate: new Date(),
                        settlementDate: expectedSettlementDate,
                        companyName: company?.name
                    });
                } catch (emailError) {
                    console.error('Error sending payment receipt email:', emailError);
                }
            }
        }

        if (invoiceId) {
            const invoice = await Invoice.findByPk(invoiceId);
            const company = await Company.findByPk(res.companyId);
            
            // Create an entry in the InvoiceHistory
            await InvoiceHistory.create({
                invoiceId: invoice.id,
                amount: amount,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Create notifications for ACH payment initiated
            try {
                const usersToNotify = await getPaymentNotificationUsers(null, invoiceId, res.companyId);
                const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
                
                const message = `ACH payment of $${amount} initiated for Invoice #${invoice.invoiceNumber} (Settlement: 3-5 business days)`;
                
                for (const user of usersToNotify) {
                    if (user.id !== userId) { // Don't notify the person who processed the payment
                        await createNotification({
                            body: {
                                userId: userId,
                                targetUserId: user.id,
                                relatedModel: 'invoices',
                                relatedModelId: invoiceId,
                                priorityId: priority.id,
                                title: 'ACH Payment Initiated',
                                message: message,
                                type: 'general'
                            }
                        });
                    }
                }
            } catch (notificationError) {
                console.error('Error creating ACH payment notifications:', notificationError);
            }

            // Send payment receipt email
            if (email) {
                try {
                    await sendPaymentReceiptEmail({
                        email,
                        firstName: firstName || 'Customer',
                        lastName: lastName || '',
                        amount,
                        paymentType: 'Invoice',
                        paymentMethod: 'Bank Transfer',
                        referenceNumber: invoice.invoiceNumber,
                        currency: currency || 'USD',
                        transactionId: paymentIntentId,
                        paymentDate: new Date(),
                        settlementDate: expectedSettlementDate,
                        companyName: company?.name
                    });
                } catch (emailError) {
                    console.error('Error sending payment receipt email:', emailError);
                }
            }
        }

        res.status(200).json({ err: false, payment });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const verifyACHBankAccount = async (req, res) => {
    try {
        const { setupIntentId, amounts } = req.body;
        
        console.log('Verifying ACH bank account:', { setupIntentId, amounts });
        
        const verification = await verifyBankAccount(setupIntentId, amounts);
        
        console.log('Verification result:', verification);
        
        res.status(200).json({ 
            err: false, 
            verification,
            status: verification.status
        });
    } catch (error) {
        console.error('ACH verification error:', error);
        res.status(500).json({ err: true, msg: error.message });
    }
};
const handleStripeACHWebhook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            console.log(`Webhook signature verification failed.`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        await handleACHWebhook(event);
        
        res.status(200).json({ received: true });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const attachACHPaymentMethod = async (req, res) => {
    try {
        const { paymentMethodId, customerId } = req.body;
        
        // DEPRECATED: This function should not be used for new ACH flows
        // Use attachVerifiedACHPaymentMethod instead after proper verification
        console.warn('DEPRECATED: attachACHPaymentMethod used. Use attachVerifiedACHPaymentMethod instead.');
        
        // Attach the payment method to the customer
        const attachedPaymentMethod = await attachPaymentMethodToCustomer(paymentMethodId, customerId);
        
        res.status(200).json({ 
            err: false, 
            paymentMethod: attachedPaymentMethod 
        });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const attachVerifiedACHPaymentMethod = async (req, res) => {
    try {
        const { paymentMethodId, customerId } = req.body;
        
        // Attach the verified payment method to the customer
        const attachedPaymentMethod = await attachPaymentMethodToCustomer(paymentMethodId, customerId);
        
        res.status(200).json({ 
            err: false, 
            paymentMethod: attachedPaymentMethod 
        });
    } catch (error) {
        console.error('Attach Payment Method Error:', error);
        res.status(500).json({ err: true, msg: error.message });
    }
};

module.exports = {
    getPayment,
    listPayments,
    listPaymentMethods,
    createStripeConnectedAccount,
    createStripePaymentIntent,
    addPaymentMethod,
    removePaymentMethod,
    removeStripeIncompleteTransactions,
    savePayment,
    createACHSetupIntentForPayment,
    createACHPaymentIntentForPayment,
    verifyACHBankAccount,
    getCustomerACHPaymentMethods,
    removeACHPaymentMethod,
    saveACHPayment,
    getACHPaymentStatusEndpoint,
    handleStripeACHWebhook,
    attachACHPaymentMethod,
    attachVerifiedACHPaymentMethod
};
