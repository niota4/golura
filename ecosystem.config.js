module.exports = {
  apps: [{
    name: 'golura',
    script: './app.js',
    env: {
      NODE_ENV: 'production',
      // All environment variables should be set via a .env file or your hosting platform.
      // See .env.example for the full list of required variables.
    }
  }]
};
