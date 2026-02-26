'use strict';

angular.module('ngComments', [])
.factory('$comment', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {
        getEventComments: function (data) {
            return $http
            .post('/comments/events/get', data)
            .then(function (response) {
                return response.data;
            });
        },
        createEventComment: function (data) {
            return $http
            .post('/comments/events', data)
            .then(function (response) {
                return response.data;
            });
        },
        updateEventComment: function (data) {
            return $http
            .put('/comments/events/update', data)
            .then(function (response) {
                return response.data;
            });
        },
        updateEventCommentLike: function (data) {
            return $http
            .put('/comments/events/like', data)
            .then(function (response) {
                return response.data;
            });
        },
        archiveEventComment: function (data) {
            return $http
            .post('/comments/events/archive', data)
            .then(function (response) {
                return response.data;
            });
        }
    }
}]);
