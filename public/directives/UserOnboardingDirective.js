define(['intro'], function(introJs) {
    'use strict';

    angular.module('ngUserOnboarding', [])
        .directive('userOnboarding', ['$timeout', '$rootScope', '$user', '$q', '$media', 
            function($timeout, $rootScope, $user, $q, $media) {
                return {
                    restrict: 'E',
                    scope: {
                        pageName: '@',
                        autoStart: '=?',
                        customSteps: '=?'
                    },
                    template: `
                        <div class="user-onboarding-container" ng-if="shouldShowOnboarding">
                            <button class="onboarding-trigger-btn" 
                                    ng-click="startTour()" 
                                    ng-if="!autoStart"
                                    title="Start Tour"
                                    aria-label="Start Onboarding Tour">
                                <i class="fal fa-question-circle"></i>
                            </button>
                        </div>
                    `,
                    link: function(scope, element, attrs) {
                        
                        // Initialize variables
                        scope.shouldShowOnboarding = false;
                        scope.onboardingData = null;
                        scope.introObj = null;
                        scope.autoStart = scope.autoStart !== false; // Default to true
                        
                        // Dashboard-specific tour configuration
                        const dashboardTourSteps = [
                            {
                                element: '.dashboard-container',
                                title: 'Welcome to Your Dashboard!',
                                intro: 'This is your personalized dashboard where you can monitor your business activities, view important metrics, and manage your day-to-day operations.',
                                position: 'bottom'
                            },
                            {
                                element: '.navigation-logo',
                                title: 'Company Logo & Navigation',
                                intro: 'Click on your company logo to navigate back to the dashboard from any page. This is your home base in Golura.',
                                position: 'bottom'
                            },
                            {
                                element: '.navigation-side-bar',
                                title: 'Main Navigation',
                                intro: 'Use this sidebar to navigate between different sections of your application. Each icon represents a different area of your business management.',
                                position: 'right'
                            },
                            {
                                element: '.settings-button',
                                title: 'User Settings & Profile',
                                intro: 'Access your user settings, profile information, weather, and account options by clicking this menu.',
                                position: 'left'
                            },
                            {
                                element: '.dashboard-grid-stack-container',
                                title: 'Dashboard Widgets',
                                intro: 'Your dashboard is composed of customizable widgets that display key business metrics and information. You can add, remove, and rearrange these widgets.',
                                position: 'top'
                            },
                            {
                                element: '[data-open="widgetsReveal"]',
                                title: 'Manage Widgets',
                                intro: 'Click this button to add new widgets to your dashboard or remove existing ones. Customize your dashboard to show the information most important to you.',
                                position: 'left'
                            },
                            {
                                element: 'a[data-toggle="notificationsOffCanvas"]',
                                title: 'Notifications Center',
                                intro: 'Click here to view your notifications, alerts, and important updates related to your account and activities.',
                                position: 'right'
                            }
                        ];

                        // Generate navigation steps dynamically based on available pages
                        const generateNavigationSteps = function() {
                            const steps = [];
                            
                            if ($rootScope.subscribedPages && $rootScope.subscribedPages.length > 0) {
                                $rootScope.subscribedPages.forEach(function(page, index) {
                                    if (page.name === 'dashboard') return; // Skip dashboard as it's covered above
                                    
                                    const selector = `a[ng-href="/${page.url}"]`;
                                    const element = document.querySelector(selector);
                                    
                                    if (element) {
                                        steps.push({
                                            element: selector,
                                            title: `${page.name.charAt(0).toUpperCase() + page.name.slice(1)} Section`,
                                            intro: getPageDescription(page.name),
                                            position: 'right'
                                        });
                                    }
                                });
                            }
                            
                            return steps;
                        };

                        // Get description for each page
                        const getPageDescription = function(pageName) {
                            const descriptions = {
                                'clients': 'Manage your customer database, view client information, and track client interactions.',
                                'events': 'Schedule appointments, manage your calendar, and track important dates.',
                                'estimates': 'Create and manage project estimates, send quotes to clients, and track estimate status.',
                                'work orders': 'Create and manage work orders, assign tasks, and track project progress.',
                                'invoices': 'Generate invoices, track payments, and manage your billing processes.',
                                'inventory': 'Manage your inventory, track stock levels, and organize your products and materials.',
                                'users': 'Manage team members, assign roles, and control user permissions.',
                                'reports': 'View business analytics, generate reports, and track key performance metrics.',
                                'communications': 'Manage messages, notifications, and communication with clients and team members.',
                                'payments': 'Track payments, manage payment methods, and view financial transactions.',
                                'chats': 'Real-time messaging with team members and clients.',
                            };
                            
                            return descriptions[pageName] || `Navigate to the ${pageName} section to manage related business activities.`;
                        };

                        // Check if onboarding should be shown for this page
                        const checkOnboardingStatus = function() {
                            if (!$rootScope.onboarding || !scope.pageName) {
                                return;
                            }

                            // Find onboarding record for this page - check both regular pages and subPages
                            const pageOnboarding = $rootScope.onboarding.find(function(item) {
                                // First check if it's a regular page match
                                if (item.Page && item.Page.name && item.Page.name.toLowerCase() === scope.pageName.toLowerCase()) {
                                    return true;
                                }
                                // Then check if it's a subPage match (pageId will be null for subPages)
                                if (!item.pageId && item.subPage && item.subPage.toLowerCase() === scope.pageName.toLowerCase()) {
                                    return true;
                                }
                                return false;
                            });

                            scope.onboardingData = pageOnboarding;
                            
                            // Show onboarding if not completed and not skipped
                            if (pageOnboarding) {
                                // Check multiple completion indicators: completed flag, skip flag, or completedAt timestamp
                                const isCompleted = pageOnboarding.completed || !!pageOnboarding.completedAt;
                                const isSkipped = pageOnboarding.skip;
                                scope.shouldShowOnboarding = !isCompleted && !isSkipped;
                            } else {
                                // If no record exists, assume onboarding should be shown
                                scope.shouldShowOnboarding = true;
                            }

                            // Apply changes to scope
                            if (!scope.$$phase) {
                                scope.$apply();
                            }

                            if (scope.shouldShowOnboarding && scope.autoStart) {
                                if (scope.pageName === 'events') {
                                    // For events page, wait for calendar to load before starting onboarding
                                    const waitForCalendar = function() {
                                        if (scope.$parent.UI && scope.$parent.UI.eventCalendarLoaded) {
                                            startOnboarding();
                                        } else {
                                            $timeout(waitForCalendar, 500);
                                        }
                                    };
                                    waitForCalendar();
                                } else if (scope.pageName === 'map-calendar') {
                                    // For map-calendar page, wait for map to load before starting onboarding
                                    const waitForMap = function() {
                                        if (scope.$parent.UI && scope.$parent.UI.eventMapLoaded) {
                                            startOnboarding();
                                        } else {
                                            $timeout(waitForMap, 500);
                                        }
                                    };
                                    waitForMap();
                                } else if (scope.pageName === 'clients') {
                                    // For clients page, wait for clients to load before starting onboarding
                                    const waitForClients = function() {
                                        if (scope.$parent.UI && scope.$parent.UI.clientsLoaded) {
                                            startOnboarding();
                                        } else {
                                            $timeout(waitForClients, 500);
                                        }
                                    };
                                    waitForClients();
                                } else if (scope.pageName === 'client-view') {
                                    // For client view page, wait for client to load before starting onboarding
                                    const waitForClient = function() {
                                        if (scope.$parent.UI && scope.$parent.UI.clientLoaded) {
                                            startOnboarding();
                                        } else {
                                            $timeout(waitForClient, 500);
                                        }
                                    };
                                    waitForClient();
                                } else if (scope.pageName === 'work-orders') {
                                    // For work orders page, wait for work orders to load before starting onboarding
                                    const waitForWorkOrders = function() {
                                        if (scope.$parent.UI && scope.$parent.UI.workOrdersLoaded) {
                                            startOnboarding();
                                        } else {
                                            $timeout(waitForWorkOrders, 500);
                                        }
                                    };
                                    waitForWorkOrders();
                                } else if (scope.pageName === 'users') {
                                    // For users page, wait for users to load before starting onboarding
                                    const waitForUsers = function() {
                                        if (scope.$parent.UI && scope.$parent.UI.usersLoaded) {
                                            startOnboarding();
                                        } else {
                                            $timeout(waitForUsers, 500);
                                        }
                                    };
                                    waitForUsers();
                                } else if (scope.pageName === 'reports') {
                                    // For reports page, wait for reports to load before starting onboarding
                                    const waitForReports = function() {
                                        if (scope.$parent.UI && scope.$parent.UI.reportsLoaded) {
                                            startOnboarding();
                                        } else {
                                            $timeout(waitForReports, 500);
                                        }
                                    };
                                    waitForReports();
                                } else if (scope.pageName === 'payroll') {
                                    // For payroll page, wait for payroll to load before starting onboarding
                                    const waitForPayroll = function() {
                                        if (scope.$parent.UI && scope.$parent.UI.payrollsLoaded) {
                                            startOnboarding();
                                        } else {
                                            $timeout(waitForPayroll, 500);
                                        }
                                    };
                                    waitForPayroll();
                                } else if (scope.pageName === 'estimates') {
                                    // For estimates page, wait for estimates to load before starting onboarding
                                    const waitForEstimates = function() {
                                        if (scope.$parent.UI && scope.$parent.UI.estimatesLoaded) {
                                            startOnboarding();
                                        } else {
                                            $timeout(waitForEstimates, 500);
                                        }
                                    };
                                    waitForEstimates();
                                } else if (scope.pageName === 'admin') {
                                    // For admin page, wait for admin to load before starting onboarding
                                    const waitForAdmin = function() {
                                        if (scope.$parent.UI && (scope.$parent.UI.adminLoaded || scope.$parent.UI.generalSettingsLoaded)) {
                                            startOnboarding();
                                        } else {
                                            $timeout(waitForAdmin, 500);
                                        }
                                    };
                                    waitForAdmin();
                                } else {
                                    // Small delay to ensure DOM is ready for other pages
                                    $timeout(function() {
                                        startOnboarding();
                                    }, 800);
                                }
                            }
                        };

                        // Events-specific tour configuration
                        const eventsTourSteps = [
                            {
                                element: '.events-calendar-container',
                                title: 'Welcome to Events Calendar!',
                                intro: 'This is your events calendar where you can schedule appointments, manage your calendar, and track important dates. The calendar displays all your events in an organized view.',
                                position: 'top'
                            },
                            {
                                element: '.wx-event-calendar-right',
                                title: 'Calendar Controls',
                                intro: 'Use these buttons to navigate between different calendar views (day, week, month, list) and control your calendar display options.',
                                position: 'bottom'
                            },
                            {
                                element: '#mapButton',
                                title: 'Map View',
                                intro: 'Click this button to view your events on a map. This is especially useful for managing field appointments and understanding the geographical distribution of your events.',
                                position: 'left'
                            },
                            {
                                element: '#settingsButton',
                                title: 'Calendar Settings',
                                intro: 'Access calendar settings to filter events by categories, toggle groups, and customize your calendar view preferences.',
                                position: 'left'
                            },
                            {
                                element: '.events-calendar',
                                title: 'Interactive Calendar',
                                intro: 'Your events are displayed here. You can click on events to view details, drag to create new events, and interact with the calendar in multiple ways. Double-click on empty space to create a new event.',
                                position: 'top'
                            }
                        ];

                        // Map Calendar specific tour configuration
                        const mapCalendarTourSteps = [
                            {
                                element: '.event-map-container',
                                title: 'Welcome to Map Calendar!',
                                intro: 'This is your map view where you can see all your events plotted geographically. This view is perfect for route planning and understanding the location distribution of your appointments.',
                                position: 'bottom'
                            },
                            {
                                element: '#eventMap',
                                title: 'Interactive Map',
                                intro: 'Your events are displayed as markers on this map. You can click on markers to view event details, zoom in/out, and navigate to see events in different areas.',
                                position: 'top'
                            },
                            {
                                element: '.event-map-calendar-options-container',
                                title: 'View Options',
                                intro: 'Use this "View Calendar" button to switch back to the traditional calendar view when you need to see events in a time-based format.',
                                position: 'bottom'
                            },
                            {
                                element: 'button[data-toggle="eventMapSettingsOffCanvas"]',
                                title: 'Map Settings',
                                intro: 'Click this settings button to access advanced options for filtering events by groups, categories, and customizing your map display preferences.',
                                position: 'left'
                            },
                            {
                                element: '.event-map-calendar-groups-data-container',
                                title: 'Schedule Timeline',
                                intro: 'Below the map, you have a timeline view that shows your events in chronological order. This combines the benefits of both map and calendar views.',
                                position: 'top'
                            }
                        ];

                        // Clients list specific tour configuration
                        const clientsTourSteps = [
                            {
                                element: '.clients-search-container',
                                title: 'Welcome to Client Management!',
                                intro: 'This is your client database where you can manage all your customer information. Use the search bar to quickly find specific clients by name, phone, email, or address.',
                                position: 'bottom'
                            },
                            {
                                element: '.clients-list-header',
                                title: 'Client Information Columns',
                                intro: 'The client list displays key information at a glance: name, primary phone number, email address, physical address, and creation date.',
                                position: 'bottom'
                            },
                            {
                                title: 'Create New Client',
                                intro: 'Now let\'s create a new client! Click this button to open the client creation form where you can add all the necessary information.',
                                position: 'left'
                            }
                        ];

                        // Client create form specific tour configuration
                        const clientCreateFormTourSteps = [
                            {
                                element: '.client-form-sidebar',
                                title: 'Similar Clients',
                                intro: 'This sidebar shows existing clients with similar names to help you avoid duplicates. If you see a match, you can click on it to edit that client instead.',
                                position: 'right'
                            },
                            {
                                element: 'input[name="primaryFirstName"]',
                                title: 'First Name',
                                intro: 'Enter the client\'s first name. This field is required and will be used throughout the system to identify the client.',
                                position: 'top'
                            },
                            {
                                element: 'input[name="primaryLastName"]',
                                title: 'Last Name',  
                                intro: 'Enter the client\'s last name. This field is also required and combined with the first name creates the client\'s full name.',
                                position: 'top'
                            },
                        ];

                        // Client view specific tour configuration  
                        const clientViewTourSteps = [
                            {
                                element: '.view-client-primary-details',
                                title: 'Welcome to Client Details!',
                                intro: 'This is the detailed view for an individual client. Here you can see all their contact information, communicate with them, and manage their data.',
                                position: 'right'
                            },
                            {
                                element: '.button-group',
                                title: 'Quick Actions',
                                intro: 'These buttons provide quick access to common actions: Schedule Event creates appointments, Create Estimate generates quotes, Edit modifies client information, and Delete removes the client.',
                                position: 'bottom'
                            },
                            {
                                element: '.button-groups',
                                title: 'Communication Tools',
                                intro: 'Use these buttons to communicate directly with your client: Email opens an email composer, Text sends SMS messages, and Call initiates phone calls (if supported).',
                                position: 'right'
                            },
                            {
                                element: '.view-client-details-tabs-list',
                                title: 'Contact Information Tabs',
                                intro: 'These tabs organize all the client\'s contact information: Phone Numbers, Email Addresses, Physical Addresses, and Notes. Click any tab to view and manage that type of information.',
                                position: 'right'
                            },
                            {
                                element: '[data-tabs-target="notes"]',
                                title: 'Client Notes',
                                intro: 'The Notes tab is especially useful for storing important information about the client, special instructions, or history of interactions that your team should know about.',
                                position: 'right'
                            }
                        ];

                        // Work Orders specific tour configuration  
                        const workOrdersTourSteps = [
                            {
                                element: '.work-orders-search-container',
                                title: 'Welcome to Work Orders!',
                                intro: 'This is your work orders management system. Here you can create, track, and manage work orders using a kanban board layout for visual workflow management.',
                                position: 'bottom'
                            },
                            {
                                element: '#workOrdersSearchInput',
                                title: 'Search Work Orders',
                                intro: 'Use this search field to quickly find specific work orders by number, client name, or other details. The kanban board will filter in real-time as you type.',
                                position: 'bottom'
                            },
                            {
                                element: '.work-orders-sync-button.success',
                                title: 'Sync Work Orders',
                                intro: 'Click this green "Sync" button to update work order priorities. This ensures your board displays the most current information and proper priority ordering.',
                                position: 'bottom'
                            },
                            {
                                element: '.work-orders-sync-button.alert',
                                title: 'Unlock Board for Editing',
                                intro: 'Click this "Unlock" button to enable dragging work orders between status columns. When unlocked, you can change a work order\'s status by dragging it to a different column.',
                                position: 'bottom'
                            },
                            {
                                element: '#workOrderBoard',
                                title: 'Kanban Board',
                                intro: 'This kanban board displays your work orders organized by status columns. When unlocked, drag work orders between columns to update their status. Click any work order to view its details.',
                                position: 'top'
                            }
                        ];

                        // Users specific tour configuration  
                        const usersTourSteps = [
                            {
                                element: '.users-search-container',
                                title: 'Welcome to User Management!',
                                intro: 'This is where you manage your team members and user accounts. You can view user information, manage roles and permissions, and add new team members.',
                                position: 'bottom'
                            },
                            {
                                element: '#usersSearchInput',
                                title: 'Search Users',
                                intro: 'Use this search field to quickly find specific users by name, role, or other criteria. The list will filter in real-time as you type.',
                                position: 'bottom'
                            },
                            {
                                element: '.sort-input-container',
                                title: 'Sort Options',
                                intro: 'Use this dropdown to sort users by different criteria like alphabetical order, role, creation date, or last seen activity.',
                                position: 'bottom'
                            },
                            {
                                element: '.users-list-header',
                                title: 'User Information Columns',
                                intro: 'This header shows what information is displayed for each user: Name, Role, Last Seen activity, and Creation date. You can also access user options from the rightmost column.',
                                position: 'bottom'
                            },
                            {
                                title: 'Users List',
                                intro: 'This list displays all your team members with their current status. Online users show a green indicator, while offline users show gray. Click any user to view their detailed profile.',
                                position: 'top'
                            },
                            {
                                title: 'Create New User',
                                intro: 'When you\'re ready to add a new team member, click this button to create a new user account. You can set their role, permissions, and contact information.',
                                position: 'left'
                            }
                        ];

                        // Reports specific tour configuration  
                        const reportsTourSteps = [
                            {
                                element: '.reports-container',
                                title: 'Welcome to Business Reports!',
                                intro: 'This is your business intelligence center where you can generate various reports to analyze your business performance, track metrics, and make data-driven decisions.',
                                position: 'bottom'
                            },
                            {
                                element: '.reports-side-bar-tabs-list',
                                title: 'Report Categories',
                                intro: 'Reports are organized by categories including Analytics, Client reports, Communications, Financial data, HR/Payroll, Inventory, KPIs, Operations, and Summary reports.',
                                position: 'right'
                            },
                            {
                                element: '[data-tabs-target]',
                                title: 'Category Selection',
                                intro: 'Click on any category to see the available reports in that section. Each category contains reports relevant to that business area.',
                                position: 'right'
                            },
                            {
                                element: '.reports-side-bar-tabs-content',
                                title: 'Available Reports',
                                intro: 'Once you select a category, you\'ll see all available reports with descriptions. Click on any report card to generate and view that report.',
                                position: 'left'
                            }
                        ];

                        // Payroll specific tour configuration  
                        const payrollTourSteps = [
                            {
                                element: '.payroll-search-container',
                                title: 'Welcome to Payroll Management!',
                                intro: 'This is your payroll system where you can manage employee payroll, track wages, calculate deductions, and generate pay stubs for your team.',
                                position: 'bottom'
                            },
                            {
                                element: '#payrollSearchInput',
                                title: 'Search Payroll',
                                intro: 'Use this search field to find specific payroll records by period, employee, or payroll number. Press Enter after typing to search through your records.',
                                position: 'bottom'
                            },
                            {
                                element: '.payroll-list-header',
                                title: 'Payroll Information Columns',
                                intro: 'This header shows the information displayed for each payroll period: Number, Period dates, Status, Employee count, Total Gross pay, Total Net pay, and Deductions.',
                                position: 'bottom'
                            },
                            {
                                element: '.payroll-list',
                                title: 'Payroll Records',
                                intro: 'This list displays all your payroll records with key financial information. Click on any payroll record to view detailed information, generate reports, or process payments.',
                                position: 'top'
                            },
                            {
                                title: 'Create New Payroll',
                                intro: 'When you\'re ready to process payroll for a new period, click this button. This opens a form where you can set the pay period, select employees, and calculate wages.',
                                position: 'left'
                            }
                        ];

                        // Estimates specific tour configuration  
                        const estimatesTourSteps = [
                            {
                                element: '.estimates-container',
                                title: 'Welcome to Estimates!',
                                intro: 'This is your estimates management system where you can create, send, and track project estimates and quotes for your clients. The interface is split into a sidebar and main content area.',
                                position: 'bottom'
                            },
                            {
                                element: '.estimates-list-search',
                                title: 'Search Estimates',
                                intro: 'Use this search field to quickly find specific estimates by number, client name, or project details. The estimates list filters in real-time as you type.',
                                position: 'bottom'
                            },
                            {
                                element: '.estimates-sidebar-list',
                                title: 'Estimates List Sidebar',
                                intro: 'This sidebar shows all your estimates with their numbers, client information, and basic details. The currently selected estimate is highlighted. Click any estimate to view its details.',
                                position: 'right'
                            },
                            {
                                element: '.estimates-list-container',
                                title: 'Estimate Details & Actions',
                                intro: 'When you select an estimate from the sidebar, its detailed information appears here. You can view line items, costs, client information, and take actions like sending estimates or converting them to work orders.',
                                position: 'left'
                            }
                        ];

                        // Admin specific tour configuration  
                        const adminTourSteps = [
                            {
                                element: '.admin-container',
                                title: 'Welcome to System Administration!',
                                intro: 'This is your system administration center where you can configure settings, manage user permissions, and customize various aspects of your Golura system. Let\'s explore each settings category.',
                                position: 'bottom'
                            },
                            {
                                element: '.admin-tabs-list',
                                title: 'Settings Categories',
                                intro: 'Settings are organized into vertical tabs on the left side. Each tab contains related configuration options for different areas of your business system. We\'ll click through several key tabs to show you what\'s available.',
                                position: 'right'
                            },
                            {
                                element: '[data-tabs-target="general"]',
                                title: 'General Settings Tab',
                                intro: 'Let\'s start with General settings. This tab is already active and contains core system settings including company information (name, address, logo), brand colors, business hours, and default communication templates.',
                                position: 'right'
                            },
                            {
                                element: '.admin-tabs-content #general',
                                title: 'General Settings Content',
                                intro: 'Here you can see the general settings form with company details, logo upload, address information, brand colors, business hours, and default template selections for emails, PDFs, and SMS.',
                                position: 'left'
                            },
                            {
                                element: '[data-tabs-target="users"]',
                                title: 'User Management Tab',
                                intro: 'Now let\'s look at User settings. Click this tab to see user management options.',
                                position: 'right',
                                onBeforeChange: function() {
                                    // Click the users tab to show its content
                                    const usersTab = document.querySelector('a[data-tabs-target="users"]');
                                    if (usersTab) {
                                        usersTab.click();
                                    }
                                    return true;
                                }
                            },
                            {
                                element: '.admin-tabs-content #users',
                                title: 'User Settings Content',
                                intro: 'The Users tab allows you to set default user roles, create new users, and manage user roles and permissions. You can see options to create users and view archived users.',
                                position: 'left'
                            },
                            {
                                element: '[data-tabs-target="estimators"]',
                                title: 'AI Estimators Tab',
                                intro: 'Let\'s explore the Estimators section. This is where you create and manage AI-powered estimators for automated project quotes.',
                                position: 'right',
                                onBeforeChange: function() {
                                    // Click the estimators tab if it exists
                                    const estimatorsTab = document.querySelector('[data-tabs-target="estimators"]');
                                    if (estimatorsTab) {
                                        estimatorsTab.click();
                                    }
                                    return true;
                                }
                            },
                            {
                                element: '.admin-tabs-content #estimators',
                                title: 'AI Estimators Management',
                                intro: 'Here you can create, configure, and manage AI estimators. You can run estimators, configure their logic and variables, edit settings, and delete estimators. There are also links to manage variables and labor settings.',
                                position: 'left'
                            },
                            {
                                element: '[data-tabs-target="groups"]',
                                title: 'Groups Management Tab',
                                intro: 'Groups help organize your events and team members. Let\'s see the groups management interface.',
                                position: 'right',
                                onBeforeChange: function() {
                                    // Click the groups tab if it exists
                                    const groupsTab = document.querySelector('[data-tabs-target="groups"]');
                                    if (groupsTab) {
                                        groupsTab.click();
                                    }
                                    return true;
                                }
                            },
                            {
                                element: '.admin-tabs-content #groups',
                                title: 'Groups Management Interface',
                                intro: 'The Groups section allows you to create, edit, and manage groups for better organization of your calendar events and user access. You can search existing groups and create new ones.',
                                position: 'left'
                            },
                            {
                                element: '[data-tabs-target="templates"]',
                                title: 'Communication Templates Tab',
                                intro: 'Templates are crucial for automated communications. Let\'s look at the template management section.',
                                position: 'right',
                                onBeforeChange: function() {
                                    // Click the templates tab
                                    const templatesTab = document.querySelector('[data-tabs-target="templates"]');
                                    if (templatesTab) {
                                        templatesTab.click();
                                    }
                                    return true;
                                }
                            },
                            {
                                element: '.admin-tabs-content #templates',
                                title: 'Template Management',
                                intro: 'Here you can create and manage email, PDF, and SMS templates for automated communications like estimates, invoices, appointment confirmations, and custom messages.',
                                position: 'left'
                            },
                            {
                                element: '[data-tabs-target="forms"]',
                                title: 'Forms Management Tab',
                                intro: 'Custom forms help with data collection and client intake. Let\'s see the forms management interface.',
                                position: 'right',
                                onBeforeChange: function() {
                                    // Click the forms tab
                                    const formsTab = document.querySelector('[data-tabs-target="forms"]');
                                    if (formsTab) {
                                        formsTab.click();
                                    }
                                    return true;
                                }
                            },
                            {
                                element: '.admin-tabs-content #forms',
                                title: 'Forms Creation and Management',
                                intro: 'The Forms section allows you to create and manage custom forms for data collection, client intake, surveys, and other business processes. Configure form fields, validation rules, and submission handling.',
                                position: 'left'
                            },
                            {
                                element: '.admin-tabs-list',
                                title: 'Additional Settings Tabs',
                                intro: 'There are several other important tabs including Events (calendar settings), Estimates (pricing settings), Labor (workforce settings), Work Orders (workflow settings), Invoices (billing settings), Subscriptions (account management), and Payroll (payroll processing). Each contains specialized configuration options.',
                                position: 'right'
                            },
                            {
                                element: '.admin-tabs-content',
                                title: 'System Configuration Complete',
                                intro: 'You\'ve now seen the key administration areas. Each tab contains forms and options to customize that area of your system. Remember that changes in admin settings affect how features work for all users in your system, so make adjustments carefully.',
                                position: 'left'
                            }
                        ];

                        // Initialize Intro.js
                        const initializeIntro = function() {
                            try {
                                let steps = [];
                                let doneLabel = 'Complete';
                                
                                // Use custom steps if provided, otherwise use predefined steps
                                if (scope.customSteps && scope.customSteps.length > 0) {
                                    steps = scope.customSteps;
                                } else if (scope.pageName === 'dashboard') {
                                    // Combine dashboard steps with navigation steps
                                    steps = dashboardTourSteps.concat(generateNavigationSteps());
                                } else if (scope.pageName === 'events') {
                                    steps = eventsTourSteps;
                                    doneLabel = 'Continue to Map View';
                                } else if (scope.pageName === 'map' || scope.pageName === 'map-calendar') {
                                    steps = mapCalendarTourSteps;
                                    doneLabel = 'Complete';
                                } else if (scope.pageName === 'clients') {
                                    steps = clientsTourSteps;
                                    doneLabel = 'Complete';
                                } else if (scope.pageName === 'client-view') {
                                    steps = clientViewTourSteps;
                                    doneLabel = 'Complete';
                                } else if (scope.pageName === 'work-orders') {
                                    steps = workOrdersTourSteps;
                                    doneLabel = 'Complete';
                                } else if (scope.pageName === 'users') {
                                    steps = usersTourSteps;
                                    doneLabel = 'Complete';
                                } else if (scope.pageName === 'reports') {
                                    steps = reportsTourSteps;
                                    doneLabel = 'Complete';
                                } else if (scope.pageName === 'payroll') {
                                    steps = payrollTourSteps;
                                    doneLabel = 'Complete';
                                } else if (scope.pageName === 'estimates') {
                                    steps = estimatesTourSteps;
                                    doneLabel = 'Complete';
                                } else if (scope.pageName === 'admin') {
                                    steps = adminTourSteps;
                                    doneLabel = 'Complete';
                                }

                                // Only proceed if we have steps
                                if (steps.length === 0) {
                                    console.warn('No onboarding steps defined for page:', scope.pageName);
                                    return;
                                }

                                const isMobile = $media.getMedia();
                                if (!isMobile) {
                                    scope.introObj = introJs.tour().setOptions({
                                        steps: steps,
                                        showProgress: true,
                                        showBullets: false,
                                        showButtons: true,
                                        nextLabel: 'Next',
                                        prevLabel: 'Back',
                                        doneLabel: doneLabel,
                                        exitOnEsc: true,
                                        exitOnOverlayClick: true,
                                        scrollToElement: true,
                                        overlayOpacity: 0.7,
                                        tooltipClass: 'golura-onboarding-tooltip',
                                        highlightClass: 'golura-onboarding-highlight',
                                        disableInteraction: false,
                                        nextToDone: true,
                                        showStepNumbers: false,
                                        tooltipPosition: 'auto',
                                        scrollPadding: 30
                                    });
                                    // Set up event handlers
                                    scope.introObj.onbeforechange(function(targetElement) {
                                        // Get current step
                                        const currentStepIndex = this._currentStep;
                                        const currentStep = steps[currentStepIndex];
                                        // Execute onBeforeChange callback if it exists
                                        if (currentStep && currentStep.onBeforeChange && typeof currentStep.onBeforeChange === 'function') {
                                            const result = currentStep.onBeforeChange();
                                            // Allow a small delay for DOM updates
                                            if (result && scope.pageName === 'admin') {
                                                return new Promise((resolve) => {
                                                    $timeout(() => {
                                                        resolve();
                                                    }, 300);
                                                });
                                            }
                                        }
                                        return true;
                                    });

                                    // Handle all tour completion/skip/close logic here
                                    scope.introObj.oncomplete(function(currentStep, reason) {
                                        if (reason === 'done') {
                                            // User finished the tour
                                            if (scope.pageName === 'events') {
                                                window.location.href = '/events/map';
                                            } else if (scope.pageName === 'clients') {
                                                const createButton = document.getElementById('clientSearchCreateButton');
                                                if (createButton) {
                                                    createButton.click();
                                                    $timeout(function() {
                                                        startClientFormOnboarding();
                                                    }, 500);
                                                } else {
                                                    markOnboardingCompleted();
                                                }
                                            } else {
                                                markOnboardingCompleted();
                                            }
                                        } else if (reason === 'skip' || reason === 'end') {
                                            // User skipped or closed the tour
                                            showSkipDialog();
                                        }
                                    });

                                    scope.introObj.onbeforeexit(function() {
                                        // Allow exit
                                        return true;
                                    });

                                    scope.introObj.onchange(function(targetElement) {
                                        // Hide back button on first step
                                        const currentStep = this._currentStep;
                                        const backButton = document.querySelector('.introjs-prevbutton');
                                        if (backButton) {
                                            if (currentStep === 0) {
                                                backButton.style.display = 'none';
                                            } else {
                                                backButton.style.display = 'inline-block';
                                            }
                                        }
                                    });
                                }

                            } catch (error) {
                                console.error('Error initializing Intro.js:', error);
                            }
                        };

                        // Start the onboarding tour
                        const startOnboarding = function() {
                            try {
                                if (!scope.introObj) {
                                    initializeIntro();
                                }
                                
                                if (scope.introObj && typeof scope.introObj.start === 'function') {
                                    scope.introObj.start();
                                }
                            } catch (error) {
                                console.error('Error starting onboarding tour:', error);
                            }
                        };

                        // Start client form onboarding in modal
                        const startClientFormOnboarding = function() {
                            try {
                                // Initialize intro.js with client create form steps
                                const formIntroObj = introJs.tour().setOptions({
                                    steps: clientCreateFormTourSteps,
                                    showProgress: true,
                                    showBullets: false,
                                    showButtons: true,
                                    nextLabel: 'Next',
                                    prevLabel: 'Back',
                                    doneLabel: 'Complete',
                                    exitOnEsc: true,
                                    exitOnOverlayClick: false, // Don't close on overlay click for modal
                                    scrollToElement: true,
                                    overlayOpacity: 0.7,
                                    tooltipClass: 'golura-onboarding-tooltip',
                                    highlightClass: 'golura-onboarding-highlight',
                                    disableInteraction: false,
                                    nextToDone: true,
                                    showStepNumbers: false,
                                    tooltipPosition: 'auto',
                                    scrollPadding: 30
                                });

                                formIntroObj.oncomplete(function() {
                                    markOnboardingCompleted();
                                });

                                formIntroObj.onexit(function() {
                                    markOnboardingCompleted();
                                });

                                formIntroObj.onchange(function(targetElement) {
                                    // Hide back button on first step
                                    const currentStep = this._currentStep;
                                    const backButton = document.querySelector('.introjs-prevbutton');
                                    
                                    if (backButton) {
                                        if (currentStep === 0) {
                                            backButton.style.display = 'none';
                                        } else {
                                            backButton.style.display = 'inline-block';
                                        }
                                    }
                                });

                                formIntroObj.start();
                            } catch (error) {
                                console.error('Error starting client form onboarding:', error);
                                markOnboardingCompleted();
                            }
                        };

                        // Mark onboarding as completed
                        const markOnboardingCompleted = function() {
                            scope.shouldShowOnboarding = false;
                            if (scope.onboardingData) {
                                const updateData = {
                                    id: scope.onboardingData.id,
                                    completed: true,
                                    completedAt: new Date().toISOString()
                                };
                                $user.updateOnboard(updateData).then(function(response) {
                                    if (response && response.success) {
                                        // Update local onboarding data
                                        scope.onboardingData.completed = true;
                                        scope.onboardingData.completedAt = updateData.completedAt;
                                        // Update rootScope data
                                        const index = $rootScope.onboarding.findIndex(function(item) {
                                            return item.id === scope.onboardingData.id;
                                        });
                                        if (index !== -1) {
                                            $rootScope.onboarding[index] = scope.onboardingData;
                                        }
                                    }
                                }).catch(function(error) {
                                    console.error('Error updating onboarding status:', error);
                                });
                            }
                        };

                        // Mark onboarding as skipped
                        const markOnboardingSkipped = function() {
                            scope.shouldShowOnboarding = false;
                            if (scope.onboardingData) {
                                const updateData = {
                                    id: scope.onboardingData.id,
                                    skip: true
                                };
                                $user.updateOnboard(updateData).then(function(response) {
                                    if (response && response.success) {
                                        // Update local onboarding data
                                        scope.onboardingData.skip = true;
                                        // Update rootScope data
                                        const index = $rootScope.onboarding.findIndex(function(item) {
                                            return item.id === scope.onboardingData.id;
                                        });
                                        if (index !== -1) {
                                            $rootScope.onboarding[index] = scope.onboardingData;
                                        }
                                    }
                                }).catch(function(error) {
                                    console.error('Error updating onboarding skip status:', error);
                                });
                            }
                        };

                        // Show skip dialog
                        const showSkipDialog = function() {
                            markOnboardingSkipped();
                        };

                        // Public methods for manual control
                        scope.startTour = function() {
                            startOnboarding();
                        };

                        scope.skipTour = function() {
                            markOnboardingSkipped();
                        };

                        scope.completeTour = function() {
                            markOnboardingCompleted();
                        };

                        // Watch for changes in onboarding data
                        $rootScope.$watch('onboarding', function(newVal, oldVal) {
                            if (newVal && newVal !== oldVal) {
                                checkOnboardingStatus();
                            }
                        });

                        // Watch for changes in subscribed pages
                        $rootScope.$watch('subscribedPages', function(newVal, oldVal) {
                            if (newVal && newVal !== oldVal && scope.introObj) {
                                // Reinitialize intro with updated navigation steps
                                initializeIntro();
                            }
                        });

                        // Initialize when directive loads
                        $timeout(function() {
                            checkOnboardingStatus();
                        }, 100);

                        // Cleanup on scope destroy
                        scope.$on('$destroy', function() {
                            if (scope.introObj && scope.introObj.exit) {
                                scope.introObj.exit();
                            }
                        });
                    }
                };
            }
        ]);

    return angular.module('ngUserOnboarding');
});
