'use strict';

angular.module('ngActivities', [])
.factory('$activity', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {
        getClientActivities: function (data) {
            return $http
                .post(
                    '/activities/clients/client',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        getEventActivities: function (data) {
            return $http
                .post(
                    '/activities/events/event',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        getEstimateActivities: function (data) {
            return $http
                .post(
                    '/activities/estimates/estimate',
                    data
                )
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
        getWorkOrderActivities: function (data) {
            return $http
                .post(
                    '/activities/work-orders/work-order',
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