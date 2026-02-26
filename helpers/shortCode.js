const env = process.env;
const { 
  Company,
  Client, 
  Estimate, 
  Event, 
  ClientEmail, 
  ClientPhoneNumber, 
  ClientAddress, 
  ShortCode,
  State,
  User // Add User model
} = require('../models'); // Adjust the path as needed

const fetchData = async (data) => {
  const result = {};

  if (data.clientId) {
    const client = await Client.findByPk(data.clientId);
    if (client) {
      result.Client = `${client.firstName} ${client.lastName}`;
      const clientEmail = await ClientEmail.findOne({ where: { clientId: client.id } });
      const clientPhone = await ClientPhoneNumber.findOne({ where: { clientId: client.id } });
      const clientAddress = await ClientAddress.findOne({ where: { clientId: client.id } });
      result.ClientEmail = clientEmail ? clientEmail.email : '';
      result.ClientPhone = clientPhone ? clientPhone.phoneNumber : '';
      result.ClientAddress = clientAddress ? `${clientAddress.street}, ${clientAddress.city}, ${clientAddress.state}, ${clientAddress.zip}` : '';
    }
  }

  if (data.estimateId) {
    const estimate = await Estimate.findByPk(data.estimateId);
    if (estimate) {
      result.Estimate = estimate.estimateNumber;
      result.EstimateSubTotal = estimate.subTotal;
      result.EstimateTotal = estimate.total;
      result.EstimateDiscount = estimate.discountTotal;
    }
  }

  if (data.eventId) {
    const event = await Event.findByPk(data.eventId);
    if (event) {
      result.Event = event.title;
      result.EventType = event.type;
      result.EventDate = event.date;
      result.EventStatus = event.status;
    }
  }

  if (data.userId) {
    const user = await User.findByPk(data.userId);
    if (user) {
      result.UserName = `${user.firstName} ${user.lastName}`;
      result.UserEmail = user.email;
      result.UserPhoneNumber = user.phoneNumber;
    }
  }

  // Add more data fetching logic as needed

  return result;
};

const replacePlaceholders = async (templateContent, data) => {
  // Fetch the necessary data
  const fetchedData = await fetchData(data);

  // Replace {{Content}} with the supplied text
  if (data.emailContent) {
    templateContent = templateContent.replace('{{Content}}', data.emailContent);
  }

  // Fetch all shortcodes
  const shortCodes = await ShortCode.findAll();

  // Replace shortcodes in the template
  shortCodes.forEach(shortCode => {
    const regex = new RegExp(`{{${shortCode.name}}}`, 'g');
    templateContent = templateContent.replace(regex, fetchedData[shortCode.name] || '');
  });

  // Check for shortcodes in the EmailContent and replace them
  if (data.EmailContent) {
    shortCodes.forEach(shortCode => {
      const regex = new RegExp(`{{${shortCode.name}}}`, 'g');
      data.EmailContent = data.EmailContent.replace(regex, fetchedData[shortCode.name] || '');
    });
  }

  // Fetch company data
  const company = await Company.findByPk(res.companyId);
  const companyState = await State.findByPk(company.stateId) || {};

  // Replace other placeholders
  const staticPlaceholders = {
    '{{CompanyName}}': company.name,
    '{{CompanyLogo}}': company.logoUrl,
    '{{CompanyWebsite}}': env.DOMAIN_URL,
    '{{CompanyAddress}}': `${company.street1}, ${company.street2}, ${company.city}, ${companyState.name}, ${company.zipCode}`,
    '{{CompanyCity}}': company.city,
    '{{CompanyPhone}}': company.phone,
    '{{CompanyEmail}}': company.email,
    '{{SupportEmail}}': company.supportEmail,
    '{{CompanyFacebook}}': company.facebook,
    '{{CompanyTwitter}}': company.twitter,
    '{{CompanyInstagram}}': company.instagram,
    '{{CompanyYouTube}}': company.youtube,
    '{{CompanyLinkedIn}}': company.linkedin,
    '{{CompanyPrimaryColor}}': company.primaryColor || '#3F3FAA',
    '{{CompanySecondaryColor}}': company.secondaryColor || '#F1F1F1',
  };

  for (const [placeholder, value] of Object.entries(staticPlaceholders)) {
    templateContent = templateContent.replace(new RegExp(placeholder, 'g'), value || '');
  }

  return templateContent;
};

module.exports = { replacePlaceholders };