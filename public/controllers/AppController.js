define( function () {

    const app = angular.module('goluraApplication',
    [
        'colorpicker',
        'angular-inview',
        'ngRoute',
        'ngCookies',
        'ngFlatPickr',
        'ngFullTextArea',
        'ngPhoneNumber',
        'ngRichTextEditor',
        'ngPasswordStrength',
        'ngSanitize',
        'ngAnimate',
        'ngMask',
        'ngSelectize',
        'ngImages',
        'ngDocuments',
        'ngVideos',
        'ngUsers',
        'ngActivities',
        'ngAi',
        'ngComments',
        'ngChats',
        'ngAdmin',
        'ngClients',
        'ngEvents',
        'ngInventory',
        'ngWorkOrders',
        'ngInvoices',
        'ngWidgets',
        'ngEstimates',
        'ngEstimators',
        'ngPayments',
        'ngPayrolls',
        'ngReports',
        'ngForms',
        'ngToDos',
        'ngCommunications',
        'ngMedia',
        'ngSetup',
        'ngUserIcon',
        'ngWeather',
        'ngAddressLookup',
        'ngAddressMap',
        'ngAddressesFormat',
        'ngAiFormat',
        'ngPhoneNumbersFormat',
        'ngNumberFormat',
        'ngVariableFormat', 
        'ngClientsFormat',
        'ngCommentsFormat',
        'ngMessagesFormat',
        'ngNotificationsFormat',
        'ngEventsFormat',
        'ngUsersFormat',
        'ngImageUploader',
        'ngDocumentUploader',
        'ngVideoUploader',
        'ngImporterUploader',
        'ngUserOnboarding',
    ]);
    app.config([
        '$routeProvider', 
        '$controllerProvider',
        '$locationProvider',
        '$compileProvider',
        '$provide',
        function (
            $routeProvider, 
            $controllerProvider, 
            $locationProvider, 
            $compileProvider,
            $provide
        ) {
            
            $locationProvider
            .html5Mode({ enabled: true, requireBase: false })
            .hashPrefix('');
            
            $compileProvider
            .debugInfoEnabled(false)
            .commentDirectivesEnabled(false)
            .cssClassDirectivesEnabled(false);
            app.register = {
                controller: $controllerProvider.register,
                factory: $provide.factory
            };
            
            $routeProvider
            .when('/', {
                templateUrl: 'dist/views/home.html', 
                controller: 'HomeController',
                resolve: resolveController(['dist/controllers/HomeController'])
            })
            $routeProvider
            .when('/admin-settings', {
                templateUrl: 'dist/views/admin.html', 
                controller: 'AdminController',
                resolve: resolveController(['dist/controllers/AdminController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/admin-settings/groups', {
                redirectTo: function () {
                    return '/admin?tab=group';
                }
            })
            $routeProvider
            .when('/admin-settings/variables', {
                templateUrl: 'dist/partials/admin/variables.html', 
                controller: 'AdminController',
                resolve: resolveController(['dist/controllers/AdminController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/admin-settings/archived/events', {
                templateUrl: 'dist/partials/archived/events.html', 
                controller: 'AdminController',
                resolve: resolveController(['dist/controllers/AdminController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/admin-settings/estimator/:estimatorId', {
                templateUrl: 'dist/partials/admin/view-estimator.html', 
                controller: 'AdminController',
                resolve: resolveController(['dist/controllers/AdminController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/admin-settings/estimator/containers/container/:containerId', {
                templateUrl: 'dist/partials/admin/view-question-container.html', 
                controller: 'AdminController',
                resolve: resolveController(['dist/controllers/AdminController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/admin-settings/archived/clients', {
                templateUrl: 'dist/partials/archived/clients.html', 
                controller: 'AdminController',
                resolve: resolveController(['dist/controllers/AdminController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/admin-settings/archived/estimates', {
                templateUrl: 'dist/partials/archived/estimates.html', 
                controller: 'AdminController',
                resolve: resolveController(['dist/controllers/AdminController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/admin-settings/archived/users', {
                templateUrl: 'dist/partials/archived/users.html', 
                controller: 'AdminController',
                resolve: resolveController(['dist/controllers/AdminController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/dashboard', {
                templateUrl: 'dist/views/dashboard.html', 
                controller: 'DashboardController',
                resolve: resolveController(['dist/controllers/DashboardController'])
            })
            $routeProvider
            .when('/chats', {
                templateUrl: 'dist/views/chats.html', 
                controller: 'ChatsController',
                resolve: resolveController(['dist/controllers/ChatsController'])
            })
            $routeProvider
            .when('/chats/chat/:chatRoomId', {
                templateUrl: 'dist/views/chats.html', 
                controller: 'ChatsController',
                resolve: resolveController(['dist/controllers/ChatsController'])
            })
            $routeProvider
            .when('/clients', {
                templateUrl: 'dist/views/clients.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController'])
            })
            $routeProvider
            .when('/clients/client', {
                templateUrl: 'dist/forms/clients/client-create-form.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/clients/client/:clientId', {
                templateUrl: 'dist/partials/clients/view.html',
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/clients/client/:clientId/edit', {
                templateUrl: 'dist/forms/clients/client-form.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/clients/client/:clientId/activity', {
                templateUrl: 'dist/partials/clients/activity.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/clients/client/:clientId/contact', {
                templateUrl: 'dist/partials/clients/contact.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/clients/client/:clientId/photos', {
                templateUrl: 'dist/partials/clients/photos.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/clients/client/:clientId/documents', {
                templateUrl: 'dist/partials/clients/documents.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/clients/client/:clientId/videos', {
                templateUrl: 'dist/partials/clients/videos.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/clients/client/:clientId/events', {
                templateUrl: 'dist/partials/clients/events.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/clients/client/:clientId/estimates', {
                templateUrl: 'dist/partials/clients/estimates.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/clients/client/:clientId/work-orders', {
                templateUrl: 'dist/partials/clients/work-orders.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/clients/client/:clientId/invoices', {
                templateUrl: 'dist/partials/clients/invoices.html', 
                controller: 'ClientsController',
                resolve: resolveController(['dist/controllers/ClientsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/company/setup', {
                templateUrl: 'dist/forms/admin/company-setup-form.html', 
                controller: 'AdminController',
                resolve: resolveController(['dist/controllers/AdminController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/estimates', {
                templateUrl: 'dist/views/estimates.html', 
                controller: 'EstimatesController',
                resolve: resolveController(['dist/controllers/EstimatesController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/estimates/estimate/:estimateId', {
                templateUrl: 'dist/partials/estimates/view.html', 
                controller: 'EstimatesController',
                resolve: resolveController(['dist/controllers/EstimatesController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/estimates/estimate/:estimateId/activity', {
                templateUrl: 'dist/partials/estimates/activity.html', 
                controller: 'EstimatesController',
                resolve: resolveController(['dist/controllers/EstimatesController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/estimates/estimate/:estimateId/edit', {
                templateUrl: 'dist/forms/estimates/estimate-form.html', 
                controller: 'EstimatesController',
                resolve: resolveController(['dist/controllers/EstimatesController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/estimates/line-items', {
                templateUrl: 'dist/partials/estimates/line-items.html', 
                controller: 'EstimatesController',
                resolve: resolveController(['dist/controllers/EstimatesController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/estimates/line-items/line-item', {
                templateUrl: 'dist/forms/estimates/line-item-form.html', 
                controller: 'EstimatesController',
                resolve: resolveController(['dist/controllers/EstimatesController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/estimates/line-items/line-item/:id', {
                templateUrl: 'dist/forms/estimates/line-item-form.html', 
                controller: 'EstimatesController',
                resolve: resolveController(['dist/controllers/EstimatesController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/estimates/estimator/:estimatorId', {
                templateUrl: 'dist/partials/estimators/run.html', 
                controller: 'EstimatorController',
                resolve: resolveController(['dist/controllers/EstimatorController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/events', {
                templateUrl: 'dist/views/events.html', 
                controller: 'EventsController',
                resolve: resolveController(['dist/controllers/EventsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/events/map', {
                templateUrl: 'dist/partials/events/map-calendar.html', 
                controller: 'EventsController',
                resolve: resolveController(['dist/controllers/EventsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/events/event/:eventId/edit', {
                templateUrl: 'dist/forms/events/event-form.html', 
                controller: 'EventsController',
                resolve: resolveController(['dist/controllers/EventsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/events/event/:eventId', {
                templateUrl: 'dist/partials/events/view.html',
                controller: 'EventsController',
                resolve: resolveController(['dist/controllers/EventsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/events/event/:eventId/activity', {
                templateUrl: 'dist/partials/events/activity.html', 
                controller: 'EventsController',
                resolve: resolveController(['dist/controllers/EventsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/events/event/:eventId/photos', {
                templateUrl: 'dist/partials/events/photos.html', 
                controller: 'EventsController',
                resolve: resolveController(['dist/controllers/EventsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/events/event/:eventId/documents', {
                templateUrl: 'dist/partials/events/documents.html', 
                controller: 'EventsController',
                resolve: resolveController(['dist/controllers/EventsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/events/event/:eventId/videos', {
                templateUrl: 'dist/partials/events/videos.html', 
                controller: 'EventsController',
                resolve: resolveController(['dist/controllers/EventsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/events/event/:eventId/estimates', {
                templateUrl: 'dist/partials/events/estimates.html', 
                controller: 'EventsController',
                resolve: resolveController(['dist/controllers/EventsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/events/event/:eventId/work-order', {
                templateUrl: 'dist/partials/events/work-order.html', 
                controller: 'EventsController',
                resolve: resolveController(['dist/controllers/EventsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/events/event/:eventId/invoice', {
                templateUrl: 'dist/partials/events/invoice.html', 
                controller: 'EventsController',
                resolve: resolveController(['dist/controllers/EventsController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/inventory', {
                templateUrl: 'dist/views/inventory.html',
                controller: 'InventoryController',
                resolve: resolveController(['dist/controllers/InventoryController']),
                reloadOnUrl: false
            });
            $routeProvider
            .when('/inventory/items', {
                templateUrl: 'dist/partials/inventory/items.html',
                controller: 'InventoryController',
                resolve: resolveController(['dist/controllers/InventoryController']),
            }); 
            $routeProvider
            .when('/inventory/items/item', {
                templateUrl: 'dist/forms/inventory/item-form.html',
                controller: 'InventoryController',
                resolve: resolveController(['dist/controllers/InventoryController']),
            }); 
            $routeProvider
            .when('/inventory/items/item/:itemId/edit', {
                templateUrl: 'dist/forms/inventory/item-form.html',
                controller: 'InventoryController',
                resolve: resolveController(['dist/controllers/InventoryController']),
            }); 
            $routeProvider
            .when('/inventory/warehouses/warehouse/:warehouseId', {
                templateUrl: 'dist/partials/inventory/view-warehouse.html',
                controller: 'InventoryController',
                resolve: resolveController(['dist/controllers/InventoryController'])
            });
            $routeProvider
            .when('/inventory/warehouses/warehouse', {
                templateUrl: 'dist/forms/inventory/warehouse-form.html',
                controller: 'InventoryController',
                resolve: resolveController(['dist/controllers/InventoryController'])
            });
            $routeProvider
            .when('/inventory/warehouses/warehouse/:warehouseId/edit', {
                templateUrl: 'dist/forms/inventory/warehouse-form.html',
                controller: 'InventoryController',
                resolve: resolveController(['dist/controllers/InventoryController'])
            });
            $routeProvider
            .when('/inventory/vendors/vendor/:vendorId', {
                templateUrl: 'dist/partials/inventory/view-vendor.html',
                controller: 'InventoryController',
                resolve: resolveController(['dist/controllers/InventoryController'])
            });
            $routeProvider
            .when('/invoices', {
                templateUrl: 'dist/views/invoices.html',
                controller: 'InvoiceController',
                resolve: resolveController(['dist/controllers/InvoiceController'])
            });
            $routeProvider
            .when('/invoices/invoice', {
                templateUrl: 'dist/forms/invoices/invoice-form.html', 
                controller: 'InvoiceController',
                resolve: resolveController(['dist/controllers/InvoiceController'])
            });
            $routeProvider
            .when('/invoices/invoice/:invoiceId', {
                templateUrl: 'dist/partials/invoices/view.html',
                controller: 'InvoiceController',
                resolve: resolveController(['dist/controllers/InvoiceController'])
            });
            $routeProvider
            .when('/invoices/invoice/:invoiceId/edit', {
                templateUrl: 'dist/forms/invoices/invoice-form.html', 
                controller: 'InvoiceController',
                resolve: resolveController(['dist/controllers/InvoiceController'])
            });
            $routeProvider
            .when('/payments/pay', {
                templateUrl: 'dist/forms/payments/payment-form.html',
                controller: 'PaymentsController',
                resolve: resolveController(['dist/controllers/PaymentsController'])
            });
            $routeProvider
            .when('/payments/bank-transfer', {
                templateUrl: 'dist/forms/payments/payment-bank-transfer-form.html',
                controller: 'PaymentsController',
                resolve: resolveController(['dist/controllers/PaymentsController'])
            });
            $routeProvider
            .when('/payroll', {
                templateUrl: 'dist/views/payroll.html',
                controller: 'PayrollController',
                resolve: resolveController(['dist/controllers/PayrollController'])
            });
            $routeProvider
            .when('/payroll/:payrollId', {
                templateUrl: 'dist/partials/payroll/view.html',
                controller: 'PayrollController',
                resolve: resolveController(['dist/controllers/PayrollController'])
            });
            $routeProvider
            .when('/payroll/pay-stub/:payrollItemId', {
                templateUrl: 'dist/partials/payroll/paystub.html',
                controller: 'PayrollController',
                resolve: resolveController(['dist/controllers/PayrollController'])
            });
            $routeProvider
            .when('/payroll/stripe/completion', {
                templateUrl: 'dist/partials/payroll/stripe-onboard-completion-screen.html',
                controller: 'PayrollController',
                resolve: resolveController(['dist/controllers/PayrollController'])
            });
            $routeProvider
            .when('/reports', {
                templateUrl: 'dist/views/reports.html', 
                controller: 'ReportsController',
                resolve: resolveController(['dist/controllers/ReportsController']),
            });
            $routeProvider
            .when('/reports/report/:reportId', {
                templateUrl: 'dist/partials/reports/view.html', 
                controller: 'ReportsController',
                resolve: resolveController(['dist/controllers/ReportsController']),
            });
            $routeProvider
            .when('/users', {
                templateUrl: 'dist/views/users.html', 
                controller: 'UsersController',
                resolve: resolveController(['dist/controllers/UsersController']),
            })
            $routeProvider
            .when('/users/user', {
                templateUrl: 'dist/forms/users/user-create-form.html', 
                controller: 'UsersController',
                resolve: resolveController(['dist/controllers/UsersController'])
            })
            $routeProvider
            .when('/users/user/setup', {
                templateUrl: 'dist/forms/users/user-setup-form.html', 
                controller: 'UsersController',
                resolve: resolveController(['dist/controllers/UsersController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/users/user/password-reset', {
                templateUrl: 'dist/forms/users/user-password-reset-form.html', 
                controller: 'UsersController',
                resolve: resolveController(['dist/controllers/UsersController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/users/user/:userId', {
                templateUrl: 'dist/partials/users/view.html', 
                controller: 'UsersController',
                resolve: resolveController(['dist/controllers/UsersController'])
            })
            $routeProvider
            .when('/users/user/:userId/edit', {
                templateUrl: 'dist/forms/users/user-form.html', 
                controller: 'UsersController',
                resolve: resolveController(['dist/controllers/UsersController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/users/user/:userId/estimates', {
                templateUrl: 'dist/partials/users/estimates.html',
                controller: 'UsersController',
                resolve: resolveController(['dist/controllers/UsersController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/users/user/:userId/events', {
                templateUrl: 'dist/partials/users/events.html',
                controller: 'UsersController',
                resolve: resolveController(['dist/controllers/UsersController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/users/user/:userId/drive', {
                templateUrl: 'dist/partials/users/drive.html',
                controller: 'UsersController',
                resolve: resolveController(['dist/controllers/UsersController'])
            })
            $routeProvider
            .when('/users/user/:userId/pay-stub/:paystubId', {
                templateUrl: 'dist/partials/payroll/paystub.html',
                controller: 'UsersController',
                resolve: resolveController(['dist/controllers/UsersController']),
                reloadOnUrl: false
            })
            $routeProvider
            .when('/work-orders', {
                templateUrl: 'dist/views/work-orders.html',
                controller: 'WorkOrderController',
                resolve: resolveController(['dist/controllers/WorkOrderController']),
                reloadOnUrl: false
            });
            $routeProvider
            .when('/work-orders/work-order', {
                templateUrl: 'dist/forms/work-orders/work-order-form.html',
                controller: 'WorkOrderController',
                resolve: resolveController(['dist/controllers/WorkOrderController'])
            });
            $routeProvider
            .when('/work-orders/work-order/:workOrderId', {
                templateUrl: 'dist/partials/work-orders/view.html',
                controller: 'WorkOrderController',
                resolve: resolveController(['dist/controllers/WorkOrderController'])
            });
            $routeProvider
            .when('/work-orders/work-order/:workOrderId/edit', {
                templateUrl: 'dist/forms/work-orders/work-order-form.html',
                controller: 'WorkOrderController',
                resolve: resolveController(['dist/controllers/WorkOrderController'])
            });
            $routeProvider
            .when('/work-orders/work-order/:workOrderId/activity', {
                templateUrl: 'dist/partials/work-orders/activity.html',
                controller: 'WorkOrderController',
                resolve: resolveController(['dist/controllers/WorkOrderController'])
            });
            $routeProvider
            .when('/work-orders/work-order/purchase-orders/purchase-order/:purchaseOrderId', {
                templateUrl: 'dist/partials/work-orders/purchase-order.html',
                controller: 'WorkOrderController',
                resolve: resolveController(['dist/controllers/WorkOrderController'])
            });
            // Default route
            $routeProvider
            .otherwise({
                templateUrl: 'dist/views/four-zero-four.html',
                controller: 'NavigationController',
            });
            $provide
            .factory('httpInterceptor', function ($q, $rootScope) {
                return {
                    responseError: function (rejection) {
                        if (rejection.status === 404 && ['POST', 'PUT', 'DELETE'].includes(rejection.config.method)) {
                            $rootScope.checkForErrors();

                            $rootScope.$broadcast('fourZeroFour'); // Broadcast the 404 event
                        }
                        return $q.reject(rejection);
                    }
                };
            });            
        }]
    )
    .run(function($rootScope, $window) {
        var windowElement = angular.element($window);

        $rootScope.$on('$viewContentLoaded', function () {
            $(document).foundation();
        });
    });
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['goluraApplication']);
    });
    app.factory('authInterceptor', function($rootScope, $window, $cookies) {
        return {
            request: function(config) {
                // First try to get user from cookies (new approach)
                var user = $cookies.getObject('goluraUser');

                // Fallback to localStorage for backward compatibility
                if (!user) {
                    user = angular.fromJson($window.localStorage.getItem('goluraUser'));
                }
                
                var pendingUser = angular.fromJson($window.localStorage.getItem('goluraPendingUser'));
                var token = $window.localStorage.getItem('goluraToken');
                if (user && user.token) {
                    config.headers.Authorization = 'Bearer ' + user.token;
                } else if (pendingUser && pendingUser.token) {
                    config.headers.Authorization = 'Bearer ' + pendingUser.token;
                } else if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            },
            responseError: function(response) {
                if (response.status === 401) {
                    // Watch for $rootScope.UI.elementsUpdated to become true
                    var unwatch = $rootScope.$watch(
                        function() { return $rootScope.UI && $rootScope.UI.elementsUpdated; },
                        function(newValue) {
                            if (newValue === true) {
                                $rootScope.$broadcast('userTimedOut');
                                // Stop watching after the event is triggered
                                unwatch();
                            }
                        }
                    );
                }
                return response; // Return the response, even if not handled here
            }
        };
    });
    app.config(function($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
        $httpProvider.interceptors.push('httpInterceptor');
    });
    const resolveController = function (controllers) {
        return {
            load: ['$q', '$rootScope', function ($q, $rootScope) {
                var defer = $q.defer();
                require(controllers, function () {
                    defer.resolve();
                    $rootScope.$apply();
                });
                return defer.promise;
            }]
        }
    };
    const capitalize = function (str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    app.filter('TimeAgoFormat', 
        function () {
        return function (mysqlDatetime) {
            if (!mysqlDatetime) return 'N/A';
    
            const now = new Date();
            const parsedDate = new Date(mysqlDatetime); // Convert MySQL datetime to JS date
    
            // Calculate difference in seconds
            const diffInSeconds = Math.floor((now - parsedDate) / 1000);
    
            if (diffInSeconds < 60) {
                // Seconds ago
                return diffInSeconds === 1 ? '1 second ago' : `${diffInSeconds} seconds ago`;
            } else if (diffInSeconds < 3600) {
                // Minutes ago
                const minutes = Math.floor(diffInSeconds / 60);
                return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
            } else if (diffInSeconds < 86400) {
                // Hours ago
                const hours = Math.floor(diffInSeconds / 3600);
                return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
            } else if (diffInSeconds < 2592000) {
                // Days ago
                const days = Math.floor(diffInSeconds / 86400);
                return days === 1 ? '1 day ago' : `${days} days ago`;
            } else if (diffInSeconds < 31536000) {
                // Months ago
                const months = Math.floor(diffInSeconds / 2592000);
                return months === 1 ? '1 month ago' : `${months} months ago`;
            } else {
                // Years ago
                const years = Math.floor(diffInSeconds / 31536000);
                return years === 1 ? '1 year ago' : `${years} years ago`;
            }
        };
        }
    );    
    app.filter('DateTimeFormat', 
        function () {

            return function(d) {
                if (!d) {
                    return 'N/A'
                }
                var date = new Date(d);
                var today = new Date();
                var day = date.getDate();
                var month = date.toLocaleString('default', { month: 'short' });
                var year = date.getFullYear();
                var datetime
                if (date.getFullYear() < 2000) {
                    year = date.setFullYear(date.getFullYear() + 100);

                };
                datetime = month + 
                ' ' +
                day +
                ', ' + 
                year
                if (date.getFullYear() == today.getFullYear()) {
                    datetime =  month + 
                    ' ' +
                    day
                }
                if (date.getDate() == today.getDate()) {
                    datetime = date.toLocaleString(
                        'en-US', 
                        { 
                            hour: 'numeric', 
                            minute: 'numeric', 
                            hour12: true }
                        )
                }
                return datetime;
            };
        }
    );
    app.filter('EventDateFormat', 
        function () {

            return function(d) {
                var date = new Date(d);
                var day = date.getDate();
                var month = date.toLocaleString('default', { month: 'short' });
                var year = date.getFullYear();
                var datetime = null;


                var time = date.toLocaleString(
                    'en-US', 
                    { 
                        hour: 'numeric', 
                        minute: 'numeric'
                    }
                )

                if (date.getFullYear() < 2000) {
                    year = date.setFullYear(date.getFullYear() + 100);

                };
                datetime = time +
                ' ' +
                month + 
                ' ' +
                day +
                ', ' +
                year;
                
                return datetime;
            };
        }
    );
    app.filter('PhoneNumberDecorator', 
        function () {

            return function(string) {
                var number = string.replace(
                    /(\d{3})(\d{3})(\d{4})/, 
                    '($1) $2-$3'
                );
                return number;
            }
        }
    );
    app.filter('Operator', 
        [
            '$setup', 
            function($setup) {
        var operators = $setup.getOperators();
    
        return function(operator) {
            if (!operator) {
                return operator;
            }
    
            let operatorName = '';
            for (let i = 0; i < operators.length; i++) {
                if (operators[i].value === operator) {
                    operatorName = operators[i].name;
                    break;
                }
            }
            return operatorName || operator;
        };
            }
        ]
    );
    app.filter('ByteFormat', 
        function() {
            return function(bytes, decimals) {
                if (bytes === 0) return '0 B';
                if (!bytes) return '';

                const k = 1024; // Kilobyte unit
                const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
                const dm = decimals || 0; // Default to 2 decimal places

                const i = Math.floor(Math.log(bytes) / Math.log(k));

                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
            };
        }
    );
    app.filter('TimeFormat', 
        function () {
            return function (input) {
                if (isNaN(input) || input < 0) return input; // Return the input if it's not a valid number
        
                // Convert input to a number
                const totalSeconds = Math.floor(input);
                const fractionalSeconds = input - totalSeconds;
        
                // Calculate hours, minutes, and seconds
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60 + Math.round(fractionalSeconds * 1000) / 1000;
        
                // Format the result
                if (hours > 0) {
                return `${hours} hrs ${minutes} mins`;
                } else if (minutes > 0) {
                return `${minutes} mins ${seconds.toFixed()} secs`;
                } else {
                return `${seconds.toFixed()} secs`;
                }
            };
        }
    );
    app.filter('SanitizeName', 
        function() {
            return function(input) {
                if (!input) return 'default';
                return input.replace(/\//g, '-');
            };
        }
    );
    app.filter('formatCamelCase', 
        function() {
            return function(input) {
                if (!input) return '';
                return input
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, function(str) { 
                        return str.toUpperCase(); 
                    })
                    .trim();
            };
        }
    );
    app.filter('formatPhoneNumber', function() {
    return function(phoneNumber) {
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            return phoneNumber;
        }
        
        // Remove non-numeric characters
        var cleaned = phoneNumber.replace(/\D/g, '');
        
        // Handle numbers starting with +1 (country code)
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            // Remove the leading '1' and format the remaining 10 digits
            cleaned = cleaned.slice(1);
        }
        
        // Format the cleaned number
        if (cleaned.length === 10) {
            return '(' + cleaned.slice(0, 3) + ') ' + cleaned.slice(3, 6) + '-' + cleaned.slice(6);
        }
        
        return phoneNumber; // Return unformatted if not 10 digits
    };
});
    app.controller('NavigationController',
    function (
        $scope, 
        $rootScope,
        $routeParams,
        $route,
        $location,
        $log,
        $window,
        $timeout,
        $compile,
        $user,
        $widget,
        $media,
        $setup,
        $q,
        $sce
    ) {
        const urlParams = new URLSearchParams(window.location.search);

        // Only set user from cookie if not already set (to avoid overwriting during login)
        if (!$rootScope.user) {
            $rootScope.user = $user.getUserFromCookie() || null;
        }
        $rootScope.routeHistory = JSON.parse(localStorage.getItem('routeHistory')) || [];
        $rootScope.page = $setup.getCurrentPage();
        $rootScope.preferences = {};
        $rootScope.currentLocation = {};

        $rootScope.location = null;

        $scope.total = {};
        $scope.weather = {};


        $rootScope.permissions = [];
        $rootScope.pages = [];
        $rootScope.userPages = [];
        $rootScope.pages = [];
        $rootScope.subscribedPages = [];
        $rootScope.counts = [];
        $rootScope.notifications = [];
        $rootScope.reminders = [];
        $rootScope.onboarding = [];
        $rootScope.states = [];
        
        

        $scope.notifications = [];
        $scope.readNotifications = [];
        $scope.reminderTypes = [];

        $scope.search = {
            value: null,
            page: null,
            limit: null,
            count: null,
            total: null
        };

        $scope.general = {};
        $scope.reminder = {};

        $scope.UI = {
            formSaving: false,
            message: null,
            errMessage: null,
            selectReminders: false,
            selectNotifications: false,
            pastReminders: false,
        };
        $rootScope.UI = {
            id: null,
            isMobile: $media.getMedia(),
            notificationMsg: null,
            mainUrl: null,
            subUrl: null,
            mainTitle: null,
            subTitle: null,
            titleName: null,
            currentUrl: null,
            sideBar: false,
            loginAttempt: false,
            loginError: false,
            timedOut: false,
            weatherTimeout: null,
            pageProgress: 0,
            pageLoading: false,
            permissionDenied: false,
            fourZeroFour: false,
            sideBarMinimize: false,
            generalSearchLoaded: false,
            weatherLoaded: false,
            weatherFormLoaded: false,
            remindersLoaded: false,
            notificationsLoaded: false,
            locationLoading: false,
            elementsUpdated: false,
            refresh: false,
            formSaving: false,
            message: null,
            errMessage: null,
            weatherErrMessage: null,
        };

        $scope.initNavigation = function () {
            require(
                ['sockets'], 
                function (io) {
                    var homePagePath = '/';
                    var baseUrl = $location.$$protocol + '://' + $location.$$host;
                    var currentPath = $location.path();

                    angular.element($window).on('resize', $scope.updateIsMobile);

                    if (!$rootScope.user || !$rootScope.user.id || Object.keys($rootScope.user).length === 0) {
                        
                        // Ensure UI flags are properly set for unauthenticated users
                        $rootScope.UI.permissionDenied = false;
                        $rootScope.UI.fourZeroFour = false;
                        
                        // Only redirect if not already on allowed paths
                        if (
                            currentPath !== homePagePath &&
                            currentPath !== '/users/user/setup' &&
                            currentPath !== '/users/user/password-reset' &&
                            currentPath !== '/company/setup'

                        ) {
                            // Use Angular routing instead of forcing page reload
                            $location.path('/');
                        }
                        // Force apply scope changes to ensure UI updates
                        try {
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                        } catch (e) {
                            $log.error('Error applying scope:', e);
                        }
                        return;
                    } else {
                        $rootScope.user.loggedIn = true;
                        $q.all(
                            [
                                $user.getPermissions(),
                                $user.getPreferences(),
                                $user.getPages(),
                                $setup.getPages(),
                                $user.getCounts(),
                                $setup.getCompany(),
                                $user.getReminders(),
                                $setup.getSubscription(),
                                $user.getOnboarding(),
                            ]
                        )
                        .then(
                            function (responses) {
                                if (
                                    responses[0].unauthorized &&
                                    responses[0].msg == 'Invalid token'

                                ) {
                                    $user.removeUser();
                                }
                                if (
                                    !responses[0].err &&
                                    !responses[1].err &&
                                    !responses[2].err &&
                                    !responses[3].err &&
                                    !responses[4].err &&
                                    !responses[5].err &&
                                    !responses[6].err &&
                                    !responses[8].err

                                ) {
                                    $rootScope.permissions = responses[0].permissions;
                                    $rootScope.preferences = responses[1].preferences;
                                    $rootScope.userPages = responses[2].pages;
                                    $rootScope.pages = responses[3].pages;
                                    $rootScope.counts = responses[4].counts;
                                    $rootScope.company = responses[5].company;
                                    $scope.reminderTypes = responses[6].reminderTypes;
                                    $rootScope.onboarding = responses[8].onboarding;
                                    
                                    // Handle subscription data (responses[7] and [8])
                                    if (responses[7] && !responses[7].err) {
                                        $rootScope.subscription = responses[7].subscription;
                                        $rootScope.subscriptionUsage = responses[7].usage;
                                    } else {
                                        $rootScope.subscription = null;
                                        $rootScope.subscriptionUsage = {};
                                    }
                                    // Filter pages based on subscription features
                                    if ($rootScope.pages && $rootScope.subscription) {
                                        $rootScope.subscribedPages = $scope.filterPagesBySubscription($rootScope.pages);
                                        
                                    } else {
                                        $rootScope.subscribedPages = $rootScope.pages || [];
                                    }
                                    
                                    $scope.initCompanyTheme();

                                    // Smart socket connection URL logic for all environments
                                    const currentHost = $location.host();
                                    const currentPort = $location.port();
                                    const currentProtocol = $location.protocol();
                                    
                                    // Environment-aware socket connection
                                    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
                                        if (currentPort === 6500) {
                                            // Development: frontend on 6500, backend on 6250
                                            baseUrl = `${currentProtocol}://localhost:6250`;
                                        } else {
                                            // Development: same port for both
                                            baseUrl = `${currentProtocol}://${currentHost}:${currentPort}`;
                                        }
                                    } else {
                                        // Production with subdomains: always connect to backend port 6250
                                        // Check if we're on a subdomain of golura.net
                                        if (currentHost.endsWith('.golura.net') || currentHost === 'golura.net') {
                                            baseUrl = `${currentProtocol}://${currentHost}:6250`;
                                        } else {
                                            // Other production environments: use the same host/port as the current page
                                            baseUrl = `${currentProtocol}://${currentHost}${currentPort ? ':' + currentPort : ''}`;
                                        }
                                    }
                                    
                                    // Prevent multiple socket connections
                                    if ($rootScope.socket) {
                                        return; // Socket already exists, don't create another
                                    }
                                    
                                    const socket = io(
                                        baseUrl,
                                        {
                                            transports: ['websocket'],
                                            upgrade: false,
                                            query: {
                                                id: $scope.user.id
                                            },
                                            reconnection: false,
                                            rejectUnauthorized: false
                                        }
                                    );
                                    
                                    // Store socket in rootScope to prevent multiple connections
                                    $rootScope.socket = socket;
                                    
                                    socket.on(
                                        'connect', 
                                        function () {

                                            socket.on(
                                                'updateUserStatus', 
                                                function (onlineUsers) {
                                                }
                                            );
                                            socket.on(
                                                'updateCount', 
                                                function (data) {
                                                    const type = data.type;
                                                    switch (type) {
                                                        case 'notification':
                                                            $rootScope.counts.notificationCount = data.count;
                                                            $scope.initNotifications();
                                                        break;
                                                    }
                                                    $timeout(
                                                        function () {
                                                            $scope.$apply();
                                                        }
                                                    )
                                                }
                                            );
                                            socket.on(
                                                'updateReminder', 
                                                function (data) {
                                                    $rootScope.$broadcast('updateReminder', data);
                                                    $timeout(
                                                        function () {
                                                            $scope.$apply();
                                                        }
                                                    )
                                                }
                                            );
                                            socket.on(
                                                'updateChatRoomCount',
                                                function (data) {
                                                    $rootScope.$broadcast('updateChatRoomCount', data);
                                                    $timeout(
                                                        function () {
                                                            $scope.$apply();
                                                        }
                                                    )
                                                }
                                            );
                                            socket.on(
                                                'newMessage',
                                                function (data) {
                                                    $rootScope.$broadcast('newMessage', data);
                                                    $timeout(
                                                        function () {
                                                            $scope.$apply();
                                                        }
                                                    )
                                                }
                                            )
                                            socket.on(
                                                'chatTyping',
                                                function (data) {
                                                    $rootScope.$broadcast('chatTyping', data);
                                                    $timeout(
                                                        function () {
                                                            $scope.$apply();
                                                        }
                                                    )
                                                }
                                            );
                                            socket.on(
                                                'chatStopTyping',
                                                function (data) {
                                                    $rootScope.$broadcast('chatStopTyping', data);
                                                    $timeout(
                                                        function () {
                                                            $scope.$apply();
                                                        }
                                                    )
                                                }
                                            );
                                            socket.on(
                                                'permissionDenied', 
                                                function (data) {
                                                    $rootScope.UI.permissionDenied = true;
                                                }
                                            );
                                            socket.on(
                                                'logOut',
                                                function () {
                                                    $scope.logOut();
                                                }
                                            );

                                            $rootScope.$on('userChatTyping', function (e, data) {
                                                socket.emit('chatTyping', {
                                                    chatRoomId: parseInt(data.chatRoomId),
                                                    userId: $rootScope.user.id,
                                                });
                                            });
                                            $rootScope.$on('userChatStopTyping', function (e, data) {
                                                socket.emit('chatStopTyping', {
                                                    chatRoomId: parseInt(data.chatRoomId),
                                                    userId: $rootScope.user.id,
                                                });
                                            });
                                            $scope.user = $rootScope.user;
                                            $scope.$watch(
                                                'search.value', 
                                                function(newVal, oldVal) {
                                                    if (newVal !== oldVal) {
                                                        $scope.search.page = 1;
                                                        $scope.searchGeneral();
                                                    }
                                                }
                                            );
                                            $rootScope.$watch('preferences.realTimeActivityUpdates', function(newValue, oldValue) {
                                                
                                                socket.off('updateActivities');
                                                
                                                if (newValue === true) {
                                                    socket.on('updateActivities', function (data) {
                                                        $rootScope.$broadcast('updateActivities', data);
                                                        $timeout(function () {
                                                            $scope.$apply();
                                                        });
                                                    });
                                                }
                                            });
                                            $user.setUser($scope.user);
                                            $user.setPages($rootScope.userPages);
                                            $user.setPermissions($rootScope.permissions);
                                            
                                            if ($scope.UI.refresh) {
                                                window.location.reload();
                                            }
                                            $(document).foundation();
                                        }   
                                    );
                                };
                                if ($rootScope.preferences.darkMode) {
                                    document.documentElement.setAttribute('data-theme', 'dark');
                                    $window.localStorage.setItem('theme', 'dark');
                                }
                            }
                        );
                    };
                }
            );
        };
        $scope.initMobileNavigation = function () {
            const mobileNavigationDiv = $('#mobileNavigationReveal');
            if (mobileNavigationDiv.length) {
                mobileNavigationDiv.remove();
            }
            const modalHtml = `
                <div 
                    class="mobile-navigation-reveal reveal"
                    id="mobileNavigationReveal"
                    data-reveal
                    data-close-on-click="false"
                >
                    <div class="mobile-navigation">
                        <button 
                            class="mobile-navigation-close-button close-button" 
                            aria-label="closeMobileNavigationReveal" 
                            type="button" 
                            data-close
                        >
                            <span aria-hidden="true">
                                <i class="fal fa-times-circle"></i>
                            </span>
                        </button>
                        <div
                            ng-class="{'golura-block': true, 'mobile-navigation-side-bar': true}"
                            ng-include="'dist/navigations/navigation-side-bar.html'"
                        ></div>
                        <div class="side-bar-log-out-button-container">
                            <button 
                                class="side-bar-log-out-button log-out-button button alert white-text expanded" 
                                ng-click="logOut()"
                                type="button"
                                aria-label="sideBarLogOutButton" 
                                data-close
                            >
                                <i class="fal fa-sign-out-alt"></i> Log Out
                            </button>
                        </div>
                    </div>
                </div>
            `
            $('body').append(modalHtml);

            const compiledElement = angular.element($('#mobileNavigationReveal'));
            $compile(compiledElement)($scope);

            // Initialize the Foundation modal
            const mobileNavigation = new Foundation.Reveal($('#mobileNavigationReveal'));
            mobileNavigation.open();
        };
        $scope.initWeather = function () {
            $scope.UI.weatherLoaded = false;
            $scope.UI.weatherErrMessage = null;
            
            const currentTime = new Date();
            const defaultIp = '173.166.164.121';
            let location = $rootScope.preferences.defaultLocation || {
                ip: defaultIp // Default IP address for location lookup
            };

            $rootScope.weather = angular.fromJson($window.localStorage.getItem('goluraWeather') || null);

            if ($rootScope.weather && $rootScope.weather.lastUpdated) {
                // Check if the weather data is older than 5 minutes
                const lastUpdatedTime = new Date($rootScope.weather.lastUpdated);
                const timeDifference = (currentTime - lastUpdatedTime) / 1000; // Convert to seconds

                if (timeDifference < 300) {
                    // Use cached weather data if it's less than 5 minutes old
                    $rootScope.UI.weatherLoaded = true;
                    return;
                }
            }
            if (!location) {
                // ask the user for their location through HTML5
                location = $user.getUserLocation();

                if (!location) {
                    location = { ip: defaultIp };
                }  
                $scope.updateWeather(location); 
            } else {
                $scope.updateWeather(location);
            };    
        };
        $scope.initCompanyTheme = function() {
            
            // Guard clause: exit early if company data isn't available
            if (!$rootScope.company) {
                return;
            }
            
            const root = document.documentElement;
            // Helper functions for color manipulation
            const lightenColor = function(color, percent) {
                const num = parseInt(color.replace("#", ""), 16);
                const amt = Math.round(2.55 * percent);
                const R = Math.min(255, (num >> 16) + amt);
                const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
                const B = Math.min(255, (num & 0x0000FF) + amt);
                return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
            };
            
            const darkenColor = function(color, percent) {
                const num = parseInt(color.replace("#", ""), 16);
                const amt = Math.round(2.55 * percent);
                const R = Math.max(0, (num >> 16) - amt);
                const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
                const B = Math.max(0, (num & 0x0000FF) - amt);
                return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
            };
            
            // Apply company colors as CSS variables if they exist
            if ($rootScope.company.primaryColor) {
                root.style.setProperty('--primary-color', $rootScope.company.primaryColor);
                root.style.setProperty('--anchor-color', $rootScope.company.primaryColor);
                
                // Generate and set all primary color variations
                const primaryLight = lightenColor($rootScope.company.primaryColor, 15);
                const primaryDark = darkenColor($rootScope.company.primaryColor, 15);
                const primaryLight10 = lightenColor($rootScope.company.primaryColor, 10);
                const primaryLight20 = lightenColor($rootScope.company.primaryColor, 20);
                const primaryLight40 = lightenColor($rootScope.company.primaryColor, 40);
                const primaryLight45 = lightenColor($rootScope.company.primaryColor, 45);
                const primaryDark10 = darkenColor($rootScope.company.primaryColor, 10);
                
                root.style.setProperty('--primary-color-light', primaryLight);
                root.style.setProperty('--primary-color-dark', primaryDark);
                root.style.setProperty('--primary-color-light-10', primaryLight10);
                root.style.setProperty('--primary-color-light-20', primaryLight20);
                root.style.setProperty('--primary-color-light-40', primaryLight40);
                root.style.setProperty('--primary-color-light-45', primaryLight45);
                root.style.setProperty('--primary-color-dark-10', primaryDark10);
            }
            if ($rootScope.company.secondaryColor) {
                root.style.setProperty('--secondary-color', $rootScope.company.secondaryColor);
                
                // Generate and set all secondary color variations
                const secondaryLight = lightenColor($rootScope.company.secondaryColor, 15);
                const secondaryDark = darkenColor($rootScope.company.secondaryColor, 15);
                const secondaryLight15 = lightenColor($rootScope.company.secondaryColor, 15);
                const secondaryLight20 = lightenColor($rootScope.company.secondaryColor, 20);
                
                root.style.setProperty('--secondary-color-light', secondaryLight);
                root.style.setProperty('--secondary-color-dark', secondaryDark);
                root.style.setProperty('--secondary-color-light-15', secondaryLight15);
                root.style.setProperty('--secondary-color-light-20', secondaryLight20);
            }
            if ($rootScope.company.tertiaryColor) {
                root.style.setProperty('--tertiary-color', $rootScope.company.tertiaryColor);
                
                // Generate and set tertiary color variations
                const tertiaryLight = lightenColor($rootScope.company.tertiaryColor, 15);
                const tertiaryDark = darkenColor($rootScope.company.tertiaryColor, 15);
                root.style.setProperty('--tertiary-color-light', tertiaryLight);
                root.style.setProperty('--tertiary-color-dark', tertiaryDark);
            }
            
            // Apply company logo as favicon
            if ($rootScope.company.logoUrl) {
                $scope.setFavicon($rootScope.company.logoUrl);
            }
        };
        $scope.initUserPreferences = function () {
            // Check if the modal already exists to avoid duplication
            if ($('#userPreferencesFormModal').length === 0) {
                // Create the modal content with ng-include
                const modalHtml = `
                    <div 
                        class="user-preferences-reveal reveal" 
                        id="userPreferencesFormModal" 
                        data-reveal 
                        data-close-on-click="false"
                    >
                        <button 
                            class="close-button" 
                            aria-label="closeUserPreferencesFormModal" 
                            type="button" 
                            data-close
                        >
                            <span aria-hidden="true">
                                <i class="fal fa-times-circle"></i>
                            </span>
                        </button>
                        <div ng-include="'dist/forms/users/user-preferences-form.html'"></div>
                    </div>
                `;
    
                // Append the modal HTML to the body
                $('body').append(modalHtml);
    
                // Compile the HTML to bind AngularJS directives
                const compiledElement = angular.element($('#userPreferencesFormModal'));
                $compile(compiledElement)($scope);
    
                // Initialize the Foundation modal
                const userPreferencesModal = new Foundation.Reveal($('#userPreferencesFormModal'));
    
                // Open the modal
                userPreferencesModal.open();
            } else {
                // Open the existing modal if it's already present
                const userPreferencesModal = new Foundation.Reveal($('#userPreferencesFormModal'));
                userPreferencesModal.open();
            }
            $('#sideBarNavigationOffCanvas').foundation('close');
        };
        $scope.initUserReminders = function () {
            $scope.UI.message = null;
            $scope.UI.errMessage = null;
            $scope.UI.formSaving = false;
            $scope.UI.selectReminders = false;
            $scope.reminders = [];

            // Check if the modal already exists to avoid duplication
            if ($('#userRemindersModal').length === 0) {
                // Create the modal content with ng-include
                const modalHtml = `
                    <div 
                        class="user-upcoming-reminders-reveal reveal large" 
                        id="userUpcomingRemindersModal" 
                        data-reveal 
                        data-close-on-click="false"
                    >
                        <button 
                            class="close-button" 
                            aria-label="closeUserRemindersModal" 
                            type="button" 
                            data-close
                        >
                            <span aria-hidden="true">
                                <i class="fal fa-times-circle"></i>
                            </span>
                        </button>
                        <div 
                            class="golura-block"
                            ng-include="'dist/partials/users/upcoming-reminders.html'"
                        ></div>
                    </div>
                `;
                $('body').append(modalHtml);
    
                // Compile the HTML to bind AngularJS directives
                const compiledElement = angular.element($('#userUpcomingRemindersModal'));
                $compile(compiledElement)($scope);

                // Initialize the Foundation modal
                const reminderModal = new Foundation.Reveal($('#userUpcomingRemindersModal'));

                // Open the modal
                reminderModal.open();
            } else {
                // Open the existing modal if it's already present
                const reminderModal = new Foundation.Reveal($('#userUpcomingRemindersModal'));
                reminderModal.open();
            }
            $scope.initReminders()
            $('#sideBarNavigationOffCanvas').foundation('close');
        };
        $scope.initSideBarReadNotifications = function () {
            // Check if the modal already exists to avoid duplication
            if ($('#navigationSideBarReadNotificationsReveal').length === 0) {
                // Create the modal content with ng-include
                const modalHtml = `
                    <div 
                        class="navigation-side-bar-read-notifications-reveal reveal"
                        id="navigationSideBarReadNotificationsReveal"
                        data-reveal
                        data-close-on-click="false"
                    >
                        <button 
                            class="close-button" 
                            aria-label="closeNavigationSideBarReadNotificationsReveal" 
                            type="button" 
                            data-close
                        >
                            <span aria-hidden="true">
                                <i class="fal fa-times-circle"></i>
                            </span>
                        </button>
                        <div 
                            class="golura-block"
                            ng-include="'dist/partials/general/read-notifications.html'"
                        ></div>
                    </div>
                `;
                // Append the modal HTML to the body
                $('body').append(modalHtml);
    
                // Compile the HTML to bind AngularJS directives
                const compiledElement = angular.element($('#navigationSideBarReadNotificationsReveal'));
                $compile(compiledElement)($scope);
    
                // Initialize the Foundation modal
                const sideBarReadNotificationsReveal = new Foundation.Reveal($('#navigationSideBarReadNotificationsReveal'));
    
                // Open the modal
                sideBarReadNotificationsReveal.open();
            } else {
                // Open the existing modal if it's already present
                const sideBarReadNotificationsReveal = new Foundation.Reveal($('#navigationSideBarReadNotificationsReveal'));
                sideBarReadNotificationsReveal.open();
            }
            $user.getReadNotifications()
            .then(
                function (response) {
                    $scope.readNotifications = response.notifications;
                }
            );
            $('#notificationsOffCanvas').foundation('close');
        }; 
        $scope.initNotifications = function () {
            $scope.UI.notificationsLoaded = false;
            $rootScope.notifications = [];
            $scope.UI.message = null;
            $scope.UI.errMessage = null;
            $scope.UI.selectNotifications = false;
            $scope.UI.formSaving = false;

            $q.all(
                [
                    $user.getNotifications(),
                    $user.getReadNotifications(),
                    $user.getUsers(),
                ]
            )
            .then(
                function (responses) {
                    if (
                        responses[0].err &&
                        responses[1].errc&&
                        responses[2].err

                    ) {
                        return;
                    };
                    $scope.UI.notificationsLoaded = true;
                    $rootScope.notifications = responses[0].notifications;
                    $scope.readNotifications = responses[1].notifications;
                    $scope.notifications = responses[0].notifications;
                    $scope.users = responses[2].users;

                    $timeout(
                        function () {
                            $scope.$apply();
                        }
                    );
                }
            )

        };
        $scope.initReminders = function () {
            $scope.UI.remindersLoaded = false;
            $rootScope.reminders = [];
            $user.getReminders()
            .then(
                function (response) {
                    // Calculate the time ten minutes before the current time
                    const tenMinutesBefore = new Date(new Date().getTime() - 10 * 60000);
                    
                    if (response.err) {
                        return;
                    };
                    $scope.UI.remindersLoaded = true;
                    $rootScope.reminders = response.reminders;

                    $scope.reminders = response.reminders.filter(reminder => {
                        const reminderTime = new Date(reminder.date);
                        return reminderTime > tenMinutesBefore;
                    });
                }
            ).catch(
                function (error) {
                    $rootScope.UI.errMessage = error;
                }
            );
        };    
        $scope.initWeatherOptions = function () {
            $scope.UI.weatherLoaded = false;
            $scope.UI.weatherErrMessage = null;


            // Check if the modal already exists to avoid duplication
            if ($('#weatherOptionsModal').length === 0) {
                // Create the modal content with ng-include
                const modalHtml = `
                    <div 
                        class="weather-options-reveal reveal large" 
                        id="weatherOptionsModal" 
                        data-reveal 
                        data-close-on-click="false"
                    >
                        <button 
                            class="close-button" 
                            aria-label="closeWeatherOptionsModal" 
                            type="button" 
                            data-close
                        >
                            <span aria-hidden="true">
                                <i class="fal fa-times-circle"></i>
                            </span>
                        </button>
                        <div ng-include="'dist/forms/users/user-weather-options-form.html'"></div>
                    </div>
                `;
                $('body').append(modalHtml);
    
                // Compile the HTML to bind AngularJS directives
                const compiledElement = angular.element($('#weatherOptionsModal'));
                $compile(compiledElement)($scope);

                // Initialize the Foundation modal
                const weatherOptionsModal = new Foundation.Reveal($('#weatherOptionsModal'));

                // Open the modal
                weatherOptionsModal.open();
            } else {
                // Open the existing modal if it's already present
                const weatherOptionsModal = new Foundation.Reveal($('#weatherOptionsModal'));
                weatherOptionsModal.open();
            }
            $rootScope.UI.weatherFormLoaded = true;
            $('#sideBarNavigationOffCanvas').foundation('close');
            $('#weatherOptionsModal').on(
                'closed.zf.reveal', 
                function () {
                    $rootScope.UI.weatherFormLoaded = false;
                }
            );
        };
        $scope.initReminderForm = function () {
            $scope.reminder = {};
            $scope.reminderTypes = [];
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            // Check if the modal already exists to avoid duplication
            if ($('#reminderFormModal').length === 0) {
                // Create the modal content with ng-include
                const modalHtml = `
                    <div 
                        class="reminder-reveal reveal" 
                        id="reminderFormModal" 
                        data-reveal 
                        data-close-on-click="false"
                    >
                        <button 
                            class="close-button" 
                            aria-label="closeReminderFormModal" 
                            type="button" 
                            data-close
                        >
                            <span aria-hidden="true">
                                <i class="fal fa-times-circle"></i>
                            </span>
                        </button>
                        <div 
                            class="callout sticky text-center fade"
                            ng-class="{'success success-text': UI.message,
                            'alert alert-text': UI.errMessage}"
                            ng-hide="!UI.message.length &&
                            !UI.errMessage.length"
                        >
                            <p ng-if="UI.message.length">
                                {{UI.message}}
                            </p>
                            <p ng-if="UI.errMessage.length">
                                {{UI.errMessage}}
                            </p>
                        </div>  
                        <div ng-include="'dist/forms/users/user-reminder-form.html'"></div>
                    </div>
                `;
                $('body').append(modalHtml);
    
                // Compile the HTML to bind AngularJS directives
                const compiledElement = angular.element($('#reminderFormModal'));
                $compile(compiledElement)($scope);

                // Initialize the Foundation modal
                const reminderModal = new Foundation.Reveal($('#reminderFormModal'));

                // Open the modal
                reminderModal.open();

            } else {
                // Open the existing modal if it's already present
                const reminderModal = new Foundation.Reveal($('#reminderFormModal'));
                reminderModal.open();
            };
            $('#userUpcomingRemindersModal').foundation('close');

            $setup.getReminderTypes()
            .then(
                function (response) {
                    if (response.err) {
                        return;
                    };
                    $scope.reminderTypes = response.reminderTypes;
                }
            );
        }     
        $scope.initFormSaved = function (msg) {
            $rootScope.UI.formSaved = true;
            $rootScope.UI.message = msg;
            
            $timeout(
                function () {
                    $rootScope.UI.message = null;
                    $rootScope.UI.formSaved = false;
                }, 3000
            );
        };
        $scope.initErrorMessage = function (msg) {
            $rootScope.UI.errMessage = msg;

            $timeout(
                function () {
                    $rootScope.UI.errMessage = null;
                }, 3000
            );
        };
        $scope.createUserReminder = function (e, reminder) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.formSaving = true;

            reminder.userId = $rootScope.user.id;

            // Map the selected reminder type IDs
            reminder.reminderTypes = $scope.reminderTypes
                .filter(rt => rt.selected)
                .map(rt => rt.id);

            $user.createReminder(reminder)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {

                        // Reset the reminder types to unselect all
                        $scope.reminderTypes.forEach(rt => rt.selected = false);
    
                        $scope.initReminders();
                        $scope.initFormSaved(response.msg || 'Reminder created successfully');

                        $('#reminderFormModal').foundation('close');
                    } else {
                        $rootScope.UI.errMessage = response.msg || 'An error occurred creating reminder';
                        return;
                    }
                }
            ).catch(
                function (error) {
                    $scope.UI.formSaving = false;
                    $rootScope.UI.errMessage = error || 'An error occurred creating reminder';
                }
            );
        };
        $scope.updateNavigationSideBarToggle = function () {
            $rootScope.preferences.minimizeSidebar = !$rootScope.preferences.minimizeSidebar;
            $user.updatePreferences($rootScope.preferences)
            .then(
                function (response) {
                    $timeout(
                        function () {
                            if (response.err) {
                                $rootScope.UI.errMessage = response.msg || 'An error occurred updating preferences';
                                return;
                            }
                        }
                    )
                }
            );
        };
        $scope.updateWeather = function (location) {
            $scope.UI.weatherLoaded = false;
            $scope.UI.weatherErrMessage = null;

            const currentTime = new Date();

            $q.all(
                [
                    $user.getWeather(location),
                    $setup.getStates()
                ]
            )
            .then(
                function (responses) { 
                    $rootScope.UI.weatherLoaded = true;
                    
                    if (responses[0].err || responses[1].err) {
                        $rootScope.weather = null;
                        $rootScope.UI.weatherErrMessage = responses[0].msg;
                        return;
                    }
                    $rootScope.states = responses[1].states;
                    $rootScope.weather = responses[0].weather;
                    $rootScope.location = $rootScope.weather.location || 'Unknown Location';
                    $rootScope.weather.lastUpdated = currentTime.toISOString();
                    $window.localStorage.setItem('goluraWeather', angular.toJson($scope.weather));
                }
            )
            .catch(
                function (error) {
                    $rootScope.UI.weatherLoaded = true;
                    $rootScope.UI.weatherErrMessage = error || 'An error occurred updating weather try again later or try a different location';
                }
            );
        };
        $scope.updateWeatherOptions = function (e, options) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.formSaving = true;

            $rootScope.preferences.defaultLocation = options || null;

            $user.updatePreferences($rootScope.preferences)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (response.err) {
                        $scope.UI.errMessage = response.msg || 'An error occurred updating preferences';
                        return;
                    }
                    $window.localStorage.setItem('goluraPreferences', angular.toJson($rootScope.preferences));

                    $scope.weather = null;
                    $window.localStorage.removeItem('goluraWeather');

                    $timeout(
                        function () {
                            $('#sideBarNavigationOffCanvas').foundation('open');
                            $scope.initWeather();
                        }
                    );
                }
            ).catch(
                function (error) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = error || 'An error occurred updating preferences';
                    $timeout(
                        function () {
                            $scope.UI.errMessage = null;
                        }, 3000
                    );
                }
            );
        };
        $scope.updateIsMobile = function () {
            var isMobile = $media.getMedia();
            if ($rootScope.UI.isMobile !== isMobile) {
                $rootScope.UI.isMobile = isMobile;
                $timeout(function() {
                    $scope.$applyAsync();
                });
            }
        };
        $scope.updateBreadcrumbs = function () {
            if ($rootScope.UI.isMobile && $rootScope.UI.subTitle) {
                $('.mobile-navigation-breadcrumbs').remove();
                $('.view').prepend(
                    `<div class="mobile-navigation-breadcrumbs grid-x">
                        <div class="cell shrink">
                            <div class="cell shrink">
                                <a ng-href="/${$rootScope.UI.mainUrl}">
                                    <b>
                                        ${$rootScope.UI.mainTitle}
                                    </b>
                                </a>
                            </div>
                        </div>
                        <div class="cell shrink">
                            ${
                                $rootScope.UI.subTitle && !$scope.UI.currentUrl.includes('payroll')
                                    ? `<span> / <b>${$rootScope.UI.subTitle}</b></span>`
                                    : ''
                            }     
                            ${
                                $rootScope.UI.titleName
                                    ? `<span> / <b>${$rootScope.UI.titleName}</b></span>`
                                    : ''
                            }
                        </div>
                    </div>`
                );
            }
        };
        $scope.searchGeneral = function () {
            var data = {
                query: $scope.search.value,
                page: $scope.search.page
            };
            if (data.query.length > 3) {
                $widget.generalSearch(data)
                .then(
                    function (response) {
                        $scope.UI.generalSearchLoaded = true;
                        if (!response.err) {
                            $scope.general = response.results;
                            $timeout(
                                function () {
                                    var $dropdown = $('#generalSearchFormContent');
                                    $dropdown.triggerHandler('closeme.zf.dropdown');
                                }
                            )
                        };
                    }
                );
            };
        };   
        $scope.readNotification = function (notification) {
            if (
                $rootScope.user.id === notification.targetUserId &&
                !notification.read
            ) {
        
                // Remove the notification from $rootScope.notifications
                $scope.notifications = $rootScope.notifications.filter(
                    (n) => n.id !== notification.id
                );
                $rootScope.notifications = $scope.notifications;
                
                $user.readNotification(notification);
                
            }
        };
        $scope.login = function (e, user) {
            e.preventDefault();

            var modal = $('#loginTimedOutReveal');

            $scope.UI.loginAttempt = true;
            $scope.UI.loginError = false;
            $user.logIn(user)
            .then( 
                function (response) {
                    $scope.UI.loginAttempt = false;
                    if (response.err) {
                        $scope.UI.loginError = true;
                        $scope.UI.loginMessage = response.msg;
                        return;
                    };
                    $rootScope.UI.timedOut = false;
                    $rootScope.UI.refresh = true;
                    $rootScope.user.token = response.token;

                    delete $rootScope.user.password;

                    $user.setUser($rootScope.user);

                    $scope.initNavigation();

                    modal.foundation('close');
                    modal.parent().remove();

                }
            );
        };
        $scope.logOut = function () {
            
            // Clean up socket connection
            if ($rootScope.socket) {
                $rootScope.socket.disconnect();
                $rootScope.socket = null;
            }
            
            $user.logOut()
            .then(
                function (response) {
                    $user.removeUser();
                    $window.location.href = '';
                    if (response.err) {
                        $rootScope.UI.errMessage = response.msg;
                    }
                }
            ).catch(
                function (error) {
                    $rootScope.UI.errMessage = error;
                }
            );
        };
        $scope.anyRemindersSelected = function() {
            return $rootScope.reminders.some(r => r.selected);
        };
        $scope.anyNOtificationssSelected = function() {
            return $rootScope.notifications.some(n => n.selected);
        };
        $scope.anyReminderTypeSelected = function() {
            return $scope.reminderTypes.some(rt => rt.selected);
        }; 
        $scope.isActive = function (viewLocation) {
            const currentPath = $location.path();
            
            // Check if the current path starts with the given viewLocation
            return currentPath.startsWith(viewLocation);
        };  
        $scope.filterPagesBySubscription = function(pages) {
            if (!pages || !$rootScope.subscription) {
                return pages;
            }
            // Filter pages based on the subscription.pageAccess property
            if ($rootScope.subscription.pageAccess && $rootScope.subscription.pageAccess.length > 0) {
                return pages.filter(page => {
                    return $rootScope.subscription.pageAccess.includes(page.name);
                });
            }
            return pages;
        };
        $scope.setFavicon = function(url) {
            try {
                // Remove existing favicon links
                const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
                existingFavicons.forEach(link => link.remove());
                
                // Create new favicon link
                const favicon = document.createElement('link');
                favicon.rel = 'shortcut icon';
                favicon.type = 'image/x-icon';
                favicon.href = url;
                
                // Add the new favicon to the head
                document.head.appendChild(favicon);
                
                // Also create additional favicon formats for better browser support
                const faviconPng = document.createElement('link');
                faviconPng.rel = 'icon';
                faviconPng.type = 'image/png';
                faviconPng.href = url;
                document.head.appendChild(faviconPng);
                
            } catch (error) {
                $log.error('Error setting favicon:', error);
            }
        };  
        $scope.toggleReminders = function() {
            $scope.UI.pastReminders = !$scope.UI.pastReminders;

            $scope.reminders = $rootScope.reminders;

            if (!$scope.UI.pastReminders) {
                const tenMinutesBefore = new Date(new Date().getTime() - 10 * 60000);

                $scope.reminders = $rootScope.reminders.filter(reminder => {
                    const reminderTime = new Date(reminder.date);
                    return reminderTime > tenMinutesBefore;
                });
            }
        };
        $scope.getTrustedUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        $scope.getUserLocation = function () {
            if ($window.navigator && $window.navigator.geolocation) {
                $window.navigator.geolocation.getCurrentPosition(
                    function (position) {
                        // Handle successful location retrieval
                        $rootScope.currentLocation = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };
                    },
                    function (error) {
                        $rootScope.UI.weatherErrMessage = 'Unable to retrieve your location';
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            }
        };
        $rootScope.goBack = function () {
            $window
            .localStorage
            .setItem('goluraBackButtonInitialized',
                true
            );
            
            if (!$rootScope.routeHistory || $rootScope.routeHistory.length < 2) {
                // If history is unavailable or too short, fallback to a safe default
                $window.location.href = '/'; // Replace '/' with your fallback URL
                return;
            }
            // Remove the current URL from the history
            $rootScope.routeHistory.pop();
        
            // Get the previous URL from the history
            let previousUrl = $rootScope.routeHistory[$rootScope.routeHistory.length - 1];
        
            // Check if the previous URL is valid
            fetch(previousUrl, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        // Navigate to the previous URL
                        $window.location.href = previousUrl;
                    } else {
                        // If the previous URL is invalid, continue going back in history
                        $rootScope.routeHistory.pop(); // Remove invalid URL
                        $rootScope.goBack(); // Recursively go back again
                    }
                })
                .catch(() => {
                    // On error, fallback to a default page
                    $window.location.href = '/'; // Replace '/' with your fallback URL
                });
        };
        $rootScope.checkForErrors = function () {
            if ($rootScope.UI.permissionDenied || $rootScope.UI.fourZeroFour) {
                // Get the current URL
                const currentUrl = $location.url();
        
                // Remove all occurrences of the current URL from routeHistory
                $rootScope.routeHistory = $rootScope.routeHistory.filter(url => url !== currentUrl);
                $window.localStorage.setItem('routeHistory', JSON.stringify($rootScope.routeHistory));
        
                // Return true to indicate errors were handled
                return true;
            }
            return false; // No errors
        };    
        $rootScope.updateCounts = function () {
            $user.getCounts()
            .then(function (response) {
                if (!response.err) {
                    $rootScope.counts = response.counts;
                    $timeout(function () {
                        $rootScope.$apply();
                    });
                }
            });
        };
        $rootScope.readNotifications = function (notifications) {
            // Filter notifications to include only those with `selected: true`
            const selectedNotifications = notifications.filter((notification) => notification.selected);
        
            if (selectedNotifications.length === 0) {
                return;
            }
        
            const notificationIds = selectedNotifications.map((notification) => notification.id);
        
            // Temporarily remove the selected notifications from $scope.notifications
            const remainingNotifications = notifications.filter((notification) => !notification.selected);
        
            // Update $scope.notifications to only include unselected notifications
            $scope.notifications = [...remainingNotifications];
        
            $user.readNotifications(notificationIds)
                .then(function (response) {
                    if (response.err) {
                        // Re-add the selected notifications back to $scope.notifications on error
                        $scope.notifications = [...$scope.notifications, ...selectedNotifications];
                        $rootScope.UI.notificationMsg = response.msg;
                    }
                })
                .catch(function (error) {
                    // Re-add the selected notifications back to $scope.notifications on error
                    $scope.notifications = [...$scope.notifications, ...selectedNotifications];
                });
        };
        $rootScope.deleteNotification = function (notification) {
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.formSaving = true;

            $user.deleteNotification(notification)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        // Remove the deleted notification from the list
                        $rootScope.notifications = $rootScope.notifications.filter(
                            function (n) {
                                return n.id !== notification.id;
                            }
                        );
                        $scope.notifications = $rootScope.notifications;
                        $scope.initNotifications();
                        $scope.initFormSaved(response.msg || 'Notification deleted successfully');
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred deleting notification';
                    }
                }
            ).catch(
                function (error) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = error || 'An error occurred deleting notification';
                }
            );
        };
        $rootScope.deleteReminders = function (reminders) {
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.formSaving = true;

            // Filter reminders to include only those with `selected: true`
            const selectedReminders = reminders.filter((reminder) => reminder.selected);
            const remainingReminders = reminders.filter((reminder) => !reminder.selected);
        
            // Update $scope.notifications to only include unselected notifications
            $scope.reminders = [...remainingReminders];

            if (selectedReminders.length === 0) {
                $scope.UI.errMessage = 'Please select at least one reminder to delete';
                $scope.UI.formSaving = false;
                return;
            }

            const reminderIds = selectedReminders.map((reminder) => reminder.id);

            $user.deleteReminders({ids: reminderIds})
                .then(function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        // Remove the deleted reminders from the list
                        $rootScope.reminders = $rootScope.reminders.filter(
                            function (reminder) {
                                return !reminderIds.includes(reminder.id);
                            }
                        );
                        $scope.reminders = $rootScope.reminders;
                        $scope.initReminders();
                        $scope.initFormSaved(response.msg || 'Reminders deleted successfully');
                        $('#userUpcomingRemindersModal').foundation('close');
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred deleting reminders';
                    }
                })
                .catch(function (error) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = error || 'An error occurred deleting reminders';
                });
        };
        $rootScope.deleteReminder = function (reminder) {
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.formSaving = true;
            $user.deleteReminder(reminder)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        // Remove the deleted reminder from the list
                        $rootScope.reminders = $rootScope.reminders.filter(
                            function (r) {
                                return r.id !== reminder.id;
                            }
                        );
                        $scope.reminders = $rootScope.reminders;
                        $scope.initReminders();
                        $scope.initFormSaved(response.msg || 'Reminder deleted successfully');
                        $('#userUpcomingRemindersModal').foundation('close');
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred deleting reminder';
                    }
                }
            ).catch(
                function (error) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = error || 'An error occurred deleting reminder';
                }
            );
        };
        $rootScope.downloadFromUrl = function(url) {
            var a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            // Set the download attribute to specify the filename
            a.download = url.split('/').pop();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        $rootScope.isSubscribed = function(pageName) {
            if (!$rootScope.subscription) {
                return false;
            }
            return $rootScope.subscription.pageAccess.includes(pageName);
            
        };
        $scope.$on('$destroy', function() {
            angular.element($window).off('resize', $scope.updateIsMobile);
        });
        $rootScope.$on('currentUserLoaded',
            function (e, user) {
                $timeout(
                    function () {
                        $rootScope.user.loggedIn = true;
                        $scope.$apply();
                    }
                )
            }
        );
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            $rootScope.UI.fourZeroFour = false;
            $rootScope.UI.permissionDenied = false;
            $rootScope.UI.pageLoading = true;
            $rootScope.UI.pageProgress = 0;
            $rootScope.UI.titleName = null;

            let i = 0;
            function animate() {
                if (i < 90) {
                    i += 5;
                    $rootScope.UI.pageProgress = i;
                    $timeout(
                        function () {
                            animate();
                            $rootScope.$apply();
                        }, 300
                    );
                }
            }
            animate();
        });
        $rootScope.$on('$routeChangeSuccess', function () {
            $rootScope.UI.elementsUpdated = false;
        
            $rootScope.UI.pageProgress = 100;

            $timeout(function() {
              $rootScope.UI.pageLoading = false;
              $rootScope.UI.pageProgress = 0;
            }, 300); // small delay to let user see 100%
            const currentUrl = $location.url();
        
            // Remove duplicate entries within the last 20 entries
            const historyLength = $rootScope.routeHistory.length;
            if (historyLength > 0) {
                for (let i = Math.max(0, historyLength - 20); i < historyLength; i++) {
                    if ($rootScope.routeHistory[i] === currentUrl) {
                        $rootScope.routeHistory.splice(i, 1);
                        break; // Exit the loop after removing the duplicate
                    }
                }
            }
        
            // Add the current URL to the history only if it's not within the last 3 entries
            const recentEntries = $rootScope.routeHistory.slice(-3);
            if (!recentEntries.includes(currentUrl)) {
                $rootScope.routeHistory.push(currentUrl);
            }
        
            // Remove alternating back-and-forth duplicates
            const cleanedHistory = [];
            $rootScope.routeHistory.forEach((url, index) => {
                if (
                    cleanedHistory.length === 0 || 
                    !(cleanedHistory.length >= 2 && cleanedHistory[cleanedHistory.length - 2] === url && cleanedHistory[cleanedHistory.length - 1] === currentUrl)
                ) {
                    cleanedHistory.push(url);
                }
            });
            const backButtonInitialized = angular.fromJson($window.localStorage.getItem('goluraBackButtonInitialized') || null);
            if (backButtonInitialized) {

                //remove the last 2 entries from the history
                cleanedHistory.pop();
                cleanedHistory.pop();
                $window.localStorage.removeItem('goluraBackButtonInitialized');
                $rootScope.UI.backHistory = false;
            }
            $rootScope.routeHistory = cleanedHistory;
        
            $scope.search.value = '';
        
            // Keep only the last 100 entries
            if ($rootScope.routeHistory.length > 100) {
                $rootScope.routeHistory.shift();
            }
            // Cleanup UI elements
            $('.reveal-overlay').remove();
            $('.flatpickr-calendar').remove();
            $('#notificationsOffCanvas').foundation('close');
        
            // Store the updated route history in localStorage
            $window.localStorage.setItem('routeHistory', JSON.stringify($rootScope.routeHistory));
            $rootScope.UI.elementsUpdated = true;
            $timeout(function () {
                if ($rootScope.UI.isMobile) {
                    $scope.updateBreadcrumbs();
                };
            }, 1000);
        });        
        $rootScope.$on('$locationChangeSuccess', function (e, next, current) {
            // Parse the URL without query parameters
            const cleanUrl = next.split('?')[0]; // Remove query parameters from the URL
            $scope.UI.currentUrl = cleanUrl.split('/');
        
            // Extract parts of the URL
            const mainSegment = $scope.UI.currentUrl[3] || null; // First meaningful segment
            var subSegment = $scope.UI.currentUrl[4] || null; // Second segment, if present

            if ($scope.UI.currentUrl.includes('purchase-orders')) {
                subSegment = 'purchase-orders';
            } 
            if ($scope.UI.currentUrl.includes('purchase-order')) {
                subSegment = 'purchase-order';
            }
            if ($scope.UI.currentUrl.includes('payroll')) {
                subSegment = null;
            }

            const idMatch = cleanUrl.match(/\/(\d+)$/); // Check if the URL ends with an ID
            const id = idMatch ? `#${idMatch[1]}` : null;
        
            if (id) {
                $rootScope.UI.id = id;
            }
            if ($scope.UI.currentUrl.includes('reports')) {
                $rootScope.UI.id = null;
            }
            // Determine the title parts
            const subTitle = subSegment && isNaN(subSegment) ? ` ${capitalize(subSegment)}` : '';
            const finalId = id ? ` ${id}` : '';
            $rootScope.UI.mainUrl = mainSegment;
            $rootScope.UI.subUrl = subSegment;
            
            if (mainSegment) {
                $rootScope.UI.mainTitle = mainSegment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            } else {
                $rootScope.UI.mainTitle = null;
            }

            var newTitle = `${$rootScope.UI.mainTitle}${finalId} | ${($rootScope.company && $rootScope.company.name) || 'Golura'}`;

            if (subSegment) {
                $rootScope.UI.subTitle = subSegment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            } else {
                $rootScope.UI.subTitle = null;
            }

            if (subTitle) { 
                newTitle = `${$rootScope.UI.subTitle}${finalId} | ${($rootScope.company && $rootScope.company.name) || 'Golura'}`;
            }
            if (!mainSegment && !subSegment) {
                newTitle = ($rootScope.company && $rootScope.company.name) || 'Golura';
            }
            $window.document.title = newTitle;
        
            $timeout(function () {
                $scope.$apply();
                $(document).foundation();
            });
        
            if (typeof window.functionX === 'undefined') {
                window.functionX = function () {
                    $route.reload();
                };
            };
        });        
        $rootScope.$on('userTimedOut',
            function () {
                if (!$rootScope.UI.timedOut && $location.path() !== '/') {
                    const loginModalDiv = $('#loginTimedOutReveal');
                    if (loginModalDiv.length) {
                        loginModalDiv.remove();
                    }
                    $rootScope.UI.timedOut = true;
                    const modalHtml = `
                        <div 
                            class="login-timed-out-reveal reveal"
                            id="loginTimedOutReveal"
                            data-reveal
                            data-close-on-click="false"
                        >
                            <div class="login-timed-out">
                                <h1 class="text-center">
                                    <b>Oh Dear! </b>
                                    Looks like you've timed out! <br/> 
                                </h1>
                                <h6 class="text-center">
                                    Please enter you password to continue!
                                </h6>
                                <div ng-include="'dist/forms/login-form.html'"></div>
                            </div>
                        </div>
                    `
                    $('body').append(modalHtml);
    
                    const compiledElement = angular.element($('#loginTimedOutReveal'));
                    $compile(compiledElement)($scope);
        
                    // Initialize the Foundation modal
                    const loginModal = new Foundation.Reveal($('#loginTimedOutReveal'));
                    loginModal.open();
                    if ($location.path() === '/') {
                        $rootScope.user = null;
                        $user.removeUser();
                    }
                };
            }
        );
        $rootScope.$on('connectionError', 
            function (e, data) {
                $scope.UI.connectionError = true;
            }
        );
        $rootScope.$on('fourZeroFour', function () {
            $rootScope.UI.fourZeroFour = true;
            
            $rootScope.checkForErrors();
        });
        $rootScope.$on('callError', function (e, data) {
            $rootScope.UI.errMessage = data.msg || 'An error occurred, please try again later';
            $timeout(
                function () {
                    $rootScope.UI.errMessage = null;
                }
            );
        });
        $rootScope.$on('callInitiated', function (e, data) {
            $scope.initFormSaved(data.msg || 'Call initiated successfully');
        });
        $(document).on('change.zf.tabs',
            function (e, i) {
                if ($rootScope.page) {
                    e.preventDefault();
                    $location.search('tab', $(i).children(":first").attr('data-tabs-target'));
                };
            }
        );
        $(document).on('opened.zf.offCanvas', function (e) {
            const element = e.target; // The Off-Canvas element that triggered the event


            const overlay = $(element).siblings('.js-off-canvas-overlay'); // Find the closest overlay sibling

            if (element.id == 'sideBarNavigationOffCanvas') {
                overlay.addClass('side-bar-canvas-overlay');
                
                //
            };
            if (element.id == 'eventCalendarSettingsOffCanvas') {
                overlay.addClass('event-calendar-settings-canvas-overlay');
            }
        });
        $(document).on('close.zf.offCanvas', function (e, i) {
            const sideBar = e.target;
        
            if (sideBar.id === 'notificationsOffCanvas') {
        
                $timeout(
                    function () {
                        $rootScope.$apply(() => {
                            $rootScope.UI.sideBar = false;
                        });
                    }
                )
            }
        });
        $scope.$watch(function() { return $rootScope.company; }, function(newVal, oldVal) {
            if (newVal !== oldVal && newVal) {
                const cleanUrl = $location.url().split('?')[0];
                $scope.UI.currentUrl = cleanUrl.split('/');
                // Find first and second non-numeric segments for main and sub title
                let mainSegment = null, subSegment = null;
                for (let i = 1; i < $scope.UI.currentUrl.length; i++) {
                    const seg = $scope.UI.currentUrl[i];
                    if (seg && isNaN(seg)) {
                        if (!mainSegment) mainSegment = seg;
                        else if (!subSegment) { subSegment = seg; break; }
                    }
                }
                if ($scope.UI.currentUrl.includes('purchase-orders')) subSegment = 'purchase-orders';
                if ($scope.UI.currentUrl.includes('purchase-order')) subSegment = 'purchase-order';
                if ($scope.UI.currentUrl.includes('payroll')) subSegment = ' ';
                const idMatch = cleanUrl.match(/\/(\d+)$/);
                const id = idMatch ? `#${idMatch[1]}` : null;
                if (id) $rootScope.UI.id = id;
                if ($scope.UI.currentUrl.includes('reports')) $rootScope.UI.id = null;
                const subTitle = subSegment && isNaN(subSegment) ? ` ${capitalize(subSegment)}` : '';
                const finalId = id ? ` ${id}` : '';
                $rootScope.UI.mainUrl = mainSegment;
                $rootScope.UI.subUrl = subSegment;
                if (mainSegment) {
                    $rootScope.UI.mainTitle = mainSegment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                } else {
                    $rootScope.UI.mainTitle = null;
                }
                var newTitle = `${$rootScope.UI.mainTitle || ''}${finalId} | ${(newVal && newVal.name) || 'Golura'}`.trim();
                if (subSegment) {
                    $rootScope.UI.subTitle = subSegment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                } else {
                    $rootScope.UI.subTitle = null;
                }
                if (subTitle) {
                    newTitle = `${$rootScope.UI.subTitle}${finalId} | ${(newVal && newVal.name) || 'Golura'}`.trim();
                }
                if (!mainSegment && !subSegment) {
                    newTitle = (newVal && newVal.name) || 'Golura';
                }
                $window.document.title = newTitle;
            }
        }, true);
        $scope.$watch(function() {
            return $rootScope.UI.titleName;
        }, function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.updateBreadcrumbs();
            }
        });
    }); // Close controller function
    
    return app;
});