define([
        'app-controller', 
        'signature-pad',
        'moment'
], function (
    app, 
    SignaturePad,
    moment
) {
    app.register.controller('EstimatesController',
    function (
        $scope,
        $rootScope,
        $routeParams,
        $location,
        $document,
        $window,
        $log,
        $q,
        $admin,
        $user,
        $estimate,
        $estimator,
        $event,
        $activity,
        $ai,
        $client,
        $payment,
        $communication,
        $setup,
        $timeout
    ) {
        const urlParams = new URLSearchParams(window.location.search);

        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];
        $scope.page = $setup.getCurrentPage() || {};
        $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null);
        $scope.subPermissions = $setup.updateScopes($scope, $setup.getSubPages('estimates'));
        $scope.units = $setup.getUnits();

        $scope.sort = {
            lineItems: {
                id: 1,
                value: '-createdAt'
            }
        };
        $scope.search = {
            value: null,
            page: null,
            limit: null,
            count: null,
            total: null
        };
        $scope.selectedPaymentMethod = null;
        $scope.selectedUser = $scope.user.id;
        $scope.selectedLabor = null;
        $scope.useOvertimeRate = false;

        $scope.estimate = {};
        $scope.client = {};
        $scope.masquaradeUser = {};
        $scope.paymentData = {
            amount: 0,
            paymentMethod: null
        };
        $scope.followUpTypes = [
            { name: 'Call', value: 'call' },
            { name: 'Email', value: 'email' },
            { name: 'Text', value: 'text' },
            { name: 'In Person', value: 'in person' }
        ];

        $scope.items = [];
        $scope.estimates = [];
        $scope.estimators = [];
        $scope.estimateStatuses = [];
        $scope.labor = [];
        $scope.photos = [];
        $scope.videos = [];
        $scope.users = [];
        $scope.paymentMethods = [];
        $scope.addresses = [];
        $scope.emails = [];
        $scope.phoneNumbers = [];
        $scope.states = [];
        $scope.priorities = [];
        $scope.phoneNumberTypes = [];
        $scope.emailTypes = [];
        $scope.eventTypes = [];
        $scope.reminderTypes = [];

        $scope.laborAssignmentOptions = [
            {id: 'Material', name: 'Material'},
            {id: 'Labor', name: 'Labor'},
            {id: 'Equipment', name: 'Equipment'},
            {id: 'Miscellaneous', name: 'Miscellaneous'}
        ];

        $scope.UI = {
            currentUrl: window.location.pathname.split( '/' ),
            currentStep: 1,
            userEstimates: false,
            masquarade: false,
            newLineItem: false,
            estimateView: false,
            estimateLoaded: false,
            estimatesLoaded: false,
            estimatorsLoaded: false,
            estimateActivitiesLoaded: false,
            signatureLoaded: false,
            clientLoaded: false,
            usersLoaded: false,
            addressesLoaded: false,
            emailsLoaded: false,
            phoneNumbersLoaded: false,
            statesLoaded: false,
            prioritiesLoaded: false,
            phoneNumberTypesLoaded: false,
            emailTypesLoaded: false,
            paymentMethodsLoaded: false,
            photosLoaded: false,
            videosLoaded: false,
            estimateAnalysisLoaded: false,
            estimateFollowUpLoaded: false,
            estimateLineItemLoaded: false,
            estimateLineItemsLoaded: false,
            lineItemFormLoaded: false,
            lineItemItemsLoaded: false,
            itemsLoaded: false,
            lineItemLoaded: false,
            lineItemsLoaded: false,
            lineItemsDisplayed: 50,
            formSaving: false,
            formSaved: false,
            modalFormSaved: false,
            followUpWarning: null,
            errMessage: null,
            message: null
        };

        $setup.updateScopes($scope, $scope.page.id || null);

        $scope.initEstimate = function () {
            if ($scope.UI.userEstimates) {
                return;
            }
            $scope.UI.estimateLoaded = false;
            $scope.UI.estimateActivitiesLoaded = false;
            $scope.UI.estimateView = false;
            $scope.estimate = {};
            if(!$scope.UI.currentUrl[4]) {
                $scope.UI.estimateView = true;
            };
            $q.all(
                [
                    $estimate.getEstimate({id: $routeParams.estimateId}),
                    $activity.getEstimateActivities({id: $routeParams.estimateId}),
                ]
            ).then(
                function (responses) {
                    $scope.UI.estimateLoaded = true;
                    $scope.UI.estimateActivitiesLoaded = true;
                    $scope.UI.signatureLoaded = true;

                    if (
                        !responses[0].err &&
                        !responses[1].err
                    ) {
                        $scope.estimate = responses[0].estimate;
                        $scope.activities = responses[1].activities;
                        $scope.client = $scope.estimate.Client;

                        if(
                            $scope.page.name == 'estimates' &&
                            !$scope.UI.currentUrl[4]
                        ) {
                            $timeout(
                                function () {
                                    $scope.initSignature();
                                }, 1000
                            );
                        };
                        $(document).foundation();
                    };
                }
            );
        };
        $scope.initEstimateAnalysis = function () {
            $scope.UI.estimateAnalysisLoaded = false;
            $scope.UI.errMessage = null;
            

            $ai.getEstimateAnalysis({
                id: $routeParams.estimateId
            }).then(
                function (response) {
                    $scope.UI.estimateAnalysisLoaded = true;

                    if (!response.err) {
                        $scope.estimateAnalysis = response.analysis;
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to load estimate analysis.';
                    }
                }
            ).catch(
                function (error) {
                    $scope.UI.estimateAnalysisLoaded = true;
                    $scope.UI.errMessage = error.msg || 'Failed to load estimate analysis.';
                }
            );
        };
        $scope.initUserEstimate = function (estimate) {
            $scope.UI.estimateLoaded = false;
            $scope.UI.estimateActivitiesLoaded = false;
            $scope.UI.estimateView = false;
            $scope.estimate = {};

            $q.all(
                [
                    $estimate.getEstimate(estimate),
                    $activity.getEstimateActivities(estimate),

                ]
            ).then(
                function (responses) {
                    $scope.UI.estimateLoaded = true;
                    $scope.UI.estimateActivitiesLoaded = true;
                    $scope.UI.signatureLoaded = true;

                    if (
                        !responses[0].err &&
                        !responses[1].err
                    ) {
                        $scope.estimate = responses[0].estimate;
                        $scope.activities = responses[1].activities;
                        $scope.client = $scope.estimate.Client;
                        $log.log($scope.estimate);

                        $timeout(
                            function () {
                                $scope.initSignature();
                                $(document).foundation();
                            }, 500
                        );
                    };
                }
            );
        };
        $scope.initLabor = function () {
            $admin.getLabors()
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.labor = response.labor || [];
                        $scope.laborRoles = $scope.labor; // Make available for modal
                    } else {
                        console.log('Error loading available labor:', response.msg);
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.errMessage = err.message || 'An error occurred while loading labor data.';
                }
            );
        };
        $scope.initUserEstimates = function (id) {
            $scope.UI.estimatesLoaded = false;
            $scope.UI.usersLoaded = false;
            $scope.UI.userEstimates = true;
            $scope.UI.estimateView = true;
            $scope.UI.masquarade = false;
            $scope.masquaradeUser = {};
            $scope.estimate = {};
            $scope.estimates = [];
            $scope.users = [];

            if (!id) {
                id = $scope.user.id;
            }
            $q.all(
                [
                    $user.getEstimates({id}),
                    $user.getUsers()
                ]
            )
            .then(
                function (responses) {
                    $scope.UI.estimatesLoaded = true;

                    if (
                        !responses[0].err &&
                        !responses[1].err
                    ) {
                        $scope.estimates = responses[0].estimates;
                        $scope.users = responses[1].users;
                        
                        if (id != $scope.user.id) {
                            $scope.UI.masquarade = true;
                            
                            $scope.masquaradeUser = _.find(
                                $scope.users,
                                function (user) {
                                    return user.id == id;
                                }
                            );
                        }
                    } else {
                        $scope.UI.errMessage = responses[0].msg || 'Failed to load estimates.';
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.errMessage = err.message || 'An error occurred while loading user estimates.';
                }
            )

        };
        $scope.initEstimators = function () {
            $scope.UI.estimatorsLoaded = false;

            $scope.estimators = [];

            $log.log('Loading estimators...');
            $estimator.getEstimators()
            .then(
                function (response) {
                    $log.log(response);
                    $scope.UI.estimatorsLoaded = true;
                    if (!response.err) {
                        $scope.estimators = response.estimators;
                    };
                }
            ).catch(
                function (error) {
                    $scope.UI.estimatorsLoaded = true;
                    $scope.UI.errMessage = `Error loading estimators: ${error.message}`;
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
            )
            .catch(
                function (err) {
                    $scope.UI.errMessage = err.message || 'An error occurred while loading line items.';
                }
            );
        };
        $scope.initFollowUps = function () {
            $scope.UI.followUpsLoaded = false;
            $scope.followUps = [];
            $estimate.getEstimateFollowUps({id: $routeParams.estimateId})
            .then(
                function (response) {
                    $scope.UI.followUpsLoaded = true;
                    if (!response.err) {
                        $scope.followUps = response.followUps;
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.errMessage = err.message || 'An error occurred while loading follow-ups.';
                }
            );
        };
        $scope.initPhotos = function () {
            $scope.UI.photosLoaded = false;
            $scope.photos = [];

            if ($scope.estimate) {
                $estimate.getPhotos($scope.estimate)
                .then(
                    function (response) {
                        $scope.UI.photosLoaded = true;
                        if (!response.err) {
                            $scope.photos = response.images;
                        };
                    }
                )
                .catch(
                    function (err) {
                        $scope.UI.errMessage = err.message || 'An error occurred while loading photos.';
                    }
                );
            };
        };
        $scope.initVideos = function () {
            $scope.UI.videosLoaded = false;
            $scope.videos = [];
            if ($scope.estimate) {
                $estimate.getVideos($scope.estimate)
                .then(
                    function (response) {
                        $scope.UI.videosLoaded = true;
                        if (!response.err) {
                            $scope.videos = response.videos;
                        };
                    }
                )
                .catch(
                    function (err) {
                        $scope.UI.errMessage = err.message || 'An error occurred while loading videos.';
                    }
                );
            };
        };
        $scope.initSignature = function () {
            const canvas = document.getElementById('estimateSignaturePad');
            var options = {};

            if ($rootScope.preferences.darkMode) {

                options = {
                    penColor: 'white',
                }
            } 
            $scope.signaturePad = new SignaturePad(canvas, options);
            if ($scope.estimate.EstimateSignature) {
                const signatureData = JSON.parse($scope.estimate.EstimateSignature.signature);
                $scope.signaturePad.fromData(signatureData);
                $scope.signaturePad.off(); // Disable drawing if signature already exists
            }
            $scope.UI.signatureLoaded = true;
            $timeout(
                function () {
                    $(document).foundation();
                }, 1000
            );
        };
        $scope.initEstimateForm = function () {
            $scope.UI.estimateLoaded = false;
            $scope.UI.estimateView = false;
            $scope.estimate = {};
            $scope.estimateStatuses = [];
            $scope.users = [];

            $q.all([
                $estimate.getEstimate({id: $routeParams.estimateId}),
                $user.getUsers(),
                $estimate.getStatuses()
            ]).then(function (responses) {
                if (!responses[0].err && !responses[1].err && !responses[2].err) {
    
                    _.each(responses[2].estimateStatuses, function (estimateStatus) {
                        if (
                            estimateStatus.name == 'advance' || 
                            estimateStatus.name == 'active' || 
                            estimateStatus.name == 'lost'
                        ) {
                            $scope.estimateStatuses.push(estimateStatus);
                        }
                    });
                    $timeout(
                        function () {
                            $scope.estimate = responses[0].estimate;
                            $scope.users = responses[1].users;
                            $scope.client = $scope.estimate.Client;
                            $scope.UI.estimateLoaded = true;
                            $(document).foundation();
                            $scope.$apply();
                        }, 1000
                    )
                }
            })
            .catch(
                function (err) {
                    $scope.UI.errMessage = err.message || 'An error occurred while loading estimate form data.';
                }
            );
        };
        $scope.initEstimateFollowUpForm = function (estimate) {
            $scope.UI.currentStep = 1;
            $scope.UI.estimateFollowUpLoaded = false;
            $scope.UI.addressesLoaded = false;
            $scope.UI.emailsLoaded = false;
            $scope.UI.phoneNumbersLoaded = false;
            $scope.UI.clientLoaded = false;
            $scope.UI.followUpCount = 0;
            

            $scope.addresses = [];
            $scope.emails = [];
            $scope.phoneNumbers = [];
            $scope.states = [];
            $scope.priorities = [];
            $scope.phoneNumberTypes = [];
            $scope.emailTypes = [];
            $scope.eventTypes = [];
            $scope.reminderTypes = [];

            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            if (!estimate || !estimate.id) {
                $scope.UI.errMessage = 'Invalid estimate data.';
                return;
            }
            $scope.client = {};
            $scope.followUp = {
                estimateId: estimate.id,
                estimate: estimate,
                textMessage: null,
                type: null,
            }
            $q.all(
                [
                    $setup.getAddresses(),
                    $setup.getEmails(),
                    $setup.getPhoneNumbers(),
                    $setup.getStates(),
                    $setup.getPriorities(),
                    $setup.getPhoneNumberTypes(),
                    $setup.getEmailTypes(),
                    $client.getClient({id: estimate.clientId}),
                    $event.getEventTypes(),
                    $setup.getReminderTypes(),
                    $estimate.getEstimate({id: estimate.id})
                ]
            ).then(
                function (responses) {
                    $scope.UI.estimateFollowUpLoaded = true;
                    $scope.UI.addressesLoaded = true;
                    $scope.UI.emailsLoaded = true;
                    $scope.UI.phoneNumbersLoaded = true;
                    $scope.clientLoaded = true;
                    
                    if (!responses[0].err &&
                        !responses[1].err &&
                        !responses[2].err &&
                        !responses[3].err &&
                        !responses[4].err &&
                        !responses[5].err &&
                        !responses[6].err &&
                        !responses[7].err &&
                        !responses[8].err &&
                        !responses[9].err
                    ) {
                        $scope.addresses = responses[0].addresses;
                        $scope.emails = responses[1].emails;
                        $scope.phoneNumbers = responses[2].phoneNumbers;
                        $scope.states = responses[3].states;
                        $scope.priorities = responses[4].priorities;
                        $scope.phoneNumberTypes = responses[5].phoneNumberTypes;
                        $scope.emailTypes = responses[6].emailTypes;
                        $scope.client = responses[7].client;
                        $scope.eventTypes = responses[8].eventTypes;
                        $scope.reminderTypes = responses[9].reminderTypes;
                        $scope.estimate = responses[10].estimate;

                        if ($scope.estimate.EstimateFollowUps.length > 0) {
                            
                            _.each(
                                estimate.EstimateFollowUps,
                                function (followUp) {
                                    if (!followUp.completedAt) {
                                        $scope.UI.followUpCount++;
                                    }
                                }
                            );
                        };
                    } else {
                        $scope.UI.errMessage = 'Failed to load follow-up data.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err.message || 'An error occurred while loading follow-up data.';
                }
            );
        };
        $scope.initEstimateLineItemForm = function (lineItem) {
            $scope.UI.estimateLineItemLoaded = false;
            $scope.estimateLineItem = lineItem;

            // Set up pricing options
            $scope.pricedByOptions = [
                {id: 'custom', name: 'Manual Entry'},
                {id: 'formula', name: 'Formula-based'},
                {id: 'question', name: 'Question-based'}
            ];

            // Load available labor roles
            $scope.initLabor();

            if (!lineItem) {
                $scope.UI.newEstimateLineItem = true;
                $scope.estimateLineItem = {
                    name: null,
                    description: null,
                    rate: 0.00,
                    unit: 'each',
                    subTotal: 0.00,
                    totalPrice: 0.00,
                    taxable: true,
                    markup: 0.00,
                    userId: $scope.user.id,
                    salesTaxRate: 0.00,
                    salesTaxTotal: 0.00,
                    moduleDescription: null,
                    instructions: null,
                    category: 'Material',
                    laborId: null,
                    quantity: 1,
                    estimateId: $routeParams.estimateId || $scope.estimate.id,
                    pricedBy: 'custom',
                    formulaId: null,
                    questionId: null,
                    hours: null,
                    useOvertimeRate: false,
                    standardHours: null,
                    overtimeHours: null
                };
            } else {
                $scope.UI.newEstimateLineItem = false;
                
                // If this has a nested LineItem structure, flatten it
                if (lineItem.LineItem && !lineItem.name) {
                    // Copy relevant fields from LineItem to the main object
                    $scope.estimateLineItem = {
                        ...lineItem,
                        name: lineItem.LineItem.name || lineItem.name,
                        description: lineItem.LineItem.description || lineItem.description,
                        rate: lineItem.LineItem.rate || lineItem.rate,
                        totalPrice: lineItem.LineItem.total || lineItem.totalPrice,
                        pricedBy: lineItem.LineItem.pricedBy || lineItem.pricedBy,
                        formulaId: lineItem.LineItem.formulaId || lineItem.formulaId,
                        questionId: lineItem.LineItem.questionId || lineItem.questionId
                    };
                }
                
                // Set up useOvertimeRate based on existing data
                $scope.estimateLineItem.useOvertimeRate = $scope.estimateLineItem.useOvertimeRate || false;
                
                // Set selectedLabor if laborId exists
                if ($scope.estimateLineItem.laborId && $scope.labor) {
                    $scope.selectedLabor = _.find($scope.labor, function(labor) {
                        return labor.id == $scope.estimateLineItem.laborId;
                    });
                }
            }
            $scope.UI.estimateLineItemLoaded = true;
        };
        $scope.initLineItemForm = function () {
            $scope.UI.newLineItem = !$routeParams.id;
            $scope.UI.lineItemLoaded = false;
            var data = {
                id: $routeParams.id
            }

            if ($scope.UI.newLineItem) {
                $scope.lineItem = {
                    name: null,
                    description: null,
                    quantity: 0,
                    rate: 0.00,
                    unit: 'each',
                    subTotal: 0.00,
                    total: 0.00,
                    taxable: false,
                    markup: 0.00,
                    userId: $scope.user.id,
                    salesTaxRate: 0.00,
                    salesTaxTotal: 0.00,
                    moduleDescription: null,
                    instructions: null
                };
                $scope.UI.lineItemLoaded = true;
                return;
            };

            $estimate.getLineItem(data)
            .then(
                function (response) {
                    $scope.UI.lineItemLoaded = true;
                    if (!response.err) {
                        $scope.lineItem = response.lineItem;
                        _.each(
                            $scope.lineItem.Items,
                            function(item) {
                                item.newQuantity = item.LineItemItem.quantity;
                            }
                        );
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.errMessage = err.message || 'An error occurred while loading line item data.';
                }
            );
        };  
        $scope.initPaymentForm = function () {
            $scope.UI.paymentMethodsLoaded = false;
            $scope.paymentMethods = [];
            $scope.selectedPaymentMethod = null;

            $scope.paymentData = {
                amount: $scope.estimate ? $scope.estimate.dueNow : 0,
                paymentMethod: null
            };
            
            $payment.getPaymentMethods()
            .then(function (response) {
                $scope.UI.paymentMethodsLoaded = true;
                if (!response.err) {
                    $scope.paymentMethods = response.paymentMethods;
                };
            })
            .catch(
                function (err) {
                    $scope.UI.errMessage = err.message || 'An error occurred while loading payment methods.';
                }
            );
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
        $scope.submitPaymentMethod = function (e, payment) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            const paymentMethod = _.find(
                $scope.paymentMethods,
                function (paymentMethod) {
                    return paymentMethod.name == payment.paymentMethod;
                }
            );
            if (paymentMethod.name == 'Credit Card') {
                let url = '/payments/pay?clientId=' +
                $scope.estimate.clientId + 
                '&estimateId=' +
                $scope.estimate.id + 
                '&paymentMethodId=' + 
                paymentMethod.id;
                
                // If dueNow is 0 or 0.00, use the payment amount
                if ($scope.estimate.dueNow === 0 || $scope.estimate.dueNow === 0.00) {
                    url += '&amount=' + ($scope.paymentData.amount || 0);
                }
                
                $location.url(url);
            } else if (paymentMethod.name == 'Bank Transfer') {
                let url = '/payments/bank-transfer?clientId=' +
                $scope.estimate.clientId +
                '&estimateId=' +
                $scope.estimate.id +
                '&paymentMethodId=' +
                paymentMethod.id;
                
                // If dueNow is 0 or 0.00, use the payment amount
                if ($scope.estimate.dueNow === 0 || $scope.estimate.dueNow === 0.00) {
                    url += '&amount=' + ($scope.paymentData.amount || 0);
                }
                
                $location.url(url);
            }
        };
        $scope.followUpEstimate = function (e, followUp) {
            if (e) {
                e.preventDefault();
            };
            var reminderTypes = [];
            $log.log(followUp)
            switch (followUp.type) {
                case 'call':
                    if (!followUp.phoneNumberId) {
                        $scope.UI.errMessage = 'Please select a phone number.';
                        return;
                    }
                    $communication.createCall({
                        phoneNumberId: followUp.phoneNumberId,
                        clientId: $scope.client.id,
                        estimateId: $scope.estimate.id,
                        eventId: $scope.estimate.eventId,
                        notes: followUp.notes || null,
                    }).then(
                        function (response) {
                            if (!response.err) {
                                $scope.initFormSaved(response.msg);
                                $('#estimateFollowUpReveal').foundation('close');
                                $estimate.createEstimateFollowUp({
                                    estimateId: $scope.followUp.estimate.id,
                                    type: followUp.type,
                                    clientId: $scope.client.id,
                                    notes: followUp.notes || null,
                                    scheduledDate: Date.now(),
                                    completedAt: Date.now(),
                                    completedBy: $scope.user.id,
                                    createdBy: $scope.user.id,
                                });
                            } else {
                                $scope.UI.errMessage = response.msg || 'Failed to create call.';
                            }
                        }
                    ).catch(
                        function (err) {
                            $scope.UI.errMessage = `Error creating call: ${err.message}`;
                        }
                    );
                break;
                case 'email':
                    if (!followUp.emailId) {
                        $scope.UI.errMessage = 'Please select an email address.';
                        return;
                    }
                    $communication.createEmail({
                        emailId: followUp.emailId,
                        clientId: $scope.client.id,
                        estimateId: $scope.estimate.id,
                        eventId: $scope.estimate.eventId,
                        subject: followUp.subject || 'Follow Up for Estimate: ' + $scope.followUp.estimate.estimateNumber,
                        message: followUp.message,
                        templateId: followUp.emailTemplateId || null,
                    }).then(
                        function (response) {
                            if (!response.err) {
                                $scope.initFormSaved(response.msg);
                                $('#estimateFollowUpReveal').foundation('close');
                                $estimate.createEstimateFollowUp({
                                    estimateId: $scope.followUp.estimate.id,
                                    type: followUp.type,
                                    clientId: $scope.client.id,
                                    notes: followUp.notes || null,
                                    scheduledDate: Date.now(),
                                    completedAt: Date.now(),
                                    completedBy: $scope.user.id,
                                    createdBy: $scope.user.id,
                                });
                            } else {
                                $scope.UI.errMessage = response.msg || 'Failed to send email.';
                            }
                        }
                    ).catch(
                        function (err) {
                            $scope.UI.errMessage = `Error sending email: ${err.message}`;
                        }
                    );
                break;
                case 'text':
                    if (!followUp.phoneNumberId) {
                        $scope.UI.errMessage = 'Please select a phone number.';
                        return;
                    }

                    $communication.createTextMessage({
                        phoneNumberId: followUp.phoneNumberId,
                        clientId: $scope.client.id,
                        estimate: $scope.estimate.id,
                        eventId: $scope.estimate.eventId,
                        message: followUp.textMessage,
                        media: followUp.media || null
                    }).then(
                        function (response) {
                            if (!response.err) {
                                $scope.initFormSaved(response.msg);
                                $('#estimateFollowUpReveal').foundation('close');
                                $estimate.createEstimateFollowUp({
                                    estimateId: $scope.followUp.estimate.id,
                                    type: followUp.type,
                                    clientId: $scope.client.id,
                                    notes: followUp.notes || null,
                                    scheduledDate: Date.now(),
                                    completedAt: Date.now(),
                                    completedBy: $scope.user.id,
                                    createdBy: $scope.user.id,
                                });
                            } else {
                                $scope.UI.errMessage = response.msg || 'Failed to send text message.';
                            }
                        }
                    ).catch(
                        function (err) {
                            $scope.UI.errMessage = `Error sending text message: ${err.message}`;
                        }
                    );

                break;
                case 'in person':
                    if (!followUp.addressId) {
                        $scope.UI.errMessage = 'Please select an address.';
                        return;
                    }
                    const priority = _.find(
                        $scope.priorities,
                        function (priority) {
                            return priority.level == 'normal';
                        }
                    );
                    const eventType = _.find(
                        $scope.eventTypes,
                        function (eventType) {
                            return eventType.name == 'Client Visit';
                        }
                    );
                    reminderTypes.push(
                        _.find(
                            $scope.reminderTypes,
                            function (reminderType) {
                                return reminderType.name == 'calendar';
                            }
                        )
                    );
                    const event = {
                        title: 'Follow Up for Estimate: ' + $scope.followUp.estimate.estimateNumber,
                        details: `this is a Follow up for estimate #${$scope.followUp.estimate.estimateNumber} 
                        that is meant to be in person`,
                        startDate: moment(followUp.scheduledDate),
                        endDate: moment(followUp.scheduledDate).add(1, 'hours'), // 1 hour later
                        addressId: followUp.addressId,
                        priorityId: priority.id,
                        eventTypeId: eventType.id,
                        userId: $scope.user.id,
                        reminderTypes: reminderTypes,
                        clientId: $scope.client.id,
                        userId: $scope.selectedUser,
                        creatorId: $scope.user.id,
                    }
                    $event.createEvent(event)
                    .then(
                        function (response) {
                            if (!response.err) {
                                $scope.initFormSaved(response.msg);
                                $('#estimateFollowUpReveal').foundation('close');
                                $estimate.createEstimateFollowUp({
                                    estimateId: $scope.followUp.estimate.id,
                                    type: followUp.type,
                                    eventId: response.event.id,
                                    parentEventId: $scope.followUp.estimate.eventId,
                                    clientId: $scope.client.id,
                                    notes: followUp.notes || null,
                                    scheduledDate: followUp.scheduledDate,
                                    completedAt: null,
                                    createdBy: $scope.user.id,
                                });
                            } else {
                                $scope.UI.errMessage = response.msg || 'Failed to create follow-up event.';
                            }
                        }
                    )
                    .catch(
                        function (err) {
                            $scope.UI.errMessage = err.message || 'An error occurred while creating follow-up event.';
                        }
                    );
                    
                break;
            }
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
            .catch(
                function (err) {
                    $scope.UI.errMessage = err.message || 'An error occurred while searching items.';
                }
            )
        };
        $scope.createLineItem = function (e, lineItem) {
            $log.log(lineItem)
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;

            $estimate.createLineItem(lineItem)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initLineItems();
                        $scope.initFormSaved(response.msg);
                        $timeout(
                            function () {
                                $location.path('estimates/line-items');
                            }, 1000
                        );
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err.message || 'An error occurred while creating line item.';
                }
            );
        };
        $scope.createEstimateLineItem = function (e, estimateLineItem) {
            $log.log(estimateLineItem)
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;

            $estimate.createEstimateLineItem(estimateLineItem)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initModalFormSaved(response.msg);
                        // Reload the estimate to get updated line items
                        if ($scope.estimate && $scope.estimate.id) {
                            $scope.initEstimate();
                            $('#estimateLineItemFormReveal').foundation('close');
                        }
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating estimate line item';
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err.message || 'An error occurred while creating estimate line item.';
                }
            );
        };
        $scope.updateEstimate = function (e, estimate) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            
            $estimate.updateEstimate(estimate)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initEstimateForm();
                        $scope.initFormSaved(response.msg);
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err.message || 'An error occurred while updating estimate.';
                }
            );
        };
        $scope.updateLineItem = function (lineItem) {
            $scope.UI.formSaving = true;

            $estimate.updateLineItem(lineItem)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initLineItems();
                        $scope.initFormSaved(response.msg);
                        $timeout(
                            function () {
                                $location.path('estimates/line-items');
                            }, 1000
                        );
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err.message || 'An error occurred while updating line item.';
                }
            );
        };
        $scope.updateLineItemItemQuantity = function (item) {
            $scope.UI.formSaving = true;
        
            // Find the index of the item to be updated
            const currentIndex = $scope.lineItem.Items.findIndex(i => i.LineItemItem.id === item.LineItemItem.id);
            if (currentIndex !== -1) {
                const lineItemItem = $scope.lineItem.Items[currentIndex].LineItemItem
                if (lineItemItem) {
                    lineItemItem.quantity = item.newQuantity > 0 ? item.newQuantity : 1; // Default to 1 if newQuantity is 0 or less
        
                    // Make the API call to update the quantity in the backend
                    $estimate.updateLineItemItemQuantity({
                        id: item.LineItemItem.id,
                        newQuantity: item.newQuantity
                    }).then(
                        function (response) {
                            $scope.UI.formSaving = false;
                            if (!response.err) {
                                $scope.initLineItemForm();
                                $scope.initFormSaved(response.msg);
                            }
                        }
                    )
                    .catch(
                        function (err) {
                            $scope.UI.formSaving = false;
                            $scope.UI.errMessage = err.message || 'An error occurred while updating item quantity.';
                        }
                    );
                }
            }
        };
        $scope.updateEstimateLineItem = function (estimateLineItem) {
            $scope.UI.formSaving = true;

            $estimate.updateEstimateLineItem(estimateLineItem)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initEstimateForm();
                        $('#estimateLineItemFormReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err.message || 'An error occurred while updating estimate line item.';
                }
            );
        };
        $scope.addLineItemToEstimate = function (lineItem) {
            var index = $scope.lineItems.findIndex(i => i.id === lineItem.id);
            if (index !== -1) {
                $scope.lineItems[index].adding = true;
                lineItem.estimateId = $scope.estimate.id;
                lineItem.quantity = 1;
        
                $estimate.addLineItemToEstimate(lineItem)
                .then(
                    function (response) {
                        $scope.lineItems[index].adding = false;
                        if (!response.err) {
                            $scope.initEstimateForm();
                            $scope.initModalFormSaved(response.msg);
                        }
                    }
                )
                .catch(
                    function (err) {
                        $scope.lineItems[index].adding = false;
                        $scope.UI.errMessage = err.message || 'An error occurred while adding line item to estimate.';
                    }
                );
            }
        };
        $scope.addItemToLineItems = function (item) {
            var index = $scope.items.findIndex(i => i.id === item.id);
            if (index !== -1) {
                $scope.items[index].adding = true;
                item.lineItemId = $scope.lineItem.id;
                item.quantity = 1;

                $estimate.addItemToLineItem(item)
                .then(
                    function (response) {
                        $scope.items[index].adding = false;
                        if (!response.err) {
                            $scope.initLineItemForm();
                            $scope.initModalFormSaved(response.msg);
                        };
                    }
                )
                .catch(
                    function (err) {
                        $scope.items[index].adding = false;
                        $scope.UI.errMessage = err.message || 'An error occurred while adding item to line item.';
                    }
                );
            }    
        };
        $scope.removeLineItemFromEstimate = function (lineItem) {
            $scope.UI.formSaving = true;
        
            $estimate.removeLineItemFromEstimate(lineItem)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initEstimateForm();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg;
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err.message || 'An error occurred while removing line item from estimate.';
                }
            );
        };
        $scope.removeItemFromLineItem = function (item) {         
            $scope.UI.formSaving = true;
        
            $estimate.removeItemFromLineItem(item.LineItemItem).then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initLineItemForm();
                        $scope.initFormSaved(response.msg);
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err.message || 'An error occurred while removing item from line item.';
                }
            );
        };
        $scope.deleteEstimate = function (estimate) {
            if (!estimate || !estimate.id) {
                $scope.UI.errMessage = 'Invalid comment data.';
                return;
            }

            $estimate.archiveEstimate(estimate)
                .then(function (response) {
                    if (!response.err) {
                        $location.path('/clients/client/' +
                        $scope.estimate.clientId +
                        '/estimates');
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to delete the Estimate.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.errMessage = err.message || 'An error occurred while deleting estimate.';
                });
        };  
        $scope.printEstimate= function (estimate) {
            if (!estimate || !estimate.id) {
                $scope.initErrorMessage('Please select an estimate to print');
                return;
            }
            // Check if a PDF URL exists
            if (estimate.estimateUrl) {
                // Open the PDF in a new window/tab for printing
                var printWindow = $window.open(estimate.estimateUrl, '_blank');
                if (!printWindow || printWindow.closed || typeof printWindow.closed == 'undefined') { 
                    // Popup blocked
                    $scope.UI.errMessage = 'Popup blocked. Please allow popups for this website to print the estimate.';
                    return;
                }
                // Optional: Focus the new window and trigger print dialog
                if (printWindow) {
                    printWindow.focus();
                    // Some browsers block automatic print dialog, so this might not work
                    printWindow.onload = function() {
                        printWindow.print();
                    };
                }
            } else {
                $estimate.createEstimatePdf({
                    estimateId: estimate.id
                }).then(
                    function (response) {
                        if (!response.err) {
                            // Open the generated PDF in a new window/tab
                            var printWindow = $window.open(response.pdfUrl, '_blank');
                            if (!printWindow || printWindow.closed || typeof printWindow.closed == 'undefined') { 
                                // Popup blocked
                                $scope.UI.errMessage = 'Popup blocked. Please allow popups for this website to print the estimate.';
                                return;
                            }
                            // Optional: Focus the new window and trigger print dialog
                            if (printWindow) {
                                printWindow.focus();
                                // Some browsers block automatic print dialog, so this might not work
                                printWindow.onload = function() {
                                    printWindow.print();
                                };
                            }
                        } else {
                            $scope.UI.errMessage = response.msg || 'Failed to generate PDF for printing.';
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.errMessage = err.message || 'An error occurred while generating PDF for printing.';
                    }
                );
            }
        }; 
        $scope.acceptTerms = function () {
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            
            const termsData = {
                estimateId: $scope.estimate.id
            };

            $estimate.acceptTerms(termsData).then(
                function (response) {
                    if (!response.err) {
                        // Update the estimate object with terms acceptance
                        $scope.estimate.termsAccepted = true;
                        $scope.estimate.termsAcceptedAt = response.estimate.termsAcceptedAt;
                        
                        // Close the terms modal and proceed to save signature
                        $('#estimateTermsAndConditionsReveal').foundation('close');
                        
                        // Now save the signature automatically
                        $scope.saveSignatureAfterTerms();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to accept terms';
                    }
                }
            ).catch(function (error) {
                $scope.UI.errMessage = error.message || 'An error occurred while accepting terms.';
            });
        };
        $scope.saveSignatureAfterTerms = function () {
            if ($scope.signaturePad.isEmpty()) {
                $scope.UI.errMessage = 'Please provide a signature first.';
                return;
            }

            const signatureData = $scope.signaturePad.toData();
            if (signatureData.length < 5) {
                $scope.UI.errMessage = 'Signature is too simple. Please provide a more complex signature.';
                return;
            }

            const signatureString = JSON.stringify(signatureData);

            const signature = {
                estimateId: $scope.estimate.id,
                signature: signatureString
            };

            $estimate.signEstimate(signature).then(
                function (response) {
                    if (!response.err) {
                        $scope.initEstimate();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to save signature';
                    }
                }
            ).catch(function (error) {
                $scope.UI.errMessage = error.message || 'An error occurred while saving signature.';
            });
        };
        $scope.saveSignature = function () {
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            if ($scope.signaturePad.isEmpty()) {
                $scope.UI.errMessage = 'Please provide a signature first.';
                $('#estimateTermsAndConditionsReveal').foundation('close');
                return;
            }

            const signatureData = $scope.signaturePad.toData();
            if (signatureData.length < 5) {
                $scope.UI.errMessage = 'Signature is too simple. Please provide a more complex signature.';
                $('#estimateTermsAndConditionsReveal').foundation('close');
                return;
            }

            const signatureString = JSON.stringify(signatureData);

            const signature = {
                estimateId: $scope.estimate.id,
                signature: signatureString
            };

            $estimate.signEstimate(signature).then(
                function (response) {
                    if (!response.err) {
                        $scope.initEstimate();
                        $scope.initFormSaved(response.msg);
                        $('#estimateTermsAndConditionsReveal').foundation('close');
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.errMessage = err.message || 'An error occurred while saving signature.';
                }
            );
        };
        $scope.clearSignature = function () {
            $scope.signaturePad.clear();
        };
        $scope.convertEstimate = function (e, estimate) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            if (!estimate || !estimate.id) {
                $scope.UI.errMessage = 'Invalid estimate data.';
                return;
            }

            $estimate.convertEstimateToInvoice(estimate)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initEstimateForm();
                        $scope.initFormSaved(response.msg);
                        $timeout(
                            function () {
                                $location.path('/invoices/invoice/' + response.invoice.id);
                            }, 2000
                        );
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to convert estimate to invoice.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err.message || 'An error occurred while converting estimate to invoice.';
                }
            );
        }
        $scope.onCategoryChange = function () {
            if ($scope.estimateLineItem.category !== 'Labor') {
                $scope.estimateLineItem.laborId = null;
                $scope.selectedLabor = null;
                $scope.useOvertimeRate = false;
            }
        };
        $scope.onLaborChange = function () {
            if ($scope.estimateLineItem.laborId) {
                $scope.selectedLabor = _.find($scope.labor, function(labor) {
                    return labor.id == $scope.estimateLineItem.laborId;
                });
                $scope.calculateLaborTotal();
            } else {
                $scope.selectedLabor = null;
            }
        };
        $scope.calculateLaborTotal = function () {
            if ($scope.selectedLabor && ($scope.estimateLineItem.quantity || $scope.estimateLineItem.hours)) {
                const hours = parseFloat($scope.estimateLineItem.hours || $scope.estimateLineItem.quantity) || 0;
                const standardRate = parseFloat($scope.selectedLabor.rate) || 0;
                const overtimeRate = parseFloat($scope.selectedLabor.overtimeRate) || 0;
                const standardHoursPerDay = parseInt($scope.selectedLabor.standardHoursPerDay) || 8;
                
                let standardHours = hours;
                let overtimeHours = 0;
                let totalCost = 0;
                
                if ($scope.estimateLineItem.useOvertimeRate && hours > standardHoursPerDay) {
                    standardHours = standardHoursPerDay;
                    overtimeHours = hours - standardHoursPerDay;
                }
                
                const standardCost = standardHours * standardRate;
                const overtimeCost = overtimeHours * overtimeRate;
                totalCost = standardCost + overtimeCost;
                
                // Calculate blended rate
                const blendedRate = hours > 0 ? (totalCost / hours) : standardRate;
                
                // Update the estimate line item with new fields
                $scope.estimateLineItem.rate = blendedRate.toFixed(2);
                $scope.estimateLineItem.unitPrice = blendedRate.toFixed(2);
                $scope.estimateLineItem.subTotal = totalCost.toFixed(2);
                $scope.estimateLineItem.totalPrice = totalCost.toFixed(2);
                $scope.estimateLineItem.hours = hours;
                $scope.estimateLineItem.quantity = hours; // Keep quantity synced with hours for labor
                $scope.estimateLineItem.standardHours = standardHours;
                $scope.estimateLineItem.overtimeHours = overtimeHours;
            }
        };
        $scope.initLineItenInfiniteScroll = function () {
            var observer = new IntersectionObserver(function(entries) {
                if(entries[0].isIntersecting === true) {
                    angular.element('#lineItemsListInfiniteScroll').triggerHandler('click');
                }
            }, { threshold: [0] });
            observer.observe(document.getElementById('lineItemsListInfiniteScroll'));
        };
        $scope.updateLineItemsDisplayed = function () {
            if ($scope.UI.lineItemsDisplayed <= $scope.lineItems.length) {
                $scope.UI.lineItemsDisplayed += 5;
            }
        };
        $scope.$on('photosUploaded', function(event, data) {
            $scope.initPhotos();
        });
        $scope.$on('videosUploaded', function(event, data) {
            $scope.initVideos();
        });
        $scope.$watch('paymentData.paymentMethod', function(newVal) {
            if (newVal && newVal.name === 'Credit Card' && $scope.estimate) {
                $scope.paymentData.amount = $scope.estimate.dueNow;
            }
        });
    });
});
