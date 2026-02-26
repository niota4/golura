angular.module('ngAi', [])
.factory('$ai', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {
        getEstimateAnalysis: function (data) {
            return $http
            .post(
                '/ai/estimates/estimate/analyze',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        getEstimateDetails: function (data) {
            return $http
            .post(
                '/ai/estimates/estimate/details',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        getEstimateChatBot: function (data) {
            return $http
            .post(
                '/ai/estimates/estimate/chatbot',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        generateEstimate: function (data) {
            return $http
            .post(
                '/ai/estimates/estimate/generate',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        analyzeEstimatorRequirements: function (data) {
            return $http
            .post(
                '/ai/estimators/analyze-requirements',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
    }
}]);