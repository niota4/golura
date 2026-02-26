define(
    [
        'app-controller', 
        'math',
        'math-quill', 
        'tagify', 
        'dhtmlx-suite', 
        'moment', 
        'form-builder', 
        'form-render',
        'random-color',
    ], 
    function (
        app, 
        math,
        mathQuill, 
        Tagify, 
        dhtmlx, 
        moment, 
        formBuilder, 
        formRender,
        randomColor,
    ) {
        app.register.controller('AdminController',
        function (
            $scope,
            $rootScope,
            $routeParams,
            $location,
            $window,
            $log,
            $q,
            $cookies,
            $user,
            $admin,
            $ai,
            $estimate,
            $estimator,
            $event,
            $workOrder,
            $setup,
            $form,
            $timeout,
            $media,
            $uploader,
            $interval,
            $http,
            $document
        ) {
            const urlParams = new URLSearchParams(window.location.search);

            // Ensure user is set in both scope and rootScope
            $scope.user = $user.getUserFromCookie();
            $scope.activationCode = ['', '', '', '', '', ''];
            
            // Get pages from rootScope (fetched by NavigationController)
            $scope.pages = $rootScope.pages || [];
            $scope.page = $setup.getCurrentPage() || {};
            $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null);
            $scope.search = {
                tabs: {
                    value: '',
                },
                groups: {
                    value: '',
                },
                labor: {
                    value: '',
                },
                value: null,
                page: null,
                limit: null,
                count: null,
                total: null
            };
            $scope.sort = {
                progress: {
                    default: 'createdAt',
                    value: '-createdAt'
                },
                general: {
                    default: 'createdAt',
                    value: '-createdAt'
                },
            };

            $scope.inputs = $setup.getInputs();
            $scope.operators = $setup.getOperators();
            $scope.actions = $setup.getActions();
            $scope.timeTypes = $setup.getTimeTypes();
            $scope.templateTypes = $setup.getTemplateTypes();
            $scope.units = $setup.getUnits();
            
            // Validation types for questions
            $scope.validationTypes = [
                {
                    value: 'range',
                    name: 'Min/Max Range'
                },
                {
                    value: 'single',
                    name: 'Single Value Comparison'
                }
            ];
            
            $scope.operatorOptions = {
                valueField: 'value',
                labelField: 'name',
                searchField: 'name',
                create: false,
                maxItems: 1
            };
            
            $scope.inputOptions = {
                valueField: 'value',
                labelField: 'value',
                searchField: 'value',
                create: false,
                maxItems: 1
            };

            $scope.adminFormsTree = null;
            $scope.adminFormsDataView = null;
            $scope.folder = null;
            $scope.formBuilder = null;
            $scope.showSuggestions = null;
            $scope.emailPreview = null;
            $scope.file = null;
            $scope.mathCalculation = null;

            $scope.company = {};
            $scope.user = {};
            $scope.general = {};
            $scope.estimate = {};
            $scope.audit = {};
            $scope.userSettings = {};
            $scope.phoneNumber = {};
            $scope.group = {};
            $scope.role = {};
            $scope.eventType = {};
            $scope.groupType = {};
            $scope.question = {};
            $scope.uploadProgress = {};
            $scope.form = {};
            $scope.template = {};
            $scope.integration = {};
            $scope.estimator = {};
            $scope.questionContainer = {};
            $scope.formula = {};
            $scope.variable = {};
            $scope.labor = {};
            $scope.invoice = {};
            $scope.workOrder = {};
            $scope.communications = {};
            $scope.stripe = {
                account: {},
                paymentMethods: [],
                achSettings: {
                    enabled: false,
                    processingFee: 0.80,
                    requireVerification: true
                }
            };


            $scope.users = [];
            $scope.events = [];
            $scope.clients = [];
            $scope.estimates = [];
            $scope.calls = [];
            $scope.channels = [];
            $scope.roles = [];
            $scope.permissionCategories = [];
            $scope.teams = [];
            $scope.templates = [];
            $scope.phoneNumbers = [];
            $scope.states = [];
            $scope.days = [];
            $scope.groups = [];
            $scope.groupTypes = [];
            $scope.eventTypes = [];
            $scope.questionContainers = [];
            $scope.permissions = [];
            $scope.estimators = [];
            $scope.eventTypes = [];
            $scope.lineItems = [];
            $scope.variables = [];
            $scope.labor = [];
            $scope.estimateStatuses = [];
            $scope.folders = [];
            $scope.nestedFormFolders = [];
            $scope.shortCodes = [];
            $scope.files = [];
            $scope.integrations = [];
            $scope.templates = [];
            $scope.emailTemplates = [];
            $scope.pdfTemplates = [];
            $scope.smsTemplates = [];
            $scope.lineItems = [];
            $scope.activationCode = [];
            $scope.companyTypes = [];
            $scope.workOrderStatuses = [];
            $scope.priorities = [];
            $scope.users = [];
            $scope.phoneNumbers = [];

            $scope.complexities = [
                { id: 'small', name: 'Small (Basic renovations)' },
                { id: 'medium', name: 'Medium (Standard remodels)' },
                { id: 'large', name: 'Large (Complex renovations)' },
                { id: 'enterprise', name: 'Enterprise (Custom renovations)' }
            ];
            $scope.budgetRange = [
                {
                    id: 'under-10k',
                    name: 'Under $10,000',
                },
                {
                    id: '10k-25k',
                    name: '$10,000 - $25,000',
                },
                {
                    id: '25k-50k',
                    name: '$25,000 - $50,000',
                },
                {
                    id: '50k-100k',
                    name: '$50,000 - $100,000',
                },
                {
                    id: '100k-250k',
                    name: '$100,000 - $250,000',
                },
                {
                    id: 'over-250k',
                    name: 'Over $250,000',
                }
            ];
            $scope.markets = [
                { id: 'residential', name: 'Residential' },
                { id: 'commercial', name: 'Commercial' },
                { id: 'industrial', name: 'Industrial' },
                { id: 'mixed', name: 'Mixed Use' }
            ];
            $scope.UI = {
                tab: urlParams.get('tab'),
                currentUrl: window.location.pathname.split( '/' ),
                currentStep: 1,
                formView: false,
                newEventType: false,
                newGroup: false,
                newGroupType: false,
                newForm: false,
                newTemplate: false,
                newLineItem: false,
                newEvent: false,
                newClient: false,
                newUser: false,
                newRole: false,
                newPermission: false,
                newTeam: false,
                newPhoneNumber: false,
                newGroup: false,
                newGroupType: false,
                newEventType: false,
                newEstimator: false,
                newQuestion: false,
                newVariable: false,
                newQuestionContainer: false,
                newLabor: false,
                generalSettingsLoaded: false,
                eventSettingsLoaded: false,
                userSettingsLoaded: false,
                eventTypesLoaded: false,
                eventTypeLoaded: false,
                estimatorsLoaded: false,
                estimatorLoaded: false,
                invoiceSettingsLoaded: false,
                eventsLoaded: false, 
                estimatesLoaded: false, 
                clientsLoaded: false, 
                groupLoaded: false,
                groupTypeLoaded: false,
                questionLoaded: false,
                questionContainerLoaded: false,
                variableLoaded: false,
                groupsLoaded: false,
                groupTypesLoaded: false,
                roleLoaded: false,
                foldersLoaded: false,
                formsLoaded: false,
                questionContainersLoaded: false,
                templateLoaded: false,
                templatesLoaded: false,
                lineItemsLoaded: false,
                variablesLoaded: false,
                laborLoaded: false,
                formLoaded: false,
                stripeSettingsLoaded: false,
                estimatorDeleteConfirmation: false,
                formSaving: false,
                hoursSaving: false,
                formSaved: false,
                modalFormSaved: false,
                searchingNumbers: false,
                purchasingNumber: false,
                releasingNumber: false,
                communicationsRefreshing: false,
                settingPrimary: false,
                removingPhoneNumber: false,
                settingsSaving: false,
                groupFormSelection: null,
                showLineItems: false,
                errMessage: null,
                mathCalculationLoading: false,
                mathCalculationResponse: null,
                mathCalculationParsed: null,
                msg: null,
                message: null,
                groupsDisplayed: 50,
                formBuilderOptions:{
                    disableFields: [
                        'autocomplete', 
                        'file',
                        'hidden'
                    ],
                    disabledAttrs: [
                    'className',
                    'style',
                    'subtype',
                    'name',
                    'rows',
                    'maxlength'
                    ],
                    disabledActionButtons: [
                        'clear',
                        'data',
                        'save'
                    ],
                    subtypes: {
                        text: ['Photo Select']
                    },
                },
            };

            $setup.updateScopes($scope, $scope.page.id || null);

            $scope.initAdmin = function () {
                $q.all(
                    [
                        $setup.getStates(),
                        $scope.initAdminTabs()
                    ]
                )
                .then(
                    function (responses) {
                        if (!responses[0].err) {
                            $scope.states = responses[0].states;
                        };
                    }
                );
                $timeout(
                    function () {
                        $(document).foundation();
                    }
                );
            };
            $scope.initAdminTabs = function () {
                var i = 0;
                $scope.initTabs = $interval(
                    function() {
                        i++;
                        if ($('#' + $scope.UI.tab + '-label').length) {
                            $('.tabs-title').removeClass('is-active');
                            $('.tabs-title a').attr('aria-selected', false);
                            $('.tabs-panel').removeClass('is-active');
                            $('#' + $scope.UI.tab + '-label').parent().addClass('is-active');
                            $('#' + $scope.UI.tab + '-label').attr('aria-selected', true)
                            $('#' + $scope.UI.tab).addClass('is-active');
                            angular.element('#' + $scope.UI.tab + '-label').triggerHandler('click');
                            $interval.cancel($scope.initTabs);
                            $(document).foundation();
                        } else {
                            $scope.initGeneralSettings();
                            $(document).foundation();
                            $interval.cancel($scope.initTabs);
                        }
                    }, 100
                );
            };
            $scope.initGeneralSettings = function () {
                var hours  = [];
                $scope.UI.generalSettingsLoaded = false;

                $q.all(
                    [
                        $setup.getDays(),
                        $admin.getCompany(),
                        $scope.initTemplates()
                    ]
                ).then(
                    function (responses) {
                        if (
                            !responses[0].err &&
                            !responses[1].err
                        ) {
                            $scope.days = responses[0].days;
                            $scope.general = responses[1].company;
                            $scope.company = responses[1].company;
                            _.each(
                                $scope.days,
                                function (day) {
                                    day.open = null;
                                    day.close = null;
                                    hours.push(day);
                                }
                            );
                            $scope.general.hours = hours;
                            $scope.UI.generalSettingsLoaded = true;
                        };
                    }
                );
            };
            $scope.initEventSettings = function() {
                // Define the whitelist for the tags
                var whitelist = [
                    { value: 'clientId', display: 'Client' },
                    { value: 'address', display: 'Address' },
                    { value: 'phoneNumber', display: 'Phone Number' },
                    { value: 'email', display: 'Email' },
                    { value: 'userId', display: 'User' },
                    { value: 'priorityId', display: 'Priority' },
                    { value: 'statusId', display: 'Status' },
                    { value: 'groupId', display: 'Group' },
                    { value: 'creatorId', display: 'Creator' },
                    { value: 'createdDate', display: 'Created Date' },
                    { value: 'eventTypeId', display: 'Event Type' },
                    { value: 'startDate', display: 'Start Date' },
                    { value: 'endDate', display: 'End Date' },
                ];
            
                // Additional settings for $scope.event and eventTypes
                $scope.UI.eventSettingsLoaded = false;
                $scope.UI.eventTypesLoaded = false;
                $scope.UI.rolesLoaded = false;
                $scope.UI.foldersLoaded = false;
                $scope.eventTypes = [];
                $scope.roles = [];
                $scope.folders = [];
            
                // Load event types and roles data from the backend
                $q.all([
                    $admin.getEventTypes($scope.user),
                    $admin.getGroups(),
                    $admin.getCompany(),
                    $form.getFolders(),
                    $scope.initTemplates()
                ]).then(function (responses) {

                    if (
                        !responses[0].err && 
                        !responses[1].err &&
                        !responses[2].err &&
                        !responses[3].err
                    ) {
                        $scope.eventTypes = responses[0].eventTypes;
                        $scope.groups = responses[1].groups;
                        $scope.event = responses[2].company;
                        $scope.folders = responses[3].folders;
                        $scope.UI.eventTypesLoaded = true;
                        $scope.UI.rolesLoaded = true;
                        $scope.UI.foldersLoaded = true;
                        $scope.UI.eventSettingsLoaded = true;

            
                        // Loop through each config in inputConfigs
                        const inputConfigs = [
                            { id: 'eventClientTitle', key: 'defaultEventClientTitle' },
                            { id: 'eventUserTitle', key: 'defaultEventUserTitle' },
                            { id: 'eventGroupTitle', key: 'defaultEventGroupTitle' },
                            { id: 'eventCompanyTitle', key: 'defaultEventCompanyTitle' }
                        ];
            
                        inputConfigs.forEach(function(config) {
                            var input = document.getElementById(config.id);
                            if (input && !input.hasAttribute('tabindex')) { 
                                // Initialize Tagify for mixed content mode
                                const  tagifyInstance = new Tagify(input, {
                                    mode: 'mix',  // Enable mixed-content mode
                                    pattern: /@/, // The pattern to trigger the suggestions menu (@ symbol)
                                    tagTextProp: 'display', // Display the 'display' property in the tag
                                    whitelist: whitelist,  // Set the whitelist
                                    dropdown: {
                                        enabled: 1,   // Show the dropdown when the pattern is detected
                                        position: 'text',  // Render the suggestions next to the typed text
                                        highlightFirst: true  // Highlight the first suggestion automatically
                                    }
                                });
            
                                // Handle the saving of data back to the model as a full string (tags + text)
                                tagifyInstance.on('change', function(e) {
                                    var fullText = e.detail.value;
                                    $scope.event[config.key] = fullText;  // Save the full text (tags + plain text) to the model

                                    $timeout(
                                        function () {
                                            $scope.$apply();  // Apply the scope changes
                                        }
                                    )
                                });
            
                                // Load existing event data into Tagify if available
                                if ($scope.event[config.key]) {
                                    var loadedData = $scope.event[config.key];
                                    var tags = [];
            
                                    // Extract tags from the format [[tagValue]]
                                    var pattern = /\[\[(.*?)\]\]/g;
                                    var match;
                                    while ((match = pattern.exec(loadedData)) !== null) {
                                        var tagValue = match[1];
                                        var item = whitelist.find(w => w.value === tagValue);
                                        if (item) {
                                            tags.push({ value: item.value, display: item.display });
                                        }
                                    }
            
                                    // Load the mixed text and tags into Tagify
                                    tagifyInstance.loadOriginalValues(loadedData, tags);
                                }
                            }
                        });
                    }
                }).catch(function (error) {
                    console.error('Error loading event types and groups:', error);
                });
            };            
            $scope.initEstimateSettings = function () {
                $scope.UI.estimateSettingsLoaded = false;
                $scope.lineItems = [];
                $scope.estimateStatuses = [];
                $scope.company = {};
                $scope.estimate = {};

                $q.all(
                    [
                        $estimate.getLineItems(),
                        $estimate.getStatuses(),
                        $admin.getCompany(),
                        $scope.initTemplates()
                    ]
                ).then(
                    function (responses) {
                        $scope.UI.estimateSettingsLoaded = true;
                        if (
                            !responses[0].err &&
                            !responses[1].err &&
                            !responses[2].err
                        ) {
                            $scope.lineItems = responses[0].lineItems;
                            $scope.estimateStatuses = responses[1].estimateStatuses;
                            $scope.estimate = responses[2].company;
                        };
                    }
                );
            };
            $scope.initEstimatorsSettings = function () {
                $scope.UI.estimatorSettingsLoaded = false;
                $scope.UI.estimatorsLoaded = false;

                $scope.estimators = [];

                $q.all(
                    [
                        $estimator.getEstimators(),
                        $admin.getCompany()
                    ]
                ).then(
                    function (responses) {
                        $scope.UI.estimatorSettingsLoaded = true;
                        $scope.UI.estimatorsLoaded = true;
                        if (
                            !responses[0].err &&
                            !responses[1].err
                        ) {
                            $scope.estimators = responses[0].estimators;
                            $scope.company = responses[1].company;
                        } else {
                            $scope.initErrorMessage(responses[0].msg || responses[1].msg);
                        }
                        $(document).foundation();
                    }
                ).catch(
                    function (err) {
                        $scope.UI.estimatorSettingsLoaded = true;
                        $scope.UI.estimatorsLoaded = true;

                        $scope.initErrorMessage('An error occurred while loading estimators.');
                    }
                );
            };
            $scope.initInvoiceSettings = function () {
                $scope.UI.invoiceSettingsLoaded = false;
                $scope.company = {};
                $scope.invoice = {};

                $admin.getCompany()
                .then(
                    function (response) {
                        $scope.UI.invoiceSettingsLoaded = true;
                        if (!response.err) {
                            $scope.invoice = response.company;
                        };
                    }
                );
            };
            $scope.initUserSettings = function () {
                $scope.UI.userSettingsLoaded = false;
                $scope.UI.rolesLoaded = false;
                $scope.UI.permissionsLoaded = false;
                $scope.UI.companyLoaded = false;
                $q.all(
                    [
                        $admin.getRoles(),
                        $admin.getPermissions(),
                        $admin.getCompany(),
                        $admin.getRoleWidgets()
                    ]
                ).then(
                    function (responses) {
                        $scope.UI.rolesLoaded = true;
                        $scope.UI.permissionsLoaded = true;
                        $scope.UI.userSettingsLoaded = true;
                        $scope.UI.companyLoaded = true;
                        if (
                            !responses[0].err &&
                            !responses[1].err &&
                            !responses[2].err
                        ) {
                            $scope.roles = responses[0].roles;
                            $scope.permissions = responses[1].permissions;
                            $scope.company = responses[2].company;
                            $(document).foundation();
                        }
                    }
                )
            };
            $scope.initGroupSettings = function () {
                $scope.UI.groupsLoaded = false;
                $scope.UI.groupTypesLoaded = false;
                $scope.UI.usersLoaded = false;
                $scope.groups = [];
                $scope.users = [];
                $scope.groupTypes = [];
                $scope.roles = [];

                $q.all(
                    [
                        $admin.getGroups(),
                        $user.getUsers(),
                        $admin.getRoles()
                    ]
                )
                .then(
                    function (responses) {
                        if (
                            !responses[0].err &&
                            !responses[1].err &&
                            !responses[2].err


                        ) {
                            $scope.UI.groupsLoaded = true;
                            $scope.UI.groupTypesLoaded = true;
                            $scope.UI.usersLoaded = true;
                            $scope.UI.rolesLoaded = true;
                            
                            $scope.users = responses[1].users;
                            $scope.roles = responses[2].roles;
                            $scope.groups = responses[0].groups;

                            _.each($scope.groups, function (group) {
                                // Ensure UserGroup contains only userId as strings
                                group.UserGroups = _.map(group.UserGroups, function (userGroup) {
                                    // Return the userId as a string
                                    return userGroup.userId;
                                });
                                // Ensure RoleGroup contains only userId as strings
                                group.RoleGroups = _.map(group.RoleGroups, function (RoleGroup) {
                                    // Return the userId as a string
                                    return RoleGroup.roleId;
                                });
                            });
                        };
                        $(document).foundation();
                    }
                );

            };             
            $scope.initWorkOrderSettings = function () {
                $scope.UI.workOrderSettingsLoaded = false;
                $scope.company = {};
                $scope.workOrder = {};

                $scope.workOrderStatuses = [];
                $scope.priorities = [];
                $scope.users = [];
                $scope.emailTemplates = [];
                $scope.pdfTemplates = [];
                $scope.smsTemplates = [];

                // Parallel requests: work order statuses, priorities, users, company, templates
                $q.all([
                    $workOrder.getWorkOrderStatuses(),
                    $setup.getPriorities(),
                    $user.getUsers(),
                    $admin.getCompany(),
                    $scope.initTemplates()
                ]).then(function (responses) {
                    $scope.UI.workOrderSettingsLoaded = true;

                    if (
                        !responses[0].err &&
                        !responses[1].err &&
                        !responses[2].err &&
                        !responses[3].err &&
                        !responses[4].err
                    ) {
                        $scope.workOrderStatuses = responses[0].workOrderStatuses || [];
                        $scope.priorities = responses[1].priorities || [];
                        $scope.users = responses[2].users || [];
                        $scope.workOrder = responses[3].company || {};
                        $scope.company = responses[3].company || {};

                        $(document).foundation();

                    } else {
                        $scope.initErrorMessage(responses[3].msg || 'An error occurred while loading work order settings.');
                    }
                }).catch(function (err) {
                    $scope.UI.workOrderSettingsLoaded = true;
                    $scope.initErrorMessage(err || 'An error occurred while loading work order settings.');
                });
            };
            $scope.initForm = function (form) {
                $scope.UI.formLoaded = false;
            
                $form.getForm({ id: form.id })
                    .then(function (response) {
                        $scope.UI.formLoaded = true;
            
                        if (!response.err) {
                            $scope.form = response.form;
                            $scope.UI.errMessage = ''; // Clear error messages on success
            
                            // Render the form in adminFormView
                            const formElement = document.getElementById('adminFormView');
                            if (formElement) {
                                // Clear any existing content
                                formElement.innerHTML = '';
            
                                // Use FormBuilder's render feature
                                $(formElement).formRender({
                                    dataType: 'json',
                                    formData: $scope.form.data,
                                    notify: {
                                        error: e => {
                                        }
                                        ,
                                        success: e => {
                                        }
                                        ,
                                        warning: e => {
                                        }
                                    },
                                });
                            }
                        } else {
                            $scope.initErrorMessage(response.msg);
                            console.error(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.formLoaded = true; // End loading state even on error
                        $scope.initErrorMessage('An error occurred while fetching the form.');
                        console.error(err);
                    });
            };        
            $scope.initTemplate = function (template) {
                $scope.UI.templateLoaded = false;
                $scope.template = {};
                $scope.shortCodes = [];

                $q.all(
                    [
                        $admin.getTemplate(template),
                        $admin.getShortCodes()
                    ]
                )
                .then(
                    function (responses) {
                        $scope.UI.templateLoaded = true;

                        if (
                            !responses[0].err &&
                            !responses[1].err
                        ) {
                            $scope.template = responses[0].template;
                            $scope.shortCodes = responses[1].shortCodes;

                            switch ($scope.template.type) {
                                case 'EMAIL':

                                break;
                                case 'PDF':
                                break;
                                case 'SMS':
                                break;
                            };
                        } else {
                            $scope.initErrorMessage(response.msg || "An error occurred while loading the template.");
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.templateLoaded = true;
                        $scope.initErrorMessage("An error occurred while loading templates.");
                    }
                )
            };
            $scope.initIntegration = function (integration) {
                $scope.UI.integrationLoaded = false;
                $scope.integration = {};
                
                $admin.getIntegration(integration)
                .then(
                    function (response) {
                        $scope.UI.integrationLoaded = true;
                        if (!response.err) {
                            $scope.integration = response.integration;
                        } else {
                            $scope.initErrorMessage(response.msg || "Error retrieving integration.");
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.integrationLoaded = true;
                        $scope.initErrorMessage(err.msg || "An error occurred while loading integration.");
                    }
                );
            };    
            $scope.initEstimator = function () {
                $scope.UI.estimatorLoaded = false;
                $scope.estimator = {};
                $scope.eventTypes = [];

                const data = {
                    id: $routeParams.estimatorId
                };

                if (!data.id) {
                    $scope.initErrorMessage("Estimator ID is required.");
                    return;
                };
                $q.all(
                    [
                        $estimator.getEstimator(data),
                        $admin.getEventTypes()
                    ]
                )
                .then(
                    function (responses) {
                        $scope.UI.estimatorLoaded = true;
                        if (
                            !responses[0].err &&
                            !responses[1].err
                        ) {
                            $scope.estimator = responses[0].estimator;
                            $scope.eventTypes = responses[1].eventTypes;
                        } else {
                            $scope.initErrorMessage(responses[0].msg || "Error retrieving estimator.");
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.estimatorLoaded = true;
                        $scope.initErrorMessage(err.msg || "An error occurred while loading estimator.");
                    }
                );
            };
            $scope.initQuestionContainer = function () {
                $scope.UI.questionContainerLoaded = false;
                $scope.UI.lineItemsLoaded = false;
                $scope.questionContainer = {};
                $scope.lineItems = [];

                $estimator.getQuestionContainer({ id: $routeParams.containerId })
                .then(
                    function (response) {
                        $scope.UI.questionContainerLoaded = true;
                        $scope.UI.lineItemsLoaded = true;

                        if (!response.err) {
                            $scope.questionContainer = response.questionContainer;
                            $scope.lineItems = response.lineItems || [];
                            if (!$scope.questionContainer.lineItemIds) {
                                $scope.questionContainer.lineItemIds = [];
                            }
                            
                            // Process validation rules for questions
                            if ($scope.questionContainer.Questions) {
                                $scope.questionContainer.Questions.forEach(function(question) {
                                    if (question.validationRules) {
                                        try {
                                            // Try to parse as JSON
                                            const parsedRules = JSON.parse(question.validationRules);
                                            question.validationRules = parsedRules;
                                        } catch (e) {
                                            // Keep as string if not JSON
                                        }
                                    }
                                });
                            }
                        } else {
                            $scope.initErrorMessage(response.msg || "Error retrieving question container.");
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.questionContainerLoaded = true;
                        $scope.initErrorMessage(err.msg || "An error occurred while loading question container.");
                    }
                );
            };
            $scope.initLineItems = function () {
                $scope.UI.lineItemsLoaded = false;
                $scope.lineItems = [];

                $estimate.getLineItems()
                .then(
                    function (response) {
                        $scope.UI.lineItemsLoaded = true;
                        if (!response.err) {
                            $scope.lineItems = response.lineItems;
                        };
                    }
                );
            };   
            $scope.initItems = function () {
                $scope.UI.itemsLoaded = false;
                $scope.searchItems();

                $scope.$watch(
                    'search.items.value', 
                    function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            $scope.search.page = 1;
                            $scope.searchItems();
                        }
                    }
                );
                angular.element($document)
                .bind(
                    'scroll', 
                    function() {
                        var container = angular.element(document.getElementById('itemsList'));
                        var lastLi = container.find('li').last();
            
                        if (lastLi.length) {
                            var lastLiOffset = lastLi.offset().top + lastLi.outerHeight();
                            var containerOffset = container.offset().top + container.outerHeight();
                
                            if (containerOffset >= lastLiOffset) {
                                if ($scope.search.page < $scope.pages) {
                                    $scope.search.page++;
                                    $scope.searchItems();
                                    $scope.$apply(); // Trigger a digest cycle to update the view
                                }
                            }
                        }
                    }   
                );
            };  
            $scope.initForms = function () {
                $scope.UI.foldersLoaded = false;
                $scope.folder = null;
                $scope.folders = [];
                $scope.nestedFormFolders = [];
                $scope.forms = []; // Store forms data
            
                // Destroy existing Tree and Dataview instances if they exist
                if ($scope.adminFormsTree) {
                    $scope.adminFormsTree.destructor();
                }
                if ($scope.adminFormsDataView) {
                    $scope.adminFormsDataView.destructor();
                }
            
                // Fetch folders and forms data
                $q.all([
                    $form.getFolders(),
                    $form.getForms()
                ])
                .then(function (responses) {
                    $scope.UI.foldersLoaded = true;
                    $scope.folders = responses[0].folders; // Flat folder structure
                    $scope.nestedFormFolders = responses[0].nestedFolders; // Nested folder structure
                    $scope.forms = responses[1].forms; // Forms data
            
                    if (!responses[0].err && !responses[1].err) {
                        // Map forms into the corresponding folders
                        function mapFormsToFolders(folders) {
                            return folders.map(folder => ({
                                value: folder.name,
                                id: folder.id.toString(),
                                opened: false,
                                isFolder: true, // Folders are always true
                                items: [
                                    // Map forms belonging to this folder
                                    ...$scope.forms
                                        .filter(form => form.folderId === folder.id)
                                        .map(form => ({
                                            value: form.name,
                                            id: `form-${form.id}`, // Use unique id prefix for forms
                                            description: form.description || '',
                                            isFolder: false, // Forms are not folders
                                        })),
                                    // Recursively map child folders
                                    ...mapFormsToFolders(folder.ChildFolders || [])
                                ]
                            }));
                        }
            
                        const treeData = mapFormsToFolders($scope.nestedFormFolders);

                        if (!$rootScope.UI.isMobile) {
                            // Initialize DHTMLX Tree
                            $scope.adminFormsTree = new dhtmlx.Tree("adminFormsList", {
                                data: treeData,
                                icon: {
                                    folder: "",
                                    openFolder: "",
                                    file: "",
                                },
                                template: function (item) {
                                    var iconClass = item.isFolder ? "fal fa-folder" : "fal fa-file";
                                    iconClass = item.opened ? 'fal fa-folder-open' : iconClass;
                                    if (item.items) {
                                        iconClass = !item.items.length ? 'fal fa-folder-xmark' : iconClass;
                                    }
                                    return `<div 
                                                class="tree-item"
                                                title="${item.description || ''}"
                                            >
                                                <div class="grid-x grid-margin-x align-middle">
                                                    <div class="cell small-1 medium-1 large-1">
                                                        <span class="tree-item-icon">
                                                            <i class="${iconClass}"></i>
                                                        </span>
                                                    </div>
                                                    <div class="cell auto">
                                                        <h6>
                                                            ${item.value}
                                                        </h6>
                                                    </div>
                                                </div>
                                            </div>`;
                                },
                                isFolder: function (item) {
                                    return item.isFolder;
                                },
                            });
                        }

                        const itemsInRow = $rootScope.UI.isMobile ? 2 : 6;
                        // Initialize DHTMLX Dataview
                        $timeout(function () {
                            $scope.adminFormsDataView = new dhtmlx.DataView("adminFormsDataViewContainer", {
                                data: treeData,
                                template: function (item) {
                                    var iconClass = item.isFolder ? "fal fa-folder" : "fal fa-file";
                                    iconClass = item.opened ? 'fal fa-folder-open' : iconClass;
                                    if (item.items) {
                                        iconClass = !item.items.length ? 'fal fa-folder-xmark' : iconClass;
                                    }
                                    const backgroundColor = item.isFolder ? "" : "background: var(--light-gray);";
                                
                                    return `<div 
                                                class="dataview-item"
                                                title="${item.description || ''}"
                                                style="${backgroundColor}"
                                            >
                                                <span class="dataview-item-icon">
                                                    <i class="${iconClass}"></i>
                                                </span>
                                                <h6>
                                                    ${item.value}
                                                </h6>
                                            </div>`;
                                },
                                itemsInRow: itemsInRow,
                                gap: 12,
                            });
            
                            // DataView event: Item Click
                            $scope.adminFormsDataView.events.on("click", function (id) {
                                // Find the folder by ID
                                $scope.folder = $scope.folders.find(f => f.id === parseInt(id));
                                $scope.form = null;
                                $scope.UI.formView = false;
            
                                if ($scope.folder) {
                                    // Map child folders to DataView items
                                    const folderItems = ($scope.folder.ChildFolders || []).map(child => ({
                                        id: child.id,
                                        value: child.name,
                                        description: child.description,
                                        isFolder: true,
                                    }));
            
                                    // Filter forms matching the folder ID and map them to DataView items
                                    const formItems = $scope.forms
                                        .filter(form => form.folderId === $scope.folder.id)
                                        .map(form => ({
                                            id: `form-${form.id}`,
                                            value: form.name,
                                            description: form.description || '',
                                            isFolder: false,
                                        }));
            
                                    // Combine folder and form items
                                    const dataViewItems = [...folderItems, ...formItems];
            
                                    // Update the DataView with the combined items
                                    $scope.adminFormsDataView.data.parse(dataViewItems);
                                } else {
                                    if (id.startsWith('form-')) {
                                        const formId = parseInt(id.replace('form-', ''), 10);
                                        if (!isNaN(formId)) {
                                            id = formId; // Return the parsed form ID as an integer
                                        }
                                        $scope.initForm({id: id});
                                        $scope.UI.formView = true;
                                    } else {
                                        return; // Return if the ID is not in the expected format
                                    }
                                }
            
                                $timeout(function () {
                                    $scope.$apply();
                                });
                            });
                        });
            
                        if (!$rootScope.UI.isMobile) {
                            // Tree event: Folder Click
                            $scope.adminFormsTree.events.on("itemClick", function (id) {
                                $scope.form = null;
                                $scope.UI.formView = false;
                                $scope.folder = $scope.folders.find(f => f.id.toString() === id);
                                if ($scope.folder) {
                                    // Map child folders to DataView items
                                    const folderItems = ($scope.folder.ChildFolders || []).map(child => ({
                                        id: child.id,
                                        value: child.name,
                                        description: child.description,
                                        isFolder: true,
                                    }));
                
                                    // Filter forms matching the folder ID and map them to DataView items
                                    const formItems = $scope.forms
                                        .filter(form => form.folderId === $scope.folder.id)
                                        .map(form => ({
                                            id: `form-${form.id}`,
                                            value: form.name,
                                            description: form.description || '',
                                            isFolder: false,
                                        }));
                
                                    // Combine folder and form items
                                    const dataViewItems = [...folderItems, ...formItems];
                
                                    // Update the DataView with the combined items
                                    $scope.adminFormsDataView.data.parse(dataViewItems);
                
                                    $timeout(function () {
                                        $scope.$apply();
                                    });
                                } else {
                                    if (id.startsWith('form-')) {
                                        const formId = parseInt(id.replace('form-', ''), 10);
                                        if (!isNaN(formId)) {
                                            id = formId; // Return the parsed form ID as an integer
                                        }
                                        $scope.initForm({id: id});
                                        $scope.UI.formView = true;
                                    } else {
                                        return; // Return if the ID is not in the expected format
                                    }
                                }
                            });
                
                            // Tree event: After Expand
                            $scope.adminFormsTree.events.on("afterExpand", function (id) {
                                $scope.folder = $scope.folders.find(f => f.id === parseInt(id));
                                $scope.form = null;
                                $scope.UI.formView = false;
                
                                if ($scope.folder) {
                                    const dataViewItems = ($scope.folder.ChildFolders || []).map(child => ({
                                        id: child.id,
                                        value: child.name,
                                        description: child.description,
                                        isFolder: true,
                                    }));
                
                                    const formItems = $scope.forms
                                        .filter(form => form.folderId === $scope.folder.id)
                                        .map(form => ({
                                            id: `form-${form.id}`,
                                            value: form.name,
                                            description: form.description || '',
                                            isFolder: false,
                                        }));
                
                                    $scope.adminFormsDataView.data.parse([...dataViewItems, ...formItems]);
                
                                    $timeout(function () {
                                        $scope.$apply();
                                    });
                                }
                            });
                
                            // Tree event: After Collapse
                            $scope.adminFormsTree.events.on("afterCollapse", function (id) {
                                $scope.folder = $scope.folders.find(f => f.ChildFolders.some(child => child.id === parseInt(id)));
                                $scope.form = null;
                
                                if ($scope.folder) {
                                    const dataViewItems = ($scope.folder.ChildFolders || []).map(child => ({
                                        id: child.id,
                                        value: child.name,
                                        description: child.description,
                                        isFolder: true,
                                    }));
                
                                    const formItems = $scope.forms
                                        .filter(form => form.folderId === $scope.folder.id)
                                        .map(form => ({
                                            id: `form-${form.id}`,
                                            value: form.name,
                                            description: form.description || '',
                                            isFolder: false,
                                        }));
                
                                    $scope.adminFormsDataView.data.parse([...dataViewItems, ...formItems]);
                                } else {
                                    $scope.adminFormsDataView.data.parse([]);
                                }
                
                                $timeout(function () {
                                    $scope.$apply();
                                });
                            });
                        }
                    } else {
                        $scope.initErrorMessage(responses[0].msg || responses[1].msg);
                    }
                })
                .catch(function (err) {
                    $scope.UI.foldersLoaded = true;
                    $scope.initErrorMessage("An error occurred while loading folders or forms.");
                    console.error(err);
                });
            }; 
            $scope.initTemplates = function () {
                $scope.UI.templatesLoaded = false;

                return $q.all(
                    [
                        $admin.getTemplates()
                    ]
                ).then(
                    function (responses) {
                        $scope.UI.templatesLoaded = true;
                        if (!responses[0].err) {
                            $scope.templates = responses[0].templates;

                            // Filter templates by type
                            $scope.emailTemplates = $scope.templates.filter(template => template.type === 'EMAIL');
                            $scope.pdfTemplates = $scope.templates.filter(template => template.type === 'PDF');
                            $scope.smsTemplates = $scope.templates.filter(template => template.type === 'SMS');
                        } else {
                            $scope.initErrorMessage(responses[0].msg);
                        };
                        return responses[0]; // Return the response for the parent promise chain
                    }
                ).catch(
                    function (err) {
                        $scope.UI.templatesLoaded = true;
                        $scope.initErrorMessage("An error occurred while loading templates.");
                        return { err: true, msg: "Template loading failed" }; // Return error response
                    }
                )
            };    
            $scope.initIntegrations = function () {
                $scope.UI.integrationsLoaded = false;
                $scope.integrations = [];
                
                $admin.getIntegrations()
                .then(
                    function (response) {
                        $scope.UI.integrationsLoaded = true;

                        if (!response.err) {
                            $scope.integrations = response.integrations;
                        } else {
                            $scope.initErrorMessage(response.msg || "Error retrieving integrations.");
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.integrationsLoaded = true;
                        $scope.initErrorMessage(err.msg || "An error occurred while loading integrations.");
                    }
                );
            };
            $scope.initSubscriptions = function () {
                $scope.UI.subscriptionsLoaded = false;

                $scope.subscriptions = [];
                $setup.getSubscriptions()
                .then(
                    function (response) {
                        $scope.UI.subscriptionsLoaded = true;

                        if (!response.err) {
                            $scope.subscriptions = response.subscriptions;
                            $log.log($scope.subscriptions)
                            _.each(
                                $scope.subscriptions,
                                function (subscription) {
                                    $log.log($rootScope.subscription)
                                    if (subscription.id == $rootScope.subscription.subscriptionPlanId) {
                                        subscription.selected = true;
                                    }
                                }
                            );
                        } else {
                            $scope.initErrorMessage(response.msg || "Error retrieving subscriptions.");
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.subscriptionsLoaded = true;
                        $scope.initErrorMessage(err.msg || "An error occurred while loading subscriptions.");
                    }
                );
            };
            $scope.initVariables = function () {
                $scope.UI.variablesLoaded = false;
                $scope.variables = [];

                $admin.getVariables()
                .then(
                    function (response) {
                        $scope.UI.variablesLoaded = true;
                        if (!response.err) {
                            $scope.variables = response.variables;
                        } else {
                            $scope.initErrorMessage(response.msg || "Error retrieving variables.");
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.variablesLoaded = true;
                        $scope.initErrorMessage(err.msg || "An error occurred while loading variables.");
                    }
                );
            };
            $scope.initLabor = function () {
                $scope.UI.laborLoaded = false;
                $scope.labor = [];

                $admin.getLabors()
                .then(
                    function (response) {
                        $scope.UI.laborLoaded = true;
                        if (!response.err) {
                            $scope.labor = response.labor;
                        } else {
                            $scope.initErrorMessage(response.msg || "Error retrieving labor roles.");
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.laborLoaded = true;
                        $scope.initErrorMessage(err.msg || "An error occurred while loading labor roles.");
                    }
                );
            };
            $scope.initLaborSettings = function () {
                $scope.initLabor();
            };
            $scope.initLaborForm = function (labor) {
                if (labor) {
                    $scope.UI.newLabor = false;
                    $scope.labor = angular.copy(labor);
                } else {
                    $scope.UI.newLabor = true;
                    $scope.labor = {
                        role: '',
                        rate: '',
                        overtimeRate: '',
                        standardHoursPerDay: 8
                    };
                }
                $scope.UI.laborLoaded = true;
                $scope.UI.formSaving = false;
                $scope.UI.message = '';
                $scope.UI.errMessage = '';
            };
            $scope.initArchivedUsers = function () {
                $scope.UI.usersLoaded = false;
                $scope.users = [];

                $admin.getArchivedUsers()
                .then(
                    function (response) {
                        $scope.UI.usersLoaded = true;
                        if (!response.err) {
                            $scope.users = response.users;
                        } else {
                            $scope.initErrorMessage(response.msg || "Error retrieving users.");
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.usersLoaded = true;
                        $scope.initErrorMessage(err.msg || "An error occurred while loading users.");
                    }
                );
            };
            $scope.initArchivedEvents = function () {
                $scope.UI.eventsLoaded = false;
                $scope.events = [];

                $admin.getArchivedEvents()
                .then(
                    function (response) {
                        $scope.UI.eventsLoaded = true;
                        if (!response.err) {
                            $scope.events = response.events;
                        } else {
                            $scope.initErrorMessage(response.msg || "Error retrieving events.");
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.eventsLoaded = true;
                        $scope.initErrorMessage(err.msg || "An error occurred while loading events.");
                    }
                );
            };
            $scope.initArchivedClients = function () {
                $scope.UI.clientsLoaded = false;
                $scope.clients = [];

                $admin.getArchivedClients()
                .then(
                    function (response) {
                        $scope.UI.clientsLoaded = true;
                        if (!response.err) {
                            $scope.clients = response.clients;
                        } else {
                            $scope.initErrorMessage(response.msg || "Error retrieving clients.");
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.clientsLoaded = true;
                        $scope.initErrorMessage(err.msg || "An error occurred while loading clients.");
                    }
                );
            }; 
            $scope.initArchivedEstimates = function () {
                $scope.UI.estimatesLoaded = false;
                $scope.estimates = [];

                $admin.getArchivedEstimates()
                .then(
                    function (response) {
                        $scope.UI.estimatesLoaded = true;
                        if (!response.err) {
                            $scope.estimates = response.estimates;
                        };
                    }
                );
            }; 
            $scope.initArchivedUsers = function () {
                $scope.UI.usersLoaded = false;
                $scope.users = [];

                $admin.getArchivedUsers()
                .then(
                    function (response) {
                        $scope.UI.usersLoaded = true;
                        if (!response.err) {
                            $scope.users = response.users;
                        };
                    }
                );
            };  
            $scope.initEventTypeForm = function (type) {
                $scope.UI.formSaving = false;
                $scope.UI.newEventType = false;
                $scope.UI.eventTypeLoaded = false;
                $scope.eventType = angular.copy(type);
                if (!type) {
                    $scope.UI.newEventType = true;
                    $scope.eventType = {
                        name: null,
                        user_id: $scope.user.id,
                        color: randomColor(),
                        groupsIds: [] 
                    };
                } else {
                    $scope.eventType.groupIds = _.map($scope.eventType.Groups, group => group.id.toString());
                };
                $scope.initEventTypeColor = $interval(
                    function() {
                        var id = document.getElementById('eventTypeColorPicker');
                        if (id) {
                            id.addEventListener(
                                "change",
                                function (evt) {
                                    $scope.eventType.backgroundColor = evt.detail.hex;
                                    $('#eventTypeColor')
                                    .attr('value', evt.detail.hex);
                                } 
                            );
                            id.color = $scope.eventType.color;
                            $timeout(
                                function () {
                                    id.color = $scope.eventType.color;
                                }
                            )
                            $interval.cancel($scope.initEventTypeColor);
                        }
                    }
                );
                $scope.UI.eventTypeLoaded = true;
                $(document).foundation();
            };
            $scope.initEstimatorForm = function (estimator) {
                $scope.UI.formSaving = false;
                $scope.UI.newEstimator = false;
                $scope.UI.estimatorLoaded = false;
                $scope.UI.estimatorAi = false;
                $scope.estimator = angular.copy(estimator);

                if (!$scope.estimator) {
                    $scope.UI.newEstimator = true;
                    $scope.estimator = {
                        name: null,
                        description: null,
                    };
                }
                $scope.UI.estimatorLoaded = true;
                if (!$scope.eventTypes || !$scope.eventTypes.length) {
                    $admin.getEventTypes($scope.user).then(function(response) {
                        if (!response.err) {
                            $scope.eventTypes = response.eventTypes;
                        }
                    });
                };
            };
            $scope.initEstimatorAIForm = function(estimator) {
                $scope.UI.estimatorAi = true;
                $scope.UI.step = 1;
                $scope.UI.aiAnalyzing = false;
                $scope.UI.aiAnalysisComplete = false;
                $scope.UI.showEventDetails = false;
                $scope.UI.errorMessage = null;
                $scope.UI.message = null;
                
                if (!estimator) {
                    $scope.estimator = {
                        title: null,
                        eventTypeId: 1000,
                        eventDetails: '',
                        description: '',
                        complexity: null,
                        budgetRange: null,
                        targetMarket: null,
                        components: [],
                        selectedQuestions: [],
                        recommendedQuestions: [],
                        aiAnalysis: null,
                        options: {
                            includeFormulas: true,
                            includeVariables: true,
                            includeLineItems: true,
                            includeValidation: true
                        }
                    };
                }
            };
            $scope.initGroupForm = function (group) {
                $scope.UI.formSaving = false;
                $scope.UI.newGroup = false;
                $scope.UI.groupLoaded = false;
                $scope.group = angular.copy(group);
                if (!group) {
                    $scope.UI.newGroup = true;
                    $scope.group = {
                        name: null,
                        description: null,
                        calendar: false,
                        userId: $scope.user.id,
                        typeId: null
                    };
                };
                $scope.UI.groupLoaded = true;
            };
            $scope.initUserRoleForm = function (role) {
                var pages = [];
                var pagePermissions = [];
                var rolePermissionIds = [];
                $scope.UI.newRole = false;
                $scope.UI.roleLoaded = false;
                $scope.UI.rolesLoaded = false;
                $scope.pages = [];
                $scope.roles = [];
                $scope.permissions = [];
                $scope.widgets = [];
                $scope.company = [];
                $scope.roleWidgets = [];
            
                if (!role) {
                    $scope.UI.newRole = true;
                }
            
                $q.all([
                    $admin.getRolePermissions(),
                    $admin.getPermissions(),
                    $admin.getCompany(),
                    $setup.getPages(),
                    $admin.getWidgets(),
                    $admin.getRoleWidgets()
                ]).then(function (responses) {
                    $scope.UI.roleLoaded = true;
                    $scope.UI.rolesLoaded = true;
                    if (
                        !responses[0].err &&
                        !responses[1].err &&
                        !responses[2].err &&
                        !responses[3].err &&
                        !responses[4].err &&
                        !responses[5].err
                    ) {
                        $scope.roles = responses[0].roles;
                        $scope.permissions = responses[1].permissions;
                        $scope.company = responses[2].company;
                        $scope.widgets = responses[4].widgets;
                        $scope.roleWidgets = responses[5].widgets; // All role widgets, filter below
                        $scope.role = _.find(
                            $scope.roles,
                            function (r) {
                                return r.id == role.id;
                            }
                        );
            
                        pages = _.cloneDeep(responses[3].pages);
                        pagePermissions = _.groupBy($scope.permissions, 'pageId');
                        _.forEach(pages, page => {
                            page.permissions = pagePermissions[page.id] || [];
                        });
            
                        if ($scope.role) {
                            rolePermissionIds = _.map($scope.role.Permissions, 'id');
                            _.forEach(pages, page => {
                                _.forEach(page.permissions, permission => {
                                    permission.selected = false;
                                    var isSelected = _.includes(rolePermissionIds, permission.id);
                                    if (isSelected) {
                                        permission.selected = true;
                                    }
                                });
                            });
            
                            $scope.pages = pages;
                        }
            
                        // Filter roleWidgets to only include those related to the current role
                        var roleWidgetIds = _.map($scope.roleWidgets, function (widget) {
                            return widget.roleId === $scope.role.id ? widget.widgetId : null;
                        }).filter(id => id !== null);
                        
                        _.forEach($scope.widgets, widget => {
                            widget.selected = _.includes(roleWidgetIds, widget.id);
                        });
            
                        // Ensure the digest cycle runs to update the bindings
                        $timeout(function () {
                            $scope.$apply();
                        });
                    }
                });
            };
            $scope.initFolderForm = function (folder) {
                $scope.UI.formSaving = false;
                $scope.UI.newFolder = false;
                $scope.UI.folderLoaded = false;
                $scope.folder = angular.copy(folder) || {
                    name: null,
                    description: null,
                    parentFolderId: null
                };
                if ($scope.folder.parentFolderId) {
                    $scope.UI.parentFolder = true;
                }
                $scope.UI.newFolder = !folder;
                $scope.UI.folderLoaded = true;
            };   
            $scope.initFormBuilderForm = function (form) {
                $scope.form = {
                    data: null
                };

                if (form) {
                    $scope.form = angular.copy(form); 
                };
                $('#formBuilder').remove();
                $('#formBuilderContainer').append(
                    '<div class="form-builder"' +
                    'id="formBuilder"></div>');
                $('#formBuilderSubmitButton').off('click');
                $timeout(
                    function () {
                        const fields = [{
                            label: 'Photo Select',
                            type: 'text',
                            subtype: "Photo Select",
                            icon: '<i class="fal fa-image"></i>',
                        }];

                        $scope.UI.formBuilderOptions.onAddField = function(fieldId, fieldData) {
                            const data = fieldData;
    
                            if (data.subtype === 'Photo Select' || 
                            data.subtype === 'Video Select' ||
                            data.subtype === 'Document Select'
                            ) {
                                // check if theres another field with the same subtype
                                let existingFields = $scope.formBuilder.actions.getData();
                                if (!existingFields || !Array.isArray(existingFields)) {
                                    existingFields = [];
                                };
                                const existingField = existingFields.find(f => f.subtype === data.subtype);

                                if (existingField && existingField.id !== fieldId) {
                                    $scope.initErrorMessage(`Only 1 "${data.label}" field is allowed per form. 
                                    Please remove the existing "${existingField.label}" field before adding a new one.`);
                                    $scope.formBuilder.actions.removeField(fieldId);
                                    $scope.$apply();
                                    return false;
                                }
                            }
                        },
                        $scope.formBuilder = $('#formBuilder').formBuilder({
                            ...$scope.UI.formBuilderOptions,
                            fields,
                        });
                        if ($scope.form) {
                            $scope.formBuilder.promise
                            .then(
                                function (fb) {
                                    fb.actions.setData($scope.form.data);
                                }
                            );
                        }
                        $('#formBuilderSubmitButton').on(
                            'click', 
                            function() {
                                $scope.form.data = $scope.formBuilder.actions.getData(
                                    'json',
                                    true
                                );
                                if ($scope.form.id) {
                                    $scope.updateForm($scope.form)
                                } else {
                                    $scope.createForm($scope.form)
                                }
                            }
                        );
                        $scope.UI.formBuilderLoaded = true;
                    }
                );
            };
            $scope.initTemplateForm = function (template) {
                $scope.UI.formSaving = false;
                $scope.UI.newTemplate = true;
                $scope.UI.templateLoaded = false;
                $scope.template = angular.copy(template) || {
                    name: null,
                    description: null,
                    data: null,
                };
                if (template) {
                    $scope.UI.newTemplate = false;

                    $('#fileUploader').on('change', function(event) {
                        $scope.initTemplateFilePrevew(event);
                    });
                };
                $scope.UI.templateLoaded = true;

            };
            $scope.initQuestionContainerForm = function (questionContainer) {
                $scope.UI.formSaving = false;
                $scope.UI.newQuestionContainer = false;
                $scope.UI.questionContainerLoaded = false;
    
                $scope.questionContainer = angular.copy(questionContainer);
    
                if (!questionContainer) {
                    $scope.UI.newQuestionContainer = true;
                    $scope.questionContainer = {
                        estimatorId: $scope.estimator.id,
                        name: null,
                        displayOrder: $scope.questionContainers.length + 1
                    }
                };
                $scope.UI.questionContainerLoaded = true;
            };
            $scope.initQuestionForm = function (question) {

                $scope.UI.questionLoaded = false;
                $scope.UI.newQuestion = false;
                $log.log(question)
                $scope.question = angular.copy(question);
                
                // Parse validation rules if they exist
                if ($scope.question && $scope.question.validationRules) {
                    $scope.question.valitions = true;
                    
                    // Store original rules as string for parsing
                    const originalRules = typeof $scope.question.validationRules === 'string' 
                        ? $scope.question.validationRules 
                        : JSON.stringify($scope.question.validationRules);
                    
                    try {
                        // Try to parse as JSON first
                        const parsedRules = JSON.parse(originalRules);
                        
                        if (parsedRules.min !== undefined && parsedRules.max !== undefined) {
                            // Min/Max range validation
                            $scope.question.validationType = 'range';
                            $scope.question.validationMin = parsedRules.min;
                            $scope.question.validationMax = parsedRules.max;
                        } else {
                            // Single value validation (legacy format)
                            $scope.question.validationType = 'single'; 
                            // Parse old format like "> 5" or "= test"
                            const ruleMatch = originalRules.match(/^([><=!]+)\s*(.+)$/);
                            if (ruleMatch) {
                                $scope.question.validationOperator = ruleMatch[1];
                                $scope.question.validationValue = ruleMatch[2];
                            }
                        }
                    } catch (e) {
                        // Handle legacy string format like "> 5"
                        $scope.question.validationType = 'single';
                        const ruleMatch = originalRules.match(/^([><=!]+)\s*(.+)$/);
                        if (ruleMatch) {
                            $scope.question.validationOperator = ruleMatch[1];
                            $scope.question.validationValue = ruleMatch[2];
                        }
                    }
                }
                
                if (!question) {
                    $scope.UI.newQuestion = true;
                    $scope.question = {
                        containerId: $scope.questionContainer.id,
                        questionText: null,
                        inputType: null,
                        defaultValue: null,
                        validationRules: null,
                        validationType: 'range', // Default to range validation
                        validationMin: null,
                        validationMax: null,
                        validationOperator: null,
                        validationValue: null,
                        formulaReference: null,
                        displayOrder: $scope.questionContainer.Questions.length + 1,
                        isRequired: false,
                        isVisible: true,
                        isEditable: true,
                    };
                };
                $scope.UI.questionLoaded = true;
            };
            $scope.initVariableForm = function (variable) {
                $scope.UI.formSaving = false;
                $scope.UI.newVariable = false;
                $scope.UI.variableLoaded = false;

                $scope.variable = angular.copy(variable);
                if (!variable) {
                    $scope.UI.newVariable = true;
                    $scope.variable = {
                        name: null,
                        value: null,
                        description: null,
                    };
                };
                $scope.UI.variableLoaded = true;
            };
            $scope.initFormulaForm = function (formula) {
                $scope.UI.formSaving = false;
                $scope.UI.newFormula = false;
                $scope.UI.formulaLoaded = false;

                $scope.mathCalculation = null;

                $scope.variables = [];
                $scope.formula.expression = null;

                $q.all(
                    [
                        $estimator.getFormula({containerId: $scope.questionContainer.id}),
                        $admin.getVariables(),
                        $estimator.getQuestionContainer({id: $scope.questionContainer.id})
                    ]
                )
                .then(
                    function (responses) {
                        $scope.UI.formulaLoaded = true;

                        if (
                            !responses[0].err &&
                            !responses[1].err &&
                            !responses[2].err
                        ) {

                            const formulaEditor = document.getElementById('formulaMath');
                            $scope.formula = responses[0].formula;
                            $scope.variables = responses[1].variables;
                            
                            if (!$scope.formula) {
                                $scope.UI.newFormula = true;
                                $scope.formula = {
                                    expression: null,
                                    dependsOnQuestions: [],
                                    containerId: $scope.questionContainer.id,
                                    name: null
                                };
                            };

                            // remove formula editor if it exists
                            if (formulaEditor) {
                                formulaEditor.remove();
                            }
                            $('#formulaMathInputContainer').append(
                                `<span 
                                    class="form-input" 
                                    id="formulaMath"
                                ></span>`
                            );
                            
                            const MQ = MathQuill.getInterface(2);
                            const mathField = MQ.MathField(document.getElementById('formulaMath'), {
                                spaceBehavesLikeTab: true, // configurable
                                handlers: {
                                    edit: function(expression) {

                                        // copy only text inside the formula editor
                                        const latex = mathField.latex();
                                        $scope.formula.expression = latex;
                                        $scope.UI.mathCalculationLoading = true;
                                        $scope.UI.mathCalculationResponse = null;

                                        $timeout(function() {
                                            $scope.$apply();
                                        });
                                    }
                                }
                            });
                            mathField.latex($scope.formula.expression || '');
                            const calculateMath = function(latex) {
                                return latex// Handle fractions: \frac{a}{b} → (a)/(b)
                                .replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)')
                            
                                // Math functions
                                .replace(/\\sqrt{([^}]*)}/g, 'sqrt($1)')
                                .replace(/\\pi/g, 'pi')
                                .replace(/\\cdot/g, '*')
                                .replace(/\\times/g, '*')
                                .replace(/\\div/g, '/')
                                .replace(/\\pm/g, '+') // fallback
                            
                                // Trig functions
                                .replace(/\\sin/g, 'sin')
                                .replace(/\\cos/g, 'cos')
                                .replace(/\\tan/g, 'tan')
                                .replace(/\\log/g, 'log')
                                .replace(/\\ln/g, 'log')
                            
                                // Superscripts: x^{2} → (x)^2
                                .replace(/([a-zA-Z0-9]+)\^\{([^}]+)\}/g, '($1)^($2)')
                                .replace(/([a-zA-Z0-9]+)\^([0-9]+)/g, '($1)^($2)') // fallback for ^2
                            
                                // Insert * between number and letter: 2x → 2*x
                                .replace(/(\d)([a-zA-Z])/g, '$1*$2')
                                .replace(/([a-zA-Z])(\d)/g, '$1*$2')
                            
                                // Insert * between closing parenthesis and number/letter: (2+3)4 → (2+3)*4
                                .replace(/(\))(\d|[a-zA-Z])/g, '$1*$2')
                            
                                // Insert * between number/letter and opening parenthesis: 4(2+3) → 4*(2+3)
                                .replace(/(\d|[a-zA-Z])\(/g, '$1*(')
                            
                                // Clean up whitespace
                                .replace(/\s+/g, '');
                            }
                            const mathInterval = $interval(
                                function() {
                                    $scope.UI.mathCalculationLoading = false;
                                    $scope.UI.mathCalculationParsed = null;
                                    $scope.mathCalculation = null;

                                    if ($scope.formula.expression) {
                                        try {
                                            // Find all potential variables, formula references, or numbers in the formula
                                            const matches = $scope.formula.expression.match(/([a-zA-Z_]\w*|\d+|\\[a-z]+)/g);

                                            if (matches) {
                                                const missingReferences = [];
                                                const mathKeywords = ['cdot', 'frac', 'sqrt', 'pi', 'sin', 'cos', 'tan', 'log', 'ln', 'times', 'div', 'pm']; // Common math expressions
                                                const resolvedExpression = $scope.formula.expression.replace(/([a-zA-Z_]\w*|\d+|\\[a-z]+)/g, function(match) {
                                                    // If the match is a number, keep it as is
                                                    if (!isNaN(match)) {
                                                        return match;
                                                    }

                                                    // Handle cases where math keywords are followed by numbers (e.g., cdot500)
                                                    const keywordMatch = match.match(/(\\?[a-z]+)(\d+)/);
                                                    if (keywordMatch) {
                                                        const keyword = keywordMatch[1];
                                                        const number = keywordMatch[2];
                                                        if (mathKeywords.includes(keyword.replace('\\', ''))) {
                                                            return number; // Use the numeric part
                                                        }
                                                    }

                                                    // Filter out common math expressions
                                                    if (mathKeywords.includes(match.replace('\\', ''))) {
                                                        return match; // Leave math expressions unchanged
                                                    }

                                                    // Check if the match is a variable
                                                    const variable = $scope.variables.find(v => v.name === match);
                                                    if (variable) {
                                                        return variable.value || 0; // Use variable value or default to 0
                                                    }

                                                    // Check if the match is a formulaReference from questions
                                                    const question = $scope.questionContainer.Questions.find(q => q.formulaReference === match);
                                                    if (question) {
                                                        if (question.defaultValue) {
                                                            return question.defaultValue; // Use default value if available
                                                        } else if (question.options) {
                                                            // Handle options by extracting the numeric value after "||"
                                                            const options = question.options.split(',').map(opt => {
                                                                const parts = opt.split('||');
                                                                return parts[1] ? parts[1].trim() : 0; // Extract numeric part or default to 0
                                                            });
                                                            return options.length > 0 ? options[0] : 0; // Use the first numeric value or default to 0
                                                        } else {
                                                            return 0; // Default to 0 if no value or options are available
                                                        }
                                                    }

                                                    // If neither variable, formulaReference, nor valid math keyword is found, mark as missing
                                                    missingReferences.push(match);
                                                    return match; // Leave the match unchanged if it's not recognized
                                                });

                                                if (missingReferences.length > 0) {
                                                    $scope.UI.mathCalculationResponse = `The following references are missing: ${missingReferences.join(', ')}`;
                                                } else {
                                                    $scope.UI.mathCalculationResponse = null; // Clear any previous error message
                                                }

                                                // Parse and evaluate the resolved expression
                                                const parsed = calculateMath(resolvedExpression);
                                                $scope.UI.mathCalculationParsed = parsed;
                                                $scope.mathCalculation = math.evaluate(parsed);
                                            } else {
                                                // No variables, references, or numbers found, evaluate the expression directly
                                                const parsed = calculateMath($scope.formula.expression);
                                                $scope.UI.mathCalculationParsed = parsed;
                                                $scope.mathCalculation = math.evaluate(parsed);
                                                $scope.UI.mathCalculationResponse = null;
                                            }
                                        } catch (err) {
                                            // Handle evaluation errors
                                            $scope.mathCalculation = null;
                                            $scope.UI.mathCalculationResponse = "Unable to evaluate the formula. Please check for errors.";
                                        }
                                        $timeout(function() {
                                            $scope.$apply();
                                        });
                                    }
                                }, 1000
                            );
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formulaLoaded = true;
                        $scope.initErrorMessage(err.msg || "An error occurred while loading the formula.");
                    }
                );

                $(document).on('close.zf.reveal', function() {
                    $interval.cancel(mathInterval);
                });


            };         
            $scope.initLineItemForm = function (lineItem) {
                $scope.UI.formSaving = false;
                $scope.UI.newLineItem = false;
                $scope.UI.lineItemLoaded = false;
                
                $scope.lineItem = angular.copy(lineItem);
                if (!lineItem) {
                    $scope.UI.newLineItem = true;
                    $scope.lineItem = {
                        name: null,
                        description: null,
                        quantity: 1,
                        rate: 0,
                        unit: 'Each',
                        subTotal: 0,
                        total: 0,
                        taxable: false,
                        markup: 0,
                        userId: $scope.user.id,
                        salesTaxRate: 0,
                        salesTaxTotal: 0,
                        moduleDescription: null,
                        instructions: null,
                    };
                };
                $scope.UI.lineItemLoaded = true;
            };
            $scope.initCompanySetupForm = function () {
                $scope.UI.formSaving = false;
                $scope.UI.companySetupsLoaded = false;

                $scope.companyTypes = [];
                $scope.states = [];
                $scope.activationCode = ['', '', '', '', '', ''];

                const string = urlParams.get('string') || null;

                $q.all([
                    $setup.getCompanyTypes(),
                    $setup.getStates()
                ]).then(
                    function (responses) {
                        $scope.UI.companySetupsLoaded = true;
                        if (!responses[0].err) {
                            $scope.companyTypes = responses[0].companyTypes;
                            $scope.states = responses[1].states || [];
                        }
                        if (string) {
                            $scope.activationCode = string.split('');

                            $scope.validateActivationCode();
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.companySetupsLoaded = true;
                        $scope.initErrorMessage(err || "An error occurred while loading company types.");
                    }
                );
            };
            $scope.initStripeSettings = function () {
                $scope.UI.stripeSettingsLoaded = false;
                $scope.UI.paymentMethodsLoaded = false;
                $scope.stripe = {
                    account: {},
                    paymentMethods: [],
                    achSettings: {
                        enabled: false,
                        processingFee: 0.80,
                        requireVerification: true
                    }
                };

                $admin.getStripeSettings()
                    .then(function (response) {
                        $scope.UI.stripeSettingsLoaded = true;
                        $scope.UI.paymentMethodsLoaded = true;
                        
                        if (!response.err) {
                            $scope.stripe.account = response.account || {};
                            $scope.stripe.paymentMethods = response.paymentMethods || [];
                            $scope.stripe.achSettings = response.achSettings || {};
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.stripeSettingsLoaded = true;
                        $scope.UI.paymentMethodsLoaded = true;
                        $scope.initErrorMessage('Failed to load Stripe settings');
                        console.error(err);
                    });
            };
            $scope.initPaymentMethodForm = function () {
                $scope.UI.formSaving = false;
                $scope.paymentMethod = {
                    name: '',
                    description: '',
                    removable: true
                };
            };
            // Communications Functions
            $scope.initCommunications = function () {
                $scope.UI.communicationsLoaded = false;
                $scope.communications = {
                    settings: {
                        communicationsEnabled: false,
                        setupComplete: false,
                        primaryPhoneNumber: null,
                        monthlyLimit: 1000,
                        monthlyUsed: 0,
                        communicationsSettings: {}
                    },
                    phoneNumbers: [],
                    availableNumbers: [],
                    searchCriteria: {}
                };

                $admin.getCommunicationsSettings()
                    .then(function (response) {
                        $scope.UI.communicationsLoaded = true;
                        
                        if (!response.err) {
                            $scope.communications.settings = response.settings || {};
                            $scope.communications.phoneNumbers = response.phoneNumbers || [];

                            $(document).foundation();
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.communicationsLoaded = true;
                        $scope.initErrorMessage('Failed to load communications settings');
                        console.error(err);
                    });
            };
            $scope.initCommunicationsOnboarding = function () {
                $scope.UI.communicationsOnboardingActive = true;
                // For now, just show the phone number form
                // In future, this could be a multi-step onboarding wizard
                $scope.initPhoneNumberForm();
                $scope.UI.communicationsOnboardingActive = false;
            };
            $scope.initPhoneNumberForm = function () {
                $scope.UI.formSaving = false;
                $scope.phoneNumber = {
                    number: '',
                    type: 'Mobile'
                };
            };
            $scope.refreshCommunicationsSettings = function () {
                $scope.UI.communicationsRefreshing = true;
                
                $admin.getCommunicationsSettings()
                    .then(function (response) {
                        $scope.UI.communicationsRefreshing = false;
                        
                        if (!response.err) {
                            $scope.communications.settings = response.settings || {};
                            $scope.communications.phoneNumbers = response.phoneNumbers || [];
                            $scope.initFormSaved('Communications settings refreshed successfully');
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.communicationsRefreshing = false;
                        $scope.initErrorMessage('Error refreshing communications settings');
                        console.error(err);
                    });
            };
            $scope.updateCommunicationsSettings = function (e, settings) {
                if (e) {
                    e.preventDefault();
                }
                $scope.UI.settingsSaving = true;
                
                $admin.updateCommunicationsSettings(settings)
                    .then(function (response) {
                        $scope.UI.settingsSaving = false;
                        
                        if (!response.err) {
                            $scope.communications.settings = angular.merge($scope.communications.settings, response.settings);
                            $scope.initFormSaved('Communications settings updated successfully');
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.settingsSaving = false;
                        $scope.initErrorMessage('Error updating communications settings');
                        console.error(err);
                    });
            };
            $scope.createPhoneNumber = function (e, phoneNumber) {
                if (e) {
                    e.preventDefault();
                }
                $scope.UI.formSaving = true;
                
                $admin.addCompanyPhoneNumber(phoneNumber)
                    .then(function (response) {
                        $scope.UI.formSaving = false;
                        
                        if (!response.err) {
                            $scope.communications.phoneNumbers.push(response.phoneNumber);
                            
                            // If this is the first phone number, set it as primary and complete setup
                            if ($scope.communications.phoneNumbers.length === 1) {
                                $scope.setPrimaryPhoneNumber(response.phoneNumber, true);
                            }
                            
                            $scope.initModalFormSaved('Phone number added successfully');
                            $('#addPhoneNumberReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage('Error adding phone number');
                        console.error(err);
                    });
            };
            $scope.setPrimaryPhoneNumber = function (phoneNumber, skipCompleteSetup) {
                $scope.UI.settingPrimary = true;
                
                const settings = {
                    primaryPhoneNumberId: phoneNumber.id
                };
                
                $admin.updateCommunicationsSettings(settings)
                    .then(function (response) {
                        $scope.UI.settingPrimary = false;
                        
                        if (!response.err) {
                            $scope.communications.settings.primaryPhoneNumber = phoneNumber;
                            $scope.initFormSaved('Primary phone number updated successfully');
                            
                            // Complete setup if this is the first phone number
                            if (!skipCompleteSetup && !$scope.communications.settings.setupComplete) {
                                $scope.completeCommunicationsSetup();
                            }
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.settingPrimary = false;
                        $scope.initErrorMessage('Error setting primary phone number');
                        console.error(err);
                    });
            };
            $scope.removePhoneNumber = function (phoneNumber) {
                if (!confirm('Are you sure you want to remove this phone number?')) {
                    return;
                }
                
                $scope.UI.removingPhoneNumber = true;
                
                $admin.removeCompanyPhoneNumber({ id: phoneNumber.id })
                    .then(function (response) {
                        $scope.UI.removingPhoneNumber = false;
                        
                        if (!response.err) {
                            const index = $scope.communications.phoneNumbers.findIndex(pn => pn.id === phoneNumber.id);
                            if (index > -1) {
                                $scope.communications.phoneNumbers.splice(index, 1);
                            }
                            
                            // Clear primary phone number if this was it
                            if ($scope.communications.settings.primaryPhoneNumber && 
                                $scope.communications.settings.primaryPhoneNumber.id === phoneNumber.id) {
                                $scope.communications.settings.primaryPhoneNumber = null;
                            }
                            
                            $scope.initFormSaved('Phone number removed successfully');
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.removingPhoneNumber = false;
                        $scope.initErrorMessage('Error removing phone number');
                        console.error(err);
                    });
            };
            $scope.completeCommunicationsSetup = function () {
                $admin.completeCommunicationsSetup()
                    .then(function (response) {
                        if (!response.err) {
                            $scope.communications.settings.setupComplete = true;
                            $scope.communications.settings.communicationsEnabled = true;
                            $scope.initFormSaved('Communications setup completed successfully! You can now send text messages to clients.');
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.initErrorMessage('Error completing communications setup');
                        console.error(err);
                    });
            };

            // Twilio Phone Number Functions
            $scope.searchTwilioPhoneNumbers = function (searchCriteria) {
                $scope.UI.searchingNumbers = true;
                $scope.communications.availableNumbers = [];
                
                $admin.searchTwilioPhoneNumbers(searchCriteria || {})
                    .then(function (response) {
                        $scope.UI.searchingNumbers = false;
                        
                        if (!response.err) {
                            $scope.communications.availableNumbers = response.phoneNumbers;
                            $scope.initFormSaved(`Found ${response.count} available phone numbers`);
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.searchingNumbers = false;
                        $scope.initErrorMessage('Error searching phone numbers');
                        console.error(err);
                    });
            };

            $scope.purchaseTwilioPhoneNumber = function (availableNumber) {
                if (!confirm(`Purchase phone number ${availableNumber.phoneNumber}?`)) {
                    return;
                }
                
                $scope.UI.purchasingNumber = true;
                
                const purchaseData = {
                    phoneNumber: availableNumber.phoneNumber,
                    friendlyName: `${$scope.company.name} - Communications`,
                    type: 'Mobile',
                    locality: availableNumber.locality,
                    region: availableNumber.region,
                    postalCode: availableNumber.postalCode
                };
                
                $admin.purchaseTwilioPhoneNumber(purchaseData)
                    .then(function (response) {
                        $scope.UI.purchasingNumber = false;
                        
                        if (!response.err) {
                            $scope.communications.phoneNumbers.push(response.phoneNumber);
                            
                            // Remove from available numbers
                            const index = $scope.communications.availableNumbers.findIndex(
                                num => num.phoneNumber === availableNumber.phoneNumber
                            );
                            if (index > -1) {
                                $scope.communications.availableNumbers.splice(index, 1);
                            }
                            
                            // If this is the first phone number, set it as primary and complete setup
                            if (response.isPrimary) {
                                $scope.communications.settings.primaryPhoneNumber = response.phoneNumber;
                                $scope.completeCommunicationsSetup();
                            }
                            
                            $scope.initFormSaved('Phone number purchased and added successfully!');
                            $('#communicationsPhoneSearchReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.purchasingNumber = false;
                        $scope.initErrorMessage('Error purchasing phone number');
                        console.error(err);
                    });
            };

            $scope.releaseTwilioPhoneNumber = function (phoneNumber) {
                if (!phoneNumber.isPurchased) {
                    $scope.initErrorMessage('Only purchased phone numbers can be released');
                    return;
                }
                
                if (!confirm(`Release phone number ${phoneNumber.number}? This action cannot be undone and the number will no longer be available for use.`)) {
                    return;
                }
                
                $scope.UI.releasingNumber = true;
                
                $admin.releaseTwilioPhoneNumber({ id: phoneNumber.id })
                    .then(function (response) {
                        $scope.UI.releasingNumber = false;
                        
                        if (!response.err) {
                            const index = $scope.communications.phoneNumbers.findIndex(pn => pn.id === phoneNumber.id);
                            if (index > -1) {
                                $scope.communications.phoneNumbers.splice(index, 1);
                            }
                            
                            // Clear primary phone number if this was it
                            if ($scope.communications.settings.primaryPhoneNumber && 
                                $scope.communications.settings.primaryPhoneNumber.id === phoneNumber.id) {
                                $scope.communications.settings.primaryPhoneNumber = null;
                            }
                            
                            $scope.initFormSaved('Phone number released successfully');
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.releasingNumber = false;
                        $scope.initErrorMessage('Error releasing phone number');
                        console.error(err);
                    });
            };

            $scope.initTwilioPhoneSearch = function () {
                $scope.communications.availableNumbers = [];
                $scope.communications.searchCriteria = {};
                
                // Default search - gets random numbers
                $scope.searchTwilioPhoneNumbers();
            };
            $scope.initEmailTemplatePreview = function(template) {
                $scope.emailPreview = null;
                
                $('.reveal').not('#emailTemplatePreviewReveal').foundation('close');
                // If template is a number, find the template object from $scope.templates
                if (typeof template === 'number') {
                    template = $scope.templates.find(t => t.id === template);
                    if (!template) {
                        console.error('Template not found');
                        return;
                    }
                }
                $q.all([

                    $http.get(template.url || 'dist/partials/templates/emails/default.html'),
                    $admin.getCompany()
                ]).then(
                    function(responses) {
                        if (
                            !responses[0].err &&
                            !responses[1].err
                        ) {
                            var html = responses[0].data;
                            var tempDiv = document.createElement("div");
    
                            tempDiv.innerHTML = html;

                            $scope.company = responses[1].company;

                            if (template.url) {
                                // Check for {{Content}} and replace it with template.data
                                var emailContentElement = angular.element(tempDiv).find('*').filter(function() {
                                    return angular.element(this).html().includes('{{Content}}');
                                });
                                if (emailContentElement.length) {
                                    emailContentElement.html(emailContentElement.html().replace('{{Content}}', template.data || ''));
                                }
                            } else {
                                // Update the logo link and image
                                angular.element(tempDiv).find('.logo-link').attr('href', $scope.company.logoUrl);
                                angular.element(tempDiv).find('.logo-image').attr('src', $scope.company.logoUrl);
                                angular.element(tempDiv).find('.default-text-body').html($scope.template.data);
                            }
                            // Get the iframe and write the updated HTML inside it
                            var iframe = document.getElementById("emailTemplatePreviewIframe");
                            var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
                            $scope.emailPreview = iframeDoc;
    
                            iframeDoc.open();
                            iframeDoc.write(tempDiv.innerHTML);
                            iframeDoc.close();
                        };
                    }
                ).catch(
                    function(err) {
                        console.error("Error loading email template:", err);
                    }
                );
            };      
            $scope.initTemplateFilePrevew = function(event) {

                function createPreview(file) {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            resolve(e.target.result);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                }

                const files = event.target.files;
                $scope.file = null; // Reset the file

                if (files.length > 0) {
                    const file = files[0]; // Only handle the first file for single file upload
                    createPreview(file).then(preview => {
                        $timeout(() => {
                            file.preview = preview;
                            $scope.file = file;
                            $scope.$applyAsync();
                        });
                    }).catch(error => {
                        console.error('Error creating preview for file:', file.name, error);
                        $timeout(() => {
                            $scope.file = file;
                            $scope.$applyAsync();
                        });
                    });
                }
            };      
            $scope.initFormSaved = function (msg) {
                $scope.UI.formSaved = true;
                $scope.UI.message = msg;
                
                $timeout(
                    function () {
                        $scope.UI.message = null;
                        $scope.UI.formSaved = false;
                    }, 3000
                );
            };
            $scope.initErrorMessage = function (msg) {
                $scope.UI.errMessage = msg;

                $timeout(
                    function () {
                        $scope.UI.errMessage = null;
                    }, 3000
                );
            };
            $scope.initModalFormSaved = function (msg) {
                $scope.UI.modalFormSaved = true;
                $scope.UI.message = msg;
                
                $timeout(
                    function () {
                        $scope.UI.message = null;
                        $scope.UI.modalFormSaved = false;
                    }, 3000
                );
            };
            $scope.createEventType = function (e, t) {
                if (e) {
                    e.preventDefault();
                };
                $scope.UI.formSaving = true;

                t.tags = _.join(t.tags, ',');
                
                $admin.createEventType(t)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initEventSettings();
                            $scope.initFormSaved(response.msg);
                            $('#eventTypesFormReveal').foundation('close');
                        };
                    }
                );
            };
            $scope.createGroup = function (e, g) {
                if (e) {
                    e.preventDefault();
                };
                $scope.UI.formSaving = true;

                $admin.createGroup(g)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initGroupSettings();
                            $scope.initFormSaved(response.msg);
                            $('#groupFormReveal').foundation('close');
                        };
                    }
                );
            };
            $scope.createForm = function (form) {
                $scope.UI.formSaving = true;

                form.folderId = $scope.folder.id;

                $form.createForm(form)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initForms();
                            $('#formCreateFormReveal').foundation('close');
                            $scope.initForm(response.form);
                            $scope.initFormSaved(response.msg);
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                })
            };
            $scope.createFolder = function (e, folder) {
                if (e) {
                    e.preventDefault();
                };
                $scope.UI.formSaving = true;

                $form.createFolder(folder)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initForms();
                            $scope.initFormSaved(response.msg);
                            $('#folderCreateFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Create the Folder.');
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.initErrorMessage(`Error Updating the Folder: ${err.message}`);
                    }
                );
            };
            $scope.createTemplate = function (e, template) {
                if (e) {
                    e.preventDefault();
                };
                $scope.UI.formSaving = true;

                $admin.createTemplate(template)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initTemplates();
                            $scope.initFormSaved(response.msg);
                            $('#templateFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to create the template.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error creating the template: ${err.message}`);
                    }
                );
            };
            $scope.createEstimator = function (e, estimator) {
                if (e) {
                    e.preventDefault();
                };
                $scope.UI.formSaving = true;
                $estimator.createEstimator(estimator)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initEstimatorsSettings();
                            $scope.initFormSaved(response.msg);
                            $('#estimatorFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Create the Estimator.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error Creating the Estimator: ${err.message}`);
                    }
                );
            };
            $scope.createAIEstimator = function(event, estimator) {
                if (event) {
                    event.preventDefault();
                }
                $scope.UI.formSaving = true;
                $scope.UI.errMessage = null;
                $scope.UI.message = null;

                $estimator.generateEstimator(estimator)
                .then(
                    function(response) {
                        $scope.UI.formSaving = false;

                        if (response.error) {
                            $scope.initErrorMessage(response.data.message || 'Failed to generate estimator');
                            return;
                        };
                        $location.url(`/admin-settings/estimator/${response.estimator.id}`);
                    }
                ).catch(
                    function(err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(err || 'Error generating estimator');
                    }
                );
            };
            $scope.createQuestionContainer = function (e, questionContainer) {
                if (e) {
                    e.preventDefault();
                };
                $scope.UI.formSaving = true;

                $estimator.createQuestionContainer(questionContainer)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initEstimator();
                            $scope.initFormSaved(response.msg);
                            $('#questionContainerFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Create the Question Container.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error Creating the Question Container: ${err.message}`);
                    }
                );
            };
            $scope.createQuestion = function (e, question) {
                if (e) {
                    e.preventDefault();
                };
                $scope.UI.formSaving = true;

                // Build validation rules based on validation type
                if (question.validationType === 'range' && question.validationMin !== null && question.validationMax !== null) {
                    question.validationRules = JSON.stringify({
                        min: parseFloat(question.validationMin),
                        max: parseFloat(question.validationMax)
                    });
                } else if (question.validationType === 'single' && question.validationOperator && question.validationValue) {
                    question.validationRules = question.validationOperator + ' ' + question.validationValue;
                } else {
                    question.validationRules = null;
                }

                $estimator.createQuestion(question)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initQuestionContainer();
                            $scope.initFormSaved(response.msg);
                            $('#questionFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Create the Question.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error Creating the Question: ${err.message}`);
                    }
                );
            };
            $scope.createVariable = function (e, variable) {
                if (e) {
                    e.preventDefault();
                };
                $scope.UI.formSaving = true;

                $admin.createVariable(variable)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initVariables();
                            $scope.initFormSaved(response.msg);
                            $('#variableFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Create the Variable.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage('Error Creating the Variable' || err.message);
                    }
                );
            };
            $scope.createFormula = function (e, formula) {
                if (e) {
                    e.preventDefault();
                };
                $scope.UI.formSaving = true;

                $estimator.createFormula(formula)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initFormSaved(response.msg);
                            $scope.initQuestionContainer();
                            $('#formulaFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Create the Formula.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error Creating the Formula: ${err.message}`);
                    }
                );
            };
            $scope.createLineItem = function (e, lineItem) {
                if (e) {
                    e.preventDefault();
                }
                switch (lineItem.pricedBy) {
                    case 'formula':
                        if (!$scope.questionContainer.Formulas[0].id) {
                            $scope.initErrorMessage('Please Create the formula for the line item.');
                            return;
                        } else {
                            lineItem.formulaId = $scope.questionContainer.Formulas[0].id;
                        }
                    break;
                    case 'question':
                        if (!$scope.questionContainer.Questions.length) {
                            $scope.initErrorMessage('Please Create a question for the line item.');
                            return;
                        }
                    break;
                }
                $scope.UI.formSaving = true;
                $estimate.createLineItem(lineItem)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            // update the questionContainer lineItemIds with the new lineItem id
                            $scope.questionContainer.lineItemIds.push(response.lineItem.id);
                            $scope.lineItems.push(response.lineItem);
                            $estimator.updateQuestionContainer($scope.questionContainer)
                            .then(
                                function (updateResponse) {
                                    if (!updateResponse.err) {
                                        $scope.initQuestionContainer();
                                        $scope.initFormSaved(response.msg);

                                        $('#lineItemFormReveal').foundation('close');
                                    } else {
                                        $log.log(updateResponse);
                                        $scope.initErrorMessage(updateResponse.msg || 'Failed to Update the Question Container with the new Line Item.');
                                    }
                                }
                            ).catch(
                                function (err) {
                                    $log.log(err);
                                    $scope.initErrorMessage(`Error Updating the Question Container with the new Line Item: ${err.message}`);
                                }
                            );
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Create the Line Item.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(err.message || 'Error Creating the Line Item');
                    }
                );
            };
            $scope.createStripeConnectedAccount = function(e) {
                if (e) {
                    e.preventDefault();
                }
                $scope.UI.formSaving = true;
                $admin.createStripeConnectedAccount(
                    {
                        email: $rootScope.user.email,
                        firstName: $rootScope.user.firstName,
                        lastName: $rootScope.user.lastName,
                        refreshUrl: `${$location.protocol()}://${$location.host()}/admin-settings?tab=payroll`,
                        returnUrl: `${$location.protocol()}://${$location.host()}/payroll/stripe/completion`
                    }
                )
                .then(
                    function(response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            if (response.accountLink) {
                                // Redirect to Stripe onboarding URL
                                window.location.href = response.accountLink.url;
                            } else {
                                $scope.initErrorMessage('Stripe account URL not provided.');
                            }
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to create Stripe connected account.');
                        }
                    }
                ).catch(
                    function(err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(err.message || 'Error creating Stripe connected account.');
                    }
                );
            };
            $scope.createStripeAccount = function () {
                $scope.UI.stripeAccountCreating = true;
                
                $admin.createStripeAccount({
                    email: $rootScope.user.email,
                    firstName: $rootScope.user.firstName,
                    lastName: $rootScope.user.lastName,
                    refreshUrl: `${$location.protocol()}://${$location.host()}/admin?tab=stripe`,
                    returnUrl: `${$location.protocol()}://${$location.host()}/admin?tab=stripe&onboarded=true`
                })
                .then(function (response) {
                    $scope.UI.stripeAccountCreating = false;
                    
                    if (!response.err) {
                        if (response.accountLink) {
                            // Redirect to Stripe onboarding URL
                            window.location.href = response.accountLink.url;
                        } else {
                            $scope.initErrorMessage('Stripe account URL not provided.');
                        }
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to create Stripe account.');
                    }
                })
                .catch(function (err) {
                    $scope.UI.stripeAccountCreating = false;
                    $scope.initErrorMessage('Error creating Stripe account.');
                    console.error(err);
                });
            };
            $scope.refreshStripeAccount = function () {
                $scope.UI.stripeAccountRefreshing = true;
                
                $admin.getStripeAccount()
                    .then(function (response) {
                        $scope.UI.stripeAccountRefreshing = false;
                        
                        if (!response.err && response.account) {
                            $scope.stripe.account = response.account;
                            $scope.initFormSaved('Stripe account refreshed successfully');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to refresh Stripe account.');
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.stripeAccountRefreshing = false;
                        $scope.initErrorMessage('Error refreshing Stripe account.');
                        console.error(err);
                    });
            };
            $scope.createOnboardingLink = function () {
                $scope.UI.onboardingLinkCreating = true;
                
                $admin.createStripeOnboardingLink({
                    refreshUrl: `${$location.protocol()}://${$location.host()}/admin?tab=stripe`,
                    returnUrl: `${$location.protocol()}://${$location.host()}/admin?tab=stripe&onboarded=true`
                })
                .then(function (response) {
                    $scope.UI.onboardingLinkCreating = false;
                    
                    if (!response.err && response.accountLink) {
                        // Redirect to Stripe onboarding URL
                        window.location.href = response.accountLink.url;
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to create onboarding link.');
                    }
                })
                .catch(function (err) {
                    $scope.UI.onboardingLinkCreating = false;
                    $scope.initErrorMessage('Error creating onboarding link.');
                    console.error(err);
                });
            };
            $scope.updateACHSettings = function (e, achSettings) {
                if (e) {
                    e.preventDefault();
                }
                $scope.UI.achSettingsSaving = true;
                
                $admin.updateStripeACHSettings(achSettings)
                    .then(function (response) {
                        $scope.UI.achSettingsSaving = false;
                        
                        if (!response.err) {
                            $scope.stripe.achSettings = response.achSettings;
                            $scope.initFormSaved('ACH settings updated successfully');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to update ACH settings.');
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.achSettingsSaving = false;
                        $scope.initErrorMessage('Error updating ACH settings.');
                        console.error(err);
                    });
            };
            $scope.updatePaymentMethod = function (paymentMethod) {
                var updateMethod = $admin.enabletripePaymentMethod(paymentMethod);
                if (paymentMethod.isActive) {
                    updateMethod = $admin.disableStripePaymentMethod(paymentMethod);
                }
                $scope.UI.formSaving = true;
                updateMethod
                    .then(function (response) {
                        $scope.UI.formSaving = false;
                        
                        if (!response.err) {
                            paymentMethod.isActive = !paymentMethod.isActive;
                            $scope.initFormSaved('Payment method updated successfully');
                            $scope.initStripeSettings();
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to update payment method.');
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage('Error updating payment method.');
                        console.error(err);
                    });

            };
            $scope.createTestPayment = function () {
                $scope.UI.testPaymentCreating = true;
                
                $admin.createStripeTestPayment()
                    .then(function (response) {
                        $scope.UI.testPaymentCreating = false;
                        
                        if (!response.err) {
                            $scope.initFormSaved('Test payment created successfully. Check your Stripe dashboard for details.');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to create test payment.');
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.testPaymentCreating = false;
                        $scope.initErrorMessage('Error creating test payment.');
                        console.error(err);
                    });
            };
            $scope.getStripeAccountStatus = function () {
                if (!$scope.stripe.account.id) {
                    return 'Not Connected';
                }
                
                if ($scope.stripe.account.charges_enabled && $scope.stripe.account.payouts_enabled) {
                    return 'Active';
                } else if ($scope.stripe.account.details_submitted) {
                    return 'Pending Verification';
                } else {
                    return 'Setup Required';
                }
            };
            $scope.getWebhookEndpoint = function () {
                return `${$location.protocol()}://${$location.host()}/payments/ach/webhook`;
            };
            $scope.copyWebhookUrl = function () {
                const url = $scope.getWebhookEndpoint();
                navigator.clipboard.writeText(url).then(function() {
                    $scope.initFormSaved('Webhook URL copied to clipboard');
                }).catch(function(err) {
                    console.error('Failed to copy URL: ', err);
                    $scope.initErrorMessage('Failed to copy URL to clipboard');
                });
            };
            $scope.isDevelopment = function () {
                return $location.host().includes('localhost') || $location.host().includes('127.0.0.1');
            };
            $scope.createLabor = function (e, labor) {
                if (e) {
                    e.preventDefault();
                };
                $scope.UI.formSaving = true;

                $admin.createLabor(labor)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initLabor();
                            $scope.initFormSaved(response.msg);
                            $('#laborFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to create the labor role.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage('Error creating the labor role' || err.message);
                    }
                );
            };
            $scope.updateLabor = function (labor) {
                $scope.UI.formSaving = true;

                $admin.updateLabor(labor)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initLabor();
                            $scope.initFormSaved(response.msg);
                            $('#laborFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to update the labor role.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage('Error updating the labor role' || err.message);
                    }
                );
            };
            $scope.updateEventType = function (t) {
                $scope.UI.formSaving = true;

                $admin.updateEventType(t)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        
                        if (!response.err) {
                            $scope.initEventSettings();
                            $scope.initFormSaved(response.msg);
                            $('#eventTypesFormReveal').foundation('close');
                        };
                    }
                );
            };
            $scope.updateGeneralSettings = function (e, settings) {
                $scope.UI.formSaving = true;

                if (e) {
                    e.preventDefault();
                }
                $admin.updateCompany(settings)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        
                        if (!response.err) {
                            $scope.initFormSaved(response.msg);
                            $scope.initGeneralSettings();
                        };
                    }
                );
            };
            $scope.updateEstimateSettings = function (e, estimate) {
                if (e) {
                    e.preventDefault();
                }
                $scope.UI.formSaving = true;
                $admin.updateCompany(estimate)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initEstimateSettings(response.msg);
                            $scope.initFormSaved(response.msg);
                        };
                    }
                );

            };
            $scope.updateEventSettings = function (e, event) {
                if (e) {
                    e.preventDefault();
                }
                $scope.UI.formSaving = true;
                $admin.updateCompany(event)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initFormSaved(response.msg);
                        };
                    }
                );

            };
            $scope.updateInvoiceSettings = function (e, invoice) {
                if (e) {
                    e.preventDefault();
                }
                $scope.UI.formSaving = true;
                $admin.updateCompany(invoice)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initInvoiceSettings(response.msg);
                            $scope.initFormSaved(response.msg);
                        };
                    }
                );

            };
            $scope.updateGroup = function (g) {
                $scope.UI.formSaving = true;

                $log.log(g);
                $admin.updateGroup(g)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initGroupSettings();
                            $scope.initFormSaved(response.msg);
                            $('#groupFormReveal').foundation('close');
                        };
                    }
                );
            };
            $scope.updateUserRole = function (r, p) {
                r.permissions = [];
                r.widgets = [];
            
                _.forEach($scope.widgets, widget => {
                    if (widget.selected) {
                        r.widgets.push(widget);
                    }
                });
                _.forEach(p, page => {
                    _.forEach(page.permissions, permission => {

                        if (permission.selected) {
                            r.permissions.push(permission);
                        }
                    });
                });
                $admin.updateRole(r)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initUserSettings();
                            $scope.initFormSaved(response.msg);
                            $('#userRolesFormReveal').foundation('close');
                        };
                    }
                )
            };
            $scope.updateEventReminder = function(name) {
                switch (name) {
                    case 'email':
                        $scope.event.defaultEmailReminder = !$scope.event.defaultEmailReminder;
                        break;
                    case 'text':
                        $scope.event.defaultTextReminder = !$scope.event.defaultTextReminder;
                        break;
                    case 'call':
                        $scope.event.defaultCallReminder = !$scope.event.defaultCallReminder;
                        break;
                    case 'calendar':
                        $scope.event.defaultCalendarReminder = !$scope.event.defaultCalendarReminder;
                        break;
                }
            };
            $scope.updateForm = function (form) {
                $scope.UI.formSaving = true;

                $form.updateForm(form)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initForms();
                            $('#formCreateFormReveal').foundation('close');
                            $scope.initForm(response.form);
                            $scope.initFormSaved(response.msg);
                        } else {
                            $scope.initErrorMessage(response.msg);
                        }
                    }
                )
            };
            $scope.updateFolder = function (folder) {
                $scope.UI.formSaving = true;

                $form.updateFolder(folder)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initForms();
                            $scope.initFormSaved(response.msg);
                            $('#folderCreateFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Update the Folder.');
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.initErrorMessage(`Error Update the Folder: ${err.message}`);
                    }
                );
            };
            $scope.updateFormFolderView = function () {
                if (!$scope.folder) {
                    $scope.folder = {};
                }
            
                $scope.form = {};
                $scope.UI.formView = false;

                function transformFolders(folders) {
                    return folders.map(folder => ({
                        value: folder.name,
                        id: folder.id.toString(),
                        opened: false,
                        items: folder.ChildFolders && folder.ChildFolders.length > 0
                            ? transformFolders(folder.ChildFolders)
                            : [],
                        isFolder: true,
                    }));
                }
    
                const treeData = transformFolders($scope.nestedFormFolders);

                // Find the parent of a given folder
                const findParentFolder = (folders, targetId, parent = null) => {
                    for (const folder of folders) {
                        if (folder.id === targetId) {
                            return parent;
                        }
                        if (folder.ChildFolders && folder.ChildFolders.length > 0) {
                            const result = findParentFolder(folder.ChildFolders, targetId, folder);
                            if (result) {
                                return result;
                            }
                        }
                    }
                    return null;
                };
            
                // Find the parent folder of the current folder
                const parentFolder = findParentFolder($scope.nestedFormFolders, $scope.folder.id);
                
                if (parentFolder) {
                    // Update DataView with parent's child folders
                    const dataViewItems = parentFolder.ChildFolders.map(child => ({
                        id: child.id,
                        value: child.name,
                        description: child.description,
                        isFolder: child.ChildFolders && child.ChildFolders.length > 0,
                    }));
                    $scope.adminFormsDataView.data.parse(dataViewItems);
            
                    // Update Tree to select and expand the parent folder
                    $scope.adminFormsTree.focusItem(parentFolder.id.toString()); // Select the clicked folder in the Tree
                    $scope.adminFormsTree.expand(parentFolder.id.toString()); // Expand the clicked folder in the Tree
            
                    // Update current folder
                    $scope.folder = parentFolder;
                } else {
                    $scope.adminFormsDataView.data.parse(treeData);
                    $scope.folder = null;
                }
            };
            $scope.updateTemplate = function (e, template) {
                if (e) {
                    e.preventDefault();
                };
                
                $scope.UI.formSaving = true;
            
                $admin.updateTemplate(template)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initTemplates();
                            $scope.initFormSaved(response.msg);
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to update the template.');
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error updating the template: ${err.message}`);
                    }
                );
            };
            $scope.updateEstimator = function (estimator) {
                $scope.UI.formSaving = true;

                $estimator.updateEstimator(estimator)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initEstimator();
                            $scope.initFormSaved(response.msg);
                            $('#estimatorFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Update the Estimator.');
                        };
                    }
                )
            };
            $scope.updateQuestionContainer = function (questionContainer) {
                $scope.UI.formSaving = true;

                $estimator.updateQuestionContainer(questionContainer)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initEstimator();
                            $scope.initFormSaved(response.msg);
                            $('#questionContainerFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Update the Question Container.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error Updating the Question Container: ${err.message}`);
                    }
                );
            };
            $scope.updateQuestion = function (question) {
                $scope.UI.formSaving = true;

                // Build validation rules based on validation type
                if (question.validationType === 'range' && question.validationMin !== null && question.validationMax !== null) {
                    question.validationRules = JSON.stringify({
                        min: parseFloat(question.validationMin),
                        max: parseFloat(question.validationMax)
                    });
                } else if (question.validationType === 'single' && question.validationOperator && question.validationValue) {
                    question.validationRules = question.validationOperator + ' ' + question.validationValue;
                } else {
                    question.validationRules = null;
                }
                
                $estimator.updateQuestion(question)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initQuestionContainer();
                            $scope.initFormSaved(response.msg);
                            $('#questionFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Update the Question.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(err.message || 'Failed to Update the Question.');
                    }
                );
            };
            $scope.updateVariable = function (variable) {
                $scope.UI.formSaving = true;

                $admin.updateVariable(variable)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initVariables();
                            $scope.initFormSaved(response.msg);
                            $('#variableFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Update the Variable.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage('Error Updating the Variable' || err.message);
                    }
                );
            };
            $scope.updateFormula = function (formula) {
                $scope.UI.formSaving = true;

                $estimator.updateFormula(formula)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initQuestionContainer();
                            $scope.initFormSaved(response.msg);
                            $('#formulaFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Update the Formula.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error Updating the Formula: ${err.message}`);
                    }
                );
            };
            $scope.updateLineItem = function (lineItem) {
                $scope.UI.formSaving = true;
                $estimate.updateLineItem(lineItem)
                .then(
                    function (response) {
                        if (!response.err) {
                            // update the questionContainer lineItemIds with the updated lineItem id
                            $scope.questionContainer.lineItemIds = $scope.questionContainer.lineItemIds.map(id =>
                                id === response.lineItem.id ? response.lineItem.id : id
                            );
                            $scope.lineItems = $scope.lineItems.map(li =>
                                li.id === response.lineItem.id ? response.lineItem : li
                            );
                            $estimator.updateQuestionContainer($scope.questionContainer)
                            .then(
                                function (updateResponse) {
                                    $scope.UI.formSaving = false;
                                    
                                    if (!updateResponse.err) {
                                        $scope.initQuestionContainer();
                                        $scope.initFormSaved(response.msg);
                                        $('#lineItemFormReveal').foundation('close');

                                    } else {
                                        $scope.initErrorMessage(updateResponse.msg || 'Failed to Update the Question Container with the updated Line Item.');
                                    }
                                }
                            ).catch(
                                function (err) {
                                    $scope.UI.formSaving = false;
                                    $scope.initErrorMessage(`Error Updating the Question Container with the updated Line Item: ${err.message}`);
                                }
                            );
                        } else {
                            $scope.UI.formSaving = false;
                            $scope.initErrorMessage(response.msg || 'Failed to Update the Line Item.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(err.message || 'Error Updating the Line Item');
                    }
                );
            };
            $scope.updateWorkOrderSettings = function (e, workOrder) {
                if (e) {
                    e.preventDefault();
                };

                $scope.UI.formSaving = true;
                $admin.updateCompany(workOrder)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initWorkOrderSettings(response.msg);
                            $scope.initFormSaved(response.msg);
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to update work order settings.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(err.message || 'Error updating work order settings.');
                    }
                );
            };
            $scope.updateListDisplayed = function (t, i, v, p) {
                if (v) {
                    var type = parseInt(t);
                    var displayed = null;
                    var length = null;

                    switch (type) {
                        case 1:
                            displayed = $scope.UI.groupsDisplayed;
                        break;
                    };
                    displayed += 5;
                }
            };        
            $scope.updateStep = function(step) {
                $timeout(function() {
                    if (step === 'back') {
                        if ($scope.UI.step === 3) {
                            $scope.UI.aiAnalyzing = false;
                            $scope.UI.aiAnalysisComplete = false;
                        }
                        $scope.UI.step -= 1;
                        return;
                    }
                    
                    if (step == 3) {
                        // Start AI analysis when entering step 3
                        $scope.startAIAnalysis();
                    }
                    
                    $(document).foundation();
                    $scope.UI.step = step;
                });
            };
            $scope.updateCompanySetupStep = function(step) {
                $scope.UI.currentStep = step;

                if ($scope.UI.currentStep === 3) {
                    $scope.company.State = _.find($scope.states, { id: $scope.company.stateId });

                    const address = $scope.company.street1 + ' ' +
                    ($scope.company.street2 ? $scope.company.street2 + ' ' : '') +
                    $scope.company.city + ' ,' +
                    $scope.company.State.name + ' ' +
                    $scope.company.zipCode;

                    $setup.getAddressDetails({ address }).then(function(response) {
                        if (response.err) {
                            $scope.initErrorMessage(response.msg || 'Failed to look up address.');
                            return;
                        }
                        $scope.company.latitude = response.address.latitude;
                        $scope.company.longitude = response.address.longitude;

                    }).catch(function(err) {
                        $scope.initErrorMessage(err.message || 'Error looking up address.');
                    })
                };
                if ($scope.UI.currentStep === 5) {
                    $scope.company.Type = _.find($scope.companyTypes, { id: $scope.company.typeId });

                    if ($scope.company.primaryColor == '#008fff') {
                        $scope.company.primaryColor = null;
                    }
                    if ($scope.company.secondaryColor == '#008fff') {
                        $scope.company.secondaryColor = null;
                    }
                    if ($scope.company.tertiaryColor == '#008fff') {
                        $scope.company.tertiaryColor = null;
                    }
                }
            };  
            $scope.deleteGroup = function (g) {
                $scope.UI.formSaving = true;
                g.isActive = 0;

                $admin.deleteGroup(g)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initGroupSettings();
                            $scope.initFormSaved(response.msg);
                            $('#groupFormReveal').foundation('close');
                        };
                    }
                );
            };
            $scope.deleteEventType = function (t) {
                $scope.UI.formSaving = true;

                $admin.deleteEventType(t)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initEventSettings();
                            $scope.initFormSaved(response.msg);
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Delete the Event Type.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(err.message || 'Error Deleting the Event Type.');
                    }
                );
            };
            $scope.deleteEstimator = function (estimator) {
                $scope.UI.formSaving = true;
                estimator.isActive = 0;

                $estimator.deleteEstimator(estimator)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            if ($routeParams.estimatorId) {
                                $location.path('/admin-settings?tab=estimators');
                            } else {
                                $scope.initEstimatorsSettings();
                            };
                            $scope.initFormSaved(response.msg);
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Delete the Estimator.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error Deleting the Estimator: ${err.message}`);
                    }
                );
            };
            $scope.deleteQuestionContainer = function (questionContainer) {
                $scope.UI.formSaving = true;
                $estimator.deleteQuestionContainer(questionContainer)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initEstimator();
                            $scope.initFormSaved(response.msg);
                            $('#questionContainerFormReveal').foundation('close');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Delete the Question Container.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error Deleting the Question Container: ${err.message}`);
                    }
                );
            };
            $scope.deleteVariable = function (variable) {
                $scope.UI.formSaving = true;
                
                $admin.deleteVariable(variable)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initVariables();
                            $scope.initFormSaved(response.msg);
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Delete the Variable.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage('Error Deleting the Variable' || err.message);
                    }
                );
            };
            $scope.deleteLabor = function (labor) {
                if (confirm('Are you sure you want to delete this labor role? This action cannot be undone.')) {
                    $admin.deleteLabor({ id: labor.id })
                    .then(
                        function (response) {
                            if (!response.err) {
                                $scope.initLabor();
                                $scope.initFormSaved(response.msg);
                            } else {
                                $scope.initErrorMessage(response.msg || 'Failed to delete the labor role.');
                            };
                        }
                    ).catch(
                        function (err) {
                            $scope.initErrorMessage('Error deleting the labor role' || err.message);
                        }
                    );
                }
            };
            $scope.moveQuestionContainer = function (questionContainer, direction) {
                if (direction === 'up' && questionContainer.displayOrder > 1) {
                    questionContainer.displayOrder--;
                }
                if (direction === 'down' && questionContainer.displayOrder < $scope.questionContainers.length) {
                    questionContainer.displayOrder++;
                }
                $scope.updateQuestionContainer(questionContainer);
            };
            $scope.moveQuestion = function (question, direction) {
                if (direction === 'up' && question.displayOrder > 1) {
                    question.displayOrder--;
                }
                if (direction === 'down' && question.displayOrder < $scope.questionContainer.Questions.length) {
                    question.displayOrder++;
                }
                // update the other questions displayOrder
                _.forEach($scope.questionContainer.Questions, function (q) {
                    if (q.id !== question.id) {
                        if (q.displayOrder >= question.displayOrder) {
                            q.displayOrder++;
                        }
                    };
                });
                $scope.updateQuestion(question);
            };
            $scope.addComponent = function(event) {
                if (event && event.keyCode !== 13 && !event.type) return;
                
                if ($scope.UI.newComponent && $scope.UI.newComponent.trim()) {
                    const component = $scope.UI.newComponent.trim();
                    if ($scope.estimator.components.indexOf(component) === -1) {
                        $scope.estimator.components.push(component);
                    }
                    $scope.UI.newComponent = '';
                }
            };
            $scope.removeComponent = function(index) {
                $scope.estimator.components.splice(index, 1);
            };
            $scope.removeCompanyLogo = function () {
                $scope.UI.formSaving = true;
                $scope.company.logoUrl = null;
                $admin.updateCompany($scope.company)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initFormSaved(response.msg);
                            $scope.initGeneralSettings();
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Remove the Logo.');
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error Removing the Logo: ${err.message}`);
                    }
                );
            };
            $scope.removeQuestionValidation = function () {
                $scope.question.validationOperator = null;
                $scope.question.validationValue = null;
                $scope.question.validationMin = null;
                $scope.question.validationMax = null;
                $scope.question.validationType = 'range';
                $scope.question.validationRules = null;
                $scope.question.valitions = false;
            };
            $scope.restoreUser = function (user) {
                $scope.UI.formSaving = true;

                $user.restoreUser(user)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initArchivedUsers();
                            $scope.initFormSaved(response.msg);
                            $location.path('/users/user/' + user.id + '/edit');
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Restore the User.');
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error Restoring the User: ${err.message}`);
                    }
                );
            };
            $scope.restoreEvent = function (event) {
                $scope.UI.formSaving = true;

                $event.restoreEvent(event)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        if (!response.err) {
                            $scope.initArchivedEvents();
                            $scope.initFormSaved(response.msg);
                        } else {
                            $scope.initErrorMessage(response.msg || 'Failed to Restore the Event.');
                        };
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(`Error Restoring the Event: ${err.message}`);
                    }
                );
            };  
            $scope.uploadCompanyLogo = function () {
                // Create an input element for file selection
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.click();
            
                // Add an event listener to handle file selection
                input.addEventListener('change', function (event) {
                    const files = event.target.files;
                    if (files && files.length > 0) {
                        // Prepare files for upload
                        const fileArray = Array.from(files);
            
                        const fileObjects = fileArray.map((blob, index) => {
                            const file = new File([blob], fileArray[index].name, { type: 'image/jpeg' });
                            file.preview = URL.createObjectURL(blob);
                            return file;
                        });
                        // Initialize the company object if it's undefined
                        if (!$scope.company) {
                            $scope.company = {};
                        }
            
                        // Call the uploadFile function from the uploader service
                        $uploader.uploadFile(
                            fileObjects, 
                            null,  // No clientId
                            null,  // No eventId
                            null,  // No marketingId
                            null,  // No estimateId
                            'companyLogo',  // Specify 'companyLogo' as the folder
                            function (progress, fileName) {
                                // Update progress UI
                                $timeout(() => {
                                    if (!$scope.uploadProgress) {
                                        $scope.uploadProgress = {};
                                    }
                                    $scope.uploadProgress[fileName] = Math.round(progress);
                                });
                            }
                        ).then((responses) => {
                            $timeout(() => {
                                responses.forEach(response => {
                                    if (response.err) {
                                        $scope.errMessages.push(`File: ${response.fileName}, Error: ${response.msg}`);
                                    } else {
                                        // On success, update the company's logoUrl
                                        $scope.company.logoUrl = response.msg;  // Set the new logo URL
                                        $scope.initFormSaved('Company logo updated successfully!');
                                        $scope.initGeneralSettings();
                                        $scope.UI.formSaving = false;
                                    }
                                });
                            });
                        }).catch((error) => {
                            $timeout(() => {
                                $scope.errMessages.push(`File: ${error.fileName}, Error: ${error.msg}`);
                            });
                        });
                    }
                });
            };
            $scope.uploadTemplate = function () {
                if (!$scope.file) return;
            
                const type = $scope.template.type.toLowerCase();
                const files = [$scope.file]; // Wrap the single file in an array
            
                $uploader.uploadFile(files, null, null, null, null, type, function (progress, fileName) {
                    $timeout(function () {
                        $scope.uploadProgress[fileName] = Math.round(progress);
                    });
                }, $scope.template.id).then(function (responses) {
                    $timeout(function () {
                        responses.forEach(function (response) {
                            if (response.err) {
                                $scope.errMessages.push(`File: ${response.fileName}, Error: ${response.msg}`);
                            } else {
                                $scope.files = [];
                                $scope.file = null;
                                
                                $scope.initFormSaved(response.msg || 'Template imported successfully!');

                                $admin.getTemplate($scope.template).then(function (response) {
                                    if (!response.err) {
                                        $scope.template = response.template;
                                        $scope.initEmailTemplatePreview($scope.template);
                                    } else {
                                        $scope.initErrorMessage(response.msg || "An error occurred while loading the template.");
                                    }
                                });
                            }
                        });
                    });
                }).catch(function (error) {
                    $timeout(function () {
                        $scope.errMessages.push(`File: ${error.fileName}, Error: ${error.msg}`);
                    });
                });
            };      
            $scope.searchItems = function () {
                var data = {
                    query: $scope.search.value,
                    page: $scope.search.page
                };
                $estimate.searchItems(data)
                .then(
                    function (response) {
                        $scope.UI.itemsLoaded = true;
                        if (!response.err) {
                            $scope.total = response.total;
                            $scope.items = response.items
                        };

                    }
                )
            };
            $scope.isEventReminderSelected = function(name) {
                switch (name) {
                    case 'email':
                        return $scope.event.defaultEmailReminder;
                    case 'text':
                        return $scope.event.defaultTextReminder;
                    case 'call':
                        return $scope.event.defaultCallReminder;
                    case 'calendar':
                        return $scope.event.defaultCalendarReminder;
                    default:
                        return false;
                }
            };
            $scope.parseOptions = function (options) {
                if (options) {
                    const parsedOptions = options.split(',');
                    $log.log(parsedOptions);
                    return parsedOptions.map(option => option.trim());
                }
            };
            $scope.moveToNextInput = function(index, event) {
                if (event && event.key === 'Backspace' && index > 0 && !$scope.activationCode[index]) {
                    document.querySelectorAll('.company-setup-form-activation-code')[index - 1].focus();
                } else if ($scope.activationCode[index] && index < 5) {
                    document.querySelectorAll('.company-setup-form-activation-code')[index + 1].focus();
                }
            };
            $scope.handlePaste = function(event) {
                const pasteData = event.originalEvent.clipboardData.getData('text');
                const numericData = pasteData.replace(/\D/g, ''); // Remove non-numeric characters

                for (let i = 0; i < 6; i++) {
                    $scope.activationCode[i] = numericData[i] || ''; // Fill with numbers or empty string if not enough numbers
                }

                document.querySelectorAll('.company-setup-form-activation-code')[5].focus();
            };
            $scope.validateEstimatorAIStep = function() {
                switch ($scope.UI.step) {
                    case 1:
                        // Check if project type is selected
                        if (!$scope.estimator.eventTypeId) return false;
                        
                        // If it's a broad category, also check for event details
                        if (!$scope.estimator.title || !$scope.estimator.details) {
                            return false;
                        }
                        return true;
                    case 2:
                        return $scope.estimator.title && 
                               $scope.estimator.description && 
                               $scope.estimator.complexity;
                    case 3:
                        return $scope.UI.aiAnalysisComplete;
                    case 4:
                        return true;
                    default:
                        return false;
                }
            };
            $scope.validateActivationCode = function() {
                const companyId = parseInt($location.search().id) || null;
                const securityToken = $location.search().token || null;
                const activationCode = parseInt($scope.activationCode.join('')) || null;
                $scope.UI.formSaving = true;
                $scope.UI.errMessage = null;
                $scope.UI.message = null;
                $scope.UI.formSaved = false;

                $admin.validateCompanySecurityToken({
                    id: companyId,
                    securityToken,
                    activationCode
                }).then(
                    function (response) {
                        $scope.UI.formSaving = false;
                        $scope.company = response.company || {};
                        $scope.company.securityToken = securityToken || null;

                        if (!response.err) {
                            $scope.updateCompanySetupStep(2);
                        } else {
                            $scope.UI.errMessage = response.msg || 'Invalid activation code.';
                            $scope.activationCode = ['', '', '', '', '', ''];
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.UI.errMessage = err || 'An error occurred while validating the activation code.';
                    }
                );
            };
            $scope.setupCompany = function(e, company) {
                if (e) {
                    e.preventDefault();
                };
                
                $scope.UI.formSaving = true;
                $scope.UI.errMessage = null;
                $scope.UI.message = null;

                $admin.setupCompany(company)
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initFormSaved(response.msg);
                            $timeout(function() {
                                $window.location.href = '/';
                            }, 3500);
                        } else {
                            $scope.UI.errMessage = response.msg || 'An error occurred while setting up the company.';
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.formSaving = false;
                        $scope.UI.errMessage = err || 'An error occurred while setting up the company.';
                    }
                );
            };
            $scope.startAIAnalysis = function() {
                $scope.UI.aiAnalyzing = true;
                $scope.UI.aiAnalysisComplete = false;
                $ai.analyzeEstimatorRequirements({estimator: $scope.estimator})
                .then(
                    function(response) {
                        $scope.UI.aiAnalyzing = false;

                        if (!response.err && response.success) {
                            $scope.estimator.aiData = response;
                            $scope.UI.aiAnalysisComplete = true;
                            $scope.UI.step = 3;

                            $timeout(function() {
                                $(document).foundation();
                            }, 100);
                        } else {
                            $scope.UI.errMessage = 'Failed to analyze project requirements. Please try again.';
                        }
                    }
                ).catch(
                    function(error) {
                        console.error('AI Analysis error:', error);
                        $scope.UI.errMessage = 'Error during AI analysis. Please check your connection and try again.';
                    }
                );
            };
            $scope.includeQuestion = function(question) {
                if ($scope.estimator.selectedQuestions.indexOf(question) === -1) {
                    $scope.estimator.selectedQuestions.push(question);
                }
                // Remove from recommended list
                const index = $scope.estimator.recommendedQuestions.indexOf(question);
                if (index > -1) {
                    $scope.estimator.recommendedQuestions.splice(index, 1);
                }
            };
            $scope.modifyQuestion = function(question) {
                // Open question modification modal or inline editor
                $scope.UI.editingQuestion = angular.copy(question);
                $scope.UI.questionEditMode = true;
            };
            $scope.sendValidationCode = function (e) {
                if (e) {
                    e.preventDefault();
                }
                $scope.UI.formSaving = true;
                $scope.UI.errMessage = null;
                $scope.UI.message = null;

                $admin.sendValidateEmail({companyId: $location.search().id})
                .then(
                    function (response) {
                        $scope.UI.formSaving = false;

                        if (!response.err) {
                            $scope.initFormSaved(response.msg)
                        } else {
                            $scope.UI.errMessage = response.msg || 'An error occurred while sending the verification code.';
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.errMessage = err || 'An error occurred while sending the verification code.';
                    }
                );
            };
        })
    }
);