angular.module('ngTextMessagesFormat', [])
.directive('formatTextMessages', ['$rootScope', '$timeout', '$setup', function($rootScope, $timeout, $setup) {
    return {
        restrict: 'A',
        scope: {
            textMessages: '=', // Array of text messages
            textMessage: '=',  // Single text message
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

            // Function to parse media URLs from JSON string
            function parseMediaUrls(textMessage) {
                if (textMessage.media) {
                    try {
                        textMessage.parsedMedia = JSON.parse(textMessage.media);
                    } catch (e) {
                        textMessage.parsedMedia = [];
                    }
                } else {
                    textMessage.parsedMedia = [];
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

            // Process a single text message (format text and parse media)
            function processTextMessage(textMessage) {
                if (textMessage.message) {
                    textMessage.formattedMessage = formatMessageText(textMessage.message);
                }
                parseMediaUrls(textMessage);
                if (!textMessage.links) {
                    textMessage.links = getLinksFromMessage(textMessage.message);
                }
            }

            // Watch for changes in the text messages array
            scope.$watch('textMessages', function(newTextMessages) {
                if (newTextMessages) {
                    newTextMessages.forEach(processTextMessage);
                }
            }, true);

            // Watch for changes in a single text message
            scope.$watch('textMessage', function(newTextMessage) {
                if (newTextMessage && newTextMessage.message) {
                    processTextMessage(newTextMessage);
                }
            }, true);
        }
    };
}]);
