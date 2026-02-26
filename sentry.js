const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN, // Add your Sentry DSN here
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
});

module.exports = Sentry;
