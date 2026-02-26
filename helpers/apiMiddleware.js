// API Response Standardization Middleware
const standardizeResponse = (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to standardize responses
    res.json = function(data) {
        let standardResponse;
        
        if (data && typeof data === 'object') {
            // If already in standard format, use as-is
            if (data.hasOwnProperty('err') && data.hasOwnProperty('msg')) {
                standardResponse = {
                    success: !data.err,
                    error: data.err,
                    message: data.msg,
                    data: null,
                    timestamp: new Date().toISOString(),
                    ...data
                };
            } else {
                // Standardize non-standard responses
                standardResponse = {
                    success: true,
                    error: false,
                    message: 'Request completed successfully',
                    data: data,
                    timestamp: new Date().toISOString()
                };
            }
        } else {
            standardResponse = {
                success: true,
                error: false,
                message: 'Request completed successfully',
                data: data,
                timestamp: new Date().toISOString()
            };
        }
        
        // Add request ID for tracking
        standardResponse.requestId = req.id || require('crypto').randomBytes(8).toString('hex');
        
        return originalJson.call(this, standardResponse);
    };
    
    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    // Log error for monitoring
    console.error('API Error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    
    // Determine error type and appropriate response
    let statusCode = 500;
    let message = 'Internal server error';
    
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized access';
    } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Access forbidden';
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Resource not found';
    } else if (err.name === 'ConflictError') {
        statusCode = 409;
        message = 'Resource conflict';
    } else if (err.name === 'RateLimitError') {
        statusCode = 429;
        message = 'Too many requests';
    }
    
    // Send standardized error response
    res.status(statusCode).json({
        success: false,
        error: true,
        message: message,
        data: null,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString(),
        requestId: req.id || require('crypto').randomBytes(8).toString('hex')
    });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Generate unique request ID
    req.id = require('crypto').randomBytes(8).toString('hex');
    
    // Log request
    console.log('API Request:', {
        id: req.id,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    
    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log('API Response:', {
            id: req.id,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        });
    });
    
    next();
};

module.exports = {
    standardizeResponse,
    errorHandler,
    requestLogger
};
