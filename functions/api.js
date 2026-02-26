const {
    Company,
} = require('../models');
const jwt = require('jsonwebtoken');

const { sendCompanyCreationEmail } = require('../helpers/emails');

const handleCompanyCreation = async (req, res) => {
    const { name, email, website, status } = req.body;
    console.log('Received company creation request:', { name, email, website, status });
    try {
        // Validate input
        if (!name || !email || !website || !status) {
            return res.status(400).json({ error: 'Name, email, website, and status are required.' }); }
        // Check if the website is valid
        const websiteRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-\.\/?%&=]*)?$/;
        if (!websiteRegex.test(website)) {
            return res.status(400).json({ error: 'Invalid website format.' });
        }

        // Find company by email or website
        let company = await Company.findOne({ where: { email } });
        if (!company) {
            company = await Company.findOne({ where: { website } });
        }
        if (company && company.isActive) {
            return res.status(400).json({ error: 'Company already exists and is active.' });
        };
        if (status === 'pending') {
            // Only create if not exists
            if (company) {
                return res.status(400).json({ error: 'Company already exists.' });
            }
            const newCompany = await Company.create({
                name,
                email,
                website,
                isActive: false
            });
            return res.status(201).json({ message: 'Company created as pending.', company: newCompany });
        } else if (status === 'accepted') {
            if (!company) {
                return res.status(404).json({ error: 'Company not found for acceptance.' });
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
            company.isActive = true; // Activate the company
            await company.save();
    
            // Send verification email
            await sendCompanyCreationEmail(company, securityToken, randomNumber);
            return res.status(200).json({ message: 'Company accepted and activated.', company });
        } else if (status === 'rejected') {
            if (!company) {
                return res.status(404).json({ error: 'Company not found for rejection.' });
            }
            
            company.isActive = false;
            await company.save();

            return res.status(200).json({ message: 'Company rejected and deactivated.', company });
        } else {
            return res.status(400).json({ error: 'Invalid status value.' });
        }
    } catch (error) {
        console.error('Error handling company creation:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = {
    handleCompanyCreation
};