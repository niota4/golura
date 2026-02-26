const { SubscriptionPlan, CompanySubscription } = require('../models');

const get = async (req, res) => {
    try {
        const companyId = req.companyId;
        const subscription = await CompanySubscription.findOne({
            where: { companyId },
            include: [
                {
                    model: SubscriptionPlan,
                    as: 'SubscriptionPlan',
                },
            ],
        });

        if (!subscription) {
            return res.status(404).json({
                err: true,
                msg: 'No active subscription found for this company.',
            });
        }

        res.status(200).json({
            err: false,
            msg: 'Subscription retrieved successfully.',
            subscription,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message,
        });
    }
};

const getUsage = async (req, res) => {
    try {
        const companyId = req.companyId;

        const subscription = await CompanySubscription.findOne({
            where: { companyId },
            include: [
                {
                    model: SubscriptionPlan,
                    as: 'SubscriptionPlan',
                },
            ],
        });

        if (!subscription) {
            return res.status(404).json({
                err: true,
                msg: 'No active subscription found for this company.',
            });
        }

        const usage = {
            limits: subscription.SubscriptionPlan.limits,
            currentUsage: subscription.metadata?.usage || {},
        };

        res.status(200).json({
            err: false,
            msg: 'Usage data retrieved successfully.',
            data: usage,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message,
        });
    }
};
const list = async (req, res) => {
    try {
        const subscriptions = await SubscriptionPlan.findAll();

        res.status(200).json({
            err: false,
            msg: 'Subscriptions retrieved successfully.',
            subscriptions,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message,
        });
    }
};
module.exports = {
    get,
    getUsage,
    list
};