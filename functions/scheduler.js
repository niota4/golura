const schedule = require('node-schedule');
const { removeStripeIncompleteTransactions } = require('./payments');
const { calculateWorkOrderPriorities } = require('./workOrders');
const { checkandSendFollowUpNotifications } = require('./estimates');
const { expirePast } = require('./events');
const { removeBlacklistTokens } = require('../helpers/validate');
const { checkAndSendReminders } = require('../helpers/reminders');
const { performCalendarSync } = require('../helpers/calendar');
const { processPayrolls } = require('./payrolls');
const { Company } = require('../models');
const sequelize = require('../models').sequelize;

// Schedule the job to run at midnight every day
function scheduleJobs() {
    // Schedule the job to run at midnight every day
    schedule.scheduleJob('0 0 * * *', function() {
        removeStripeIncompleteTransactions();
        calculateWorkOrderPriorities();
        checkandSendFollowUpNotifications();
        expirePast();
    });

    // Schedule the job to run every week at midnight on Sunday
    schedule.scheduleJob('0 0 * * 0', function() {
        removeBlacklistTokens();
    });

    // Schedule the job to run every minute to check for reminders
    schedule.scheduleJob('* * * * *', function() {
        checkAndSendReminders();
    });

    // Schedule calendar sync to run every 2 hours
    schedule.scheduleJob('0 */2 * * *', function() {
        performCalendarSync()
            .then(result => {
                if (result.userCount > 0) {
                    console.log(`Processed ${result.userCount} users with ${result.totalEvents || 0} total events`);
                }
            })
            .catch(error => {
                console.error('Calendar sync failed:', error.message);
            });
    });

    // Schedule payroll processing for every company at midnight every day
    schedule.scheduleJob('0 0 * * *', async function() {
        try {
            const companies = await Company.findAll({ where: { autoGeneratePayroll: true }, attributes: ['id'] });
            for (const company of companies) {
                try {
                    sequelize.setRequestContext({ companyId: company.id });
                    await processPayrolls();
                    console.log(`Processed payrolls for company ${company.id}`);
                } catch (err) {
                    console.error(`Error processing payrolls for company ${company.id}:`, err.message);
                }
            }
        } catch (err) {
            console.error('Error fetching companies for payroll processing:', err.message);
        }
    });
}

module.exports = {
    scheduleJobs
};
