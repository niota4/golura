angular.module('ngMessagesFormat', [])
.directive('formatMessages', ['$rootScope', '$timeout', '$setup', function($rootScope, $timeout, $setup) {
    return {
        restrict: 'A',
        scope: {
            messages: '=', // Array of messages
            message: '=',  // Single message
            userLimit: '@?' // Optional limit for displayed users, default is 3
        },
        link: function(scope) {
            const userPattern = /\[\[{"id":(\d+),"value":"([^"]+)","display":"([^"]+)","prefix":"@"}\]\]/g;
            const emojiPattern = /\[\[{"display":"([^"]+)","value":"([^"]+)"}\]\]/g;
            const hashPattern = /\[\[{"id":"(\d+)","value":"([^"]+)","display":"([^"]+)","prefix":"#"}\]\]/g;

            // Function to format the message text
            function formatMessageText(messageText) {
                if (!messageText) return messageText;

                // Format @user links
                let formattedText = messageText.replace(userPattern, function(_, id, value, display) {
                    return `<a href="users/users/${id}" class="formatted-link"><strong>${display}</strong></a>`;
                });

                // Format emojis
                formattedText = formattedText.replace(emojiPattern, function(_, display) {
                    return display; // Return only the emoji
                });

                // Format #model links
                formattedText = formattedText.replace(hashPattern, function(_, id, value, display) {
                    const [modelName, modelId] = value.split(' '); // Extract model name and ID
                    if (!modelName || isNaN(modelId)) return display; // Return display if invalid

                    const formattedModelName = modelName.trim().toLowerCase().replace(/\s+/g, '-'); // Convert to lowercase, replace spaces with dashes
                    const pluralModelName = `${formattedModelName}s`; // Make it plural
                    const link = `<a href="${pluralModelName}/${formattedModelName}/${id}" class="formatted-link"><strong>${display}</strong></a>`;
                    return link;
                });

                return formattedText;
            };

            // Function to format liked users
            function formatLikedUsers(message) {
                if (!message.likedUsers || message.likedUsers.length === 0) {
                    message.likesText = null;
                    return;
                }

                if (!$rootScope.user) {
                    $timeout(() => formatLikedUsers(message), 50);
                    return;
                }

                const limit = parseInt(scope.userLimit) || 3;
                const currentUserId = $rootScope.user?.id;

                const validUsers = message.likedUsers.filter(user => user && user.id != null);
                message.liked = validUsers.some(user => user.id === currentUserId);

                const currentUserLiked = validUsers.some(user => user.id === currentUserId);
                const otherUsers = validUsers.filter(user => user.id !== currentUserId);

                const totalUsers = otherUsers.length;
                const displayedUsers = otherUsers.slice(0, limit - (currentUserLiked ? 1 : 0)).map(user => `${user.firstName} ${user.lastName}`);
                const remainingCount = totalUsers - displayedUsers.length;

                if (currentUserLiked) {
                    if (remainingCount > 0) {
                        message.likesText = `You, ${displayedUsers.join(', ')}, and ${remainingCount} more liked this message`;
                    } else if (displayedUsers.length > 0) {
                        message.likesText = `You and ${displayedUsers.join(', ')} liked this message`;
                    } else {
                        message.likesText = 'You liked this message';
                    }
                } else {
                    if (remainingCount > 0) {
                        message.likesText = `${displayedUsers.join(', ')} and ${remainingCount} more liked this message`;
                    } else if (displayedUsers.length > 0) {
                        message.likesText = `${displayedUsers.join(', ')} liked this message`;
                    }
                }
            }
            // Function to get links from the message text and add them to the message object
            function getLinksFromMessage(message) {
                const links = [];
                const regex = /https?:\/\/[^\s]+/g;
                const matches = message.match(regex);

                if (matches) {
                    matches.forEach(match => {
                        $setup.getLinkPreview({url: match})
                        .then(
                            function(response) {
                                if (response.err) {
                                    return;
                                } else {
                                    links.push(response.metadata);
                                }
                            }
                        );
                    });
                }

                return links;
            }

            // Process a single message (format text and likes)
            function processMessage(message) {
                if (message.message) {
                    message.formattedMessage = formatMessageText(message.message);
                }
                formatLikedUsers(message);
                if (!message.links) {
                    message.links =  getLinksFromMessage(message.message)
                }
            }

            // Watch for changes in the messages array
            scope.$watch('messages', function(newMessages) {
                if (newMessages) {
                    newMessages.forEach(processMessage);
                }
            }, true);

            // Watch for changes in a single message
            scope.$watch('message', function(newMessage) {
                if (newMessage.message) {
                    processMessage(newMessage);
                }
            }, true);
        }
    };
}]);
