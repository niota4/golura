/**
 * Monitoring Service for GoLura Platform
 * Handles application monitoring, health checks, and performance metrics
 */

class MonitoringService {
    constructor() {
        this.metrics = {
            requests: {
                total: 0,
                success: 0,
                errors: 0,
                lastReset: Date.now()
            },
            performance: {
                avgResponseTime: 0,
                totalResponseTime: 0,
                requestCount: 0
            },
            database: {
                connectionErrors: 0,
                slowQueries: 0,
                totalQueries: 0,
                avgQueryTime: 0
            },
            ai: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                avgProcessingTime: 0
            },
            memory: {
                usage: process.memoryUsage(),
                peak: process.memoryUsage(),
                lastCheck: Date.now()
            },
            system: {
                uptime: process.uptime(),
                startTime: Date.now(),
                nodeVersion: process.version,
                platform: process.platform
            }
        };

        this.alertThresholds = {
            errorRate: 0.05, // 5% error rate
            responseTime: 5000, // 5 seconds
            memoryUsage: 0.9, // 90% memory usage
            diskSpace: 0.9, // 90% disk usage
            dbConnectionErrors: 10 // per hour
        };

        this.startPeriodicChecks();
    }

    /**
     * Track API request metrics
     */
    trackRequest(req, res, responseTime) {
        this.metrics.requests.total++;
        
        if (res.statusCode < 400) {
            this.metrics.requests.success++;
        } else {
            this.metrics.requests.errors++;
        }

        // Track response time
        this.metrics.performance.totalResponseTime += responseTime;
        this.metrics.performance.requestCount++;
        this.metrics.performance.avgResponseTime = 
            this.metrics.performance.totalResponseTime / this.metrics.performance.requestCount;

        // Check for performance alerts
        if (responseTime > this.alertThresholds.responseTime) {
            this.sendAlert('slow_response', {
                url: req.url,
                method: req.method,
                responseTime,
                threshold: this.alertThresholds.responseTime
            });
        }
    }

    /**
     * Track database query metrics
     */
    trackDatabaseQuery(queryTime, isError = false, isSlow = false) {
        this.metrics.database.totalQueries++;
        
        if (isError) {
            this.metrics.database.connectionErrors++;
        }
        
        if (isSlow) {
            this.metrics.database.slowQueries++;
        }

        // Update average query time
        this.metrics.database.avgQueryTime = 
            ((this.metrics.database.avgQueryTime * (this.metrics.database.totalQueries - 1)) + queryTime) 
            / this.metrics.database.totalQueries;
    }

    /**
     * Track AI request metrics
     */
    trackAIRequest(success, processingTime) {
        this.metrics.ai.totalRequests++;
        
        if (success) {
            this.metrics.ai.successfulRequests++;
        } else {
            this.metrics.ai.failedRequests++;
        }

        // Update average processing time
        this.metrics.ai.avgProcessingTime = 
            ((this.metrics.ai.avgProcessingTime * (this.metrics.ai.totalRequests - 1)) + processingTime) 
            / this.metrics.ai.totalRequests;
    }

    /**
     * Get current health status
     */
    getHealthStatus() {
        const currentTime = Date.now();
        const hoursSinceReset = (currentTime - this.metrics.requests.lastReset) / (1000 * 60 * 60);
        
        // Calculate error rate
        const errorRate = this.metrics.requests.total > 0 
            ? this.metrics.requests.errors / this.metrics.requests.total 
            : 0;

        // Check memory usage
        const memUsage = process.memoryUsage();
        const memoryUsagePercent = memUsage.heapUsed / memUsage.heapTotal;

        // Determine overall health
        const issues = [];
        
        if (errorRate > this.alertThresholds.errorRate) {
            issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
        }
        
        if (this.metrics.performance.avgResponseTime > this.alertThresholds.responseTime) {
            issues.push(`Slow response time: ${this.metrics.performance.avgResponseTime.toFixed(0)}ms`);
        }
        
        if (memoryUsagePercent > this.alertThresholds.memoryUsage) {
            issues.push(`High memory usage: ${(memoryUsagePercent * 100).toFixed(1)}%`);
        }

        const status = issues.length === 0 ? 'healthy' : 'warning';

        return {
            status,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            issues,
            metrics: {
                requests: {
                    total: this.metrics.requests.total,
                    errorRate: (errorRate * 100).toFixed(2) + '%',
                    successRate: ((1 - errorRate) * 100).toFixed(2) + '%'
                },
                performance: {
                    avgResponseTime: Math.round(this.metrics.performance.avgResponseTime) + 'ms',
                    totalRequests: this.metrics.performance.requestCount
                },
                memory: {
                    used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
                    total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
                    usagePercent: (memoryUsagePercent * 100).toFixed(1) + '%'
                },
                database: {
                    totalQueries: this.metrics.database.totalQueries,
                    avgQueryTime: Math.round(this.metrics.database.avgQueryTime) + 'ms',
                    connectionErrors: this.metrics.database.connectionErrors,
                    slowQueries: this.metrics.database.slowQueries
                },
                ai: {
                    totalRequests: this.metrics.ai.totalRequests,
                    successRate: this.metrics.ai.totalRequests > 0 
                        ? ((this.metrics.ai.successfulRequests / this.metrics.ai.totalRequests) * 100).toFixed(1) + '%'
                        : '0%',
                    avgProcessingTime: Math.round(this.metrics.ai.avgProcessingTime) + 'ms'
                }
            }
        };
    }

    /**
     * Start periodic health checks
     */
    startPeriodicChecks() {
        // Memory monitoring every 5 minutes
        setInterval(() => {
            this.checkMemoryUsage();
        }, 5 * 60 * 1000);

        // Daily metrics reset
        setInterval(() => {
            this.resetDailyMetrics();
        }, 24 * 60 * 60 * 1000);

        // Disk space check every hour
        setInterval(() => {
            this.checkDiskSpace();
        }, 60 * 60 * 1000);
    }

    /**
     * Check memory usage and alert if high
     */
    checkMemoryUsage() {
        const memUsage = process.memoryUsage();
        const usagePercent = memUsage.heapUsed / memUsage.heapTotal;
        
        this.metrics.memory.usage = memUsage;
        
        // Update peak memory if current is higher
        if (memUsage.heapUsed > this.metrics.memory.peak.heapUsed) {
            this.metrics.memory.peak = memUsage;
        }
        
        this.metrics.memory.lastCheck = Date.now();

        if (usagePercent > this.alertThresholds.memoryUsage) {
            this.sendAlert('high_memory', {
                current: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
                total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
                percent: (usagePercent * 100).toFixed(1) + '%'
            });
        }
    }

    /**
     * Check disk space
     */
    async checkDiskSpace() {
        try {
            const fs = require('fs').promises;
            const path = require('path');
            
            const stats = await fs.stat(path.resolve('./'));
            // This is a simplified check - in production you'd use a more robust method
            
            // For now, we'll just log that we're checking disk space
            console.log('🔍 Disk space check completed');
        } catch (error) {
            console.error('Failed to check disk space:', error);
        }
    }

    /**
     * Reset daily metrics
     */
    resetDailyMetrics() {
        console.log('📊 Resetting daily metrics');
        
        // Store yesterday's metrics for reporting
        const yesterdayMetrics = {
            date: new Date().toISOString().split('T')[0],
            requests: { ...this.metrics.requests },
            database: { ...this.metrics.database },
            ai: { ...this.metrics.ai }
        };

        // Reset counters
        this.metrics.requests = {
            total: 0,
            success: 0,
            errors: 0,
            lastReset: Date.now()
        };

        this.metrics.performance = {
            avgResponseTime: 0,
            totalResponseTime: 0,
            requestCount: 0
        };

        this.metrics.database = {
            connectionErrors: 0,
            slowQueries: 0,
            totalQueries: 0,
            avgQueryTime: 0
        };

        this.metrics.ai = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            avgProcessingTime: 0
        };

        // Log daily summary
        this.logDailySummary(yesterdayMetrics);
    }

    /**
     * Log daily summary
     */
    logDailySummary(metrics) {
        const errorRate = metrics.requests.total > 0 
            ? (metrics.requests.errors / metrics.requests.total * 100).toFixed(2)
            : '0';

        console.log('📈 Daily Summary:', {
            date: metrics.date,
            requests: metrics.requests.total,
            errors: metrics.requests.errors,
            errorRate: errorRate + '%',
            dbQueries: metrics.database.totalQueries,
            aiRequests: metrics.ai.totalRequests
        });
    }

    /**
     * Send alert (in production, this would integrate with alerting services)
     */
    sendAlert(type, data) {
        const alert = {
            type,
            severity: this.getAlertSeverity(type),
            timestamp: new Date().toISOString(),
            data,
            environment: process.env.NODE_ENV || 'development'
        };

        console.warn('🚨 ALERT:', alert);

        // In production, send to:
        // - Email notifications
        // - Slack/Teams
        // - PagerDuty
        // - SMS for critical alerts
    }

    /**
     * Get alert severity
     */
    getAlertSeverity(type) {
        const severityMap = {
            high_memory: 'warning',
            slow_response: 'warning',
            high_error_rate: 'critical',
            disk_space: 'warning',
            database_errors: 'critical'
        };
        
        return severityMap[type] || 'info';
    }

    /**
     * Create monitoring middleware for Express
     */
    createMonitoringMiddleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            
            // Track request start
            req.monitoringStartTime = startTime;
            
            // Override res.end to capture response time
            const originalEnd = res.end;
            res.end = (...args) => {
                const responseTime = Date.now() - startTime;
                this.trackRequest(req, res, responseTime);
                originalEnd.apply(res, args);
            };
            
            next();
        };
    }

    /**
     * Create database monitoring hook
     */
    createDatabaseMonitoringHook() {
        return {
            beforeQuery: (options) => {
                options.startTime = Date.now();
            },
            afterQuery: (options, result) => {
                const queryTime = Date.now() - options.startTime;
                const isSlow = queryTime > 1000; // 1 second threshold
                this.trackDatabaseQuery(queryTime, false, isSlow);
            },
            onError: (error, options) => {
                const queryTime = Date.now() - options.startTime;
                this.trackDatabaseQuery(queryTime, true, false);
            }
        };
    }
}

// Create singleton instance
const monitoringService = new MonitoringService();

module.exports = {
    MonitoringService,
    monitoringService,
    getHealthStatus: () => monitoringService.getHealthStatus(),
    trackAIRequest: (success, time) => monitoringService.trackAIRequest(success, time),
    createMonitoringMiddleware: () => monitoringService.createMonitoringMiddleware(),
    createDatabaseMonitoringHook: () => monitoringService.createDatabaseMonitoringHook()
};
