'use strict';

angular.module('ngToDos', [])
.factory('$toDo', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {
        getToDo: function (data) {
            return $http
                .post(
                    '/to-dos/to-do/get',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        getToDos: function (data) {
            return $http
                .post(
                    '/to-dos',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        createToDo: function (data) {
            return $http
                .post(
                    '/to-dos/to-do',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        updateToDo: function (data) {
            return $http
                .put(
                    '/to-dos/to-do/update',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        deleteToDo: function (data) {
            return $http
                .post(
                    '/to-dos/to-do/delete',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        completeToDo: function (data) {
            return $http
                .post(
                    '/to-dos/to-do/complete',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        toggleToDoItem: function (data) {
            return $http
                .post(
                    '/to-dos/to-do/item/toggle',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
    }
}]);
