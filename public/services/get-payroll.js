const { get } = require("lodash");

angular.module('ngPayrolls', [])
.factory(
    '$payroll', 
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
                createPayroll: function (data) {
                    return $http.post('/payrolls/payroll', data)
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
                getPayroll: function (data) {
                    return $http.post(
                        '/payrolls/payroll/get',
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
                getPayrolls: function (data) {
                    return $http.post('/payrolls', data)
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
                getCheckIns: function (data) {
                    return $http.post(
                        '/payrolls/checkins',
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
                getHoursFromCheckIns: function (data) {
                    return $http.post(
                        '/payrolls/payroll/user/hours',
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
                getPayStub: function (data) {
                    return $http.post(
                        '/payrolls/payroll/user/pay-stub',
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
                getDeductions: function (data) {
                    return $http.post(
                        '/payrolls/payroll/deductions',
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
                getPayStubsForPayroll: function (data) {
                    return $http.post(
                        '/payrolls/payroll/pay-stubs',
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
                updatePayroll: function (data) {
                    return $http.put(
                        '/payrolls/payroll/update', 
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
                updatePayrollItem: function (data) {
                    return $http.put(
                        '/payrolls/payroll-item/update', 
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
                updatePayrollDeduction: function (data) {
                    return $http.put(
                        '/payrolls/payroll-deduction/update', 
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
                archivePayroll: function (data) {
                    return $http.post(
                        '/payrolls/payroll/archive', 
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
                addPayrollItem: function (data) {
                    return $http.post('/payrolls/payroll-item', data)
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
                addPayrollDeduction: function (data) {
                    return $http.post(
                        '/payrolls/payroll-deduction',
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
                removePayrollItem: function (data) {
                    return $http.post(
                        '/payrolls/payroll-item/delete',
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
                removePayrollDeduction: function (data) {
                    return $http.post(
                        '/payrolls/payroll-deduction/delete',
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
                calculateTotals: function (data) {
                    return $http.post(
                        '/payrolls/payroll/calculate-totals',
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
                approvePayroll: function (data) {
                    return $http.post(
                        '/payrolls/payroll/approve',
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
                processPayroll: function (data) {
                    return $http.post(
                        '/payrolls/payroll/process',
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
                revertPayrollApproval: function (data) {
                    return $http.post(
                        '/payrolls/payroll/revert',
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
            };
        }
    ]
);
