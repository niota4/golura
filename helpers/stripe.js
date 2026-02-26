const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Connect Express account for a user.
 * @param {Object} user - User object with at least email, firstName, lastName
 * @returns {Promise<Object>} Stripe account object
 */
async function createConnectAccount(user) {
  return await stripe.accounts.create({
    type: 'express',
    email: user.email,
    business_type: 'individual',
    individual: {
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
    },
    capabilities: {
      transfers: { requested: true },
    },
  });
}

/**
 * Create an onboarding link for a Stripe Connect account.
 * @param {string} accountId - The Stripe Connect account ID
 * @param {string} refreshUrl - URL to return to if onboarding is interrupted
 * @param {string} returnUrl - URL to return to after onboarding is complete
 * @returns {Promise<Object>} Stripe account link object
 */
async function createAccountLink(accountId, refreshUrl, returnUrl) {
  return await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
}

/**
 * Retrieve a Stripe Connect account by ID
 * @param {string} accountId
 * @returns {Promise<Object>} Stripe account object
 */
async function getConnectAccount(accountId) {
  return await stripe.accounts.retrieve(accountId);
}

/**
 * Create a SetupIntent for ACH payments to collect bank account details
 * @param {string} customerId - The Stripe customer ID
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Stripe SetupIntent object
 */
async function createACHSetupIntent(customerId, options = {}) {
  return await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['us_bank_account'],
    usage: 'off_session',
    ...options
  });
}

/**
 * Create a PaymentIntent for ACH payments
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {string} customerId - The Stripe customer ID
 * @param {string} paymentMethodId - The ACH payment method ID
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Stripe PaymentIntent object
 */
async function createACHPaymentIntent(amount, currency, customerId, paymentMethodId, options = {}) {
  const convertedAmount = Math.round(amount * 100); // Convert to cents
  
  return await stripe.paymentIntents.create({
    amount: convertedAmount,
    currency: currency.toLowerCase(),
    customer: customerId,
    payment_method: paymentMethodId,
    payment_method_types: ['us_bank_account'],
    confirmation_method: 'automatic',
    confirm: true,
    ...options
  });
}

/**
 * Create a Stripe customer for ACH payments
 * @param {Object} customerData - Customer information
 * @returns {Promise<Object>} Stripe customer object
 */
async function createACHCustomer(customerData) {
  return await stripe.customers.create({
    email: customerData.email,
    name: `${customerData.firstName} ${customerData.lastName}`,
    phone: customerData.phoneNumber,
    metadata: {
      clientId: customerData.clientId?.toString() || '',
      estimateId: customerData.estimateId?.toString() || '',
      invoiceId: customerData.invoiceId?.toString() || ''
    }
  });
}

/**
 * Verify a bank account using micro-deposits
 * @param {string} setupIntentId - The SetupIntent ID associated with the bank account
 * @param {Array} amounts - Array of two micro-deposit amounts in cents
 * @returns {Promise<Object>} Verification result
 */
async function verifyBankAccount(setupIntentId, amounts) {
  try {
    // For ACH bank account verification with SetupIntents, use the correct Stripe API
    const verification = await stripe.setupIntents.verifyMicrodeposits(
      setupIntentId,
      { amounts: amounts }
    );
    
    return verification;
  } catch (error) {
    console.error('Stripe micro-deposit verification error:', error);
    throw error;
  }
}

/**
 * Retrieve ACH payment method details
 * @param {string} paymentMethodId - The ACH payment method ID
 * @returns {Promise<Object>} Payment method object
 */
async function getACHPaymentMethod(paymentMethodId) {
  return await stripe.paymentMethods.retrieve(paymentMethodId);
}

/**
 * List all ACH payment methods for a customer
 * @param {string} customerId - The Stripe customer ID
 * @returns {Promise<Object>} List of payment methods
 */
async function listACHPaymentMethods(customerId) {
  return await stripe.paymentMethods.list({
    customer: customerId,
    type: 'us_bank_account'
  });
}

/**
 * Detach an ACH payment method from a customer
 * @param {string} paymentMethodId - The ACH payment method ID
 * @returns {Promise<Object>} Detached payment method
 */
async function detachACHPaymentMethod(paymentMethodId) {
  return await stripe.paymentMethods.detach(paymentMethodId);
}

/**
 * Get ACH payment status and details
 * @param {string} paymentIntentId - The Stripe payment intent ID
 * @returns {Promise<Object>} Payment intent with status
 */
async function getACHPaymentStatus(paymentIntentId) {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Create a mandate for ACH payments (for recurring payments)
 * @param {Object} mandateData - Mandate information
 * @returns {Promise<Object>} Stripe mandate object
 */
async function createACHMandate(mandateData) {
  return await stripe.mandates.create({
    payment_method: mandateData.paymentMethodId,
    customer_acceptance: {
      type: 'online',
      online: {
        ip_address: mandateData.ipAddress,
        user_agent: mandateData.userAgent
      }
    }
  });
}

/**
 * Calculate expected settlement date for ACH payments
 * @param {Date} paymentDate - The date when payment was initiated
 * @returns {Date} Expected settlement date (typically 3-5 business days)
 */
function calculateACHSettlementDate(paymentDate = new Date()) {
  const settlementDate = new Date(paymentDate);
  
  // Add 4 business days (typical ACH settlement time)
  let daysAdded = 0;
  while (daysAdded < 4) {
    settlementDate.setDate(settlementDate.getDate() + 1);
    const dayOfWeek = settlementDate.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  
  return settlementDate;
}

/**
 * Handle ACH webhook events
 * @param {Object} event - Stripe webhook event
 * @returns {Promise<void>}
 */
async function handleACHWebhook(event) {
  const { Payment } = require('../models');
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      if (event.data.object.payment_method_types.includes('us_bank_account')) {
        await Payment.update(
          { 
            status: 'succeeded',
            achStatus: 'succeeded'
          },
          { 
            where: { stripePaymentIntentId: event.data.object.id }
          }
        );
      }
      break;
      
    case 'payment_intent.payment_failed':
      if (event.data.object.payment_method_types.includes('us_bank_account')) {
        await Payment.update(
          { 
            status: 'failed',
            achStatus: 'failed',
            achFailureReason: event.data.object.last_payment_error?.message || 'Payment failed'
          },
          { 
            where: { stripePaymentIntentId: event.data.object.id }
          }
        );
      }
      break;
      
    case 'payment_intent.processing':
      if (event.data.object.payment_method_types.includes('us_bank_account')) {
        await Payment.update(
          { 
            status: 'processing',
            achStatus: 'processing'
          },
          { 
            where: { stripePaymentIntentId: event.data.object.id }
          }
        );
      }
      break;
  }
}

/**
 * Attach a payment method to a customer
 * @param {string} paymentMethodId - The payment method ID
 * @param {string} customerId - The Stripe customer ID
 * @returns {Promise<Object>} Attached payment method
 */
async function attachPaymentMethodToCustomer(paymentMethodId, customerId) {
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId
  });
}

/**
 * Create an ACH payment method on the backend
 * @param {Object} bankDetails - Bank account details
 * @param {Object} billingDetails - Billing information
 * @returns {Promise<Object>} Stripe payment method object
 */
async function createACHPaymentMethod(bankDetails, billingDetails) {
  return await stripe.paymentMethods.create({
    type: 'us_bank_account',
    us_bank_account: {
      routing_number: bankDetails.routingNumber,
      account_number: bankDetails.accountNumber,
      account_type: bankDetails.accountType,
      account_holder_type: 'individual'
    },
    billing_details: {
      name: billingDetails.name,
      email: billingDetails.email
    }
  });
}

module.exports = {
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
};