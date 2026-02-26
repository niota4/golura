'use strict';

angular.module('ngMedia', [])
.factory('$media', ['$q','$http', '$window',
function ($q, $http, $window) {
    return {
        getMedia: function () {
            var width = window.innerWidth;
            var isMobile = false;

            // iPhone retina, Android Galaxy, and similar high-density screens
            // Typical breakpoints: < 600px = mobile, 600-1024 = tablet, >1024 = desktop
            if (width <= 600) {
                isMobile = true; // Most phones, including retina/galaxy
            } else if (width > 600 && width <= 1024) {
                isMobile = true; // Tablet, treat as non-mobile for layout
            } else {
                isMobile = false; // Desktop
            }

            return isMobile;
        },
        getPhoto: function (data) {
            return $http
            .post(
                '/media/photos/photo',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
        },
        getPhotoByUrl: function (data) {
            return $http
            .post(
                '/media/photos/photo/url',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
        },
        getVideo: function (data) {
            return $http
            .post(
                '/media/videos/video',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
        },
        getDocument: function (data) {
            return $http
            .post(
                '/media/documents/document',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
        },
        associatePhoto: function (data) {
            return $http
            .post(
                '/media/associate/photo',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
        },
        associateVideo: function (data) {
            return $http
            .post(
                '/media/associate/video',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
        },
        associateDocument: function (data) {
            return $http
            .post(
                '/media/associate/document',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
        },
        deletePhoto: function(data) {
            return $http
            .post(
                '/media/photos/photo/delete',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            );
        },
        deletePhotos: function(data) {
            return $http
            .post(
                '/media/photos/delete',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            );
        },
        deleteVideo: function(data) {
            return $http
            .post(
                '/media/videos/video/delete',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            );
        },
        deleteVideos: function(data) {
            return $http
            .post(
                '/media/videos/delete',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            );
        },
        deleteDocument: function(data) {
            return $http
            .post(
                '/media/documents/document/delete',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            );
        },
        deleteDocuments: function(data) {
            return $http
            .post(
                '/media/documents/delete',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            );
        },

    }
}]);