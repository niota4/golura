'use-strict'

require('dotenv').config();

var express = require('express');
var compression = require('compression');
var router = express.Router();
var env = process.env;
const sequelize = require('./config/database'); // Correct Sequelize instance import
const initModels = require('./models/init-models'); // Import init-models.js directly
const models = initModels(sequelize); // Initialize models

// Make models available globally to avoid circular dependency issues  
global.models = models;

// Install global multi-tenant hooks
const GlobalCompanyHooks = require('./helpers/companyHooks');
GlobalCompanyHooks.install(sequelize);

const cors = require('cors');
const https = require('https');
const context = require('./context');

const { socketConnection } = require('./sockets.js');
const { scheduleJobs } = require('./functions/scheduler');
const { bulkReindexAll } = require('./helpers/meili'); // <-- implement this function to do the actual reindex

var app = express();

// Import advanced security controls
const {
    ddosProtection,
    advancedRateLimit,
    slowDown,
    sqlInjectionProtection,
    xssProtection,
    csrfProtection: advancedCSRF,
    fileUploadSecurity,
    securityHeaders: advancedSecurityHeaders,
    sanitizeInput
} = require('./helpers/security');

// Import error handling and monitoring
const { initialize: initializeErrorHandler, logError } = require('./helpers/errorHandler');
const { createMonitoringMiddleware, createDatabaseMonitoringHook } = require('./helpers/monitoring');

app.set('port', (env.PORT));

// Configure trust proxy appropriately for environment
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Trust first proxy in production
} else {
    app.set('trust proxy', false); // Don't trust proxy in development
}

// Apply advanced security headers (replaces basic security headers)
// app.use(advancedSecurityHeaders()); // Temporarily disabled for debugging

// Initialize error handling
initializeErrorHandler(app);

// Add monitoring middleware
app.use(createMonitoringMiddleware());

// DDoS Protection (first line of defense)
// app.use(ddosProtection()); // Temporarily disabled for debugging

// Gradual slow down for high request volumes
// app.use(slowDown()); // Temporarily disabled for debugging

// SQL Injection Protection
// app.use(sqlInjectionProtection()); // Temporarily disabled for debugging

// XSS Protection
// app.use(xssProtection()); // Temporarily disabled for debugging

// Apply enhanced rate limiting
// app.use('/users/user/login', advancedRateLimit('strict')); // Temporarily disabled for debugging
// app.use('/users/user/password/reset', advancedRateLimit('strict')); // Temporarily disabled for debugging
// app.use('/users/user/register', advancedRateLimit('strict')); // Temporarily disabled for debugging
// app.use('/api/payments', advancedRateLimit('payment')); // Temporarily disabled for debugging
// app.use('/api/upload', advancedRateLimit('upload')); // Temporarily disabled for debugging
// app.use('/api/search', advancedRateLimit('search')); // Temporarily disabled for debugging
// app.use('/api/', advancedRateLimit('standard')); // Temporarily disabled for debugging

// Apply input sanitization
// app.use(sanitizeInput); // Temporarily disabled for debugging

// Apply advanced CSRF protection
// app.use(advancedCSRF); // Temporarily disabled for debugging

// File upload security
// app.use(fileUploadSecurity()); // Temporarily disabled for debugging

// Security headers middleware to prevent 3rd party cookies and enhance security
app.use((req, res, next) => {
    // Prevent 3rd party cookies and tracking
    res.setHeader('Set-Cookie', '');
    
    // Content Security Policy to allow images from any source but keep other resources secure
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://kit.fontawesome.com https://maps.googleapis.com https://js.stripe.com; " +
        "style-src 'self' 'unsafe-inline' https://kit.fontawesome.com https://ka-p.fontawesome.com https://fonts.googleapis.com; " +
        "img-src * data: blob:; " +
        "font-src 'self' data: https://kit.fontawesome.com https://ka-p.fontawesome.com https://fonts.gstatic.com; " +
        "connect-src 'self' wss: ws: https://maps.googleapis.com https://cdn.jsdelivr.net https://api.stripe.com; " +
        "media-src * data: blob:; " +
        "object-src 'none'; " +
        "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://m.stripe.com https://q.stripe.com; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none';"
    );
    
    // Additional security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), ' +
        'accelerometer=(), gyroscope=(), magnetometer=(), midi=(), sync-xhr=()'
    );
    
    // Prevent DNS prefetching to external domains
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    
    next();
});

app.use(cors({
    origin: function(origin, callback) {
        // Build allowed origins list
        const allowedOrigins = [];
        // Always allow your production domain
        if (process.env.DOMAIN_URL) {
            allowedOrigins.push(process.env.DOMAIN_URL);
        }
        if (process.env.DEV_DOMAIN_URL) {
            allowedOrigins.push(process.env.DEV_DOMAIN_URL);
        }
        // Allow the configured production frontend origin
        if (process.env.PRODUCTION_URL) {
            allowedOrigins.push(process.env.PRODUCTION_URL);
        }
        // In development, be more permissive
        if (process.env.NODE_ENV !== 'production') {
            // Allow localhost with various ports
            allowedOrigins.push('http://localhost:6250');
            allowedOrigins.push('https://localhost:6250');
            allowedOrigins.push('http://localhost:6500');
            allowedOrigins.push('https://localhost:6500');
            allowedOrigins.push('http://127.0.0.1:6250');
            allowedOrigins.push('https://127.0.0.1:6250');
            allowedOrigins.push('http://127.0.0.1:6500');
            allowedOrigins.push('https://127.0.0.1:6500');
            // Allow local network IPs (for mobile testing)
            if (origin && (origin.includes('192.168.') || origin.includes('10.') || origin.includes('172.'))) {
                const originUrl = new URL(origin);
                if (['6250', '6500', '3000'].includes(originUrl.port)) {
                    allowedOrigins.push(origin);
                }
            }
        }
        
        // No origin means same-origin request (e.g., from server-side rendered pages or React Native)
        if (!origin) {
            return callback(null, true);
        }
        
        // React Native and mobile apps often have different origin patterns
        // Allow requests from mobile apps (React Native doesn't always send proper origin)
        if (origin.includes('exp://') || origin.includes('exps://') || 
            origin.includes('exp.host') || origin.includes('expo.dev') ||
            origin.startsWith('capacitor://') || origin.startsWith('ionic://') ||
            origin.includes('localhost') || origin.includes('127.0.0.1') ||
            origin.includes('192.168.') || origin.includes('10.') || origin.includes('172.')) {
            return callback(null, true);
        }
        
        // Check if origin is allowed
        if (allowedOrigins.includes(origin) || 
            (process.env.NODE_ENV !== 'production' && origin.includes('golura.net'))) {
            callback(null, true);
        } else {
            // Log rejected origins for debugging
            console.log('CORS rejected origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow credentials but only from allowed origins
    optionsSuccessStatus: 200
}));
app.use(compression());
app.use(express.json({ limit: '500mb' }));

app.use(function (req, res, next) {
    var replaceErrors = function (key, value) {
        if (value instanceof Error) {
            var error = {};

            Object.getOwnPropertyNames(value).forEach(function (key) {
                error[key] = value[key];
            });

            return error;
        }

        return value;
    };

    res.convertErrorToJSON = (error) => {
        console.log(error);

        return JSON.stringify(error, replaceErrors);
    };

    next();
});
app.use('/scripts', express.static(__dirname + '/node_modules/'));

require('./routes')(app);
app.use('/api', router);
app.use('/', express.static(__dirname + '/public', { extensions: ['html'] }));

// Ensure unmatched routes middleware is placed after all other routes
app.use((req, res, next) => {
    // Check if it's a request for a static file that doesn't exist
    if (req.path.includes('.')) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'The requested resource could not be found.'
        });
    }
    
    // For non-API routes without file extensions, serve the SPA
    if (!req.path.startsWith('/api')) {
        return res.sendFile('public/index.html', { root: __dirname });
    }
    
    // For API routes that don't match, return 404
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource could not be found.'
    });
});

// Apply advanced security headers
app.use((req, res, next) => {
    if (!req.path.match(/\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|otf|map)$/)) {
        advancedSecurityHeaders()(req, res, next);
    } else {
        next();
    }
});

// DDoS Protection
app.use((req, res, next) => {
    if (!req.path.match(/\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|otf|map)$/)) {
        ddosProtection()(req, res, next);
    } else {
        next();
    }
});

// Gradual slow down for high request volumes
app.use((req, res, next) => {
    if (!req.path.match(/\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|otf|map)$/)) {
        slowDown()(req, res, next);
    } else {
        next();
    }
});

// SQL Injection Protection
app.use((req, res, next) => {
    if (!req.path.match(/\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|otf|map)$/)) {
        sqlInjectionProtection()(req, res, next);
    } else {
        next();
    }
});

// XSS Protection
app.use((req, res, next) => {
    if (!req.path.match(/\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|otf|map)$/)) {
        xssProtection()(req, res, next);
    } else {
        next();
    }
});

// Apply input sanitization
app.use((req, res, next) => {
    if (!req.path.match(/\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|otf|map)$/)) {
        sanitizeInput(req, res, next);
    } else {
        next();
    }
});

// Apply advanced CSRF protection
app.use((req, res, next) => {
    if (!req.path.match(/\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|otf|map)$/)) {
        advancedCSRF(req, res, next);
    } else {
        next();
    }
});

// File upload security
app.use((req, res, next) => {
    if (!req.path.match(/\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|otf|map)$/)) {
        fileUploadSecurity()(req, res, next);
    } else {
        next();
    }
});

sequelize.authenticate() 
    .then(async function () {
        // Add database monitoring hooks
        const dbHooks = createDatabaseMonitoringHook();
        sequelize.addHook('beforeQuery', dbHooks.beforeQuery);
        sequelize.addHook('afterQuery', dbHooks.afterQuery);
        sequelize.addHook('afterCreate', 'logQuery', dbHooks.afterQuery);
        sequelize.addHook('afterUpdate', 'logQuery', dbHooks.afterQuery);
        sequelize.addHook('afterDestroy', 'logQuery', dbHooks.afterQuery);
        
        const server = app.listen(app.get('port'), function () {
            scheduleJobs();
        
            console.log('🚀 GoLura server running on port', app.get('port'));
            console.log('📊 Monitoring and error handling initialized');
        });
        socketConnection(server);
    })
    .catch(err => {
        logError(err, {
            context: 'Database Sync',
            critical: true
        });
        console.error('Error syncing database:', err);
    });

module.exports = app;
