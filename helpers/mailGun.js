const FormData = require("form-data");
const Mailgun = require("mailgun.js");
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const env = process.env;
const { Template, Company } = require('../models'); // Adjust the path as needed
const { replacePlaceholders } = require('../helpers/shortCode'); // Import the replacePlaceholders function

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: env.MAILGUN_API_KEY || "API_KEY",
});

const getTemplateContent = async (templateUrl) => {
  try {
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const templateContent = await response.text();
    return templateContent;
  } catch (error) {
    console.error('Error fetching template:', error);
    throw new Error('Could not fetch template');
  }
};

const getDefaultTemplateContent = () => {
  try {
    const defaultTemplatePath = path.join(__dirname, '../public/dist/partials/templates/emails/default.html');
    const templateContent = fs.readFileSync(defaultTemplatePath, 'utf8');
    return templateContent;
  } catch (error) {
    console.error('Error reading default template:', error);
    throw new Error('Could not read default template');
  }
};

const updateTemplateContent = async (templateContent) => {
  try {
    const company = await Company.findByPk(res.companyId);
    const logoUrl = company && company.logoUrl ? company.logoUrl : "https://res.cloudinary.com/golura/image/upload/favicon.png";
    const appUrl = env.DOMAIN_URL;
    const companyName = company && company.name ? company.name : "Company Name";

    // Update logo images
    templateContent = templateContent.replace(/<img class="logo-image"[^>]*src="[^"]*"[^>]*>/g, (match) => {
      return match.replace(/src="[^"]*"/, `src="${logoUrl}"`);
    });

    // Update logo links
    templateContent = templateContent.replace(/<a class="logo-link"[^>]*href="[^"]*"[^>]*>/g, (match) => {
      return match.replace(/href="[^"]*"/, `href="${appUrl}"`);
    });

    // Update company name
    templateContent = templateContent.replace(/<td class="company-name"[^>]*>[^<]*<\/td>/g, (match) => {
      return match.replace(/>[^<]*</, `>${companyName}<`);
    });
    // Update every #3F3FAA with company primary color
    templateContent = templateContent.replace(/#3F3FAA/g, company.primaryColor || '#3F3FAA');
    
    return templateContent;
  } catch (error) {
    console.error('Error updating template content:', error);
    throw new Error('Could not update template content');
  }
};

const sendEmail = async (to, subject, templateId, data) => {
  try {
    let templateContent;

    if (templateId) {
      // Fetch the template from the database
      const template = await Template.findByPk(templateId);
      if (template) {
        // Fetch the template content from the URL
        templateContent = await getTemplateContent(template.url);
      }
    }

    // Use default template if no template is found
    if (!templateContent) {
      templateContent = getDefaultTemplateContent();
      templateContent = await updateTemplateContent(templateContent);
    }

    // Replace placeholders in the template with actual data
    const emailContent = await replacePlaceholders(templateContent, data);

    // Prepare the email data
    const emailData = {
      from: '<noreply@mail.golura.net>',
      to: to,
      subject: subject,
      html: emailContent,
    };

    // Send the email using Mailgun
    await mg.messages.create(env.MAILGUN_DOMAIN, emailData);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendInternalEmail = async (to, subject, type, data) => {
  try {
    let templatePath;

    switch (type) {
      case 'userVerification':
        templatePath = path.join(__dirname, '../public/partials/templates/emails/user-validation-email.html');
        break;
      case 'userCreation':
        templatePath = path.join(__dirname, '../public/partials/templates/emails/user-creation-email.html');
        break;
      case 'companyVerification':
        templatePath = path.join(__dirname, '../public/partials/templates/emails/company-validation-email.html');
        break;
      case 'companyCreation':
        templatePath = path.join(__dirname, '../public/partials/templates/emails/company-creation-email.html');
        break;
      case 'companySetupComplete':
        templatePath = path.join(__dirname, '../public/partials/templates/emails/company-setup-complete-email.html');
        break;
      case 'passwordReset':
        templatePath = path.join(__dirname, '../public/partials/templates/emails/user-reset-password-email.html');
        break;
      case 'userReminder':
        templatePath = path.join(__dirname, '../public/partials/templates/emails/user-reminder-email.html');
        break;
      case 'paystub':
        templatePath = path.join(__dirname, '../public/partials/templates/emails/user-paystub-email.html');
        break;
      case 'payrollProcessed':
        templatePath = path.join(__dirname, '../public/partials/templates/emails/user-payroll-processed-email.html');
        break;
      // Add more cases for different types if needed
      default:
        throw new Error('Invalid email type');
    }

    // Read the template content from the file
    let templateContent = fs.readFileSync(templatePath, 'utf8');

    // Get company information for theming
    const company = await Company.findByPk(res.companyId);
    
    // Replace company primary color placeholder
    if (company && company.primaryColor) {
      templateContent = templateContent.replace(/#3F3FAA/g, company.primaryColor);
    }

    // Replace placeholders in the template with actual data
    templateContent = await replacePlaceholders(templateContent, data);

    // Replace verification code digits
    templateContent = templateContent.replace(/{{digit1}}/g, data.digit1);
    templateContent = templateContent.replace(/{{digit2}}/g, data.digit2);
    templateContent = templateContent.replace(/{{digit3}}/g, data.digit3);
    templateContent = templateContent.replace(/{{digit4}}/g, data.digit4);
    templateContent = templateContent.replace(/{{digit5}}/g, data.digit5);
    templateContent = templateContent.replace(/{{digit6}}/g, data.digit6);

    // General placeholders
    templateContent = templateContent.replace(/{{UserName}}/g, data.userName);
    templateContent = templateContent.replace(/{{VerificationUrl}}/g, data.verificationUrl);
    templateContent = templateContent.replace(/{{ResetUrl}}/g, data.resetUrl);

    // Reminder specific placeholders
    templateContent = templateContent.replace(/{{ReminderTitle}}/g, data.reminderTitle);
    templateContent = templateContent.replace(/{{ReminderDate}}/g, data.reminderDate);
    templateContent = templateContent.replace(/{{ReminderDescription}}/g, data.reminderDescription);

    // Paystub specific placeholders
    templateContent = templateContent.replace(/{{PayDate}}/g, data.payDate);
    templateContent = templateContent.replace(/{{PayStubUrl}}/g, data.payStubUrl);
    templateContent = templateContent.replace(/{{PayPeriodStartDate}}/g, data.payPeriodStartDate);
    templateContent = templateContent.replace(/{{PayPeriodEndDate}}/g, data.payPeriodEndDate);

    // Prepare the email data
    const emailData = {
      from: '<noreply@mail.golura.net>',
      to: to,
      subject: subject,
      html: templateContent,
    };

    // Send the email using Mailgun
    await mg.messages.create(env.MAILGUN_DOMAIN, emailData);
    console.log(`Internal email of type ${type} sent to ${to}`);
  } catch (error) {
    console.error('Error sending internal email:', error);
  }
};

module.exports = { sendEmail, sendInternalEmail };
