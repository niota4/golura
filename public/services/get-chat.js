'use strict';

angular.module('ngChats', [])
.factory('$chat', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {
        getChatMessages: function (data) {
            return $http
            .post('/chats/messages', data)
            .then(function (response) {
                return response.data;
            });
        },
        createChatRoom: function (data) {
            return $http
            .post('/chats/room', data)
            .then(function (response) {
                return response.data;
            });
        },
        createChatMessage: function (data) {
            return $http
            .post('/chats/message/message', data)
            .then(function (response) {
                return response.data;
            });
        },
        updateChatRoom: function (data) {
            return $http
            .put('/chats/rooms/room', data)
            .then(function (response) {
                return response.data;
            });
        },
        updateChatMessage: function (data) {
            return $http
            .put('/chats/messages/message', data)
            .then(function (response) {
                return response.data;
            });
        },
        updateChatMessageLike: function (data) {
            return $http
            .put('/chats/messages/message/like', data)
            .then(function (response) {
                return response.data;
            });
        },
        deleteChatRoom: function (data) {
            return $http
            .post('/chats/rooms/room/delete', data)
            .then(function (response) {
                return response.data;
            });
        },
        deleteChatMessage: function (data) {
            return $http
            .post('/chats/messages/message/delete', data)
            .then(function (response) {
                return response.data;
            });
        }
    }
}]);
