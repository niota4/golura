'use strict';

angular.module('ngCommunications', [])
.factory('$communication', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {
        getTextMessage: function (data) {
            return $http
            .post(
                '/communications/text-messages/text-message/get', 
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(
                function (err) {
                    return err;
                }
            );
        },
        getEmail: function (data) {
            return $http
            .post(
                '/communications/emails/email/get', 
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(
                function (err) {
                    return err;
                }
            );
        },
        getTextMessages: function (data) {
            return $http
            .post(
                '/communications/text-messages', 
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(
                function (err) {
                    return err;
                }
            );
        },
        getEmails: function (data) {
            return $http
            .post(
                '/communications/emails', 
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(
                function (err) {
                    return err;
                }
            );
        },
        createTextMessage: function (data) {
            return $http
            .post(
                '/communications/text-messages/text-message', 
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(
                function (err) {
                    return err;
                }
            );
        },
        createEmail: function (data) {
            return $http
            .post(
                '/communications/emails/email', 
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(
                function (err) {
                    return err;
                }
            );
        },
        createCall: function (data) {
            return $http
            .post(
                '/communications/calls/call', 
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(
                function (err) {
                    return err;
                }
            );
        },
    }
}]);
