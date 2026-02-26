define(['app-controller', 'gridstack'], function (app, GridStack) {
    app.register.controller('DashboardController',
    function (
        $scope,
        $rootScope,
        $location,
        $window,
        $log,
        $q,
        $cookies,
        $timeout,
        $interval,
        $user,
        $widget,
        $admin,
        $media,
        $setup
    ) {
        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];
        $scope.isMobileDevice = false;
        
        $scope.search = {
            users: '',
            widgets: '',
            activityTimeline: '',
            clientInsights: '',
            upcomingEvents: ''
        };
        $scope.sort = {
            widgets: {
                default: 'name',
                value: 'name'
            }
        };
        $scope.limits = [
            { value: 10, name: '10' },
            { value: 25, name: '25' },
            { value: 50, name: '50' },
            { value: 100, name: '100' }
        ];
        $scope.widgetTimeTypes = $setup.getWidgetTimeTypes();

        $scope.company = {};
        $scope.today = {};
        $scope.days = {};
        $scope.grid = {};

        $scope.userWidgets = [];
        $scope.roleWidgets = [];
        $scope.availableWidgets = [];
        $scope.widgets = [];

        $scope.widgetData = {
            salesOverview: {
                period: '30d',
                limit: 10
            },
            workOrdersSummary: {
                period: '7d',
                includeAllUsers: false
            },
            upcomingEvents: {
                period: '7d',
                limit: 10,
                includeAllUsers: false
            },
            invoiceStatus: {
                period: '90d',
                includeAllUsers: false
            },
            activityTimeline: {
                period: '7d',
                limit: 10,
                includeAllUsers: false
            },
            clientInsights: {
                period: '30d',
                limit: 10,
                includeAllUsers: false
            },
            estimateAnalytics: {},
            activitySummary: {
                period: '24h',
                limit: 10
            },
            payrollMonthly: {
                period: '30d',
                status: '',
                includeItems: false,
                loaded: false,
                data: [],
                summary: {}
            },
            payrollExpenses: {
                period: '30d',
                limit: 10,
                chartType: 'line',
                includeDeductions: true,
                includeAllUsers: false,
                loaded: false,
                data: [],
                summary: {},
                topEmployees: [],
                monthlyTrend: []
            }
        };
        $scope.UI = {
            widgetEdit: false,
            widgetsLoaded: false,
            estimateWidgetDataLoaded: false,
            salesOverviewLoaded: false,
            workOrdersSummaryLoaded: false,
            clientInsightsLoaded: false,
            upcomingEventsLoaded: false,
            invoiceStatusLoaded: false,
            activityTimelineLoaded: false,
            activitySummaryLoaded: false,
            estimateAnalyticsLoaded: false,
            payrollMonthlyLoaded: false,
            payrollExpensesLoaded: false,
            saving: false,
            formSaved: false,
            errMessage: null,
            message: null
        };
        $scope.initDashboard = function () {
            $q.all(
                [
                    $user.getWidgets(),
                    $widget.getRoleWidgets() 
                ]
            ).then(function (responses) {
                $scope.userWidgets = responses[0].widgets;
                $scope.roleWidgets = responses[1].widgets;
        
                const roleWidgets = _.filter($scope.roleWidgets, { roleId: $scope.user.roleId });
        
                const combinedWidgets = [];
                const userWidgetMap = _.keyBy($scope.userWidgets, 'id');
        
                _.forEach(roleWidgets, function (roleWidget) {
                    if (!userWidgetMap[roleWidget.widgetId]) {
                        combinedWidgets.push(roleWidget);
                    }
                });
        
                _.forEach($scope.userWidgets, function (userWidget) {
                    combinedWidgets.push(userWidget);
                });
                $scope.widgets = combinedWidgets;
                $scope.UI.widgetsLoaded = true;
        
                const screenWidth = window.innerWidth;
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                               (window.innerWidth <= 1024 && 'ontouchstart' in window);
                const isTablet = !isMobile && (screenWidth >= 768 && screenWidth <= 1366);
                
                let deviceType;
                
                if (isMobile) {
                    deviceType = screenWidth >= 768 ? 'tablet' : 'mobile';
                } else {
                    deviceType = 'desktop';
                }
                
                // Set mobile flag for template
                $scope.isMobileDevice = (deviceType === 'mobile');
        
                _.each($scope.userWidgets, function (widget, index) {
                    let settings = {};
                    switch (deviceType) {
                        case 'desktop':
                            settings = widget.desktopSettings || {};
                            widget.width = settings.width || widget.width || 4;
                            widget.height = settings.height || widget.height || 2;
                            widget.x = settings.x || widget.x || 0;
                            widget.y = settings.y || widget.y || 0;
                            break;
                        case 'tablet':
                            settings = widget.tabletSettings || {};
                            // Fixed width and height for tablet (2 columns)
                            widget.width = 1; // Each widget takes 1 column out of 2
                            widget.height = 3; // Fixed height
                            widget.x = index % 2; // Alternate between 0 and 1
                            widget.y = Math.floor(index / 2) * 3; // Stack vertically
                            break;
                        case 'mobile':
                            settings = widget.mobileSettings || {};
                            // Fixed width and height for mobile (single column)
                            widget.width = 1; // Full width (single column)
                            widget.height = 2; // Smaller height for mobile
                            widget.x = 0; // Always at column 0
                            widget.y = index * 2; // Stack vertically with spacing
                            break;
                    }
                });
                
                $scope.initWidgets();
                
                // Initialize widget data after layout is set
                $timeout(function() {
                    $scope.refreshAllWidgetData();
                }, 100);
            });
        };
        $scope.initWidgets = function () {
            $scope.UI.widgetEdit = false;
            
            $timeout(function () {

                if ($scope.grid) {
                    try {
                        // Remove event listeners if the off method exists
                        if (typeof $scope.grid.off === 'function') {
                            $scope.grid.off('resizestop');
                            $scope.grid.off('dragstop');
                        }
                        
                        // Try to destroy if the method exists (older versions)
                        if (typeof $scope.grid.destroy === 'function') {
                            $scope.grid.destroy(false);
                        } else if (typeof $scope.grid.disable === 'function') {
                            // For newer versions without destroy method, just disable
                            $scope.grid.disable();
                        }
                    } catch (e) {
                        // Ignore GridStack cleanup warnings
                    }
                }
                
                // Get device type for responsive configuration
                const screenWidth = window.innerWidth;
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                               (window.innerWidth <= 1024 && 'ontouchstart' in window);
                const isTablet = !isMobile && (screenWidth >= 768 && screenWidth <= 1366);
                
                let deviceType, gridConfig;
                
                if (isMobile) {
                    deviceType = screenWidth >= 768 ? 'tablet' : 'mobile';
                } else if (isTablet) {
                    deviceType = 'tablet';
                } else {
                    deviceType = 'desktop';
                }
                
                if (deviceType === 'mobile') {
                    // Don't initialize GridStack for mobile - use simple CSS layout
                    $scope.grid = null;
                    return;
                } else {
                    deviceType = 'desktop';
                    gridConfig = {
                        cellHeight: '10rem',
                        verticalMargin: 20,
                        horizontalMargin: 20,
                        column: 12, // Full 12 columns on desktop
                        float: false,
                        acceptWidgets: false,
                        removable: false,
                        resizable: {
                            handles: 'e, se, s, sw, w'
                        },
                        draggable: {
                            handle: '.grid-stack-item-content'
                        }
                    };
                }
                
                // Only initialize GridStack for tablet and desktop
                if (deviceType !== 'mobile') {
                    $scope.grid = GridStack.init(gridConfig);
                    $scope.grid.disable(); // Start in disabled state
                    
                    // Auto-position any widgets that don't have valid positions
                    $scope.autoPositionWidgets();
                    
                    // Add real-time watchers for widget position and size changes
                    $scope.grid.on('change', function (event, items) {
                        if (!items || items.length === 0) return;
                        
                        items.forEach(function(item) {
                            const widgetId = parseInt(item.el.getAttribute('data-widget-id'), 10);
                            const widget = _.find($scope.userWidgets, { widgetId: widgetId });
                            
                            if (widget) {
                                // Update the widget object with new values
                                const newWidth = parseInt(item.w) || widget.width || 4;
                                const newHeight = parseInt(item.h) || widget.height || 2;
                                const newX = parseInt(item.x) || widget.x || 0;
                                const newY = parseInt(item.y) || widget.y || 0;
                                
                                // Only update if values actually changed
                                if (widget.width !== newWidth || widget.height !== newHeight || 
                                    widget.x !== newX || widget.y !== newY) {
                                    
                                    widget.width = newWidth;
                                    widget.height = newHeight;
                                    widget.x = newX;
                                    widget.y = newY;
                                    
                                    // Auto-save the widget position/size to database
                                    $scope.saveWidgetChange(widget, deviceType);
                                }
                            }
                        });
                        
                        // Apply changes to scope
                        
                    });
                    
                    $scope.grid.save();
                } else {
                    // For mobile, just ensure widgets are positioned correctly
                    $scope.autoPositionWidgets();
                }
                $(document).foundation();
            }, 100); // Increased timeout to ensure DOM is ready
        };
        $scope.initAvailableWidgets = function () {
            $scope.UI.widgetsLoaded = false;
            $scope.availableWidgets = [];
            // Don't reset userWidgets here - keep the current ones
            
            $q.all([
                $widget.getWidgets(),
                $user.getWidgets()
            ]).then(function (responses) {
                if (responses[0].err || responses[1].err) {
                    throw new Error((responses[0].err || responses[1].err) || 'Error loading widgets');
                };
                $scope.availableWidgets = responses[0].widgets || [];
                const currentUserWidgets = responses[1].widgets || [];
                
                // Mark which widgets are currently selected
                _.forEach($scope.availableWidgets, function (widget) {
                    widget.selected = _.some(currentUserWidgets, { widgetId: widget.id });
                });

                $scope.UI.widgetsLoaded = true;
            }).catch(function (err) {
                $scope.UI.errMessage = 'Error loading widgets: ' + err;
                $scope.initErrorMessage(err || 'Error loading widgets');
            });
        };
        $scope.initDashboardEditWidget = function () {
            $scope.UI.widgetEdit = true;
            $timeout(function () {
                const grid = $scope.grid;
        
                if (grid) {
                    grid.enableMove(true); 
                    grid.enableResize(true);
                }
            }, 0);
        };
        $scope.initFormSaved = function (msg) {
            $scope.UI.formSaved = true;
            $scope.UI.message = msg;
            
            $timeout(function () {
                $scope.UI.message = null;
                $scope.UI.formSaved = false;
            }, 3000);
        };
        $scope.initErrorMessage = function (msg) {
            $scope.UI.errMessage = msg;

            $timeout(
                function () {
                    $scope.UI.errMessage = null;
                }, 3000
            );
        };
        $scope.initWidgetData = function (widgetName) {
            switch (widgetName) {
                case 'Sales Overview':
                    $scope.initSalesOverview();
                    break;
                case 'Work Orders Summary':
                    $scope.initWorkOrdersSummary();
                    break;
                case 'Client Insights':
                    $scope.initClientInsights();
                    break;
                case 'Upcoming Events':
                    $scope.initUpcomingEvents();
                    break;
                case 'Invoice Status':
                    $scope.initInvoiceStatus();
                    break;
                case 'Activity Timeline':
                    $scope.initActivityTimeline();
                    break;
                case 'Activity Summary':
                    $scope.initActivitySummary();
                    break;
                case 'Estimate Analytics':
                    $scope.initEstimateAnalytics();
                    break;
                case 'Payroll Monthly':
                    $scope.initPayrollMonthly();
                    break;
                case 'Payroll Monthly Expenses':
                    $scope.initPayrollMonthlyExpenses();
                    break;
                default:
                    $scope.initEstimateWidgetData();
                    break;
            }
        };
        $scope.initEstimateWidgetData = function () {
            $scope.UI.estimateWidgetDataLoaded = false;

            $widget.getEstimateWidgetData()
            .then(function (response) {
                if (!response.err) {
                    $scope.widgetEstimateData = response;
                }
                $scope.UI.estimateWidgetDataLoaded = true;
            }).catch(function (err) {
                $scope.initErrorMessage(err || 'Error loading estimate widget data');
                $scope.UI.estimateWidgetDataLoaded = true;
            });
        };
        $scope.initSalesOverview = function (period, limit, includeAllUsers) {
            $scope.UI.salesOverviewLoaded = false;
            
            // Use passed parameters or preferences, with fallbacks
            period = period || ($rootScope.preferences && $rootScope.preferences.salesOverviewPeriod) || '30d';
            limit = limit || ($rootScope.preferences && $rootScope.preferences.salesOverviewLimit) || 10;
            includeAllUsers = includeAllUsers !== undefined ? includeAllUsers : 
                             (($rootScope.preferences && $rootScope.preferences.salesOverviewIncludeAllUsers) || false);
            
            $widget.getSalesOverview({ period: period, limit: limit, includeAllUsers: includeAllUsers })
                .then(function (response) {
                    if (!response.err) {
                        $scope.widgetData.salesOverview = response.widget;
                        $scope.widgetData.salesOverview.period = period;
                        $scope.widgetData.salesOverview.limit = limit;
                        $scope.widgetData.salesOverview.includeAllUsers = includeAllUsers;

                        $timeout(function () {
                            $(document).foundation();
                            // Check if the dropdown exists before trying to close it
                            const dropdown = $('#salesOverviewOptions');
                            if (dropdown.length > 0 && dropdown.is(':visible')) {
                                try {
                                    dropdown.foundation('close');
                                } catch (e) {
                                    // Ignore dropdown close warnings
                                }
                            }
                        }, 500);
                    }
                    $scope.UI.salesOverviewLoaded = true;
                }).catch(function (err) {
                    $scope.initErrorMessage(err || 'Error loading sales overview');
                    $scope.UI.salesOverviewLoaded = true;
                });
        };
        $scope.initWorkOrdersSummary = function (period, includeAllUsers) {
            $scope.UI.workOrdersSummaryLoaded = false;

            // Use passed parameters or preferences, with fallbacks
            period = period || ($rootScope.preferences && $rootScope.preferences.workOrdersSummaryPeriod) || '7d';
            includeAllUsers = includeAllUsers !== undefined ? includeAllUsers : 
                             (($rootScope.preferences && $rootScope.preferences.workOrdersSummaryIncludeAllUsers) || false);

            $widget.getWorkOrdersSummary({ period, includeAllUsers })
                .then(function (response) {
                    $scope.UI.workOrdersSummaryLoaded = true;

                    if (response.err) {
                        $scope.UI.errMessage = response.err || 'Could not load work orders summary';
                        return;
                    }
                    $scope.widgetData.workOrdersSummary = response.widget;
                    $scope.widgetData.workOrdersSummary.period = period;
                    $scope.widgetData.workOrdersSummary.includeAllUsers = includeAllUsers;
                    
                    $timeout(function () {
                        $(document).foundation();
                        // Check if the dropdown exists before trying to close it
                        const dropdown = $('#workOrdersOptions');                            if (dropdown.length > 0 && dropdown.is(':visible')) {
                                try {
                                    dropdown.foundation('close');
                                } catch (e) {
                                    // Ignore dropdown close warnings
                                }
                            }
                    }, 500);
                }).catch(function (err) {
                    $scope.initErrorMessage(err || 'Error loading work orders summary');
                    $scope.UI.workOrdersSummaryLoaded = true;
                });
        };
        $scope.initClientInsights = function (period, limit) {
            $scope.UI.clientInsightsLoaded = false;

            // Use passed parameters or preferences, with fallbacks
            period = period || ($rootScope.preferences && $rootScope.preferences.clientInsightsPeriod) || '30d';
            limit = limit || ($rootScope.preferences && $rootScope.preferences.clientInsightsLimit) || 10;

            $widget.getClientInsights({ period, limit })
                .then(function (response) {
                    $scope.UI.clientInsightsLoaded = true;

                    if (response.err) {
                        $scope.UI.errMessage = response.err || 'Could not load client insights';
                        return;
                    }
                    $scope.widgetData.clientInsights = response.widget;
                    $scope.widgetData.clientInsights.period = period;
                    $scope.widgetData.clientInsights.limit = limit;

                    $timeout(function () {
                        $(document).foundation();
                        // Check if the dropdown exists before trying to close it
                        const dropdown = $('#clientInsightsOptions');                            if (dropdown.length > 0 && dropdown.is(':visible')) {
                                try {
                                    dropdown.foundation('close');
                                } catch (e) {
                                    // Ignore dropdown close warnings
                                }
                            }
                    }, 500);
                }).catch(function (err) {
                    $scope.UI.errMessage = err || 'Could not load client insights';
                    $scope.UI.clientInsightsLoaded = true;
                });
        };
        $scope.initUpcomingEvents = function (period, limit, includeAllUsers) {
            $scope.UI.upcomingEventsLoaded = false;

            // Use passed parameters or preferences, with fallbacks
            period = period || ($rootScope.preferences && $rootScope.preferences.upcomingEventsPeriod) || '7d';
            limit = limit || ($rootScope.preferences && $rootScope.preferences.upcomingEventsLimit) || 10;
            includeAllUsers = includeAllUsers !== undefined ? includeAllUsers : 
                             (($rootScope.preferences && $rootScope.preferences.upcomingEventsIncludeAllUsers) || false);

            $widget.getUpcomingEvents({ 
                period: period, 
                limit: limit,
                includeAllUsers: includeAllUsers 
            }).then(function (response) {
                $scope.UI.upcomingEventsLoaded = true;

                if (response.err) {
                    $scope.UI.errMessage = response.err || 'Could not load upcoming events';
                    return;
                }
                $scope.widgetData.upcomingEvents = response.widget;
                $scope.widgetData.upcomingEvents.period = period;
                $scope.widgetData.upcomingEvents.limit = limit;
                $scope.widgetData.upcomingEvents.includeAllUsers = includeAllUsers;

                $timeout(function () {
                    $(document).foundation();
                    // Check if the dropdown exists before trying to close it
                    const dropdown = $('#upcomingEventsOptions');
                    if (dropdown.length > 0 && dropdown.is(':visible')) {
                        try {
                            dropdown.foundation('close');
                        } catch (e) {
                            // Ignore dropdown close warnings
                        }
                    }
                }, 500);
            }).catch(function (err) {
                $scope.initErrorMessage(err || 'Error loading upcoming events');
                $scope.UI.upcomingEventsLoaded = true;
            });
        };
        $scope.initInvoiceStatus = function (period, includeAllUsers) {
            $scope.UI.invoiceStatusLoaded = false;

            // Use passed parameters or preferences, with fallbacks
            period = period || ($rootScope.preferences && $rootScope.preferences.invoiceStatusPeriod) || '90d';
            includeAllUsers = includeAllUsers !== undefined ? includeAllUsers : 
                             (($rootScope.preferences && $rootScope.preferences.invoiceStatusIncludeAllUsers) || false);

            $widget.getInvoiceStatus({ period, includeAllUsers })
                .then(function (response) {
                    $scope.UI.invoiceStatusLoaded = true;

                    if (response.err) {
                        $scope.UI.errMessage = response.err || 'Could not load invoice status';
                        return;
                    }
                    $scope.widgetData.invoiceStatus = response.widget;
                    $scope.widgetData.invoiceStatus.period = period;
                    $scope.widgetData.invoiceStatus.includeAllUsers = includeAllUsers;
                    
                    $timeout(function () {
                        $(document).foundation();
                        // Check if the dropdown exists before trying to close it
                        const dropdown = $('#invoiceStatusOptions');                            if (dropdown.length > 0 && dropdown.is(':visible')) {
                                try {
                                    dropdown.foundation('close');
                                } catch (e) {
                                    // Ignore dropdown close warnings
                                }
                            }
                    }, 500);
                }).catch(function (err) {
                    $scope.initErrorMessage(err || 'Error loading invoice status');
                    $scope.UI.invoiceStatusLoaded = true;
                });
        };
        $scope.initActivityTimeline = function (period, limit, activityTypes) {
            $widget.getActivityTimeline({ 
                limit: limit || 10, 
                activityTypes: activityTypes || 'client,estimate,event,invoice,workOrder',
                period: period || '7d'
            }).then(function (response) {
                $scope.UI.activityTimelineLoaded = true;

                if (response.err) {
                    $scope.UI.errMessage = response.err || 'Could not load activity timeline';
                    return;
                }
                $scope.widgetData.activityTimeline = response;
                $scope.widgetData.activityTimeline.period = period || '7d';
                $scope.widgetData.activityTimeline.limit = limit || 10;

                $timeout(function () {
                    $(document).foundation();
                    // Check if the dropdown exists before trying to close it
                    const dropdown = $('#activityTimelineOptions');
                    if (dropdown.length > 0 && dropdown.is(':visible')) {
                        try {
                            dropdown.foundation('close');
                        } catch (e) {
                            // Ignore dropdown close warnings
                        }
                    }
                }, 500);
            }).catch(function (err) {
                $scope.initErrorMessage(err || 'Error loading activity timeline');
                $scope.UI.activityTimelineLoaded = true;
            });
        };
        $scope.initActivitySummary = function (period, limit) {
            $scope.UI.activitySummaryLoaded = false;
            
            // Use passed parameters or preferences, with fallbacks
            period = period || ($rootScope.preferences && $rootScope.preferences.activitySummaryPeriod) || '24h';
            limit = limit || ($rootScope.preferences && $rootScope.preferences.activitySummaryLimit) || 10;
            
            $widget.getActivitySummary({ hours: period, limit: limit })
                .then(function (response) {
                    if (!response.err) {
                        $scope.widgetData.activitySummary = response.summary;
                        $scope.widgetData.activitySummary.period = period;
                        $scope.widgetData.activitySummary.limit = limit;

                        $timeout(function () {
                            $(document).foundation();
                            // Check if the dropdown exists before trying to close it
                            const dropdown = $('#activitySummaryOptions');
                            if (dropdown.length > 0 && dropdown.is(':visible')) {
                                try {
                                    dropdown.foundation('close');
                                } catch (e) {
                                    // Ignore dropdown close warnings
                                }
                            }
                        }, 500);
                    }
                    $scope.UI.activitySummaryLoaded = true;
                }).catch(function (err) {
                    $scope.initErrorMessage(err || 'Error loading activity summary');
                    $scope.UI.activitySummaryLoaded = true;
                });
        };
        $scope.initEstimateAnalytics = function (period, includeAllUsers) {
            $scope.UI.estimateAnalyticsLoaded = false;
            
            // Use passed parameters or preferences, with fallbacks
            period = period || ($rootScope.preferences && $rootScope.preferences.estimateAnalyticsPeriod) || '30d';
            includeAllUsers = includeAllUsers !== undefined ? includeAllUsers : 
                             (($rootScope.preferences && $rootScope.preferences.estimateAnalyticsIncludeAllUsers) || false);
            
            $widget.getEstimateAnalytics({ period: period, includeAllUsers: includeAllUsers })
                .then(function (response) {
                    if (!response.err) {
                        $scope.widgetData.estimateAnalytics = response.data;
                        $scope.widgetData.estimateAnalytics.period = period;
                        $scope.widgetData.estimateAnalytics.includeAllUsers = includeAllUsers;
                    }
                    $scope.UI.estimateAnalyticsLoaded = true;
                    
                    $timeout(function () {
                        $(document).foundation();
                        // Check if the dropdown exists before trying to close it
                        const dropdown = $('#estimateAnalyticsOptions');                            if (dropdown.length > 0 && dropdown.is(':visible')) {
                                try {
                                    dropdown.foundation('close');
                                } catch (e) {
                                    // Ignore dropdown close warnings
                                }
                            }
                    }, 500);
                }).catch(function (err) {
                    $scope.initErrorMessage(err || 'Error loading estimate analytics');
                    $scope.UI.estimateAnalyticsLoaded = true;
                });
        };
        $scope.initPayrollMonthly = function (period, status, includeItems) {
            $scope.UI.payrollMonthlyLoaded = false;
            $scope.widgetData.payrollMonthly.loaded = false;

            // Use passed parameters or preferences, with fallbacks
            period = period || ($rootScope.preferences && $rootScope.preferences.payrollMonthlyPeriod) || '30d';
            status = status || ($rootScope.preferences && $rootScope.preferences.payrollMonthlyStatus) || '';
            includeItems = includeItems !== undefined ? includeItems : 
                          (($rootScope.preferences && $rootScope.preferences.payrollMonthlyIncludeItems) || false);

            // Update widget data with current parameters
            $scope.widgetData.payrollMonthly.period = period;
            $scope.widgetData.payrollMonthly.status = status;
            $scope.widgetData.payrollMonthly.includeItems = includeItems;

            $widget.getPayrollMonthlyWidget({ 
                period: period, 
                status: status,
                includeItems: includeItems 
            }).then(function (response) {
                if (response.err) {
                    $scope.initErrorMessage(response.msg || 'Error loading payroll monthly data');
                    $scope.widgetData.payrollMonthly.loaded = true;
                    $scope.widgetData.payrollMonthly.data = [];
                    $scope.widgetData.payrollMonthly.summary = {};
                } else {
                    $scope.widgetData.payrollMonthly.loaded = true;
                    $scope.widgetData.payrollMonthly.data = response.widget.data || [];
                    $scope.widgetData.payrollMonthly.summary = response.widget.summary || {};
                    $scope.widgetData.payrollMonthly.period = response.widget.period;
                }
                $scope.UI.payrollMonthlyLoaded = true;
                
            }).catch(function (err) {
                $scope.initErrorMessage(err || 'Error loading payroll monthly data');
                $scope.widgetData.payrollMonthly.loaded = true;
                $scope.widgetData.payrollMonthly.data = [];
                $scope.widgetData.payrollMonthly.summary = {};
                $scope.UI.payrollMonthlyLoaded = true;
                
            });
        };
        $scope.initPayrollMonthlyExpenses = function (period, chartType, includeDeductions, includeAllUsers, limit) {
            $scope.UI.payrollExpensesLoaded = false;
            $scope.widgetData.payrollExpenses.loaded = false;

            // Use passed parameters or preferences, with fallbacks
            period = period || ($rootScope.preferences && $rootScope.preferences.payrollExpensesPeriod) || '30d';
            chartType = chartType || ($rootScope.preferences && $rootScope.preferences.payrollExpensesChartType) || 'line';
            includeDeductions = includeDeductions !== undefined ? includeDeductions : 
                              (($rootScope.preferences && $rootScope.preferences.payrollExpensesIncludeDeductions) || false);
            includeAllUsers = includeAllUsers !== undefined ? includeAllUsers : 
                            (($rootScope.preferences && $rootScope.preferences.payrollExpensesIncludeAllUsers) || false);
            limit = limit || ($rootScope.preferences && $rootScope.preferences.payrollExpensesLimit) || 10;

            // Update widget data with current parameters
            $scope.widgetData.payrollExpenses.period = period;
            $scope.widgetData.payrollExpenses.chartType = chartType;
            $scope.widgetData.payrollExpenses.includeDeductions = includeDeductions;
            $scope.widgetData.payrollExpenses.includeAllUsers = includeAllUsers;
            $scope.widgetData.payrollExpenses.limit = limit;

            $widget.getPayrollMonthlyExpensesWidget({ 
                period: period, 
                chartType: chartType,
                includeDeductions: includeDeductions,
                includeAllUsers: includeAllUsers,
                limit: limit
            }).then(function (response) {
                if (response.err) {
                    $scope.initErrorMessage(response.msg || 'Error loading payroll expenses data');
                    $scope.widgetData.payrollExpenses.loaded = true;
                    $scope.widgetData.payrollExpenses.data = [];
                    $scope.widgetData.payrollExpenses.summary = {};
                    $scope.widgetData.payrollExpenses.topEmployees = [];
                    $scope.widgetData.payrollExpenses.monthlyTrend = [];
                } else {
                    $scope.widgetData.payrollExpenses.loaded = true;
                    $scope.widgetData.payrollExpenses.data = response.widget.data || [];
                    $scope.widgetData.payrollExpenses.summary = response.widget.summary || {};
                    $scope.widgetData.payrollExpenses.topEmployees = response.widget.topEmployees || [];
                    $scope.widgetData.payrollExpenses.monthlyTrend = response.widget.monthlyTrend || [];
                    $scope.widgetData.payrollExpenses.period = response.widget.period;
                }
                $scope.UI.payrollExpensesLoaded = true;
                
            }).catch(function (err) {
                $scope.initErrorMessage(err || 'Error loading payroll expenses data');
                $scope.widgetData.payrollExpenses.loaded = true;
                $scope.widgetData.payrollExpenses.data = [];
                $scope.widgetData.payrollExpenses.summary = {};
                $scope.widgetData.payrollExpenses.topEmployees = [];
                $scope.widgetData.payrollExpenses.monthlyTrend = [];
                $scope.UI.payrollExpensesLoaded = true;
                
            });
        };
        $scope.saveWidgetChange = function (widget, deviceType) {
            // Just update the widget object in memory - no API calls
            // The actual save to database happens when user clicks the save button
        };
        $scope.updateWidgetsSizeAndPosition = function (userWidgets) {
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
        
            let deviceType;
            const screenWidth = window.innerWidth;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                           (window.innerWidth <= 1024 && 'ontouchstart' in window);
            const isTablet = !isMobile && (screenWidth >= 768 && screenWidth <= 1366);
            
            if (isMobile) {
                deviceType = screenWidth >= 768 ? 'tablet' : 'mobile';
            } else {
                deviceType = 'desktop';
            }
        
            let updatePromises = [];
            
            userWidgets.forEach(function (widget) {
                const widgetId = widget.widgetId;
                
                // Use the current widget values directly from the widget object
                // These are the values that have been updated in real-time by GridStack
                const currentWidth = widget.width || 4;
                const currentHeight = widget.height || 2;
                const currentX = widget.x || 0;
                const currentY = widget.y || 0;
                
                let settings = {
                    width: currentWidth,
                    height: currentHeight,
                    x: currentX,
                    y: currentY
                };

                let updateData = {
                    widgetId: widgetId,
                    userId: $scope.user.id,
                    desktopSettings: deviceType === 'desktop' ? settings : undefined,
                    tabletSettings: deviceType === 'tablet' ? settings : undefined,
                    mobileSettings: deviceType === 'mobile' ? settings : undefined
                };
                
                let updatePromise = $user.updateUserWidget(updateData).then(
                    function (response) {
                        if (response.err) {
                            throw new Error('Error updating widget: ' + response.err);
                        }
                    }
                );
        
                updatePromises.push(updatePromise);
            });
        
            $q.all(updatePromises).then(
                function () {
                    $scope.initFormSaved('All widgets updated successfully!');
                    $scope.UI.widgetEdit = false;
                    
                    // Disable GridStack move and resize after successful update
                    if ($scope.grid) {
                        $scope.grid.enableMove(false);
                        $scope.grid.enableResize(false);
                    }
                },
                function (err) {
                    $scope.UI.errMessage = err.message;
                    $scope.initErrorMessage(err.message || 'Error updating widgets');
                }
            );
        };
        $scope.updateWidgetPreferences = function(widgetType, preferences) {
            if (!$rootScope.preferences) {
                $rootScope.preferences = {};
            }

            // Update preferences in memory
            switch(widgetType) {
                case 'salesOverview':
                    if (preferences.period !== undefined) $rootScope.preferences.salesOverviewPeriod = preferences.period;
                    if (preferences.limit !== undefined) $rootScope.preferences.salesOverviewLimit = preferences.limit;
                    if (preferences.includeAllUsers !== undefined) $rootScope.preferences.salesOverviewIncludeAllUsers = preferences.includeAllUsers;
                    break;
                case 'workOrdersSummary':
                    if (preferences.period !== undefined) $rootScope.preferences.workOrdersSummaryPeriod = preferences.period;
                    if (preferences.includeAllUsers !== undefined) $rootScope.preferences.workOrdersSummaryIncludeAllUsers = preferences.includeAllUsers;
                    break;
                case 'clientInsights':
                    if (preferences.period !== undefined) $rootScope.preferences.clientInsightsPeriod = preferences.period;
                    if (preferences.limit !== undefined) $rootScope.preferences.clientInsightsLimit = preferences.limit;
                    break;
                case 'upcomingEvents':
                    if (preferences.period !== undefined) $rootScope.preferences.upcomingEventsPeriod = preferences.period;
                    if (preferences.limit !== undefined) $rootScope.preferences.upcomingEventsLimit = preferences.limit;
                    if (preferences.includeAllUsers !== undefined) $rootScope.preferences.upcomingEventsIncludeAllUsers = preferences.includeAllUsers;
                    break;
                case 'invoiceStatus':
                    if (preferences.period !== undefined) $rootScope.preferences.invoiceStatusPeriod = preferences.period;
                    if (preferences.includeAllUsers !== undefined) $rootScope.preferences.invoiceStatusIncludeAllUsers = preferences.includeAllUsers;
                    break;
                case 'estimateAnalytics':
                    if (preferences.period !== undefined) $rootScope.preferences.estimateAnalyticsPeriod = preferences.period;
                    if (preferences.includeAllUsers !== undefined) $rootScope.preferences.estimateAnalyticsIncludeAllUsers = preferences.includeAllUsers;
                    break;
                case 'activitySummary':
                    if (preferences.period !== undefined) $rootScope.preferences.activitySummaryPeriod = preferences.period;
                    if (preferences.limit !== undefined) $rootScope.preferences.activitySummaryLimit = preferences.limit;
                    break;
                case 'payrollMonthly':
                    if (preferences.period !== undefined) $rootScope.preferences.payrollMonthlyPeriod = preferences.period;
                    if (preferences.status !== undefined) $rootScope.preferences.payrollMonthlyStatus = preferences.status;
                    if (preferences.includeItems !== undefined) $rootScope.preferences.payrollMonthlyIncludeItems = preferences.includeItems;
                    break;
                case 'payrollExpenses':
                    if (preferences.period !== undefined) $rootScope.preferences.payrollExpensesPeriod = preferences.period;
                    if (preferences.chartType !== undefined) $rootScope.preferences.payrollExpensesChartType = preferences.chartType;
                    if (preferences.includeDeductions !== undefined) $rootScope.preferences.payrollExpensesIncludeDeductions = preferences.includeDeductions;
                    if (preferences.includeAllUsers !== undefined) $rootScope.preferences.payrollExpensesIncludeAllUsers = preferences.includeAllUsers;
                    if (preferences.limit !== undefined) $rootScope.preferences.payrollExpensesLimit = preferences.limit;
                    break;
            }

            // Save to database
            $user.updatePreferences($rootScope.preferences)
                .then(function(response) {
                    if (response.err) {
                        $scope.initErrorMessage(response.msg || 'Error saving widget preferences');
                    } else {
                        // Initialize the appropriate widget after saving preferences
                        switch(widgetType) {
                            case 'salesOverview':
                                $scope.initSalesOverview(preferences.period, preferences.limit, preferences.includeAllUsers);
                                break;
                            case 'workOrdersSummary':
                                $scope.initWorkOrdersSummary(preferences.period, preferences.includeAllUsers);
                                break;
                            case 'clientInsights':
                                $scope.initClientInsights(preferences.period, preferences.limit);
                                break;
                            case 'upcomingEvents':
                                $scope.initUpcomingEvents(preferences.period, preferences.limit, preferences.includeAllUsers);
                                break;
                            case 'invoiceStatus':
                                $scope.initInvoiceStatus(preferences.period, preferences.includeAllUsers);
                                break;
                            case 'estimateAnalytics':
                                $scope.initEstimateAnalytics(preferences.period, preferences.includeAllUsers);
                                break;
                            case 'activitySummary':
                                $scope.initActivitySummary(preferences.period, preferences.limit);
                                break;
                            case 'payrollMonthly':
                                $scope.initPayrollMonthly(preferences.period, preferences.status, preferences.includeItems);
                                break;
                            case 'payrollExpenses':
                                $scope.initPayrollMonthlyExpenses(preferences.period, preferences.chartType, preferences.includeDeductions, preferences.includeAllUsers, preferences.limit);
                                break;
                        }
                    }
                })
                .catch(function(err) {
                    $scope.initErrorMessage(err || 'Error saving widget preferences');
                });
        };
        $scope.toggleWidget = function (widget) {
            widget.selected = !widget.selected;

            if (widget.selected) {
                // Find a safe position based on current user widgets, not available widgets
                const existingPositions = _.map($scope.userWidgets, function (w) {
                    return { 
                        x: w.x || 0, 
                        y: w.y || 0, 
                        width: w.width || w.Widget?.minWidth || 4, 
                        height: w.height || w.Widget?.minHeight || 2 
                    };
                });
                
                const widgetWidth = widget.minWidth || 4;
                const widgetHeight = widget.minHeight || 2;
                const newPosition = $scope.findSafePosition(existingPositions, widgetWidth, widgetHeight);
                
                $user.addWidget({
                    userId: $scope.user.id,
                    widgetId: widget.id,
                    settings: {},
                    size: { width: widgetWidth, height: widgetHeight },
                    position: { x: newPosition.x, y: newPosition.y }
                }).then(function (response) {
                    if (response.err) {
                        $scope.UI.errMessage = 'Error adding widget: ' + response.err;
                        $scope.initErrorMessage(response.err || 'Error adding widget');
                        widget.selected = false; // Revert selection on error
                    } else {
                        $scope.initFormSaved('Widget added successfully!');
                        // Refresh the dashboard to show the new widget
                        $scope.initDashboard();
                    }
                });
            } else {
                $user.removeWidget({
                    userId: $scope.user.id,
                    widgetId: widget.id
                }).then(function (response) {
                    if (response.err) {
                        $scope.UI.errMessage = 'Error removing widget: ' + response.err;
                        $scope.initErrorMessage(response.err || 'Error removing widget');
                        widget.selected = true; // Revert selection on error
                    } else {
                        $scope.initFormSaved('Widget removed successfully!');
                        // Refresh the dashboard to remove the widget
                        $scope.initDashboard();
                    }
                });
            }
        };
        $scope.toggleActivityTimelineRealTime = function () {
            $rootScope.preferences.realTimeActivityUpdates = !$rootScope.preferences.realTimeActivityUpdates;

            $user.updatePreferences($rootScope.preferences)
            .then(
                function (response) {
                    $timeout(
                        function () {
                            if (response.err) {
                                $rootScope.UI.errMessage = response.msg || 'An error occurred updating preferences';
                                return;
                            }
                            if ($rootScope.preferences.realTimeActivityUpdates) {
                                $scope.initActivityTimeline(
                                    $scope.widgetData.activityTimeline.period, 
                                    $scope.widgetData.activityTimeline.limit, 
                                    'client,estimate,event,invoice,workOrder'
                                );
                            };
                        }
                    )
                }
            );
        };
        $scope.getSelectedWidgetsCount = function () {
            return _.filter($scope.availableWidgets, 'selected').length;
        };
        $scope.getWidgetIcon = function (type) {
            const iconMap = {
                'chart': 'fa-chart-line',
                'summary': 'fa-list-alt',
                'analytics': 'fa-analytics',
                'calendar': 'fa-calendar',
                'financial': 'fa-dollar-sign',
                'feed': 'fa-stream',
                'standard': 'fa-th'
            };
            return iconMap[type] || 'fa-th';
        };
        $scope.getTopActivityType = function(activityCounts) {
            if (!activityCounts || Object.keys(activityCounts).length === 0) {
                return 'None';
            }
            
            let topType = '';
            let maxCount = 0;
            
            for (const [type, count] of Object.entries(activityCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    topType = type;
                }
            }
            
            return topType.charAt(0).toUpperCase() + topType.slice(1);
        };
        $scope.refreshAllWidgetData = function () {
            $scope.initSalesOverview();
            $scope.initWorkOrdersSummary();
            $scope.initClientInsights();
            $scope.initUpcomingEvents();
            $scope.initInvoiceStatus();
            $scope.initActivityTimeline();
            $scope.initActivitySummary();
            $scope.initEstimateAnalytics();
            $scope.initPayrollMonthly();
            $scope.initPayrollMonthlyExpenses();
        };
        $scope.findSafePosition = function (existingPositions, minWidth, minHeight) {
            const gridColumns = 12; // Standard grid columns
            const maxRows = 50; // Reasonable max rows to check
            
            // Default size if not provided
            const width = minWidth || 4;
            const height = minHeight || 2;
            
            // Function to check if a position overlaps with existing widgets
            function isPositionOccupied(x, y, w, h) {
                return existingPositions.some(function (pos) {
                    return !(x >= pos.x + pos.width || 
                             x + w <= pos.x || 
                             y >= pos.y + pos.height || 
                             y + h <= pos.y);
                });
            }
            
            // Try to find a position starting from top-left, row by row
            for (let row = 0; row < maxRows; row++) {
                for (let col = 0; col <= gridColumns - width; col++) {
                    if (!isPositionOccupied(col, row, width, height)) {
                        return { x: col, y: row };
                    }
                }
            }
            
            // If no position found, place at the bottom of all existing widgets
            const maxY = existingPositions.length > 0 
                ? Math.max(...existingPositions.map(pos => pos.y + pos.height))
                : 0;
            
            return { x: 0, y: maxY };
        };
        $scope.autoPositionWidgets = function () {
            if (!$scope.userWidgets || $scope.userWidgets.length === 0) {
                return;
            }

            const screenWidth = window.innerWidth;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                           (window.innerWidth <= 1024 && 'ontouchstart' in window);
            const isTablet = !isMobile && (screenWidth >= 768 && screenWidth <= 1366);
            
            let deviceType, gridColumns;
            
            if (isMobile) {
                deviceType = screenWidth >= 768 ? 'tablet' : 'mobile';
                gridColumns = deviceType === 'mobile' ? 1 : 2;
            } else {
                deviceType = 'desktop';
                gridColumns = 12;
            }

            // For mobile and tablet, use static positioning
            if (deviceType === 'mobile' || deviceType === 'tablet') {
                _.forEach($scope.userWidgets, function (widget, index) {
                    if (deviceType === 'mobile') {
                        widget.width = 1;
                        widget.height = 2; // Smaller height for mobile
                        widget.x = 0;
                        widget.y = index * 2; // Stack with smaller spacing
                    } else { // tablet
                        widget.width = 1;
                        widget.height = 3;
                        widget.x = index % 2;
                        widget.y = Math.floor(index / 2) * 3;
                    }
                });
                return;
            }

            // Desktop logic remains the same
            const occupiedPositions = [];
            const widgetsToReposition = [];

            // First pass: identify valid positions and widgets that need repositioning
            _.forEach($scope.userWidgets, function (widget, index) {
                const width = widget.width || widget.Widget?.minWidth || 4;
                const height = widget.height || widget.Widget?.minHeight || 2;
                const x = widget.x || 0;
                const y = widget.y || 0;

                // Check if position is valid (not overlapping and within bounds)
                const isValidPosition = (
                    x >= 0 && 
                    x + width <= gridColumns && 
                    y >= 0 &&
                    !$scope.isPositionOccupied(x, y, width, height, occupiedPositions)
                );

                if (isValidPosition) {
                    // Mark this position as occupied
                    occupiedPositions.push({ x, y, width, height, widgetId: widget.widgetId });
                } else {
                    // This widget needs repositioning
                    widgetsToReposition.push(widget);
                }
            });

            // Second pass: find new positions for widgets that need repositioning
            _.forEach(widgetsToReposition, function (widget) {
                const width = widget.width || widget.Widget?.minWidth || 4;
                const height = widget.height || widget.Widget?.minHeight || 2;
                
                const newPosition = $scope.findSafePosition(occupiedPositions, width, height);
                
                // Update widget position
                widget.x = newPosition.x;
                widget.y = newPosition.y;
                
                // Mark new position as occupied
                occupiedPositions.push({ 
                    x: newPosition.x, 
                    y: newPosition.y, 
                    width, 
                    height, 
                    widgetId: widget.widgetId 
                });
            });
        };
        $scope.isPositionOccupied = function (x, y, width, height, positions) {
            return positions.some(function (pos) {
                return !(x >= pos.x + pos.width || 
                         x + width <= pos.x || 
                         y >= pos.y + pos.height || 
                         y + height <= pos.y);
            });
        };
    })
});