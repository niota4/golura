'use strict';

angular.module('ngForms', [])
.factory('$form', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {

        getForm: function (data) {
            return $http
                .post(
                    '/forms/form/get',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        getFolder: function (data) {
            return $http
                .post(
                    '/form/folders/folder/get',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        getForms: function (data) {
            return $http
                .post(
                    '/forms',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        getFolders: function (data) {
            return $http
                .post(
                    '/forms/folders',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        createForm: function (data) {
            return $http
                .post(
                    '/forms/form',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        submitForm: function (data) {
            return $http
                .post(
                    '/forms/form/submit',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        createFolder: function (data) {
            return $http
                .post(
                    '/forms/folders/folder',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        updateForm: function (data) {
            return $http
                .put(
                    '/forms/form/update',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        updateFolder: function (data) {
            return $http
                .put(
                    '/forms/folders/folder/update',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        deleteForm: function (data) {
            return $http
                .post(
                    '/forms/form/delete',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        deleteFolder: function (data) {
            return $http
                .post(
                    '/forms/folders/folder/delete',
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
