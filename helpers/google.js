const { google } = require('googleapis');
const { auth } = require('google-auth-library');

/**
 * General authentication client for Google APIs
 * @param {Array} scopes - An array of scopes required for the Google API
 * @returns {Object} authClient - The authenticated client
 */
const getAuthClient = async (scopes = ['https://www.googleapis.com/auth/chat.bot']) => {
    const authClient = await auth.getClient({
        scopes: scopes,
    });
    google.options({ auth: authClient });
    return authClient;
};

/**
 * User-specific authentication client for Google APIs
 * @param {String} userId - The user ID to retrieve the OAuth token for
 * @param {Array} scopes - An array of scopes required for the Google API
 * @returns {Object} authClient - The authenticated client for the user
 */
const getUserAuthClient = async (userId, scopes = ['https://www.googleapis.com/auth/chat.bot']) => {
    // Assuming you have a method to get the user's OAuth token
    const userToken = await getUserToken(userId);

    const authClient = new auth.OAuth2();
    authClient.setCredentials({ access_token: userToken });

    google.options({ auth: authClient });
    return authClient;
};

// Google Chat specific helpers
const googleChat = {
    /**
     * List all spaces in Google Chat
     * @param {Object} authClient - The authenticated client
     * @returns {Promise} - The result of the API call
     */
    listSpaces: async (authClient) => {
        return google.chat('v1').spaces.list({
            pageSize: 100,
            filter: 'type = "ROOM"',
            auth: authClient
        });
    },

    /**
     * Send a message to a specific space
     * @param {Object} authClient - The authenticated client
     * @param {string} spaceId - The ID of the space
     * @param {string} text - The message text to send
     * @returns {Promise} - The result of the API call
     */
    sendMessage: async (authClient, spaceId, text) => {
        return google.chat('v1').spaces.messages.create({
            parent: `spaces/${spaceId}`,
            requestBody: { text },
            auth: authClient
        });
    },

    /**
     * List messages from a specific space
     * @param {Object} authClient - The authenticated client
     * @param {string} spaceId - The ID of the space
     * @returns {Promise} - The result of the API call
     */
    listMessages: async (authClient, spaceId) => {
        return google.chat('v1').spaces.messages.list({
            parent: `spaces/${spaceId}`,
            auth: authClient
        });
    },

    /**
     * Create a new space in Google Chat
     * @param {Object} authClient - The authenticated client
     * @param {string} name - The name of the new space
     * @returns {Promise} - The result of the API call
     */
    createSpace: async (authClient, name) => {
        return google.chat('v1').spaces.create({
            requestBody: { displayName: name },
            auth: authClient
        });
    },

    /**
     * Delete a space in Google Chat
     * @param {Object} authClient - The authenticated client
     * @param {string} spaceId - The ID of the space to delete
     * @returns {Promise} - The result of the API call
     */
    deleteSpace: async (authClient, spaceId) => {
        return google.chat('v1').spaces.delete({
            name: `spaces/${spaceId}`,
            auth: authClient
        });
    },
};

module.exports = {
    getAuthClient,
    getUserAuthClient,
    googleChat,
    // You can add more Google service helpers here...
};
