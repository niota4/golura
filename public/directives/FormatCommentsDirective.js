angular.module('ngCommentsFormat', [])
.directive('formatComments', ['$rootScope', '$timeout', function($rootScope, $timeout) {
    return {
        restrict: 'A',
        scope: {
            comments: '=', // Array of comments
            comment: '=',  // Single comment
            userLimit: '@?' // Optional limit for displayed users, default is 3
        },
        link: function(scope) {
            const userPattern = /\[\[{"id":(\d+),"value":"([^"]+)","display":"([^"]+)","prefix":"@"}\]\]/g;
            const emojiPattern = /\[\[{"display":"([^"]+)","value":"([^"]+)"}\]\]/g;
            const hashPattern = /\[\[{"id":"(\d+)","value":"([^"]+)","display":"([^"]+)","prefix":"#"}\]\]/g;

            // Function to format the comment text
            function formatCommentText(commentText) {
                if (!commentText) return commentText;

                // Format @user links
                let formattedText = commentText.replace(userPattern, function(_, id, value, display) {
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
            }

            // Function to format liked users
            function formatLikedUsers(comment) {
                if (!comment.likedUsers || comment.likedUsers.length === 0) {
                    comment.likesText = null;
                    return;
                }

                if (!$rootScope.user) {
                    $timeout(() => formatLikedUsers(comment), 50);
                    return;
                }

                const limit = parseInt(scope.userLimit) || 3;
                const currentUserId = $rootScope.user?.id;

                const validUsers = comment.likedUsers.filter(user => user && user.id != null);
                comment.liked = validUsers.some(user => user.id === currentUserId);

                const currentUserLiked = validUsers.some(user => user.id === currentUserId);
                const otherUsers = validUsers.filter(user => user.id !== currentUserId);

                const totalUsers = otherUsers.length;
                const displayedUsers = otherUsers.slice(0, limit - (currentUserLiked ? 1 : 0)).map(user => `${user.firstName} ${user.lastName}`);
                const remainingCount = totalUsers - displayedUsers.length;

                if (currentUserLiked) {
                    if (remainingCount > 0) {
                        comment.likesText = `You, ${displayedUsers.join(', ')}, and ${remainingCount} more liked this comment`;
                    } else if (displayedUsers.length > 0) {
                        comment.likesText = `You and ${displayedUsers.join(', ')} liked this comment`;
                    } else {
                        comment.likesText = 'You liked this comment';
                    }
                } else {
                    if (remainingCount > 0) {
                        comment.likesText = `${displayedUsers.join(', ')} and ${remainingCount} more liked this comment`;
                    } else if (displayedUsers.length > 0) {
                        comment.likesText = `${displayedUsers.join(', ')} liked this comment`;
                    }
                }
            }

            // Process a single comment (format text and likes)
            function processComment(comment) {
                if (comment.comment) {
                    comment.formattedComment = formatCommentText(comment.comment);
                }
                formatLikedUsers(comment);
            }

            // Watch for changes in the comments array
            scope.$watch('comments', function(newComments) {
                if (newComments) {
                    newComments.forEach(processComment);
                }
            }, true);

            // Watch for changes in a single comment
            scope.$watch('comment', function(newComment) {
                if (newComment) {
                    processComment(newComment);
                }
            }, true);
        }
    };
}]);
