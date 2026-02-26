/**
 * Advanced Security Middleware for GoLura Platform
 * Implements OWASP Top 10 security controls and enterprise-grade protection
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const validator = require('validator');
const crypto = require('crypto');
const xss = require('xss');
const { logError } = require('./errorHandler');

class SecurityManager {
    constructor() {
        this.suspiciousIPs = new Map(); // Track suspicious behavior
        this.blockedIPs = new Set(); // Temporarily blocked IPs
        this.rateLimitStore = new Map(); // In-memory store for rate limiting
        this.securityEvents = []; // Security event log
        this.initializeSecurityConfig();
    };
    initializeSecurityConfig() {
        this.config = {
            // DDoS Protection thresholds
            ddos: {
                maxRequestsPerSecond: 50,
                maxRequestsPerMinute: 300,
                maxRequestsPerHour: 5000,
                blockDurationMinutes: 15,
                suspiciousThreshold: 100 // requests per minute to flag as suspicious
            },
            
            // Rate limiting configurations
            rateLimits: {
                strict: { windowMs: 15 * 60 * 1000, max: 5 }, // Authentication endpoints
                standard: { windowMs: 15 * 60 * 1000, max: 1000 }, // General API
                upload: { windowMs: 60 * 60 * 1000, max: 50 }, // File uploads
                search: { windowMs: 60 * 1000, max: 100 }, // Search endpoints
                payment: { windowMs: 60 * 60 * 1000, max: 10 } // Payment processing
            },
            
            // Security headers
            headers: {
                contentSecurityPolicy: this.buildCSP(),
                hsts: {
                    maxAge: 31536000,
                    includeSubDomains: true,
                    preload: true
                },
                frameguard: { action: 'deny' },
                noSniff: true,
                referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
            }
        };
    };
    buildCSP() {
        const isDev = process.env.NODE_ENV !== 'production';
        
        return {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'", // Allow inline scripts for development
                    "'unsafe-eval'", // Allow eval for development
                    'https://kit.fontawesome.com',
                    'https://maps.googleapis.com',
                    'https://js.stripe.com',
                    'https://www.google.com',
                    'https://www.gstatic.com'
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'", // Often needed for dynamic styles
                    'https://kit.fontawesome.com',
                    'https://ka-p.fontawesome.com',
                    'https://fonts.googleapis.com'
                ],
                imgSrc: [
                    "'self'",
                    'data:',
                    'blob:',
                    'https://res.cloudinary.com',
                    'https://maps.googleapis.com',
                    'https://maps.gstatic.com',
                    'https://*.stripe.com'
                ],
                fontSrc: [
                    "'self'",
                    'data:',
                    'https://kit.fontawesome.com',
                    'https://ka-p.fontawesome.com',
                    'https://fonts.gstatic.com'
                ],
                connectSrc: [
                    "'self'",
                    'wss:',
                    'ws:',
                    'https://maps.googleapis.com',
                    'https://api.stripe.com',
                    'https://cdn.jsdelivr.net',
                    ...(isDev ? ['http://localhost:*', 'https://localhost:*'] : [])
                ],
                mediaSrc: ["'self'", 'blob:'],
                objectSrc: ["'none'"],
                frameSrc: [
                    "'self'",
                    'https://js.stripe.com',
                    'https://hooks.stripe.com',
                    'https://m.stripe.com',
                    'https://q.stripe.com'
                ],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                frameAncestors: ["'none'"],
                upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
            }
        };
    };
    createDDoSProtection() {
        return (req, res, next) => {
            // Skip DDoS protection for static assets
            if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$/i) ||
                req.url.startsWith('/scripts/') || 
                req.url.startsWith('/dist/') || 
                req.url.startsWith('/public/') ||
                req.url.startsWith('/assets/') ||
                req.url.startsWith('/health')) {
                return next();
            }
            
            const ip = this.getClientIP(req);
            const now = Date.now();
            
            // Check if IP is blocked
            if (this.blockedIPs.has(ip)) {
                this.logSecurityEvent('blocked_ip_request', { ip, url: req.url });
                return res.status(429).json({
                    error: 'IP temporarily blocked due to suspicious activity',
                    retryAfter: this.config.ddos.blockDurationMinutes * 60
                });
            }

            // Initialize tracking for new IPs
            if (!this.rateLimitStore.has(ip)) {
                this.rateLimitStore.set(ip, {
                    requests: [],
                    firstRequest: now,
                    totalRequests: 0
                });
            }

            const ipData = this.rateLimitStore.get(ip);
            
            // Clean old requests (older than 1 hour)
            ipData.requests = ipData.requests.filter(time => now - time < 60 * 60 * 1000);
            
            // Add current request
            ipData.requests.push(now);
            ipData.totalRequests++;

            // Check various time windows
            const lastSecond = ipData.requests.filter(time => now - time < 1000).length;
            const lastMinute = ipData.requests.filter(time => now - time < 60 * 1000).length;
            const lastHour = ipData.requests.filter(time => now - time < 60 * 60 * 1000).length;

            // DDoS detection
            if (lastSecond > this.config.ddos.maxRequestsPerSecond) {
                this.handleSuspiciousActivity(ip, 'excessive_requests_per_second', { lastSecond });
                return res.status(429).json({ error: 'Request rate too high' });
            }

            if (lastMinute > this.config.ddos.maxRequestsPerMinute) {
                this.handleSuspiciousActivity(ip, 'excessive_requests_per_minute', { lastMinute });
                return res.status(429).json({ error: 'Request rate too high' });
            }

            if (lastHour > this.config.ddos.maxRequestsPerHour) {
                this.blockIP(ip, 'excessive_requests_per_hour');
                return res.status(429).json({ error: 'IP blocked due to excessive requests' });
            }

            // Flag suspicious activity
            if (lastMinute > this.config.ddos.suspiciousThreshold) {
                this.flagSuspiciousIP(ip, lastMinute);
            }

            next();
        };
    };
    createAdvancedRateLimit(type = 'standard') {
        const config = this.config.rateLimits[type] || this.config.rateLimits.standard;
        
        return rateLimit({
            windowMs: config.windowMs,
            max: config.max,
            message: {
                error: 'Rate limit exceeded',
                type: type,
                retryAfter: Math.ceil(config.windowMs / 1000)
            },
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: (req) => this.getClientIP(req),
            skip: (req) => {
                // Skip rate limiting for health checks
                if (req.url.startsWith('/health')) {
                    return true;
                }
                
                // Skip rate limiting for static assets
                if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$/i)) {
                    return true;
                }
                
                // Skip rate limiting for common static paths
                if (req.url.startsWith('/scripts/') || 
                    req.url.startsWith('/dist/') || 
                    req.url.startsWith('/public/') ||
                    req.url.startsWith('/assets/')) {
                    return true;
                }
                
                return false;
            },
            handler: (req, res) => {
                const ip = this.getClientIP(req);
                this.logSecurityEvent('rate_limit_exceeded', {
                    ip,
                    type,
                    url: req.url,
                    userAgent: req.get('User-Agent')
                });
                
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    type: type,
                    retryAfter: Math.ceil(config.windowMs / 1000)
                });
            }
        });
    };
    createSlowDown() {
        return slowDown({
            windowMs: 15 * 60 * 1000, // 15 minutes
            delayAfter: 100, // Allow 100 requests per window at full speed
            delayMs: () => 500, // Fixed 500ms delay function
            maxDelayMs: 20000, // Maximum delay of 20 seconds
            keyGenerator: (req) => this.getClientIP(req),
            validate: { delayMs: false } // Disable delayMs warning
        });
    };
    createSQLInjectionProtection() {
        return (req, res, next) => {
            const sqlPatterns = [
                /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
                /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
                /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
                /((\%27)|(\'))union/i,
                /((\%27)|(\'))select/i,
                /((\%27)|(\'))insert/i,
                /((\%27)|(\'))delete/i,
                /((\%27)|(\'))update/i,
                /((\%27)|(\'))drop/i,
                /((\%27)|(\'))create/i,
                /((\%27)|(\'))alter/i,
                /((\%27)|(\'))exec/i,
                /exec(\s|\+)+(s|x)p\w+/i
            ];

            const checkForSQLInjection = (obj, path = '') => {
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        const value = obj[key];
                        const currentPath = path ? `${path}.${key}` : key;
                        
                        if (typeof value === 'string') {
                            for (const pattern of sqlPatterns) {
                                if (pattern.test(value)) {
                                    this.logSecurityEvent('sql_injection_attempt', {
                                        ip: this.getClientIP(req),
                                        field: currentPath,
                                        value: value.substring(0, 100), // Log first 100 chars
                                        url: req.url,
                                        userAgent: req.get('User-Agent')
                                    });
                                    
                                    return res.status(400).json({
                                        error: 'Invalid input detected',
                                        field: key
                                    });
                                }
                            }
                        } else if (typeof value === 'object' && value !== null) {
                            const result = checkForSQLInjection(value, currentPath);
                            if (result) return result;
                        }
                    }
                }
                return null;
            };

            // Check body, query, and params
            const sqlCheckResult = checkForSQLInjection(req.body) || 
                                 checkForSQLInjection(req.query) || 
                                 checkForSQLInjection(req.params);
            
            if (sqlCheckResult) return sqlCheckResult;
            
            next();
        };
    };
    createXSSProtection() {
        return (req, res, next) => {
            const xssPatterns = [
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
                /javascript:/i,
                /on\w+\s*=/i,
                /<img[^>]+src[\\s]*=[\\s]*[\\"]?[\\s]*javascript:/i,
                /<img[^>]+src[\\s]*=[\\s]*[\\"]?[\\s]*data:/i
            ];

            const sanitizeValue = (value) => {
                if (typeof value === 'string') {
                    for (const pattern of xssPatterns) {
                        if (pattern.test(value)) {
                            this.logSecurityEvent('xss_attempt', {
                                ip: this.getClientIP(req),
                                value: value.substring(0, 100),
                                url: req.url
                            });
                            return value.replace(pattern, '[BLOCKED]');
                        }
                    }
                }
                return value;
            };

            const sanitizeObject = (obj) => {
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (typeof obj[key] === 'string') {
                            obj[key] = sanitizeValue(obj[key]);
                        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                            sanitizeObject(obj[key]);
                        }
                    }
                }
            };

            if (req.body) sanitizeObject(req.body);
            if (req.query) sanitizeObject(req.query);
            if (req.params) sanitizeObject(req.params);

            next();
        };
    };
    createCSRFProtection() {
        return (req, res, next) => {
            // Skip for safe methods
            if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
                return next();
            }

            // Skip for static assets and main page loads
            if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i) ||
                req.url === '/' ||
                req.url.startsWith('/health') ||
                req.url.startsWith('/scripts/') ||
                req.url.startsWith('/public/')) {
                return next();
            }

            const origin = req.get('Origin');
            const referer = req.get('Referer');
            const host = req.get('Host');
            const userAgent = req.get('User-Agent') || '';

            // Allow mobile apps and API clients
            if (this.isMobileApp(userAgent) || this.isAPIClient(req)) {
                return next();
            }

            // For API endpoints, be more strict
            if (req.url.startsWith('/api/')) {
                // Validate origin/referer for API calls
                if (!origin && !referer) {
                    this.logSecurityEvent('csrf_no_origin_referer', {
                        ip: this.getClientIP(req),
                        userAgent,
                        url: req.url
                    });
                    return res.status(403).json({ error: 'Origin or Referer required for API calls' });
                }

                const allowedOrigins = this.getAllowedOrigins(host);
                
                if (origin && !this.isValidOrigin(origin, allowedOrigins)) {
                    this.logSecurityEvent('csrf_invalid_origin', {
                        ip: this.getClientIP(req),
                        origin,
                        url: req.url
                    });
                    return res.status(403).json({ error: 'Invalid origin' });
                }

                if (referer && !this.isValidReferer(referer, allowedOrigins)) {
                    this.logSecurityEvent('csrf_invalid_referer', {
                        ip: this.getClientIP(req),
                        referer,
                        url: req.url
                    });
                    return res.status(403).json({ error: 'Invalid referer' });
                }
            }

            next();
        };
    };
    createFileUploadSecurity() {
        return (req, res, next) => {
            if (!req.file && !req.files) {
                return next();
            }

            const files = req.files || [req.file];
            
            for (const file of files) {
                if (!this.validateFile(file)) {
                    this.logSecurityEvent('malicious_file_upload', {
                        ip: this.getClientIP(req),
                        filename: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size
                    });
                    return res.status(400).json({ error: 'Invalid file type or size' });
                }
            }

            next();
        };
    };
    createSecurityHeaders() {
        return helmet(this.config.headers);
    };
    getClientIP(req) {
        return req.ip || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress || 
               req.headers['x-forwarded-for']?.split(',')[0] || 
               'unknown';
    };
    handleSuspiciousActivity(ip, type, details) {
        this.flagSuspiciousIP(ip, details);
        this.logSecurityEvent('suspicious_activity', { ip, type, details });
    };
    blockIP(ip, reason) {
        this.blockedIPs.add(ip);
        this.logSecurityEvent('ip_blocked', { ip, reason });
        
        // Auto-unblock after configured duration
        setTimeout(() => {
            this.blockedIPs.delete(ip);
            this.logSecurityEvent('ip_unblocked', { ip });
        }, this.config.ddos.blockDurationMinutes * 60 * 1000);
    };
    flagSuspiciousIP(ip, requestCount) {
        const existing = this.suspiciousIPs.get(ip) || { count: 0, firstSeen: Date.now() };
        existing.count++;
        existing.lastSeen = Date.now();
        this.suspiciousIPs.set(ip, existing);
    };
    isMobileApp(userAgent) {
        const mobilePatterns = [
            'okhttp', 'ExpoKit', 'Expo', 'React Native', 
            'ReactNativeApplication', 'Mobile', 'Android', 
            'iPhone', 'iPad', 'GoLuraApp'
        ];
        return mobilePatterns.some(pattern => userAgent.includes(pattern));
    };
    isAPIClient(req) {
        return req.headers['x-api-client'] || 
               req.headers['authorization']?.startsWith('Bearer ');
    };
    getAllowedOrigins(host) {
        const origins = [
            `http://${host}`,
            `https://${host}`
        ];

        if (process.env.DOMAIN_URL) origins.push(process.env.DOMAIN_URL);
        if (process.env.DEV_DOMAIN_URL) origins.push(process.env.DEV_DOMAIN_URL);

        // Development origins
        if (process.env.NODE_ENV !== 'production') {
            origins.push(
                'http://localhost:6250', 'https://localhost:6250',
                'http://localhost:6500', 'https://localhost:6500',
                'http://localhost:3000', 'https://localhost:3000',
                'http://127.0.0.1:6250', 'https://127.0.0.1:6250'
            );
        }

        return origins;
    };
    isValidOrigin(origin, allowedOrigins) {
        return allowedOrigins.some(allowed => 
            origin === allowed || origin.startsWith(allowed)
        );
    };
    isValidReferer(referer, allowedOrigins) {
        return allowedOrigins.some(allowed => referer.startsWith(allowed));
    };
    validateFile(file) {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        const maxSize = 10 * 1024 * 1024; // 10MB
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs'];

        return allowedTypes.includes(file.mimetype) &&
               file.size <= maxSize &&
               !dangerousExtensions.some(ext => file.originalname?.toLowerCase().endsWith(ext)) &&
               !/[<>:"'/\\|?*]/.test(file.originalname || '');
    };
    logSecurityEvent(type, details) {
        const event = {
            timestamp: new Date().toISOString(),
            type,
            details,
            severity: this.getEventSeverity(type)
        };

        this.securityEvents.push(event);
        
        // Keep only last 1000 events
        if (this.securityEvents.length > 1000) {
            this.securityEvents.shift();
        }

        // Log to error handler for persistent logging
        if (event.severity === 'high' || event.severity === 'critical') {
            logError(new Error(`Security Event: ${type}`), {
                securityEvent: event,
                critical: event.severity === 'critical'
            });
        }

        console.warn(`🔒 Security Event [${event.severity.toUpperCase()}]:`, event);
    };
    getEventSeverity(type) {
        const severityMap = {
            blocked_ip_request: 'medium',
            rate_limit_exceeded: 'low',
            sql_injection_attempt: 'critical',
            xss_attempt: 'high',
            csrf_invalid_origin: 'medium',
            malicious_file_upload: 'high',
            suspicious_activity: 'medium',
            ip_blocked: 'high'
        };
        return severityMap[type] || 'low';
    };
    getSecurityStats() {
        return {
            blockedIPs: Array.from(this.blockedIPs),
            suspiciousIPs: Object.fromEntries(this.suspiciousIPs),
            recentEvents: this.securityEvents.slice(-50),
            eventCounts: this.securityEvents.reduce((acc, event) => {
                acc[event.type] = (acc[event.type] || 0) + 1;
                return acc;
            }, {})
        };
    };
    sanitizeInput = (req, res, next) => {
        // Sanitize all string inputs
        const sanitizeObject = (obj) => {
            if (typeof obj === 'string') {
                // Remove potential XSS
                return xss(obj, {
                    whiteList: {},
                    stripIgnoreTag: true,
                    stripIgnoreTagBody: ['script']
                });
            }
            
            if (obj && typeof obj === 'object') {
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        obj[key] = sanitizeObject(obj[key]);
                    }
                }
            }
            
            return obj;
        };
    
        if (req.body) {
            req.body = sanitizeObject(req.body);
        }
        
        if (req.query) {
            req.query = sanitizeObject(req.query);
        }
        
        if (req.params) {
            req.params = sanitizeObject(req.params);
        }
    
        next();
    };
}

// Create singleton instance
const securityManager = new SecurityManager();

module.exports = {
    SecurityManager,
    securityManager,
    
    // DDoS and Rate Limiting
    ddosProtection: () => securityManager.createDDoSProtection(),
    advancedRateLimit: (type) => securityManager.createAdvancedRateLimit(type),
    slowDown: () => securityManager.createSlowDown(),
    
    // OWASP Protection
    sqlInjectionProtection: () => securityManager.createSQLInjectionProtection(),
    xssProtection: () => securityManager.createXSSProtection(),
    csrfProtection: () => securityManager.createCSRFProtection(),
    
    // File and Headers
    fileUploadSecurity: () => securityManager.createFileUploadSecurity(),
    securityHeaders: () => securityManager.createSecurityHeaders(),
    
    // Input Sanitization
    sanitizeInput: securityManager.sanitizeInput,
    
    // Utilities
    getSecurityStats: () => securityManager.getSecurityStats()
};
