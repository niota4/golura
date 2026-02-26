'use strict';

angular.module('ngCreds', [])
.factory('$cred', ['$q','$http',
function ($q, $http) {

    var creds = {};
    var config = {};
    var token = {};
    function setCreds(value) {
        creds = value;
    };
    function getCreds() {
        deferred.resolve(creds);
        return deferred.promise;
    };
    function setConfig(value) {
        config = value;
    };
    function getConfig() {
        return config;
    };

    function setToken(value) {
        token = value;
    };
    function getToken() {
        return token;
    };
    return {
        setCreds: setCreds,
        getCreds: getCreds,
        setConfig: setConfig,
        getConfig: getConfig,
        setToken: setToken,
        getToken: getToken
    }
}]);