define([
    'app-controller',
    'moment',
], function (
    app,
    moment,
) {
    app.register.controller('PayrollController',
    function (
        $scope,
        $rootScope,
        $routeParams,
        $location,
        $window,
        $log,
        $q,
        $http,
        $cookies,
        $compile,
        $timeout,
        $interval,
        $user,
        $admin,
        $payroll,
        $media,
        $setup,
    ) {
        const urlParams = new URLSearchParams(window.location.search);
        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];
        $scope.page = $setup.getCurrentPage() || {};
        $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null);
        $scope.subPermissions = $setup.updateScopes($scope, $setup.getSubPages('payrolls'));
        $scope.company = {};
        $scope.payroll = {};
        $scope.payrollItem = {};
        $scope.payrollDeduction = {};
        $scope.employee = {};
        $scope.checkIn = {};
        $scope.user = {};
        $scope.total = {};
        $scope.payStub = {};
        $scope.payStubPreview = null;
        $scope.payStubUrl = null;
        $scope.search = {
            value: null,
            page: 1,
            limit: 100,
            count: null,
            total: null,
            pages: null,
            payrolls: '',
            payroll: ''
        };

        $scope.payrolls = [];
        $scope.payrollItems = [];
        $scope.payrollDeductions = [];
        $scope.employees = [];
        $scope.users = [];
        $scope.checkIns = [];
        $scope.activities = [];

        $scope.payrollStatuses = [
            { id: 'draft', name: 'Draft' },
            { id: 'approved', name: 'Approved' },
            { id: 'paid', name: 'Paid' }
        ],
        $scope.paymentMethods = [
            { id: 'direct_deposit', name: 'Direct Deposit' },
            { id: 'check', name: 'Check' },
            { id: 'cash', name: 'Cash' },
            { id: 'other', name: 'Other' }
        ];
        $scope.deductionTypes = [
            { id: 'fixed', name: 'Fixed Amount' },
            { id: 'percentage', name: 'Percentage' }
        ];

        $scope.UI = {
            currentUrl: window.location.pathname.split('/'),
            isMobile: $media.getMedia(),
            tab: urlParams.get('tab'),
            errMessage: null,
            message: null,
            date: null,
            step: 1,
            payrollApproval: false,
            payrollRevertConfirmation: false,
            dateChange: false,
            newPayroll: false,
            newPayrollItem: false,
            newPayrollDeduction: false,
            payrollLoaded: false,
            payrollsLoaded: false,
            payrollItemsLoaded: false,
            payrollDeductionsLoaded: false,
            employeesLoaded: false,
            checkInsLoaded: false,
            payrollActivitiesLoaded: false,
            payrollCommentsLoaded: false,
            usersLoaded: false,
            totalsLoaded: false,
            payrollItemLoaded: false,
            deductionLoaded: false,
            userDeductionsLoaded: false,
            loadingUserPayroll: false,
            createPayroll: false,
            createPayrollItem: false,
            createPayrollDeduction: false,
            showDraftPayrolls: false,
            addPayrollEmployee: false,
            countDown: 10,
            currentStep: 1,
            payrollDraft: false,
            today: new Date(),
            startDate: null,
            endDate: null,
            payPeriodType: 'weekly',
            autoCalculateHours: true,
            includeCheckIns: true,
        };

        $scope.initPayroll = function (payroll) {
            $scope.UI.payrollLoaded = false;
            $scope.UI.payrollActivitiesLoaded = false;
            $scope.UI.payrollCommentsLoaded = false;

            $scope.payroll = {};
            $scope.payrollItems = [];

            if (!payroll) {
                payroll = {
                    id: $routeParams.payrollId
                };
            }

            $q.all([
                $payroll.getPayroll(payroll),
                $user.getUsers(),
                $admin.getCompany(),
            ]).then(function (responses) {

                if (
                    responses[0].err ||
                    responses[1].err ||
                    responses[2].err
                ) {
                    $scope.initErrorMessage('Error loading payroll data');
                    return;
                }
                $scope.payroll = responses[0].payroll || {};
                $scope.users = responses[1].users || [];
                $scope.company = responses[2].company || {};

                $rootScope.UI.titleName = $scope.payroll.payrollNumber || 'Payroll';

                $scope.UI.payrollLoaded = true;
                $scope.UI.payrollActivitiesLoaded = true;
                $scope.UI.usersLoaded = true;

            }).catch(function (err) {
                $scope.initErrorMessage('Error loading payroll data');
            });
        };
        $scope.initPayrolls = function () {
            $scope.UI.payrollsLoaded = false;
            $scope.UI.employeesLoaded = false;
            $scope.UI.usersLoaded = false;

            $scope.payroll = {};
            $scope.payrolls = [];
            $scope.employees = [];
            $scope.users = [];

            // Check for date parameter and set date range
            const dateParam = urlParams.get('date');
            if (dateParam && moment(dateParam, 'YYYY-MM-DD', true).isValid()) {
                $scope.UI.date = moment(dateParam).format('YYYY-MM-DD');
            } else {
                $scope.UI.date = moment().format('YYYY-MM-DD');
            }

            // Set default pay period (current week)
            if (!$scope.UI.startDate) {
                $scope.UI.startDate = moment().startOf('month').toDate();
                $scope.UI.endDate = moment().endOf('month').toDate();
            }

            var data = {
                page: $scope.search.page || 1,
                limit: $scope.search.limit || 100,
                startDate: moment($scope.UI.startDate).format('YYYY-MM-DD'),
                endDate: moment($scope.UI.endDate).format('YYYY-MM-DD'),
                query: $scope.search.value || '',
                includeInactive: false
            };

            $q.all([
                $payroll.getPayrolls(data),
                $user.getUsers(),
                $admin.getCompany(),
                $scope.initCheckIns(data)
            ]).then(function (responses) {
                if (
                    responses[0].err ||
                    responses[1].err ||
                    responses[2].err ||
                    responses[3].err
                ) {
                    $scope.initErrorMessage('Error loading payrolls');
                    return;
                }
                
                // Handle the new response format from the backend
                $scope.payrolls = responses[0].payrolls.rows;
                $scope.search.total = responses[0].total || 0;
                $scope.search.pages = responses[0].pages || 0;
                $scope.search.count = $scope.payrolls.length;
                
                $scope.users = responses[1].data || [];
                $scope.employees = responses[1].data ? responses[1].data.filter(u => u.isEmployee) : [];
                $scope.company = responses[2].data || {};

                $scope.UI.payrollsLoaded = true;
                $scope.UI.employeesLoaded = true;
                $scope.UI.usersLoaded = true;
            }).catch(function (err) {
                $scope.initErrorMessage('Error loading payrolls');
            });
        };
        $scope.initCheckIns = function (data) {
            $scope.UI.checkInsLoaded = false;
            $scope.checkIns = [];

            return $payroll.getCheckIns(data)
            .then(function (response) {
                $scope.checkIns = response.data || [];
                $scope.UI.checkInsLoaded = true;
                return response;
            }).catch(function (err) {
                $scope.initErrorMessage('Error loading check-ins');
            });
        };
        $scope.initUserPayroll = function (payrollItem) {
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.userHoursLoaded = false;

            if (!payrollItem || !payrollItem.employeeId) {
                return;
            }

            // Prevent multiple simultaneous calls
            if ($scope.UI.loadingUserPayroll) {
                return;
            }
            $scope.UI.loadingUserPayroll = true;

            $q.all(
                [
                    $payroll.getHoursFromCheckIns({
                        userId: payrollItem.employeeId, 
                        startDate: $scope.payroll.startDate, 
                        endDate: $scope.payroll.endDate
                    }),
                    $user.getPayRates({ id: payrollItem.employeeId }),
                    $payroll.getDeductions({ employeeId: payrollItem.employeeId }),
                ]
            ).then(
                function (responses) {
                    $scope.UI.userHoursLoaded = true;
                    $scope.UI.loadingUserPayroll = false;
                    
                    if (
                        responses[0].err ||
                        responses[1].err ||
                        responses[2].err
                    ) {
                        $scope.initErrorMessage(responses[0].msg || 'Error updating check-ins');
                    } else {
                        // For new payroll items, use calculated values from check-ins
                        // For existing items, preserve the existing values unless they're 0
                        if (!payrollItem.id || payrollItem.regularHours === 0 || payrollItem.regularHours === '0') {
                            payrollItem.regularHours = responses[0].hours.regularHours || 0;
                        }
                        if (!payrollItem.id || payrollItem.overtimeHours === 0 || payrollItem.overtimeHours === '0') {
                            payrollItem.overtimeHours = responses[0].hours.overtimeHours || 0;
                        }
                        if (!payrollItem.id || payrollItem.totalHours === 0 || payrollItem.totalHours === '0') {
                            payrollItem.totalHours = responses[0].hours.totalHours || 0;
                        }
                        
                        // Only reset rates and pay if this is a new item
                        if (!payrollItem.id) {
                            payrollItem.rate = 0;
                            payrollItem.overtimeRate = 0;
                            payrollItem.netPay = 0;
                            payrollItem.grossPay = 0;
                        }
                        
                        payrollItem.payRates = responses[1].payRates || [];
                        payrollItem.deductions = responses[2].deductions || [];

                        // find primary pay rate for the user
                        const primaryRate = payrollItem.payRates.find(rate => rate.isPrimary) || {};

                        if (primaryRate) {
                            primaryRate.selected = true;
                            // check each deduction to see if its type is percentage or fixed and calculate value accordingly
                            payrollItem.deductions.forEach(deduction => {
                                if (deduction.type === 'percentage') {
                                    deduction.value = (payrollItem.grossPay * (parseFloat(deduction.value) || 0) / 100).toFixed(2);
                                } else {
                                    deduction.value = (parseFloat(deduction.value) || 0).toFixed(2);
                                }
                            });
                            payrollItem.deductionsTotal = payrollItem.deductions ? payrollItem.deductions.reduce(
                                (sum, d) => sum + parseFloat(d.value || 0), 0) : 0;
                            payrollItem.rate = primaryRate.rate ? parseFloat(primaryRate.rate).toFixed(2) : "0.00";
                            payrollItem.overtimeRate = primaryRate.overtimeRate ? parseFloat(primaryRate.overtimeRate).toFixed(2) : "0.00";
                            payrollItem.grossPay = (payrollItem.regularHours * parseFloat(payrollItem.rate)) +
                            (payrollItem.overtimeHours * parseFloat(payrollItem.overtimeRate));
                            payrollItem.netPay = payrollItem.grossPay - payrollItem.deductionsTotal;

                            if (payrollItem.netPay < 0) {
                                payrollItem.netPay = 0;
                            }

                        }
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.loadingUserPayroll = false;
                    $scope.initErrorMessage(err || 'Error updating check-ins');
                    $log.error('Update check-ins error:', err);
                }
            );
        };
        $scope.initUserDeductions = function (payrollDeduction) {
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.userDeductionsLoaded = false;

            if (!payrollDeduction || !payrollDeduction.employeeId) {
                $scope.initErrorMessage('Please select an employee to view deductions');
                return;
            }

            $payroll.getDeductions({ employeeId: payrollDeduction.employeeId })
            .then(
                function (response) {
                    $scope.UI.userDeductionsLoaded = true;
                    
                    if (response.err) {
                        $scope.initErrorMessage(response.msg || 'Error loading employee deductions');
                    } else {
                        $scope.payrollDeduction.existingDeductions = response.deductions || [];
                    }
                }
            ).catch(
                function (err) {
                    $scope.initErrorMessage(err || 'Error loading employee deductions');
                    $log.error('Load deductions error:', err);
                }
            );
        };
        $scope.initPayStub = function (payrollItem) {
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.userPayStubsLoaded = false;
            $scope.payStubPreview = null;

            if (!payrollItem) {
                payrollItem = {
                    id: $routeParams.payrollItemId,
                    employeeId: $routeParams.employeeId
                };
            }

            $q.all([
                $payroll.getPayStub({ id: payrollItem.id, employeeId: payrollItem.employeeId }),
                $setup.getCompany()
            ])
            .then(function (responses) {
                $scope.UI.userPayStubsLoaded = true;

                if (responses[0].err) {
                    $scope.initErrorMessage(responses[0].msg || 'Error loading user pay stub');
                    return;
                }

                $scope.payStub = responses[0].payStub || {};
                $scope.payStub.PaymentMethod = $scope.paymentMethods.find(method => method.id === $scope.payStub.paymentMethod);

                $log.log($scope.payStub);
                $scope.company = responses[1].company || {};
            })
            .catch(function (err) {
                $scope.initErrorMessage(err || 'Error loading user pay stub');
                $log.error('Load user pay stub error:', err);
            });
        };
        $scope.initStripeOnboardingCompletion = function () {
            $scope.UI.countDown = 10;

            $interval(
                function () {
                    $scope.UI.countDown -= 1;
                    if ($scope.UI.countDown <= 0) {
                        $interval.cancel();
                        $rootScope.goBack();
                    }
                }, 1000, 10
            )
        };
        $scope.initPayrollCreateForm = function (data) {
            $scope.UI.payrollForm = true;
            $scope.UI.newPayroll = true;

            if (data) {
                $scope.payroll = angular.copy(data);
            } else {
                $scope.payroll = {
                    startDate: null,
                    endDate: null,
                    status: 'draft',
                    payPeriodType: null,
                    autoCalculateHours: null
                };
            }

            $scope.UI.currentStep = 1;
        };
        $scope.initPayrollItemForm = function (payrollItem) {
            $scope.UI.newPayrollItem = true;

            if (payrollItem) {
                $scope.UI.newPayrollItem = false;
                $scope.payrollItem = angular.copy(payrollItem);
                
                // Parse and format numeric fields
                if (payrollItem.regularHours) {
                    $scope.payrollItem.regularHours = parseFloat(payrollItem.regularHours).toFixed(2);
                }
                if (payrollItem.overtimeHours) {
                    $scope.payrollItem.overtimeHours = parseFloat(payrollItem.overtimeHours).toFixed(2);
                }
                if (payrollItem.rate) {
                    $scope.payrollItem.rate = parseFloat(payrollItem.rate).toFixed(2);
                }
                if (payrollItem.overtimeRate) {
                    $scope.payrollItem.overtimeRate = parseFloat(payrollItem.overtimeRate).toFixed(2);
                }
                if (payrollItem.grossPay) {
                    $scope.payrollItem.grossPay = parseFloat(payrollItem.grossPay).toFixed(2);
                }
                if (payrollItem.netPay) {
                    $scope.payrollItem.netPay = parseFloat(payrollItem.netPay).toFixed(2);
                }
                if (payrollItem.deductions) {
                    $scope.payrollItem.deductions = parseFloat(payrollItem.deductions).toFixed(2);
                }
                
                // For existing items, show the form immediately
                $scope.UI.userHoursLoaded = true;

                $scope.initUserPayroll($scope.payrollItem);
            } else {
                $scope.payrollItem = {
                    payrollId: $scope.payroll.id,
                    totalHours: 0,
                    grossPay: 0,
                    deductions: 0,
                    netPay: 0,
                    regularHours: 0,
                    overtimeHours: 0,
                    rate: 0,
                    overtimeRate: 0,
                    employeeId: null,
                    paymentMethod: 'direct_deposit',
                    notes: ''
                };
            };
        };
        $scope.initPayrollDeductionForm = function (payrollDeduction) {
            $scope.UI.newPayrollDeduction = true;
            $scope.UI.usersLoaded = false;
            $scope.UI.userDeductionsLoaded = false;

            $scope.users = [];

            if (payrollDeduction) {
                $scope.UI.newPayrollDeduction = false;
                $scope.payrollDeduction = angular.copy(payrollDeduction);
                // Convert ISO date strings to MySQL date format for FlatPickr
                if ($scope.payrollDeduction.effectiveDate) {
                    const effectiveDate = new Date($scope.payrollDeduction.effectiveDate);
                    $scope.payrollDeduction.effectiveDate = effectiveDate.getFullYear() + '-' + 
                        String(effectiveDate.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(effectiveDate.getDate()).padStart(2, '0');
                }
                if ($scope.payrollDeduction.endDate) {
                    const endDate = new Date($scope.payrollDeduction.endDate);
                    $scope.payrollDeduction.endDate = endDate.getFullYear() + '-' + 
                        String(endDate.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(endDate.getDate()).padStart(2, '0');
                }
                $scope.UI.userDeductionsLoaded = true;
            } else {
                $scope.payrollDeduction = {
                    employeeId: null,
                    name: '',
                    type: 'fixed',
                    value: 0,
                    appliesTo: 'employee',
                    frequency: 'per_payroll',
                    effectiveDate: null,
                    endDate: null,
                    isActive: true,
                    notes: '',
                    existingDeductions: []
                };
            }

            $user.getUsers()
            .then(
                function (response) {
                    if (response.err) {
                        $scope.initErrorMessage(response.msg || 'Error loading employees');
                        return;
                    }
                    $scope.users = response.users || [];
                    $scope.UI.usersLoaded = true;
                }
            ).catch(
                function (err) {
                    $scope.initErrorMessage(err || 'Error loading employees');
                }
            );
        };
        $scope.initErrorMessage = function (msg) {
            $scope.UI.errMessage = msg;
            $timeout(function () {
                $scope.UI.errMessage = null;
            }, 5000);
        };
        $scope.initFormSaved = function (msg) {
            $scope.UI.message = msg;
            $timeout(function () {
                $scope.UI.message = null;
            }, 3000);
        };
        $scope.createPayroll = function (e, payroll) {
            e.preventDefault();

            if (!$scope.validatePayrollForm(payroll)) {
                return;
            }

            $payroll.createPayroll(payroll)
            .then(function (response) {
                if (response.err) {
                    $scope.initErrorMessage(response.msg || 'Error creating payroll');
                    return;
                }
                $location.path('/payroll/' + response.payroll.id);
            }).catch(function (err) {
                $scope.initErrorMessage('err || Error creating payroll');
            });
        };
        $scope.createPayrollDeduction = function (e, payrollDeduction) {
            e.preventDefault();

            $scope.UI.formSaving = true;

            $payroll.addPayrollDeduction(payrollDeduction)
            .then(
                function (response) {
                    if (response.err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(response.msg || 'Error creating payroll deduction');
                        return;
                    }
                    $scope.initFormSaved(response.msg || 'Payroll deduction created successfully');
                    $('#payrollDeductionFormReveal').foundation('close');
                }
            ).catch(
                function (err) {
                    $scope.initErrorMessage(err || 'Error creating payroll deduction');
                }
            );
        };
        $scope.createPayrollItem = function (e, payrollItem) {
            e.preventDefault();

            $payroll.addPayrollItem(payrollItem)
            .then(
                function (response) {
                    if (response.err) {
                        $scope.initErrorMessage(response.msg || 'Error adding employee to payroll');
                        return;
                    }
                    $scope.initFormSaved(response.msg);
                    // Reload the current payroll data instead of calling initPayroll recursively
                    if ($scope.payroll && $scope.payroll.id) {
                        $scope.initPayroll({ id: $scope.payroll.id });
                    }

                    $('#payrollItemFormReveal').foundation('close');
                }
            ).catch(
                function (err) {
                    $scope.initErrorMessage(err || 'Error adding employee to payroll');
                }
            );
        };
        $scope.updatePayroll = function (e, payroll) {
            e.preventDefault();

            if (!$scope.validatePayrollForm(payroll)) {
                return;
            }

            $payroll.updatePayroll(payroll)
            .then(function (response) {
                if (response.success) {
                    $scope.initFormSaved('Payroll updated successfully');
                    $scope.payroll = response.data;
                    $scope.UI.payrollForm = false;
                } else {
                    $scope.initErrorMessage(response.message || 'Error updating payroll');
                }
            }).catch(function (err) {
                $scope.initErrorMessage('Error updating payroll');
            });
        };
        $scope.updatePayrollDeduction = function (payrollDeduction) {

            $scope.UI.formSaving = true;

            $payroll.updatePayrollDeduction(payrollDeduction)
            .then(function (response) {
                if (response.err) {
                    $scope.initErrorMessage(response.msg || 'Error updating payroll deduction');
                    return;
                }
                $scope.initFormSaved('Payroll deduction updated successfully');
                $('#payrollDeductionFormReveal').foundation('close');
            
            }).catch(function (err) {
                $scope.initErrorMessage('Error updating payroll deduction');
            });
        };
        $scope.updatePayrollItem = function (payrollItem) {

            $payroll.updatePayrollItem(payrollItem)
            .then(function (response) {
                if (response.err) {
                    $scope.initErrorMessage(response.msg || 'Error updating employee hours');
                    return;
                }
                $scope.initFormSaved('Employee hours updated successfully');
                $scope.payrollItem = response.data;
                // Reload the current payroll data instead of calling initPayroll recursively
                if ($scope.payroll && $scope.payroll.id) {
                    $scope.initPayroll({ id: $scope.payroll.id });
                }
                $('#payrollItemFormReveal').foundation('close');
            }).catch(function (err) {
                $scope.initErrorMessage('Error updating employee hours');
            });
        };
        $scope.updateSelectedPayRate = function (payRate) {
            if (payRate.selected) {
                // Deselect all other pay rates
                $scope.payrollItem.payRates.forEach(rate => {
                    if (rate.id !== payRate.id) {
                        rate.selected = false;
                    }
                });
            } else {
                payRate.selected = true; // Ensure at least one is selected
            }
            $scope.payrollItem.rate = parseFloat(payRate.rate).toFixed(2) || 0;
            $scope.payrollItem.overtimeRate = parseFloat(payRate.overtimeRate).toFixed(2) || 0;
            $scope.calculatePayrollItemTotals($scope.payrollItem);
        };
        $scope.printPayStub = function (payStub) {
            if (!payStub || !payStub.PayrollItem.id) {
                $scope.initErrorMessage('Please select a pay stub to print');
                return;
            }
            
            // Check if a PDF URL exists
            if (payStub.PayrollItem.payStubUrl) {
                // Open the PDF in a new window/tab for printing
                var printWindow = $window.open(payStub.PayrollItem.payStubUrl, '_blank');
                
                // Optional: Focus the new window and trigger print dialog
                if (printWindow) {
                    printWindow.focus();
                    // Some browsers block automatic print dialog, so this might not work
                    printWindow.onload = function() {
                        printWindow.print();
                    };
                }
            } else {
                // Fallback to the preview mode if no PDF URL exists
                $scope.UI.payStubPreview = true;
            }
        };
        $scope.archivePayroll = function (payroll) {
            if (!payroll) {
                payroll = $scope.payroll;
            }
            
            if (!$scope.UI.payrollDeleteConfirmation) {
                $scope.UI.payrollDeleteConfirmation = true;
                return;
            }

            var data = {
                id: payroll.id
            };

            $payroll.archivePayroll(data)
            .then(function (response) {
                if (response.success) {
                    $scope.initFormSaved('Payroll archived successfully');
                    $location.path('/payrolls');
                } else {
                    $scope.initErrorMessage(response.message || 'Error archiving payroll');
                }
            }).catch(function (err) {
                $scope.initErrorMessage('Error archiving payroll');
            });
        };
        $scope.removePayrollDeduction = function (payrollDeduction) {

            var data = {
                id: payrollDeduction.id
            };

            $payroll.removePayrollDeduction(data)
            .then(function (response) {
                if (response.err) {
                    $scope.initErrorMessage(response.msg || 'Error removing payroll deduction');
                    return;
                }
                $scope.initFormSaved(response.msg || 'Payroll deduction removed successfully');
                var index = $scope.payrollDeduction.existingDeductions.findIndex(d => d.id === payrollDeduction.id);
                if (index !== -1) {
                    $scope.payrollDeduction.existingDeductions.splice(index, 1);
                }
            }).catch(function (err) {
                $scope.initErrorMessage('Error removing payroll deduction');
                $log.error('Remove payroll deduction error:', err);
            });
        };
        $scope.removePayrollItem = function (payrollItem) {

            var data = {
                id: payrollItem.id
            };

            $payroll.removePayrollItem(data)
            .then(function (response) {
                if (response.err) {
                    $scope.initErrorMessage(response.msg || 'Error removing employee from payroll');
                    return;
                }
                $scope.initFormSaved('Employee removed from payroll successfully');
                // Reload the current payroll data instead of calling initPayroll recursively
                if ($scope.payroll && $scope.payroll.id) {
                    $scope.initPayroll({ id: $scope.payroll.id });
                }

            }).catch(function (err) {
                $scope.initErrorMessage('Error removing employee from payroll');
                $log.error('Remove payroll item error:', err);
            });
        };
        $scope.approvePayroll = function (e, payroll) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            $scope.UI.payrollApproval = true;
            $scope.UI.errorMessage = null;
            $scope.message = null;
            
            $('#payrollApprovalFormReveal').foundation('close');

            var data = {
                id: payroll.id,
                processDate: payroll.processDate,
            };
            $payroll.approvePayroll(data)
            .then(function (response) {
                $scope.UI.payrollApproval = false;
                $scope.UI.formSaving = false;
                if (response.err) {
                    $scope.initErrorMessage(response.msg || 'Error approving payroll');
                    return;
                }
                $scope.initFormSaved(response.msg || 'Payroll approved successfully');
                $scope.initPayroll(payroll);
            }).catch(function (err) {
                $scope.UI.payrollApproval = false;
                $scope.UI.formSaving = false;
                $scope.initErrorMessage(err || 'Error approving payroll');
            });
        };
        $scope.processPayroll = function (payroll) {
            $scope.UI.formSaving = true;
            $scope.UI.errorMessage = null;
            $scope.message = null;
            $scope.UI.payrollProcessing = true;

            if (!payroll) {
                payroll = $scope.payroll;
            };

            $payroll.processPayroll({id: payroll.id})
            .then(function (response) {
                $scope.UI.payrollProcessing = false;
                $scope.UI.formSaving = false;


                if (response.err) {
                    $scope.initErrorMessage(response.message || 'Error processing payroll');
                    return;
                };
                $scope.initFormSaved(response.msg || 'Payroll processed successfully');
                $scope.initPayroll(payroll);
            }).catch(function (err) {
                $scope.initErrorMessage(err || 'Error processing payroll');
            });
        };
        $scope.revertPayroll = function (payroll) {
            $scope.UI.formSaving = true;
            $scope.UI.errorMessage = null;
            $scope.message = null;

            $payroll.revertPayrollApproval({id: payroll.id})
            .then(function (response) {
                $scope.UI.formSaving = false;
                $scope.UI.payrollRevertConfirmation = false;
                if (response.err) {
                    $scope.initErrorMessage(response.msg || 'Error reverting payroll');
                    return;
                }
                $scope.initFormSaved('Payroll reverted successfully');
                $scope.initPayroll(payroll);
            }).catch(function (err) {
                $scope.initErrorMessage(err || 'Error reverting payroll');
            });
        };
        $scope.calculatePayrollItemTotals = function (payrollItem) {
            const rate = parseFloat(payrollItem.rate) || 0;
            const overtimeRate = parseFloat(payrollItem.overtimeRate) || 0;
            const regularHours = parseFloat(payrollItem.regularHours) || 0;
            const overtimeHours = parseFloat(payrollItem.overtimeHours) || 0;
            
            payrollItem.grossPay = (regularHours * rate) + (overtimeHours * overtimeRate);
            // Recalculate deductions based on new gross pay
            payrollItem.deductionsTotal = payrollItem.deductions ? payrollItem.deductions.reduce(
                (sum, d) => {
                    if (d.type === 'percentage') {
                        d.value = (payrollItem.grossPay * (parseFloat(d.value) || 0) / 100).toFixed(2);
                    } else {
                        d.value = (parseFloat(d.value) || 0).toFixed(2);
                    }
                    return sum + parseFloat(d.value || 0);
                }, 0) : 0;
            payrollItem.netPay = payrollItem.grossPay - payrollItem.deductionsTotal;

            if (payrollItem.netPay < 0) {
                payrollItem.netPay = 0;
            };
        };
        $scope.validatePayrollForm = function (payroll) {
            if (!payroll.startDate) {
                return false;
            }

            if (!payroll.endDate) {
                return false;
            }

            if (moment(payroll.startDate).isAfter(moment(payroll.endDate))) {
                return false;
            }
            return true;
        };
    })
});
