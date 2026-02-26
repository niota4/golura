const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { sendEstimateEmail } = require('./emails'); // Assuming you have an existing email helper

/**
 * Send client action notification emails
 * @param {string} actionType - Type of action (approved, rejected, changes_requested, feedback)
 * @param {Object} estimate - Estimate object
 * @param {Object} feedback - EstimateFeedback object
 * @param {Object} client - Client object
 * @param {Object} company - Company object
 */
const sendClientActionEmail = async (actionType, estimate, feedback, client, company) => {
    try {
        // Map action types to template files and email subjects
        const emailTemplates = {
            'approved': {
                template: 'estimate-approved.html',
                subject: `✅ Estimate ${estimate.estimateNumber} Approved by Client`
            },
            'rejected': {
                template: 'estimate-rejected.html',
                subject: `❌ Estimate ${estimate.estimateNumber} Rejected by Client`
            },
            'changes_requested': {
                template: 'estimate-changes-requested.html',
                subject: `📝 Changes Requested for Estimate ${estimate.estimateNumber}`
            },
            'feedback': {
                template: 'estimate-feedback.html',
                subject: `💬 New Feedback on Estimate ${estimate.estimateNumber}`
            }
        };

        const emailConfig = emailTemplates[actionType];
        if (!emailConfig) {
            console.error(`No email template found for action type: ${actionType}`);
            return;
        }

        // Read the HTML template
        const templatePath = path.join(__dirname, '../public/partials/templates/emails', emailConfig.template);
        
        if (!fs.existsSync(templatePath)) {
            console.error(`Email template not found: ${templatePath}`);
            return;
        }

        const templateHtml = fs.readFileSync(templatePath, 'utf8');
        
        // Compile the template with Handlebars
        const template = handlebars.compile(templateHtml);
        
        // Prepare template data
        const templateData = {
            estimate: {
                id: estimate.id,
                estimateNumber: estimate.estimateNumber,
                total: parseFloat(estimate.total || 0).toFixed(2),
                subTotal: parseFloat(estimate.subTotal || 0).toFixed(2)
            },
            client: {
                firstName: client?.firstName || '',
                lastName: client?.lastName || '',
                fullName: `${client?.firstName || ''} ${client?.lastName || ''}`.trim()
            },
            feedback: {
                message: feedback?.message || '',
                clientName: feedback?.clientName || client?.firstName + ' ' + client?.lastName || 'Client',
                clientEmail: feedback?.clientEmail || '',
                createdAt: feedback?.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
            },
            company: {
                name: company?.name || 'Your Company',
                address: company?.address || '',
                phone: company?.phone || '',
                email: company?.email || ''
            },
            baseUrl: process.env.BASE_URL || 'http://localhost:3000'
        };

        // Generate the HTML content
        const htmlContent = template(templateData);

        // Determine recipient email
        let recipientEmail;
        if (estimate.assignedUserId) {
            // Get assigned user's email
            const { User } = require('../models');
            const assignedUser = await User.findByPk(estimate.assignedUserId);
            recipientEmail = assignedUser?.email;
        }
        
        if (!recipientEmail && estimate.userId) {
            // Get creator's email
            const { User } = require('../models');
            const creator = await User.findByPk(estimate.userId);
            recipientEmail = creator?.email;
        }

        if (!recipientEmail) {
            console.error('No recipient email found for estimate notification');
            return;
        }

        // Send the email
        const emailData = {
            to: recipientEmail,
            subject: emailConfig.subject,
            html: htmlContent,
            from: company?.email || process.env.DEFAULT_FROM_EMAIL
        };

        // Use your existing email sending function
        await sendEstimateEmail(emailData);
        
        console.log(`Client action email sent successfully: ${actionType} for estimate ${estimate.estimateNumber}`);
        
    } catch (error) {
        console.error('Error sending client action email:', error);
        throw error;
    }
};

/**
 * Send estimate reminder email to client
 * @param {Object} estimate - Estimate object
 * @param {Object} client - Client object
 * @param {Object} company - Company object
 * @param {string} reminderType - Type of reminder (unviewed, overdue)
 */
const sendEstimateReminderEmail = async (estimate, client, company, reminderType = 'unviewed') => {
    try {
        const subject = reminderType === 'overdue' 
            ? `⏰ Urgent: Please Review Your Estimate ${estimate.estimateNumber}`
            : `📋 Please Review Your Estimate ${estimate.estimateNumber}`;

        const templateData = {
            estimate: {
                id: estimate.id,
                estimateNumber: estimate.estimateNumber,
                total: parseFloat(estimate.total || 0).toFixed(2),
                estimateUrl: estimate.estimateUrl
            },
            client: {
                firstName: client?.firstName || '',
                lastName: client?.lastName || '',
                fullName: `${client?.firstName || ''} ${client?.lastName || ''}`.trim()
            },
            company: {
                name: company?.name || 'Your Company',
                phone: company?.phone || '',
                email: company?.email || ''
            },
            reminderType,
            baseUrl: process.env.BASE_URL || 'http://localhost:3000'
        };

        // You can create a reminder email template later
        const emailData = {
            to: client?.email || estimate.clientEmail,
            subject: subject,
            text: `Hello ${templateData.client.fullName},

This is a ${reminderType === 'overdue' ? 'follow-up ' : ''}reminder to review your estimate ${estimate.estimateNumber} totaling $${templateData.estimate.total}.

Please click the link below to view and respond to your estimate:
${templateData.estimate.estimateUrl || `${templateData.baseUrl}/estimates/view/${estimate.id}`}

If you have any questions, please don't hesitate to contact us.

Best regards,
${templateData.company.name}
${templateData.company.phone}`,
            from: company?.email || process.env.DEFAULT_FROM_EMAIL
        };

        await sendEstimateEmail(emailData);
        console.log(`Estimate reminder email sent: ${reminderType} for estimate ${estimate.estimateNumber}`);

    } catch (error) {
        console.error('Error sending estimate reminder email:', error);
        throw error;
    }
};

module.exports = {
    sendClientActionEmail,
    sendEstimateReminderEmail
};
