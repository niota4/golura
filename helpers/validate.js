const env = process.env;
const jwt = require("jsonwebtoken");
const {
    Company,
    User,
    Role,
    Permission,
    Page,
    BlacklistedToken,
} = require('../models');
const socket = require('../sockets');
const sanitizeHtml = require('sanitize-html');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mime = require('mime-types');
const { Op } = require('sequelize');
const { sendVericationEmail, login } = require('../functions/users');
const { sendVerificationEmail } = require('../functions/admin');
const { error } = require("fancy-log");
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { web } = require("webpack");

const authenticate = async (req, res, next) => {
    var token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
    if (!token) {
        return res.status(401).json({
            err: true,
            msg: 'Unauthorized',
            unauthorized: true
        });
    }

    try {
        // Check if token is blacklisted
        const blacklistedToken = await BlacklistedToken.findOne({
            where: { token: token }
        });
        
        if (blacklistedToken) {
            return res.status(401).json({
                err: true,
                msg: 'Token has been revoked',
                unauthorized: true
            });
        }

        // Verify token with enhanced validation
        const decoded = jwt.verify(token, env.JWT_ACCESS_TOKEN, {
            issuer: 'golura-app',
            audience: 'golura-users'
        });

        // Additional security checks
        if (!decoded.userId || !decoded.companyId) {
            return res.status(401).json({
                err: true,
                msg: 'Invalid token structure',
                unauthorized: true
            });
        }
        // Check if user still exists and is active in the correct company
        const user = await User.findOne({
            where: { 
                id: decoded.userId, 
                companyId: decoded.companyId,
                isActive: true 
            }
        });
        if (!user) {
            return res.status(401).json({
                err: true,
                msg: 'User not found or inactive',
                unauthorized: true
            });
        }

        req.userId = decoded.userId;
        req.companyId = decoded.companyId;
        res.companyId = decoded.companyId;

        // Set request context for global company hooks
        const sequelize = require('../config/database');
        sequelize.setRequestContext({ companyId: decoded.companyId });

        next();
    } catch (err) {
        return res.status(401).json({
            err: true,
            msg: 'Invalid token',
            unauthorized: true
        });
    }
};
const aiAuthenticate = async (req, res, next) => {
    const company = await Company.findByPk(res.companyId);
    if (!company) {
        return res.status(500).json({
            err: true,
            msg: 'Company not found'
        });
    }
    if (!company.goEsti) {
        return res.status(403).json({
            err: true,
            msg: 'AI features are not enabled for this company'
        });
    }
    next();
};
const checkPermission = (pageName, action) => async (req, res, next) => {
    const userId = req.userId;
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({
            err: true,
            msg: 'Unauthorized',
            unauthorized: true
        });
    }

    jwt.verify(token, env.JWT_ACCESS_TOKEN, async function(err, decoded) {
        if (err) {
            return res.status(401).json({
                err: true,
                msg: 'Invalid token',
                unauthorized: true
            });
        }

        if (decoded.userId && decoded.userId === req.body.id && pageName === 'users' && action === 'view') {
            return next();
        }

        const user = await User.findByPk(
            userId, {
                include: [{
                        model: Role,
                        as: 'Role',
                        include: [{
                            model: Permission,
                            as: 'Permissions',
                            include: [{
                                model: Page,
                                as: 'Page',
                            }]
                        }]
                    },
                    {
                        model: Permission,
                        as: 'Permissions',
                        include: [{
                            model: Page,
                            as: 'Page',
                        }]
                    }
                ]
            }
        );

        if (!user) {
            return res.status(403).json({
                err: true,
                msg: 'User not found'
            });
        }

        const checkPermissions = (permissions, action, pageName) => {
            if (Array.isArray(pageName)) {
                return permissions.some(
                    permission => permission.action === action && pageName.includes(permission.Page.name)
                );
            } else {
                return permissions.some(
                    permission => permission.action === action && permission.Page.name === pageName
                );
            }
        };

        const hasUserPermission = checkPermissions(user.Permissions, action, pageName);
        const hasRolePermission = checkPermissions(user.Role.Permissions, action, pageName);

        if (hasUserPermission || hasRolePermission) {
            next();
        } else {
            // Emit a socket event if the user does not have permission
            socket.sendToSpecific(userId, 'permissionDenied', {
                err: true,
                msg: 'You do not have permission to do this'
            });
            return res.status(403).json({
                err: true,
                msg: 'You do not have permission to do this'
            });
        }
    });
};
const checkSubPermission = (pageName, subAction) => async (req, res, next) => {
    const userId = req.userId;
    const user = await User.findByPk(
        userId, {
            include: [{
                    model: Role,
                    as: 'Role',
                    include: [{
                        model: Permission,
                        as: 'Permissions',
                        include: [{
                            model: Page,
                            as: 'Page',
                        }]
                    }]
                },
                {
                    model: Permission,
                    as: 'Permissions',
                    include: [{
                        model: Page,
                        as: 'Page',
                    }]
                }
            ]
        }
    );

    if (!user) {
        return res.status(403).json({
            err: true,
            msg: 'User not found'
        });
    }
    const checkPermissions = (permissions, subAction, pageName) => {
        if (Array.isArray(pageName)) {
            return permissions.some(
                permission => permission.subAction === subAction && pageName.includes(permission.Page.name)
            );
        } else {
            return permissions.some(
                permission => permission.subAction === subAction && permission.Page.name === pageName
            );
        }
    };
    const hasUserPermission = checkPermissions(user.Permissions, subAction, pageName);
    const hasRolePermission = checkPermissions(user.Role.Permissions, subAction, pageName);

    if (hasUserPermission || hasRolePermission) {
        next();
    } else {
        // Emit a socket event if the user does not have permission
        socket.sendToSpecific(userId, 'permissionDenied', {
            err: true,
            msg: 'You do not have permission to do this'
        });
        return res.status(403).json({
            err: true,
            msg: 'You do not have permission to do this'
        });
    }
};
const removeBlacklistTokens = async () => {
    const blacklistTokens = await BlacklistedToken.findAll({
        where: {
            expiresAt: {
                [Op.lt]: new Date()
            }
        }
    });

    for (const token of blacklistTokens) {
        await token.destroy();
    }
};
const validateGolura = (req, res, next) => {
    // Check API key in Authorization or X-API-Key header
    const envKey = process.env.GOLURA_API_KEY;
    const authHeader = req.headers['authorization'] || '';
    const apiKeyHeader = req.headers['x-api-key'] || '';

    let incomingKey = '';
    if (authHeader.startsWith('Bearer ')) {
        incomingKey = authHeader.replace('Bearer ', '').trim();
    } else if (apiKeyHeader) {
        incomingKey = apiKeyHeader.trim();
    }

    if (!envKey || incomingKey !== envKey) {
        return res.status(403).json({
            err: true,
            msg: 'Forbidden: Invalid API key'
        });
    }
    next();
};
const validateEmail = (req, res, next) => {
    const {
        email
    } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailRegex.test(email)) {
        // Check if the email domain has a valid MX record
        const domain = email.split('@')[1];
        require('dns').resolveMx(domain, (err, addresses) => {
            if (err || addresses.length === 0) {
                res.status(400).json({
                    err: true,
                    msg: 'Invalid email domain'
                });
            } else {
                next();
            }
        });
    } else {
        res.status(400).json({
            err: true,
            msg: 'Wrong email format'
        });
    }
};
const validateUser = (req, res, next) => {
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({
            err: true,
            msg: 'Unauthorized',
            unauthorized: true
        });
    }

    jwt.verify(token, env.JWT_ACCESS_TOKEN, async function(err, decoded) {
        if (err) {
            
            return res.status(401).json({
                err: true,
                msg: 'Invalid token',
                unauthorized: true
            });
        }
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(403).json({
                err: true,
                msg: 'User not found'
            });
        }
        if (user.id !== req.body.id) {
            return res.status(403).json({
                err: true,
                msg: 'You do not have permission to do this'
            });
        }
        next();
    });
};
const validateCompany = (req, res, next) => {
    const { securityToken } = req.body;

    if (!securityToken) {
        return res.status(400).json({
            err: true,
            msg: 'Security token is required'
        });
    }
    Company.findOne({
        where: {
            securityToken: securityToken
        }
    }).then(company => {
        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }
        req.company = company;
        next();
    }).catch(err => {
        console.error('Error validating company:', err);
        return res.status(500).json({
            err: true,
            msg: 'Internal server error while validating company'
        });
    });
}
const validatePassword = (req, res, next) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({
            err: true,
            msg: 'Password is required'
        });
    }
    
    // Enhanced password validation
    const errors = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
        errors.push('Password must be less than 128 characters');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        errors.push('Password contains common weak patterns');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            err: true,
            msg: 'Password does not meet security requirements',
            details: errors
        });
    }
    
    next();
};
function validateText(comment) {
    if (typeof comment !== 'string') return { isValid: true, comment }; // Safeguard for undefined/null
    const regex = /\[\[{"value":"(.*?)","prefix":"#"}\]\]/;
    const match = comment.match(regex);

    if (!match) return { isValid: true, comment }; // No special tag, proceed as usual

    const [_, value] = match;
    const [modelName, modelId] = value.split(' ');

    // Validate model name and numeric ID
    const allowedModels = ['Event', 'Estimate', 'Work Order', 'Client', 'Invoice', 'User'];
    if (
        !modelName ||
        !allowedModels.some(model => model.toLowerCase() === modelName.toLowerCase()) || // Case insensitive
        !modelId ||
        isNaN(modelId)
    ) {
        return {
            isValid: false,
            msg: `<b>Invalid comment format.</b> Heres an example of accepted format: <span>#Event 1234.</span>`,
        };
    }

    const formattedModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1).toLowerCase(); // Capitalize first letter
    const reformatTag = `[[{"id":"${modelId.trim()}","value":"${value}","display":"${formattedModelName} #${modelId.trim()}","prefix":"#"}]]`;

    return {
        isValid: true,
        comment: comment.replace(match[0], reformatTag), // Replace the tag with the reformatted tag
    };
};
const validateFile = async (req, res, next) => {

    const file = req.file;

    const mimeType = mime.lookup(file.path);

    if (mimeType === 'text/html') {
        // Read and sanitize HTML
        const htmlContent = fs.readFileSync(file.path, 'utf8');
        const cleanHtml = sanitizeHtml(htmlContent, {
            allowedTags: sanitizeHtml.defaults.allowedTags,
            allowedAttributes: sanitizeHtml.defaults.allowedAttributes
        });

        return { valid: true, sanitized: cleanHtml };
    } 
    else if (mimeType === 'application/pdf') {
        // Validate PDF by extracting text
        const fileBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(fileBuffer);
        next();
    } 
    else {
        return res.status(401).json({
            err: true,
            msg: 'Invalid file type'
        });
    }
};
const validateCompanySecurityToken = async (req, res) => {
    const {id, securityToken, activationCode} = req.body;

    if (!securityToken || !id || !activationCode) {
        return res.status(401).json({
            err: true,
            msg: 'No security token provided'
        });
    }

    const company = await Company.findByPk(
        id, {
            where: {
                securityToken: securityToken
            }
        }
    );
    if (!company) {
        return res.status(404).json({
            err: true,
            msg: 'Company not found'
        });
    }
    try {
        jwt.verify(company.securityToken, env.JWT_ACCESS_TOKEN, async function(err, decoded) {
            if (err) {
                req.body.expired = true;
                await sendVerificationEmail(req, res);
                return res.status(201).json({
                    err: true,
                    msg: 'Verification token expired, we have sent you a new one through email'
                });
            }

            if (decoded.randomNumber !== activationCode) {
                return res.status(201).json({
                    err: true,
                    msg: 'Invalid security token'
                });
            }

            return res.status(200).json({
                err: false,
                msg: 'Company validated successfully',
                company: {
                    id: company.id,
                    name: company.name,
                    website: company.website,
                    email: company.email,
                    isActive: company.isActive,
                    createdAt: company.createdAt,
                    updatedAt: company.updatedAt
                }
            });
        });
    } catch (error) {
        console.error('Unexpected error in validateCompanySecurityToken:', error);
        return res.status(500).json({
            err: true,
            msg: 'Internal server error'
        });
    }
};
const validateSecurityToken = async (req, res) => {
    var token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({
            err: true,
            msg: 'No security token provided'
        });
    }
    const user = await User.findByPk(
        req.body.id, {
            where: {
                securityToken: token
            }
        }
    );
    if (!user) {
        return res.status(401).json({
            err: true,
            msg: 'User not found'
        });
    }
    jwt.verify(user.securityToken, env.JWT_ACCESS_TOKEN,  async function(err, decoded) {
        if (err) {
            req.body.expired = true;
            await sendVericationEmail(req, res);

            return res.status(201).json({
                err: true,
                msg: 'Verification token expired we have sent you a new one through email'
            });
        }
        if (decoded.randomNumber !== req.body.securityToken) {

            return res.status(201).json({
                err: true,
                msg: 'Invalid security token'
            });
        }    
        const token = jwt.sign({
                userId: user.id
            },
            env.JWT_ACCESS_TOKEN, {
                expiresIn: '5d'
            }
        );
        await User.update(
            {
                securityToken: token,
                isActive: true
            }, {
                where: {
                    id: req.body.id
                }
            }
        );
        const { password, ...userWithoutPassword } = user.toJSON();

        res.json({
            err: false,
            msg: 'User validated successfully',
            user: userWithoutPassword,
            token: token
        });

    });
}; 
const validateUrl = async (req, res) => {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    const { url } = req.body;

    if (!urlRegex.test(url)) {
        return res.status(201).json({
            err: true,
        });
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; URLValidator/1.0)',
            },
            timeout: 5000, // Prevent long-running requests
        });

        if (!response.ok) {
            return res.status(201).json({
                err: true,
                msg: 'Failed to fetch URL',
            });
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/html')) {
            return res.status(400).json({
                err: true,
                msg: 'URL does not return valid HTML content',
            });
        }

        const html = await response.text();
        const dom = new JSDOM(html, { runScripts: 'outside-only' }); // Prevent JavaScript execution
        const doc = dom.window.document;

        const metadata = {
            title: doc.querySelector("meta[property='og:title']")?.getAttribute("content") || doc.querySelector("title")?.textContent || url,
            description: doc.querySelector("meta[property='og:description']")?.getAttribute("content") || doc.querySelector("meta[name='description']")?.getAttribute("content") || '',
            image: doc.querySelector("meta[property='og:image']")?.getAttribute("content") || '',
            favicon: doc.querySelector("link[rel='icon']")?.getAttribute("href") || doc.querySelector("link[rel='shortcut icon']")?.getAttribute("href") || '',
            url: url,
        };

        // Ensure metadata is sanitized
        if (!metadata.title || typeof metadata.title !== 'string') {
            metadata.title = 'Untitled';
        }
        if (!metadata.description || typeof metadata.description !== 'string') {
            metadata.description = '';
        }
        if (!metadata.image || typeof metadata.image !== 'string') {
            metadata.image = ''; // Default to empty if no image found
        } else if (!/^https?:\/\//i.test(metadata.image)) {
            // Ensure image URL is absolute
            metadata.image = new URL(metadata.image, url).href;
        }
        if (!metadata.favicon || typeof metadata.favicon !== 'string') {
            metadata.favicon = ''; // Default to empty if no favicon found
        } else if (!/^https?:\/\//i.test(metadata.favicon)) {
            // Ensure favicon URL is absolute
            metadata.favicon = new URL(metadata.favicon, url).href;
        }
        


        return res.status(200).json({
            err: false,
            metadata,
        });
    } catch (error) {
        console.error('Error validating URL:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to validate URL',
        });
    }
};

module.exports = {
    authenticate,
    aiAuthenticate,
    checkPermission,
    checkSubPermission,
    removeBlacklistTokens,
    validateGolura,
    validateUser,
    validateCompany,
    validateEmail,
    validatePassword,
    validateText,
    validateFile,
    validateCompanySecurityToken,
    validateSecurityToken,
    validateUrl
};