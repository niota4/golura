const fs = require('fs');
const path = require('path');

/**
 * Global Error Handler for GoLura Platform
 * Provides centralized error logging, monitoring, and reporting
 */

class ErrorHandler {
    constructor() {
        this.errorLogPath = path.join(__dirname, '../logs');
        this.ensureLogDirectory();
        this.initializeErrorCounts();
    }

    /**
     * Ensure log directory exists
     */
    ensureLogDirectory() {
        if (!fs.existsSync(this.errorLogPath)) {
            fs.mkdirSync(this.errorLogPath, { recursive: true });
        }
    }

    /**
     * Initialize error counters for monitoring
     */
    initializeErrorCounts() {
        this.errorCounts = {
            database: 0,
            api: 0,
            auth: 0,
            payment: 0,
            ai: 0,
            external: 0,
            unknown: 0
        };
        this.lastResetTime = Date.now();
    }

    /**
     * Log error to file with rotation
     */
    logErrorToFile(error, context = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code
            },
            context,
            severity: this.determineSeverity(error),
            category: this.categorizeError(error)
        };

        const logFileName = `error-${new Date().toISOString().split('T')[0]}.log`;
        const logFilePath = path.join(this.errorLogPath, logFileName);
        
        const logLine = JSON.stringify(logEntry) + '\n';
        
        try {
            fs.appendFileSync(logFilePath, logLine);
        } catch (fileError) {
            console.error('Failed to write to error log:', fileError);
        }
    }

    /**
     * Determine error severity
     */
    determineSeverity(error) {
        if (error.name === 'ValidationError' || error.status === 400) return 'low';
        if (error.name === 'UnauthorizedError' || error.status === 401) return 'medium';
        if (error.name === 'DatabaseError' || error.code === 'ECONNREFUSED') return 'high';
        if (error.status >= 500) return 'critical';
        return 'medium';
    }

    /**
     * Categorize error for monitoring
     */
    categorizeError(error) {
        if (error.name?.includes('Sequelize') || error.code === 'ECONNREFUSED') {
            this.errorCounts.database++;
            return 'database';
        }
        if (error.name === 'UnauthorizedError' || error.name === 'JsonWebTokenError') {
            this.errorCounts.auth++;
            return 'auth';
        }
        if (error.message?.includes('payment') || error.message?.includes('stripe')) {
            this.errorCounts.payment++;
            return 'payment';
        }
        if (error.message?.includes('ollama') || error.message?.includes('AI')) {
            this.errorCounts.ai++;
            return 'ai';
        }
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
            this.errorCounts.external++;
            return 'external';
        }
        
        this.errorCounts.api++;
        return 'api';
    }

    /**
     * Create Express error handling middleware
     */
    createExpressErrorHandler() {
        return (error, req, res, next) => {
            // Generate unique error ID for tracking
            const errorId = require('crypto').randomBytes(8).toString('hex');
            
            // Enhanced context information
            const context = {
                errorId,
                url: req.url,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                userId: req.userId || null,
                body: req.method === 'POST' ? this.sanitizeRequestBody(req.body) : undefined,
                query: req.query,
                headers: this.sanitizeHeaders(req.headers),
                timestamp: new Date().toISOString()
            };

            // Log error with context
            this.logError(error, context);

            // Determine response status
            const statusCode = error.status || error.statusCode || 500;
            const isProduction = process.env.NODE_ENV === 'production';

            // Create response object
            const errorResponse = {
                success: false,
                error: true,
                errorId,
                message: isProduction ? this.getPublicErrorMessage(error) : error.message,
                timestamp: context.timestamp
            };

            // Add stack trace in development
            if (!isProduction) {
                errorResponse.stack = error.stack;
                errorResponse.details = error.details || null;
            }

            // Send error metrics to monitoring (if enabled)
            this.sendToMonitoring(error, context);

            // Respond with standardized error
            res.status(statusCode).json(errorResponse);
        };
    }

    /**
     * Main error logging method
     */
    logError(error, context = {}) {
        // Console logging with color coding
        const severity = this.determineSeverity(error);
        const colorCode = this.getSeverityColor(severity);
        
        console.error(`${colorCode}[${severity.toUpperCase()}] Error:`, {
            errorId: context.errorId || 'unknown',
            message: error.message,
            category: this.categorizeError(error),
            context: context.url ? `${context.method} ${context.url}` : 'Unknown context'
        });

        // File logging
        this.logErrorToFile(error, context);

        // Send to external monitoring if available
        this.sendToExternalMonitoring(error, context);

        // Critical error notifications
        if (severity === 'critical') {
            this.sendCriticalAlert(error, context);
        }
    }

    /**
     * Get color code for severity
     */
    getSeverityColor(severity) {
        const colors = {
            low: '\x1b[33m',      // Yellow
            medium: '\x1b[35m',   // Magenta
            high: '\x1b[31m',     // Red
            critical: '\x1b[41m'  // Red background
        };
        return colors[severity] || '\x1b[0m';
    }

    /**
     * Get public-safe error message
     */
    getPublicErrorMessage(error) {
        const statusCode = error.status || error.statusCode || 500;
        
        const publicMessages = {
            400: 'Invalid request data',
            401: 'Authentication required',
            403: 'Access denied',
            404: 'Resource not found',
            409: 'Resource conflict',
            429: 'Too many requests',
            500: 'Internal server error',
            502: 'Service temporarily unavailable',
            503: 'Service unavailable'
        };

        return publicMessages[statusCode] || 'An unexpected error occurred';
    }

    /**
     * Sanitize request body for logging
     */
    sanitizeRequestBody(body) {
        if (!body || typeof body !== 'object') return body;
        
        const sensitiveFields = [
            'password', 'token', 'secret', 'key', 'auth', 'credential',
            'ssn', 'social', 'creditcard', 'cardnumber', 'cvv', 'pin'
        ];
        
        const sanitized = { ...body };
        
        Object.keys(sanitized).forEach(key => {
            if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                sanitized[key] = '[REDACTED]';
            }
        });
        
        return sanitized;
    }

    /**
     * Sanitize headers for logging
     */
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        delete sanitized.authorization;
        delete sanitized.cookie;
        delete sanitized['x-api-key'];
        return sanitized;
    }

    /**
     * Send error metrics to monitoring service
     */
    sendToMonitoring(error, context) {
        // This would integrate with DataDog, New Relic, or similar
        // For now, we'll increment counters and log metrics
        
        const metrics = {
            errorCount: 1,
            category: this.categorizeError(error),
            severity: this.determineSeverity(error),
            endpoint: context.url,
            method: context.method,
            statusCode: error.status || 500,
            timestamp: Date.now()
        };

        // In production, this would send to your monitoring service
        if (process.env.NODE_ENV === 'production') {
            // Example: datadog.increment('golura.errors', 1, [`category:${metrics.category}`]);
            // Example: newrelic.recordCustomEvent('ErrorEvent', metrics);
        }
    }

    /**
     * Send to external monitoring (Sentry, etc.)
     */
    sendToExternalMonitoring(error, context) {
        try {
            // Sentry integration (if configured)
            if (global.Sentry) {
                global.Sentry.captureException(error, {
                    tags: {
                        category: this.categorizeError(error),
                        severity: this.determineSeverity(error)
                    },
                    extra: context
                });
            }
        } catch (monitoringError) {
            console.error('Failed to send error to monitoring:', monitoringError);
        }
    }

    /**
     * Send critical error alerts
     */
    sendCriticalAlert(error, context) {
        // In production, this would send alerts via email, Slack, PagerDuty, etc.
        console.error('🚨 CRITICAL ERROR ALERT:', {
            error: error.message,
            context: context.url || 'Unknown',
            timestamp: new Date().toISOString()
        });

        // Example integrations:
        // - Send email to dev team
        // - Post to Slack channel
        // - Create PagerDuty incident
        // - SMS to on-call engineer
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const timeSinceReset = Date.now() - this.lastResetTime;
        const hoursElapsed = timeSinceReset / (1000 * 60 * 60);
        
        return {
            counts: { ...this.errorCounts },
            totalErrors: Object.values(this.errorCounts).reduce((sum, count) => sum + count, 0),
            timeWindow: `${hoursElapsed.toFixed(1)} hours`,
            resetTime: new Date(this.lastResetTime).toISOString()
        };
    }

    /**
     * Reset error counters (typically called daily)
     */
    resetErrorCounts() {
        this.initializeErrorCounts();
    }

    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection() {
        process.on('unhandledRejection', (reason, promise) => {
            const error = new Error(`Unhandled Promise Rejection: ${reason}`);
            error.promise = promise;
            error.reason = reason;
            
            this.logError(error, {
                type: 'unhandledRejection',
                promise: promise.toString(),
                reason: reason?.toString()
            });
        });
    }

    /**
     * Handle uncaught exceptions
     */
    handleUncaughtException() {
        process.on('uncaughtException', (error) => {
            this.logError(error, {
                type: 'uncaughtException',
                fatal: true
            });
            
            // Exit gracefully after logging
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        });
    }

    /**
     * Initialize global error handlers
     */
    initializeGlobalHandlers() {
        this.handleUnhandledRejection();
        this.handleUncaughtException();
    }

    /**
     * Initialize error handler with Express app
     */
    initialize(app) {
        // Initialize global handlers
        this.initializeGlobalHandlers();
        
        // Add Express error handler middleware
        app.use(this.createExpressErrorHandler());
        
        console.log('✅ Error handler initialized with global handlers and Express middleware');
    }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

module.exports = {
    ErrorHandler,
    errorHandler,
    initialize: (app) => errorHandler.initialize(app),
    createExpressErrorHandler: () => errorHandler.createExpressErrorHandler(),
    logError: (error, context) => errorHandler.logError(error, context),
    getErrorStats: () => errorHandler.getErrorStats(),
    resetErrorCounts: () => errorHandler.resetErrorCounts()
};
