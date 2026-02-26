'use strict';

const { get } = require("lodash");

angular.module('ngWidgets', [])
.factory(
    '$widget', 
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

                getWidget: function (data) {
                    return $http.post(
                        '/widgets/widget/get',
                        data
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getWidgets: function () {
                    return $http.post('/widgets')
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getRoleWidgets: function () {
                    return $http.post('/widgets/roles')
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getEstimateWidgetData: function () {
                    return $http
                    .post('/widgets/widget/estimate-data')
                    .then(
                        function (response) {
                            return response.data;
                        }
                    )
                },
                generalSearch: function (d) {
                    return $http
                    .post(
                        '/widgets/widget/general-search',
                        d
                    )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    )
                },
                getSalesOverview: function (data) {
                    return $http.post('/widgets/widget/sales-overview', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getWorkOrdersSummary: function (data) {
                    return $http.post('/widgets/widget/work-orders-summary', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getClientInsights: function (data) {
                    return $http.post('/widgets/widget/client-insights', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getUpcomingEvents: function (data) {
                    return $http.post('/widgets/widget/upcoming-events', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getInvoiceStatus: function (data) {
                    return $http.post('/widgets/widget/invoice-status', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getActivityTimeline: function (data) {
                    return $http.post('/widgets/widget/activities', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getActivitySummary: function (data) {
                    return $http.post('/widgets/widget/activities/activity/summary', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getEstimateAnalytics: function (data) {
                    return $http.post('/widgets/widget/estimate-analytics', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getPayrollMonthlyWidget: function (data) {
                    return $http.post('/widgets/widget/payroll-monthly', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getPayrollMonthlyExpensesWidget: function (data) {
                    return $http.post('/widgets/widget/payroll-monthly-expenses', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                }
            }
        }
    ]
);