define(['app-controller'], function (app) {
    app.register.controller('ChatsController',
    function (
        $scope,
        $rootScope,
        $location,
        $routeParams,
        $window,
        $log,
        $q,
        $user,
        $chat,
        $media,
        $setup,
        $timeout
    ) {
        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];
        $scope.page = $setup.getCurrentPage() || {};
        $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null);
        $scope.subPermissions = $setup.updateScopes($scope, $setup.getSubPages('chats'));

        $scope.chatRoom = {};
        $scope.room = {};
        $scope.chatMessage = {};
        $scope.parentChat = {};
        $scope.image = {};
        $scope.typingUsersByRoom = {};

        $scope.chatRooms = [];
        $scope.chatMessages = [];
        $scope.users = [];
        $scope.currentSpaceId = null;
        $scope.newMessage = '';

        $scope.UI = {
            errMessage: null,
            msg: null,
            message: null,
            usersLoaded: false,
            chatRoomLoaded: false,
            chatRoomsLoaded: false,
            chatMessagesLoaded: false,
            imageLoaded: false,
            newRoom: false,
            newMessage: false,
            formSaving: false,
            formSaved: false,
            modalFormSaved: false,
            messageOffset: 0,
        };

        $scope.initUserRooms = function () {
            $scope.UI.chatRoomsLoaded = false;
            $scope.UI.chatMessagesLoaded = false;
            $scope.UI.usersLoaded = false;

            $scope.chatRooms = [];
            $scope.chatMessages = [];

            $scope.user = $user.getUserFromCookie();

            $q.all([
                $user.getChatRooms({ userId: $scope.user.id }),
                $user.getUsers()

            ])
            .then(function (responses) {
                $scope.UI.chatRoomsLoaded = true;
                $scope.UI.usersLoaded = true;

                if (
                    !responses[0].err &&
                    !responses[1].err

                ) {
                    $scope.chatRooms = responses[0].chatRooms;

                    responses[1].users.filter(function (user) {
                        if (user.id !== $scope.user.id) {
                            $scope.users.push(user);
                        }
                    });

                    if ($routeParams.chatRoomId) {
                        const chatRoom = $scope.chatRooms.find(
                            (room) => room.id === parseInt($routeParams.chatRoomId)
                        );
                        if (chatRoom) {
                            $scope.initChatMessages(chatRoom);
                        }
                    }
                    _.each(
                        $scope.chatRooms,
                        function (room) {
                            room.ChatParticipants = _.map(room.ChatParticipants, function (participant) {
                                return participant.userId;
                            });
                        }
                    )
                    $timeout(function () {
                        // Ensure the modal is initialized after the chat rooms are loaded
                        $(document).foundation();
                    }
                    , 100); // Timeout to ensure the DOM is ready for Foundation
                    
                } else {
                    $scope.UI.errMessage = responses[0].msg || 'Error loading chat rooms';
                }
            }).catch(function (error) {
                $scope.UI.chatRoomsLoaded = true;
                $scope.UI.errMessage = error || 'Error loading chat rooms';
            });
        };
        $scope.initChatMessages = function (chatRoom, offset) {
            $scope.UI.chatMessagesLoaded = false;

            if (!chatRoom) {
                $scope.chatRoom = {};
                $scope.chatMessages = [];
                $scope.newMessage = '';
                return;
            }
            if ($scope.chatRoom.id !== chatRoom.id) {
                $scope.UI.messageOffset = 0;
                $scope.chatMessages = [];
                $scope.chatRoom = chatRoom;
                $scope.newMessage = '';
            } else {
                if (!offset) {
                    $scope.UI.messageOffset = 0;
                }
            }
            _.each(
                $scope.chatRooms,
                function (room) {
                    if (room.id !== chatRoom.id) {
                        room.options = false;
                    }
                }
            )
            $chat.getChatMessages({ chatRoomId: chatRoom.id, offset: $scope.UI.messageOffset })
            .then(function (response) {
                $scope.UI.chatMessagesLoaded = true;
                if (!response.err) {
                    $scope.UI.messageOffset = response.offset;
                    $scope.chatMessages = response.chatMessages;
                    // Remove unread messages count for this chat room since we are loading the messages
                    if ($scope.chatRoom && $scope.chatRoom.unreadMessagesCount) {
                        $scope.chatRoom.unreadMessagesCount = 0;
                        $rootScope.updateCounts(); // Update the unread counts in the header
                    };
                    // Scroll to the bottom of the chat container
                    var attempts = 0;
                    const interval = setInterval(function () {
                        const chatContainer = document.getElementById('chatContainer');
                        
                        if (chatContainer) {
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                            $(document).foundation();
                            clearInterval(interval);
                        } else if (attempts >= 50) {
                            $(document).foundation();
                            clearInterval(interval);
                        }
                        attempts++;
                    }, 100);
                } else {
                    $scope.UI.errMessage = response.msg || 'Error loading chat messages';
                }
            }).catch(function (error) {
                $scope.UI.chatMessagesLoaded = true;
                $scope.UI.errMessage = error.data.msg || 'Error loading chat messages';
            });
        };
        $scope.initImage = function (image) {
            $scope.UI.imageLoaded = false;

            $media.getPhotoByUrl({url: image.url})
            .then(
                function (response) {
                    $scope.UI.imageLoaded = true;
                    if (!response.err) {
                        $scope.image = response.image;
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve the Image.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.imageLoaded = true;
                    $scope.UI.errMessage = err || 'Failed to retrieve the Image.';
                }
            );
        };
        $scope.initChatRoomForm = function (chatRoom) {
            $scope.UI.formSaving = false;
            $scope.UI.newRoom = false;
            $scope.UI.chatRoomLoaded = false;
            $scope.room = chatRoom;

            if (!$scope.room) {
                $scope.UI.newRoom = true;
                $scope.room = {
                    name: null,
                    description: null,
                };
            }
            $scope.UI.chatRoomLoaded = true;
        };
        $scope.initChatMessageReply = function (message) {
            $scope.UI.formSaving = false;
            $scope.UI.newMessage = false;

            $scope.parentChat = message;
            
        };
        $scope.createChatRoom = function (e, chatRoom) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.msg = null; 

            $chat.createChatRoom(chatRoom)
            .then(function (response) {
                $scope.UI.formSaving = false;
                if (!response.err) {
                    $scope.UI.msg = response.msg;
                    $scope.chatRoom = response.chatRoom;
                    $('#chatRoomFormReveal').foundation('close');

                    $scope.initUserRooms();
                } else {
                    $scope.UI.errMessage = response.msg || 'Error creating chat room';
                }
            }).catch(function (error) {
                $scope.UI.formSaving = false;
                $scope.UI.errMessage = error.data.msg || 'Error creating chat room';
            });
        };
        $scope.updateChatRoom = function (chatRoom) {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.msg = null;
            if (!chatRoom || !chatRoom.id) {
                $scope.UI.errMessage = 'Invalid chat room data.';
                $scope.UI.formSaving = false;
                return;
            };

            $chat.updateChatRoom(chatRoom)
            .then(function (response) {
                $scope.UI.formSaving = false;
                if (!response.err) {
                    $scope.UI.msg = response.msg;
                    $scope.chatRoom = response.chatRoom;

                    $('#chatRoomFormReveal').foundation('close');

                    // Re-initialize the chat rooms to reflect the updated data
                    $scope.initUserRooms();
                } else {
                    $scope.UI.errMessage = response.msg || 'Error updating chat room';
                }
            }).catch(function (error) {
                $scope.UI.formSaving = false;
                $scope.UI.errMessage = error.data.msg || 'Error updating chat room';
            });
        };
        $scope.updateUserRooms = function () {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.msg = null;

            $user.getChatRooms({ userId: $scope.user.id })
            .then(function (response) {
                $scope.UI.formSaving = false;
                if (!response.err) {
                    _.each(
                        $scope.chatRooms,
                        function (room) {
                            const updatedRoom = response.chatRooms.find((r) => r.id === room.id);

                            if (updatedRoom) {
                                room.unreadMessagesCount = updatedRoom.unreadMessagesCount;
                                room.LastMessage = updatedRoom.LastMessage;
                                room.ChatParticipants = _.map(updatedRoom.ChatParticipants, function (participant) {
                                    return participant.userId;
                                });
                            }
                        }
                    )
                } else {
                    $scope.UI.errMessage = response.msg || 'Error updating chat rooms';
                }
            }).catch(function (error) {
                $scope.UI.formSaving = false;
                $scope.UI.errMessage = error.data.msg || 'Error updating chat rooms';
            });
        }
        $scope.updateChatMessages = function (chatRoom) {
            $chat.getChatMessages({ chatRoomId: chatRoom.id, offset: $scope.UI.messageOffset })
            .then(function (response) {
                $scope.UI.chatMessagesLoaded = true; // Mark as loaded

                // Add only new messages to the existing chat messages array
                if (!response.err) {
                    if (response.chatMessages && response.chatMessages.length > 0) {
                        // Append only new messages to the existing chat messages
                        const newMessages = response.chatMessages.filter(function (newMessage) {
                            // Check if the message already exists in the current chat messages
                            return !$scope.chatMessages.some(function (existingMessage) {
                                // Compare by message ID or any unique identifier
                                return existingMessage.id === newMessage.id;
                            });
                        });
                        if (newMessages.length > 0) {
                            // If there are new messages, append them to the chat messages array
                            $scope.chatMessages = $scope.chatMessages.concat(newMessages);
                        }
                        $timeout(function () {
                            const chatContainer = document.getElementById('chatContainer');
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                        }, 500);

                        $scope.UI.messageOffset = response.offset; // Update offset for next fetch
                    }
                    else {
                        $scope.UI.errMessage = 'No more messages to load.';
                    }
                }
                else {
                    // Handle error from server
                    $scope.UI.errMessage = response.msg || 'Error loading chat messages';
                }
            }).catch(function (error) {
                $scope.UI.chatMessagesLoaded = true; // Mark as loaded even on error
                // Handle network or server error
                if (error.data && error.data.msg) {
                    $scope.UI.errMessage = error.data.msg || 'Error loading chat messages';
                } else {
                    $scope.UI.errMessage = 'Error loading chat messages';
                }
            });
        }
        $scope.toggleChatMessageLike = function (message) {
            if (!message || !message.id) {
                $scope.UI.errMessage = 'Invalid message data.';
                return;
            }

            
            const userId = $rootScope.user.id;
            const userIndex = message.likeUserIds.indexOf(userId);
            
            message.liked = !message.liked;
            message.likeLoading = true;
            if (userIndex > -1) {
                // User already liked; remove the user
                message.likeUserIds.splice(userIndex, 1);
            } else {
                // User not in likeUserIds; add the use
                message.likeUserIds.push(userId);
            }

            // Prepare the request data
            const data = {
                id: message.id,
            };

            if (message.likeUserIds.includes(userId)) {
                message.liked = false;
            };
            // Call the server to update the like status
            $chat.updateChatMessageLike(data)
            .then(function (response) {
                if (response.err) {
                    // Rollback the like state if server update fails
                    message.like = !message.like;
                    $scope.UI.errMessage = response.msg || 'Failed to update like.';
                };

                message.likeLoading = false;
                
            })
            .catch(function (err) {
                // Rollback the like state if there's an error
                message.like = !message.like;
                $scope.UI.errMessage = `Error updating like: ${err.message}`;
            });
        };
        $rootScope.$on('updateChatRoomCount', function (event, data) {
                $rootScope.updateCounts();
                $scope.updateUserRooms();
        });
        $rootScope.$on('chatTyping', function (event, data) {
            if (!data || !data.chatRoomId || !data.userId) return;
            // Add user to typingUsersByRoom for the room
            $scope.typingUsersByRoom[data.chatRoomId] = $scope.typingUsersByRoom[data.chatRoomId] || [];
            if (!$scope.typingUsersByRoom[data.chatRoomId].some(u => u.userId === data.userId)) {
                $scope.typingUsersByRoom[data.chatRoomId].push(data);
            }
            // Optionally, update chatRooms/chatRoom objects for UI
            var room = $scope.chatRooms.find(r => r.id === data.chatRoomId);
            if (room) {
                room.typingUsers = $scope.typingUsersByRoom[data.chatRoomId];
            }
            if ($scope.chatRoom && $scope.chatRoom.id === data.chatRoomId) {
                $scope.chatRoom.typingUsers = $scope.typingUsersByRoom[data.chatRoomId];
            }
                $timeout(
                    function () {
                        const chatContainer = document.getElementById('chatContainer');
                        if (chatContainer) {
                            const atBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 50;
                            
                            if (atBottom) {
                                chatContainer.scrollTop = chatContainer.scrollHeight;
                            }
                        }
                        $scope.$applyAsync();
                    }
                );
        });
        $rootScope.$on('chatStopTyping', function (event, data) {
            if (!data || !data.chatRoomId || !data.userId) return;
            if ($scope.typingUsersByRoom[data.chatRoomId]) {
                $scope.typingUsersByRoom[data.chatRoomId] = $scope.typingUsersByRoom[data.chatRoomId].filter(u => u.userId !== data.userId);
                // Optionally, update chatRooms/chatRoom objects for UI
                var room = $scope.chatRooms.find(r => r.id === data.chatRoomId);
                if (room) {
                    room.typingUsers = $scope.typingUsersByRoom[data.chatRoomId];
                }
                if ($scope.chatRoom && $scope.chatRoom.id === data.chatRoomId) {
                    $scope.chatRoom.typingUsers = $scope.typingUsersByRoom[data.chatRoomId];
                }
            }
            $timeout(function () { $scope.$applyAsync(); });
        });
        $scope.$on('chatMessageUpdated', function (event, updatedMessage) {
                function updateMessageRecursive(messages) {
                    for (let i = 0; i < messages.length; i++) {    
                        if (messages[i].id === updatedMessage.id) {
                            updatedMessage.User = messages[i].User;
                            // Preserve replies
                            const replies = messages[i].replies;
                            messages[i] = { ...updatedMessage, replies: replies || [] };
                            $scope.$apply();
                        }
                        return true;
                    }
                    return false;
                }
                if (!updateMessageRecursive($scope.chatMessages)) {
                        console.warn("Updated message not found in the current messages array.");
                }
        });
        $scope.$on('chatMessageCreated', function (event, newMessage) {
            /**
             * Handle the new message created event
             * Append the new message to the chat messages array
             */
            if (!newMessage || !newMessage.id) {
                console.warn('Invalid new message received');
                return;
            }

            // Ensure the new message has a user object for display
            if (newMessage.User) {
                $scope.chatMessages.push(newMessage);
                $scope.$applyAsync();

                $timeout(function () {
                    const chatContainer = document.getElementById('chatContainer');
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }, 0);
            } else {
                console.warn('New message lacks user information');
            }
        });  
        $scope.$on('newMessage', function (event, data) {
            if (!data || !data.chatMessage) return;
            // If on chat page and current chatRoom matches, update messages
            if ($scope.chatRoom && data.chatMessage.chatRoomId === $scope.chatRoom.id) {
                // Optionally, reload messages or push new message
                $scope.initChatMessages($scope.chatRoom);
            }
            // Optionally, update unread counts or last message in chatRooms list
            var room = $scope.chatRooms.find(r => r.id === data.chatMessage.chatRoomId);
            if (room) {
                room.LastMessage = data.chatMessage;
                // Optionally, increment unreadMessagesCount if not in current room
                if (!$scope.chatRoom || $scope.chatRoom.id !== room.id) {
                    room.unreadMessagesCount = (room.unreadMessagesCount || 0) + 1;
                }
            }
            $timeout(function () { $scope.$applyAsync(); });
        });

        $scope.initFormSaved = function (msg) {
            $scope.UI.formSaved = true;
            $scope.UI.message = msg;
            
            $timeout(
                function () {
                    $scope.UI.message = null;
                    $scope.UI.formSaved = false;
                }, 3000
            );
        };
        $scope.initErrorMessage = function (msg) {
            $scope.UI.errMessage = msg;

            $timeout(
                function () {
                    $scope.UI.errMessage = null;
                }, 3000
            );
        };
    });
});
