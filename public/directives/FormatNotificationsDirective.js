angular.module('ngNotificationsFormat', [])
.directive('formatNotifications', ['$rootScope', '$timeout', function($rootScope, $timeout) {
    return {
        restrict: 'A',
        scope: {
            notifications: '=', // Array of notifications
            notification: '=',  // Single notification
            users: '=',         // Array of user objects
            userLimit: '@?'     // Optional limit for displayed users, default is 3
        },
        link: function(scope) {
            // Capitalize the first letter of each word in a name
            function capitalizeName(name) {
                return name.replace(/\b\w/g, char => char.toUpperCase());
            }

            // Parse message for arrays of user IDs
            function extractUserIds(message) {
                try {
                    const match = message.match(/\[(.*?)\]/); // Match array format like "[41, 1]"
                    if (match && match[1]) {
                        return match[1].split(',').map(id => parseInt(id.trim(), 10)); // Convert to array of integers
                    }
                } catch (error) {
                    console.error('Error parsing user IDs from message:', error);
                }
                return [];
            }

            // Format liked users for 'like' notifications
            function formatLikedUsers(notification) {
                if (!notification.message || notification.type !== 'like') {
                    notification.formattedMessage = null;
                    return;
                }

                if (!$rootScope.user) {
                    $timeout(() => formatLikedUsers(notification), 50);
                    return;
                }

                const userIds = extractUserIds(notification.message);
                if (!userIds || userIds.length === 0) {
                    notification.formattedMessage = notification.message; // Fallback to the original message
                    return;
                }

                const currentUserId = $rootScope.user?.id;
                const validUsers = scope.users.filter(user => userIds.includes(user.id));

                // Generate formatted text without "You" and capitalize names
                const displayedUsers = validUsers.map(
                    user => `${capitalizeName(user.firstName)} ${capitalizeName(user.lastName)}`
                );
                const totalUsers = displayedUsers.length;

                if (totalUsers > 0) {
                    const remainingCount = totalUsers - (parseInt(scope.userLimit) || 1);
                    const mainDisplay = displayedUsers.slice(0, totalUsers - (remainingCount > 0 ? remainingCount : 0));
                    const moreDisplay = remainingCount > 0 ? ` and ${remainingCount} more` : '';

                    notification.formattedMessage = `${mainDisplay.join(', ')}${moreDisplay} liked your comment`;
                } else {
                    notification.formattedMessage = 'Liked by unknown users'; // Fallback
                }
            }

            // Generate formatted URL based on relatedModel
            function generateFormattedUrl(notification) {
                if (!notification.relatedModel || !notification.relatedModelId) {
                    notification.formattedUrl = null;
                    return;
                }
                if (notification.subRelatedModel && notification.subRelatedModelId) {
                    // If sub-related model is present, format URL accordingly
                    const formattedSub = notification.subRelatedModel.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                    notification.formattedUrl = `/${formattedSub}s/${formattedSub}/${notification.subRelatedModelId}`;
                    return;
                }

                let baseModel = notification.relatedModel;

                // Special handling for 'comment' type to map to 'events'
                if (notification.type === 'comment' && baseModel === 'eventComments') {
                    baseModel = 'events';
                }
                

                // Convert camelCase to kebab-case and pluralize the first segment
                const formattedBase = baseModel.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                const pluralizedBase = `${formattedBase}s`; // Add 's' to pluralize

                notification.formattedUrl = `/${pluralizedBase}/${formattedBase}/${notification.relatedModelId}`;

                if (baseModel === 'PayrollItem') {
                    notification.formattedUrl = `/users/user/${notification.userId}/pay-stub/${notification.relatedModelId}`;
                }
            }

            // Process a single notification
            function processNotification(notification) {
                if (notification.type === 'like') {
                    formatLikedUsers(notification);
                } else {
                    notification.formattedMessage = notification.message;
                }
                generateFormattedUrl(notification);
            }

            // Watch for changes in the notifications array
            scope.$watch('notifications', function(newNotifications) {
                if (newNotifications) {
                    newNotifications.forEach(processNotification);
                }
            }, true);

            // Watch for changes in a single notification
            scope.$watch('notification', function(newNotification) {
                if (newNotification) {
                    processNotification(newNotification);
                }
            }, true);
        }
    };
}]);
