/**
 * Health Check Routes
 * Provides health and status endpoints for monitoring
 */

const express = require('express');
const router = express.Router();
const { logError } = require('../helpers/errorHandler');

/**
 * Basic health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    logError(error, {
      context: 'Health Check',
      endpoint: '/health'
    });
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * Detailed status check (includes database connectivity)
 */
router.get('/status', async (req, res) => {
  try {
    const sequelize = require('../config/database');
    
    // Test database connection
    let dbStatus = 'disconnected';
    try {
      await sequelize.authenticate();
      dbStatus = 'connected';
    } catch (dbError) {
      dbStatus = 'error';
    }

    const statusInfo = {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: 'operational'
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    };

    const statusCode = dbStatus === 'connected' ? 200 : 503;
    res.status(statusCode).json(statusInfo);
  } catch (error) {
    logError(error, {
      context: 'Status Check',
      endpoint: '/status'
    });
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Status check failed'
    });
  }
});

/**
 * Readiness probe (for Kubernetes/container orchestration)
 */
router.get('/ready', async (req, res) => {
  try {
    // Add any readiness checks here (database, external services, etc.)
    res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Liveness probe (for Kubernetes/container orchestration)
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
