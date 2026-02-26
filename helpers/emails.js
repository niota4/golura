const env = process.env;
const { sendEmail, sendInternalEmail } = require('./mailGun');
const { Address, ClientAddress, Company, User, UserPreference, State, ClientEmail, Estimate, EstimatePreference } = require('../models');

const sendEventCreationEmail = async (participant, newEvent) => {
    // Fetch the user and their preferences
    const user = await User.findByPk(participant.userId, {
        include: [{ model: UserPreference, as: 'Preferences' }]
    });

    if (user && user.Preferences.notifyByEmail) {
        // Fetch the first company and its default email template ID
        const company = await Company.findByPk(res.companyId);
        if (!company) {
            throw new Error('Company not found');
        }

        const templateId = company.companyDefaultEmailTemplateId;

        if (templateId) {
            // Determine the event location
            let eventLocation = await Address.findOne({
                where: { id: newEvent.addressId },
                include: [
                    {
                        model: State,
                        as: 'State'
                    }
                ]
            });
            if (newEvent.clientId) {
                eventLocation = await ClientAddress.findOne({
                    where: { id: newEvent.addressId },
                    include: [
                        {
                            model: State,
                            as: 'State'
                        }
                    ]
                });
            }

            // Prepare the email data
            const emailData = {
                userName: `${user.firstName} ${user.lastName}`,
                eventId: newEvent.id,
                eventName: newEvent.title,
                eventDate: newEvent.startDate,
                eventLocation: eventLocation ? `${eventLocation.street1}, ${eventLocation.city}` : 'Location not specified'
            };

            // Create the HTML content
            const emailContent = `
                <h1>Hello ${emailData.userName},</h1>
                <p>An event has been created and you have been added as a participant:</p>
                <ul>
                    <li><strong>Event Name:</strong> ${emailData.eventName}</li>
                    <li><strong>Event Date:</strong> ${emailData.eventDate}</li>
                    <li><strong>Event Location:</strong> ${emailData.eventLocation}</li>
                </ul>
                <p>Thank you for your participation!</p>
            `;

            // Send the email
            await sendEmail(user.email, 'Event Created: You Have Been Added as a Participant', templateId, { ...emailData, emailContent });
        }
    }
};
const sendAddParticipantEmail = async (participant, newEvent) => {
    // Fetch the user and their preferences
    const user = await User.findByPk(participant.userId, {
        include: [{ model: UserPreference, as: 'Preferences' }]
    });

    if (user && user.Preferences.notifyByEmail) {
        // Fetch the first company and its default email template ID
        const company = await Company.findByPk(res.companyId);
        if (!company) {
            throw new Error('Company not found');
        }

        const templateId = company.companyDefaultEmailTemplateId;

        if (templateId) {
            // Determine the event location
            let eventLocation = await Address.findOne({
                where: { id: newEvent.addressId },
                include: [
                    {
                        model: State,
                        as: 'State'
                    }
                ]
            });
            if (newEvent.clientId) {
                eventLocation = await ClientAddress.findOne({
                    where: { id: newEvent.addressId },
                    include: [
                        {
                            model: State,
                            as: 'State'
                        }
                    ]
                });
            }

            // Prepare the email data
            const emailData = {
                userName: `${user.firstName} ${user.lastName}`,
                eventId: newEvent.id,
                eventName: newEvent.title,
                eventDate: newEvent.startDate,
                eventLocation: eventLocation ? `${eventLocation.street1}, ${eventLocation.city}` : 'Location not specified'
            };

            // Create the HTML content
            const emailContent = `
                <h1>Hello ${emailData.userName},</h1>
                <p>You have been added as a participant to an event:</p>
                <ul>
                    <li><strong>Event Name:</strong> ${emailData.eventName}</li>
                    <li><strong>Event Date:</strong> ${emailData.eventDate}</li>
                    <li><strong>Event Location:</strong> ${emailData.eventLocation}</li>
                </ul>
                <p>Thank you for your participation!</p>
            `;

            // Send the email
            await sendEmail(user.email, 'You Have Been Added as a Participant', templateId, { ...emailData, emailContent });
        }
    }
};
const sendEstimateCreationEmail = async (estimate) => {
    const company = await Company.findByPk(res.companyId);
    if (!company || !company.estimateEmailNotification) {
        return;
    }

    const estimatePreferences = await EstimatePreference.findByPk(estimate.estimatePreferenceId);
    if (estimatePreferences && !estimatePreferences.email) {
        return;
    }

    const templateId = company.companyDefaultEmailTemplateId;
    if (!templateId) {
        throw new Error('Email template ID not found');
    }

    const clientEmail = await ClientEmail.findByPk(estimate.clientEmailId);
    const emailToSend = clientEmail ? clientEmail.email : null;

    if (!emailToSend) {
        return;
    }

    const emailData = {
        estimateNumber: estimate.estimateNumber,
        clientName: estimate.Client ? `${estimate.Client.firstName} ${estimate.Client.lastName}` : 'Client',
        total: estimate.total,
        dueNow: estimate.dueNow,
        estimateTermsAndConditions: estimate.estimateTermsAndConditions,
    };

    const emailContent = `
        <h1>Hello ${emailData.clientName},</h1>
        <p>An estimate has been created for you:</p>
        <ul>
            <li><strong>Estimate Number:</strong> ${emailData.estimateNumber}</li>
            <li><strong>Total:</strong> ${emailData.total}</li>
        </ul>
        <p>Terms and Conditions:</p>
        <p>${emailData.estimateTermsAndConditions}</p>
        <p>Thank you for your business!</p>
    `;

    await sendEmail(emailToSend, 'New Estimate Created', templateId, { ...emailData, emailContent });
};
const sendEstimateSignedEmail = async (estimate, companyId) => {
    const company = await Company.findByPk(companyId);
    if (!company || !company.estimateEmailNotification) {
        return;
    }

    const estimatePreferences = await EstimatePreference.findByPk(estimate.estimatePreferenceId);
    if (estimatePreferences && !estimatePreferences.email) {
        return;
    }

    const templateId = company.companyDefaultEmailTemplateId;
    if (!templateId) {
        throw new Error('Email template ID not found');
    }

    const clientEmail = await ClientEmail.findByPk(estimate.clientEmailId);
    const emailToSend = clientEmail ? clientEmail.email : null;

    if (!emailToSend) {
        return;
    }

    const emailData = {
        estimateNumber: estimate.estimateNumber,
        clientName: estimate.Client ? `${estimate.Client.firstName} ${estimate.Client.lastName}` : 'Client',
        total: estimate.total,
        dueNow: estimate.dueNow,
        estimateTermsAndConditions: company.estimateTermsAndConditions,
    };

    const emailContent = `
        <h1>Hello ${emailData.clientName},</h1>
        <p>We are pleased to inform you that your estimate has been signed:</p>
        <ul>
            <li><strong>Estimate Number:</strong> ${emailData.estimateNumber}</li>
            <li><strong>Total:</strong> ${emailData.total}</li>
        </ul>
        <p><small>Terms and Conditions:</small></p>
        <p><small>${emailData.estimateTermsAndConditions}</small></p>
        <p>Thank you for your business!</p>
    `;

    await sendEmail(emailToSend, 'Estimate Signed', templateId, { ...emailData, emailContent });

    // Notify the assigned user if they have email notifications enabled
    if (estimate.assignedUserId) {
        const assignedUser = await User.findByPk(estimate.assignedUserId, {
            include: [{ model: UserPreference, as: 'Preferences' }]
        });

        if (assignedUser && assignedUser.Preferences.notifyByEmail) {
            const assignedUserEmailData = {
                estimateNumber: estimate.estimateNumber,
                clientName: estimate.Client ? `${estimate.Client.firstName} ${estimate.Client.lastName}` : 'Client',
                total: estimate.total,
                dueNow: estimate.dueNow,
            };

            const assignedUserEmailContent = `
                <h1>Hello ${assignedUser.firstName},</h1>
                <p>The customer ${assignedUserEmailData.clientName} has signed their estimate:</p>
                <ul>
                    <li><strong>Estimate Number:</strong> ${assignedUserEmailData.estimateNumber}</li>
                    <li><strong>Total:</strong> ${assignedUserEmailData.total}</li>
                </ul>
                <p>Thank you for your attention!</p>
            `;

            await sendEmail(assignedUser.email, 'Customer Signed Estimate', templateId, { ...assignedUserEmailData, assignedUserEmailContent });
        }
    }
};
const sendUserCreationEmail = async (user, securityToken, randomNumber) => {    // Ensure randomNumber is treated as a string
    const verificationCode = String(randomNumber);

    // Generate verification URL
    const verificationUrl = `${env.DOMAIN_URL}/users/user/setup?id=${user.id}&token=${securityToken}&string=${verificationCode}`;

    // Prepare email data
    const emailData = {
        userName: `${user.firstName} ${user.lastName}`,
        verificationUrl
    };

    // Send email
    await sendInternalEmail(user.email, 'Your Account Has Been Created', 'userCreation', emailData);
};
const sendUserVerificationEmail = async (user, securityToken, randomNumber) => {
    // Ensure randomNumber is treated as a string
    const verificationCode = String(randomNumber);

    // Generate verification URL
    const verificationUrl = `${env.DOMAIN_URL}/users/user/setup?id=${user.id}&token=${securityToken}`;

    // Prepare email data
    const emailData = {
        userName: `${user.firstName} ${user.lastName}`,
        verificationUrl,
        digit1: verificationCode[0],
        digit2: verificationCode[1],
        digit3: verificationCode[2],
        digit4: verificationCode[3],
        digit5: verificationCode[4],
        digit6: verificationCode[5],
    };

    // Send email
    await sendInternalEmail(user.email, 'Your Verification Code', 'userVerification', emailData);
};
const sendUserPasswordResetEmail = async (user, securityToken) => {
    // Generate reset URL
    const resetUrl = `${env.DOMAIN_URL}/users/user/password-reset?id=${user.id}&token=${securityToken}`;

    // Prepare email data
    const emailData = {
        userName: `${user.firstName} ${user.lastName}`,
        resetUrl
    };

    // Send email
    await sendInternalEmail(user.email, 'Password Reset Request', 'passwordReset', emailData);
};
const sendPaystubEmail = async (payrollItem, company, pdfUrl) => {
    try {
        const employeeName = `${payrollItem.Employee.firstName} ${payrollItem.Employee.lastName}`;
        const subject = `Your Paystub is Ready - ${company.name}`;
        
        // Format dates for email
        const payPeriodStartDate = payrollItem.Payroll.startDate.toLocaleDateString();
        const payPeriodEndDate = payrollItem.Payroll.endDate.toLocaleDateString();
        
        // Prepare email data
        const emailData = {
            userName: employeeName,
            payStubUrl: pdfUrl,
            payPeriodStartDate: payPeriodStartDate,
            payPeriodEndDate: payPeriodEndDate
        };
        
        // Send the email
        await sendInternalEmail(
            payrollItem.Employee.email,
            subject,
            'paystub',
            emailData
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
const sendPayrollProcessedEmail = async (payrollItem, company, pdfUrl) => {
    try {
        const employeeName = `${payrollItem.Employee.firstName} ${payrollItem.Employee.lastName}`;
        const subject = `Payroll has been processed - ${company.name}`;


        const payPeriodStartDate = payrollItem.Payroll.startDate.toLocaleDateString();
        const payPeriodEndDate = payrollItem.Payroll.endDate.toLocaleDateString();
        const payDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Prepare email data
        const emailData = {
            userName: employeeName,
            payStubUrl: pdfUrl,
            payDate: payDate,
            payPeriodStartDate: payPeriodStartDate,
            payPeriodEndDate: payPeriodEndDate
        };

        // Send the email
        await sendInternalEmail(
            payrollItem.Employee.email,
            subject,
            'payrollProcessed',
            emailData
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
const sendPaymentReceiptEmail = async (paymentData) => {
    try {
        const company = await Company.findByPk(res.companyId);
        if (!company) {
            throw new Error('Company not found');
        }

        const templateId = company.companyDefaultEmailTemplateId;
        if (!templateId) {
            throw new Error('Email template ID not found');
        }

        const {
            email,
            firstName,
            lastName,
            amount,
            paymentType, // 'Estimate' or 'Invoice'
            paymentMethod, // 'Credit Card', 'Bank Transfer', etc.
            referenceNumber, // estimate number or invoice number
            currency,
            transactionId,
            paymentDate,
            settlementDate, // for ACH payments
            companyName
        } = paymentData;

        if (!email) {
            throw new Error('Email address is required');
        }

        const customerName = `${firstName} ${lastName}`;
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'
        }).format(amount);

        const formattedPaymentDate = new Date(paymentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Settlement info for ACH payments
        let settlementInfo = '';
        if (paymentMethod === 'Bank Transfer' && settlementDate) {
            const formattedSettlementDate = new Date(settlementDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            settlementInfo = `
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: 600; color: #333; font-family:'Poppins', sans-serif; font-size: 14px;">Expected Settlement:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-family:'Poppins', sans-serif; font-size: 14px;">${formattedSettlementDate}</td>
                </tr>
            `;
        }

        const paymentMethodText = paymentMethod === 'Credit Card' ? 'credit card' : 
                                paymentMethod === 'Bank Transfer' ? 'bank transfer' : 
                                paymentMethod.toLowerCase();

        // Status message based on payment method
        const statusMessage = paymentMethod === 'Bank Transfer' ? 
            'Your bank transfer has been initiated and will be processed within 3-5 business days.' : 
            'Your payment has been processed successfully.';

        // What's next content based on payment type
        const whatsNext = paymentType === 'Estimate' ? `
            <ul style="margin: 0; padding-left: 20px;">
                <li>We will begin working on your project as scheduled</li>
                <li>You will receive updates on the progress of your work</li>
                <li>A final invoice will be sent upon completion</li>
            </ul>
        ` : `
            <ul style="margin: 0; padding-left: 20px;">
                <li>Your invoice has been marked as paid</li>
                <li>You will receive a completion confirmation if applicable</li>
                <li>Please keep this receipt for your records</li>
            </ul>
        `;

        const emailData = {
            CustomerName: customerName,
            PaymentType: paymentType,
            ReferenceNumber: referenceNumber,
            Amount: formattedAmount,
            PaymentMethod: paymentMethodText,
            TransactionId: transactionId,
            PaymentDate: formattedPaymentDate,
            CompanyName: companyName || company.name || 'Our Company',
            CompanyUrl: company.website || '#',
            CompanyLogo: company.logo || '',
            SettlementInfo: settlementInfo,
            StatusMessage: statusMessage,
            WhatsNext: whatsNext
        };

        const subject = `Payment Receipt - ${paymentType} #${referenceNumber}`;

        await sendEmail(email, subject, templateId, emailData);
        
        return { success: true };
    } catch (error) {
        console.error('Error sending payment receipt email:', error);
        return { success: false, error: error.message };
    }
};
const sendEstimateApprovedNotificationEmail = async (estimate, targetUser, clientMessage = null) => {
    const company = await Company.findByPk(res.companyId);
    if (!company) {
        return;
    }

    const templateId = company.companyDefaultEmailTemplateId;
    if (!templateId) {
        return;
    }

    const emailData = {
        userName: `${targetUser.firstName} ${targetUser.lastName}`,
        estimateNumber: estimate.estimateNumber,
        clientName: estimate.Client ? `${estimate.Client.firstName} ${estimate.Client.lastName}` : 'Client',
        total: estimate.total,
        message: clientMessage || 'No additional message provided.',
        approvalDate: new Date().toLocaleDateString()
    };

    const emailContent = `
        <h1>Hello ${emailData.userName},</h1>
        <p>Great news! Your estimate has been approved by the client:</p>
        <ul>
            <li><strong>Estimate Number:</strong> ${emailData.estimateNumber}</li>
            <li><strong>Client:</strong> ${emailData.clientName}</li>
            <li><strong>Total Amount:</strong> $${emailData.total}</li>
            <li><strong>Approval Date:</strong> ${emailData.approvalDate}</li>
        </ul>
        <p><strong>Client Message:</strong></p>
        <p>${emailData.message}</p>
        <p>You can now proceed with the next steps for this approved estimate.</p>
    `;

    await sendEmail(targetUser.email, `Estimate ${emailData.estimateNumber} Approved by Client`, templateId, { ...emailData, emailContent });
};
const sendEstimateRejectedNotificationEmail = async (estimate, targetUser, rejectionReason) => {
    const company = await Company.findByPk(res.companyId);
    if (!company) {
        return;
    }

    const templateId = company.companyDefaultEmailTemplateId;
    if (!templateId) {
        return;
    }

    const emailData = {
        userName: `${targetUser.firstName} ${targetUser.lastName}`,
        estimateNumber: estimate.estimateNumber,
        clientName: estimate.Client ? `${estimate.Client.firstName} ${estimate.Client.lastName}` : 'Client',
        total: estimate.total,
        rejectionReason: rejectionReason,
        rejectionDate: new Date().toLocaleDateString()
    };

    const emailContent = `
        <h1>Hello ${emailData.userName},</h1>
        <p>Your estimate has been rejected by the client:</p>
        <ul>
            <li><strong>Estimate Number:</strong> ${emailData.estimateNumber}</li>
            <li><strong>Client:</strong> ${emailData.clientName}</li>
            <li><strong>Total Amount:</strong> $${emailData.total}</li>
            <li><strong>Rejection Date:</strong> ${emailData.rejectionDate}</li>
        </ul>
        <p><strong>Rejection Reason:</strong></p>
        <p>${emailData.rejectionReason}</p>
        <p>Please review the client's feedback and consider your next steps.</p>
    `;

    await sendEmail(targetUser.email, `Estimate ${emailData.estimateNumber} Rejected by Client`, templateId, { ...emailData, emailContent });
};
const sendEstimateChangesRequestedNotificationEmail = async (estimate, targetUser, changeRequest) => {
    const company = await Company.findByPk(res.companyId);
    if (!company) {
        return;
    }

    const templateId = company.companyDefaultEmailTemplateId;
    if (!templateId) {
        return;
    }

    const emailData = {
        userName: `${targetUser.firstName} ${targetUser.lastName}`,
        estimateNumber: estimate.estimateNumber,
        clientName: estimate.Client ? `${estimate.Client.firstName} ${estimate.Client.lastName}` : 'Client',
        total: estimate.total,
        changeRequest: changeRequest,
        requestDate: new Date().toLocaleDateString()
    };

    const emailContent = `
        <h1>Hello ${emailData.userName},</h1>
        <p>The client has requested changes to your estimate:</p>
        <ul>
            <li><strong>Estimate Number:</strong> ${emailData.estimateNumber}</li>
            <li><strong>Client:</strong> ${emailData.clientName}</li>
            <li><strong>Total Amount:</strong> $${emailData.total}</li>
            <li><strong>Request Date:</strong> ${emailData.requestDate}</li>
        </ul>
        <p><strong>Requested Changes:</strong></p>
        <p>${emailData.changeRequest}</p>
        <p>Please review the requested changes and update the estimate accordingly.</p>
    `;

    await sendEmail(targetUser.email, `Changes Requested for Estimate ${emailData.estimateNumber}`, templateId, { ...emailData, emailContent });
};
const sendEstimateFeedbackNotificationEmail = async (estimate, targetUser, feedback) => {
    const company = await Company.findByPk(res.companyId);
    if (!company) {
        return;
    }

    const templateId = company.companyDefaultEmailTemplateId;
    if (!templateId) {
        return;
    }

    const emailData = {
        userName: `${targetUser.firstName} ${targetUser.lastName}`,
        estimateNumber: estimate.estimateNumber,
        clientName: estimate.Client ? `${estimate.Client.firstName} ${estimate.Client.lastName}` : 'Client',
        total: estimate.total,
        feedback: feedback,
        feedbackDate: new Date().toLocaleDateString()
    };

    const emailContent = `
        <h1>Hello ${emailData.userName},</h1>
        <p>You have received new feedback from the client regarding your estimate:</p>
        <ul>
            <li><strong>Estimate Number:</strong> ${emailData.estimateNumber}</li>
            <li><strong>Client:</strong> ${emailData.clientName}</li>
            <li><strong>Total Amount:</strong> $${emailData.total}</li>
            <li><strong>Feedback Date:</strong> ${emailData.feedbackDate}</li>
        </ul>
        <p><strong>Client Feedback:</strong></p>
        <p>${emailData.feedback}</p>
        <p>Please review the client's feedback and respond accordingly.</p>
    `;

    await sendEmail(targetUser.email, `New Feedback for Estimate ${emailData.estimateNumber}`, templateId, { ...emailData, emailContent });
};
const sendCompanyCreationEmail = async (company, securityToken, randomNumber) => {    // Ensure randomNumber is treated as a string
    const verificationCode = String(randomNumber);

    // Generate verification URL
    const verificationUrl = `${env.DOMAIN_URL}/company/setup?id=${company.id}&token=${securityToken}&string=${verificationCode}`;

    // Prepare email data
    const emailData = {
        companyName: `${company.name}`,
        verificationUrl
    };

    // Send email to company email address
    await sendInternalEmail(company.email, 'Welcome to Golura', 'companyCreation', emailData);
};
const sendCompanyVerificationEmail = async (company, securityToken, randomNumber) => {
    // Ensure randomNumber is treated as a string
    const verificationCode = String(randomNumber);

    // Generate verification URL
    const verificationUrl = `${env.DOMAIN_URL}/company/setup?id=${company.id}&token=${securityToken}`;

    // Prepare email data
    const emailData = {
        companyName: `${company.name}`,
        verificationUrl,
        digit1: verificationCode[0],
        digit2: verificationCode[1],
        digit3: verificationCode[2],
        digit4: verificationCode[3],
        digit5: verificationCode[4],
        digit6: verificationCode[5],
    };

    // Send email
    await sendInternalEmail(company.email, 'Your Verification Code', 'companyVerification', emailData);
};
const sendCompanySetupCompleteEmail = async (company) => {
    const emailData = {
        companyName: `${company.name}`,
    }
    // Send email
    await sendInternalEmail(company.email, 'Company Setup Complete', 'companySetupComplete', emailData);
};

module.exports = {
    sendEventCreationEmail,
    sendAddParticipantEmail,
    sendEstimateCreationEmail,
    sendEstimateSignedEmail,
    sendUserCreationEmail,
    sendUserVerificationEmail,
    sendUserPasswordResetEmail,
    sendPaystubEmail,
    sendPayrollProcessedEmail,
    sendPaymentReceiptEmail,
    sendEstimateApprovedNotificationEmail,
    sendEstimateRejectedNotificationEmail,
    sendEstimateChangesRequestedNotificationEmail,
    sendEstimateFeedbackNotificationEmail,
    sendCompanyCreationEmail,
    sendCompanyVerificationEmail,
    sendCompanySetupCompleteEmail
};
