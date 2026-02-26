angular.module('ngReports', [])
.factory(
    '$report', 
    [
        '$rootScope',
        '$http', 
        '$cookies', 
        '$log', 
        '$window',
        function (
            $rootScope, 
            $http, 
            $cookies, 
            $log, 
            $window
        ) {

            return {


                getReport: function (data) {
                    return $http.post(
                        '/reports/report/get',
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
                getReports: function (data) {
                    return $http.post(
                    '/reports',
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
                getReportsTypes: function (data) {
                    return $http.post(
                    '/reports/types',
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
                generateReport: function (data) {
                    return $http.post(
                        '/reports/generate',
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
                }
            };
        }
    ]
);