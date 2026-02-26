const { Page, CompanySubscription, SubscriptionPlan } = require('../models');
const { Op } = require('sequelize');

const getPages = async (req, res) => {
    try {
        const companyId = res.companyId;
        
        // Get user's subscription with features
        const subscription = await CompanySubscription.findOne({
            where: { companyId },
            include: [
                {
                    model: SubscriptionPlan,
                    as: 'SubscriptionPlan',
                },
            ],
        });

        let whereClause = {};

        // Dynamically filter by pageAccess if present
        let pageAccess = [];
        if (subscription && Array.isArray(subscription.pageAccess) && subscription.pageAccess.length > 0) {
            pageAccess = subscription.pageAccess;
            whereClause = {
                name: { [Op.in]: pageAccess }
            };
        }

        const pages = await Page.findAll({ 
            where: whereClause,
            order: [['order', 'ASC'], ['name', 'ASC']]
        });

        res.status(201).json({
            err: false,
            msg: 'Pages successfully retrieved',
            pages: pages
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message 
        });
    }
};

module.exports = {
    getPages,
}