define(['app-controller', 'swiper', 'moment', 'tagify'], function (app, swiper, moment, Tagify) {
    app.register.controller('ClientsController',
    function (
        $scope,
        $rootScope,
        $routeParams,
        $http,
        $document,
        $location,
        $window,
        $log,
        $q,
        $activity,
        $estimate,
        $invoice,
        $admin,
        $setup,
        $client,
        $communication,
        $timeout,
        $media,
        $user,
        $event,
        $interval,
        $ai
    ) {
        const urlParams = new URLSearchParams(window.location.search);

        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];

        $scope.page = $setup.getCurrentPage() || {};
        $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null);
        $scope.subPermissions = $setup.updateScopes($scope, $setup.getSubPages('clients'));

        $scope.selectedPhoneNumber = null;

        $scope.search = {
            value: null,
            page: null,
            limit: null,
            count: null,
            total: null
        };
        $scope.sort = {
            default: {
                value: '-createdAt'
            },
            ClientAddresses: {
                selected: 'createdAt', // Default sort
                reverse: false,       // Default ascending
                options: [
                    { id: 'title', name: 'Title' },
                    { id: 'type', name: 'Type' },
                    { id: 'isPrimary', name: 'Primary Status' },
                    { id: 'createdAt', name: 'Date Created' },
                    { id: 'updatedAt', name: 'Date Updated' },
                ],
            },
            ClientEmails: {
                selected: 'createdAt',
                reverse: false,
                options: [
                    { id: 'title', name: 'Title' },
                    { id: 'type', name: 'Type' },
                    { id: 'isPrimary', name: 'Primary Status' },
                    { id: 'createdAt', name: 'Date Created' },
                    { id: 'updatedAt', name: 'Date Updated' },
                ],
            },
            ClientNotes: {
                selected: 'createdAt',
                reverse: false,
                options: [
                    { id: 'title', name: 'Title' },
                    { id: 'type', name: 'Type' },
                    { id: 'isPrimary', name: 'Primary Status' },
                    { id: 'createdAt', name: 'Date Created' },
                    { id: 'updatedAt', name: 'Date Updated' },
                ],
            },
            ClientPhoneNumbers: {
                selected: 'createdAt',
                reverse: false,
                options: [
                    { id: 'title', name: 'Title' },
                    { id: 'type', name: 'Type' },
                    { id: 'isPrimary', name: 'Primary Status' },
                    { id: 'createdAt', name: 'Date Created' },
                    { id: 'updatedAt', name: 'Date Updated' },
                ],
            },
        };
        $scope.client = {};
        $scope.event = {};
        $scope.marketing = {};
        $scope.estimate = {};
        $scope.company = {};

        $scope.clients = [];
        $scope.events = [];
        $scope.estimates = [];
        $scope.workOrders = [];
        $scope.invoices = [];
        $scope.marketings = [];
        $scope.pastEvents = [];
        $scope.futureEvents = [];
        $scope.photos = [];
        $scope.unassignedPhotos = [];
        $scope.eventPhotos = [];
        $scope.marketingPhotos = [];
        $scope.documents = [];
        $scope.unassignedDocuments = [];
        $scope.eventDocuments = [];
        $scope.marketingDocuments = [];
        $scope.videos = [];
        $scope.unassignedVideos = [];
        $scope.eventVideos = [];
        $scope.marketingVideos = [];
        $scope.states = [];
        $scope.addressTypes = [];
        $scope.phoneNumberTypes = [];
        $scope.eventTypes = [];
        $scope.emailTypes = [];

        $scope.UI = {
            mobile: $media.getMedia(),
            tab: urlParams.get('tab'),
            url: window.location.origin + window.location.pathname,
            currentUrl: window.location.pathname.split( '/' ),
            eventTitleTagify: null,
            errMessage: null,
            message: null,
            subPage: null,
            photoFolder: null,
            videoFolder: null,
            documentFolder: null,
            clientView: true,
            selectPhotos: false,
            selectVideos: false,
            selectDocuments: false,
            newClient: false,
            createEmail: false,
            createPhoneNumber: false,
            createAddress: false,
            createNote: false,
            clientLoaded: false,
            clientsLoaded: false,
            eventsLoaded: false,
            eventLoaded: false,
            photosLoaded: false,
            documentsLoaded: false,
            videosLoaded: false,
            marketingLoaded: false,
            emailsLoaded: false,
            emailLoaded: false,
            phoneNumbersLoaded: false,
            addressesLoaded: false,
            notesLoaded: false,
            estimateLoaded: false,
            estimatesLoaded: false,
            marketingLoaded: false,
            marketingsLoaded: false,
            archivedClients: false,
            archivedEvents: false,
            archivedEstimates: false,
            archivedPhotos: false,
            documentsLoaded: false,
            videosLoaded: false,
            archivedWorkOrders: false,
            archivedInvoices: false,
            archivedClientAddresses: false,
            archivedClientEmails: false,
            archivedClientNotes: false,
            archivedClientPhoneNumbers: false,
            formSaved: false,
            formSaving: false,
            contactSaving: false,
            emailSaving: false,
            phoneSaving: false,
            addressSaving: false,
            noteSaving: false,
            copiedToClipboard: false,
            clientsDisplayed: 50,
        };

        $scope.initClient = function () {
            $scope.user = $rootScope.user;
            $scope.UI.subPage = $scope.UI.currentUrl[4];
            $scope.UI.clientView = true;
            $scope.UI.archiveClients = false;
            $scope.UI.archiveEvents = false;
            $scope.UI.archiveEstimates = false;
            $scope.UI.archivePhotos = false;
            $scope.UI.archiveDocuments = false;
            $scope.UI.archiveVideos = false;
            $scope.UI.archiveWorkOrders = false;
            $scope.UI.archiveInvoices = false;
            $scope.UI.archiveClientAddresses = false;
            $scope.UI.archiveClientEmails = false;
            $scope.UI.archiveClientNotes = false;
            $scope.UI.archiveClientPhoneNumbers = false;


            $scope.initClientTabs();
            if (!$routeParams.clientId) {
                return
            }
            var data = {
                id: $routeParams.clientId
            }
            $q.all(
                [
                    $client.getClient(data),
                    $setup.getPages()
                ]
            ).then(
                function (responses) {
                    $scope.UI.clientLoaded = true;
                    if (
                        !responses[0].err &&
                        !responses[1].err
                    ) {
                        $scope.client = responses[0].client;
                        $rootScope.UI.titleName = $scope.client.firstName + ' ' + $scope.client.lastName;

                        // find phone number that has isPrimary
                        $scope.selectedPhoneNumber = Array.isArray($scope.client.ClientPhoneNumbers)
                        ? $scope.client.ClientPhoneNumbers.find(function(phone) {
                            return phone.isPrimary === true || phone.isPrimary === 1;
                        }) || null
                        : null;
                        if ($scope.UI.currentUrl[4]) {
                            switch ($scope.UI.currentUrl[4]) {

                                case 'photos':
                                    $scope.initPhotos();
                                break;

                                case 'videos':
                                    $scope.initVideos();
                                break;

                                case 'activity':
                                    $scope.initClientActivity();
                                break;

                                case 'documents':
                                    $scope.initDocuments();
                                break;

                                case 'events':
                                    $scope.initEvents();
                                break;

                                case 'estimates':
                                    $scope.initEstimates();
                                break;

                                case 'work-orders':
                                    $scope.initWorkOrders();
                                break;

                                case 'invoices':
                                    $scope.initInvoices();
                                break;
                                case 'contact':
                                    $scope.initEmails();
                                break;
                            };
                        };
                        $timeout(
                            function () {
                                $(document).foundation();
                            }, 0
                        );
                    };
                }
            );
        };
        $scope.initClients = function () {
            $scope.UI.clientsLoaded = false;
            $scope.getClients();
            $scope.$watch(
                'search.value', 
                function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $scope.search.page = 1;
                        $scope.getClients();
                    }
                }
            );
            angular.element($document)
            .bind(
                'scroll', 
                function() {
                    var container = angular.element(document.getElementById('clientsList'));
                    var lastLi = container.find('li').last();
        
                    if (lastLi.length) {
                        var lastLiOffset = lastLi.offset().top + lastLi.outerHeight();
                        var containerOffset = container.offset().top + container.outerHeight();
            
                        if (containerOffset >= lastLiOffset) {
                            if ($scope.search.page < $scope.pages) {
                                $scope.search.page++;
                                $scope.getClients();
                                $scope.$apply(); // Trigger a digest cycle to update the view
                            }
                        }
                    }
                }   
            );
        };
        $scope.initClientForm = function () {
            $scope.user = $rootScope.user;
            $scope.client = {};

            $scope.UI.newClient = false;
            $scope.UI.clientLoaded = false;
            $scope.UI.createEmail = false;
            $scope.UI.createPhoneNumber = false;
            $scope.UI.createAddress = false;
            $scope.UI.createNote = false;
            $scope.UI.clientView = true;

            $scope.states = [];
            $scope.addressTypes = [];
            $scope.phoneNumberTypes = [];
            $scope.emailTypes = [];
            $scope.priorities = [];

            const initCalls = [
                $setup.getStates(),
                $setup.getPhoneNumberTypes(),
                $setup.getEmailTypes(),
                $setup.getPriorities(),
            ];

            if ($routeParams.clientId) {
                initCalls.unshift($client.getClient({ id: $routeParams.clientId }));
            };
            if ($scope.UI.tab) {
                $scope.initClientTabs();
            };
            $q.all(initCalls).then(function (responses) {
                var offset = 0;
                $scope.UI.clientLoaded = true;
                
                if ($routeParams.clientId) {
                    // If `eventId` exists, the first response is the event data
                    if (!responses[0].err) {
                        $scope.client = responses[0].client;
                        
                    }
                    offset = 1; // Adjust index for subsequent responses
                } else {

                    $scope.$watch(
                        'search.value', 
                        function(newVal, oldVal) {
                            if (newVal !== oldVal) {
                                $scope.search.page = 1;
                                $scope.getClients();
                            }
                        }
                    );
                }

                if (
                    !responses[offset].err &&
                    !responses[offset + 1].err &&
                    !responses[offset + 2].err &&
                    !responses[offset + 3].err
                ) {
                    $scope.states = responses[offset].states;
                    $scope.phoneNumberTypes = responses[offset + 1];
                    $scope.emailTypes = responses[offset + 2];
                    $scope.priorities = responses[offset + 3].priorities;
                    
                    
                };
            });
                
            // Watch for changes in firstName and lastName to update search.value
            $scope.$watchGroup(['client.firstName', 'client.lastName'], function(newValues, oldValues) {
                if (newValues !== oldValues) {
                    $scope.search.value = `${$scope.client.firstName || ''} ${$scope.client.lastName || ''}`.trim();
                    $scope.search.page = 1;
                    $scope.getClients();
                }
            });
        };
        $scope.initClientAddressLookUp = function (t, id, a) {
            var type = parseInt(t);
            
            switch(type) {
                case 1:
                    a = $scope.client.new.address;
                break;
                case 2:
                    a = _.find(
                        $scope.client.addresses,
                        function (ad) {
                            return ad.id == a.id;
                        }
                    );
                break;
                case 3:
                    a = $scope.client.primary.address;
                break;
            };
            require(
                ['maps'], 
                function (map) {
                    $timeout(
                        function () {
                            var input = document.getElementById(id);
                            var autocomplete = new map.places.Autocomplete(input);
        
                            autocomplete.addListener(
                                "place_changed", 
                                function () {
                                    var place = autocomplete.getPlace();
                                    var gState = place.address_components[4].short_name;
                                    a.street_1 = place.name;
                                    a.city = place.address_components[2].long_name;
                                    if (place.address_components[6]) {
                                        a.zip_code = place.address_components[6].long_name;
                                    }
                                    if (place.address_components[2].types[0] == 'administrative_area_level_2') {
                                        a.city = place.address_components[1].long_name;
                                        a.zip_code = place.address_components[5].long_name;
                                        gState = place.address_components[3].short_name;
                                    }
                                    if (place.address_components[2].types[0] == 'neighborhood') {
                                        a.city = place.address_components[3].long_name;
                                    }
                                    if (place.address_components[4].types[0] == 'administrative_area_level_2') {
                                        gState = place.address_components[5].short_name;
                                        a.zip_code = place.address_components[7].long_name;
                                    }
                                    var state = _.find(
                                        $scope.states,
                                        function(state){ 
                                            return state.abbreviation == gState;
                                        }
                                    );
                                    a.state_id = state.id;
                                    a.latitude = place.geometry.location.lat();
                                    a.longitude = place.geometry.location.lng();
                                    $scope.$apply();
                                }
                            );
                        }
                    );
                }
            );
        };
        $scope.initClientActivity = function () {
            $scope.UI.clientActivitiesLoaded = false;

            $activity.getClientActivities({id: $routeParams.clientId})
            .then(
                function (response) {
                    $scope.UI.clientActivitiesLoaded = true;
                    if (!response.err) {
                        $scope.activities = response.activities;
                    }
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
        $scope.initClientTabs = function () {
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
                        $(document).foundation();
                        $interval.cancel($scope.initTabs);
                    }
                }, 100
            );
        };
        $scope.initEvents = function (archived) {
            $scope.UI.eventsLoaded = false;
            $scope.UI.archiveEvents = archived;
        
            const MAX_RECURRENCES = 20;
        
            var data = {
                id: $routeParams.clientId
            };

            var eventService = archived ? $client.getArchivedEvents : $client.getEvents;
            eventService(data)
                .then(function (response) {
                    $scope.UI.eventsLoaded = true;
                    if (!response.err) {
                        $scope.events = response.events || [];
                        $scope.pastEvents = [];
                        $scope.futureEvents = [];
                        
                        if (archived) {
                            return;
                        }
                        // Process events
                        $scope.events.forEach(event => {
                            event.originalId = event.id;
                            
                            if (event.recurring && event.RecurrencePattern) {
                                const recurrencePattern = event.RecurrencePattern;
                                const frequency = recurrencePattern.frequency;
                                const interval = recurrencePattern.interval || 1;
                                const startDate = moment(event.startDate);
                                const endDate = moment(event.endDate);
                                const recurrenceEndDate = recurrencePattern.endDate
                                    ? moment(recurrencePattern.endDate)
                                    : null;
        
                                let nextDate = startDate.clone();
                                let count = 0;
        
                                // Expand recurring events and update dates dynamically
                                while ((!recurrenceEndDate || count < MAX_RECURRENCES) && count < MAX_RECURRENCES) {
                                    const eventInstance = _.cloneDeep(event); // Use lodash for deep cloning
                                    eventInstance.startDate = nextDate.toISOString();
                                    eventInstance.endDate = nextDate.clone().add(endDate.diff(startDate)).toISOString();
                                    eventInstance.originalId = event.id;
        
                                    // Drop the recurring property to prevent calendar issues
                                    delete eventInstance.recurring;
        
                                    // Add to past or future events based on date
                                    if (nextDate.isBefore(moment())) {
                                        $scope.pastEvents.push(eventInstance);
                                    } else {
                                        $scope.futureEvents.push(eventInstance);
                                    }
        
                                    // Increment date based on recurrence frequency
                                    switch (frequency) {
                                        case 'daily':
                                            nextDate.add(interval, 'days');
                                            break;
                                        case 'weekly':
                                            nextDate.add(interval, 'weeks');
                                            break;
                                        case 'monthly':
                                            nextDate.add(interval, 'months');
                                            break;
                                        case 'yearly':
                                            nextDate.add(interval, 'years');
                                            break;
                                        default:
                                            console.warn('Unsupported frequency:', frequency);
                                            return;
                                    }
                                    count++;
                                }
                            } else {
                                // Non-recurring events are added directly to the appropriate array
                                if (moment(event.startDate).isBefore(moment())) {
                                    $scope.pastEvents.push(event);
                                } else {
                                    $scope.futureEvents.push(event);
                                }
                            }
                        });
        

                        // Ensure arrays are sorted chronologically
                        $scope.pastEvents = _.sortBy($scope.pastEvents, event => new Date(event.startDate));
                        $scope.futureEvents = _.sortBy($scope.futureEvents, event => new Date(event.startDate));
                        
                        if (!$rootScope.UI.isMobile) {
                            $timeout(function () {
                                try {
                                    new Swiper('.swiper-container', {
                                        slidesPerView: 3,
                                        spaceBetween: 20,
                                        loop: true,
                                        navigation: {
                                            nextEl: '.next',
                                            prevEl: '.prev',
                                        },
                                        pagination: {
                                            el: '.swiper-pagination',
                                            clickable: true,
                                        },
                                    });
                                } catch (err) {
                                    console.error('Swiper initialization failed:', err);
                                }
                            }, 0);
                        };
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Retrieving Events.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.eventsLoaded = true;
                    console.error('Error fetching events:', err);
                });
        };               
        $scope.initEstimate = function (estimate) {
            $log.log(estimate);
            if (!estimate) {
                return;
            }
            $scope.UI.estimateLoaded = false;
            $scope.estimate = {};
            $estimate.getEstimate({id: estimate.id})
            .then(
                function (response) {
                    $scope.UI.estimateLoaded = true;
                    if (!response.err) {
                        $scope.estimate = response.estimate; 
                    } else {
                            $scope.UI.errMessage = response.msg || 'Failed to view the Estimate.';
                        }
                    }
                )
                .catch(function (err) {
                    $scope.UI.errMessage = `Error viewing Estimate: ${err.message}`;
                });
        };
        $scope.initEstimates = function (archived) {
            $scope.UI.estimatesLoaded = false;
            $scope.UI.archiveEstimates = archived;

            var data = {
                id: $routeParams.clientId
            }

            var estimateService = archived ? $client.getArchivedEstimates : $client.getEstimates;

            estimateService(data)
            .then(
                function (response) {
                    $scope.UI.estimatesLoaded = true;
                    if (!response.err) {
                        $scope.estimates = response.estimates;
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Retrieving Estimates.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.estimatesLoaded = true;
                    $log.error("Error fetching Estimates:", err);
                });

        };
        $scope.initEstimators = function () {
            $scope.UI.estimatorsLoaded = false;

            $scope.estimators = [];

            if ($rootScope.UI.isMobile) {
                $('#viewClientOptionsMobileReveal').foundation('close');
            }

            $user.getEstimators()
            .then(
                function (response) {
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
        $scope.initWorkOrders = function (archived) {
            $scope.UI.workOrdersLoaded = false;
            $scope.UI.archiveWorkOrders = archived;

            var data = {
                id: $routeParams.clientId
            }
            var workOrderService = archived ? $client.getArchivedWorkOrders : $client.getWorkOrders;

            workOrderService(data)
            .then(
                function (response) {
                    $scope.UI.workOrdersLoaded = true;
                    if (!response.err) {
                        $scope.workOrders = response.workOrders;
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Retrieving Work Orders.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.workOrdersLoaded = true;
                    $log.error("Error fetching Work Orders:", err);
                });
        };
        $scope.initInvoices = function (archived) {
            $scope.UI.invoicesLoaded = false;
            $scope.UI.archiveInvoices = archived;
        
            var data = {
                id: $routeParams.clientId
            };
        
            var invoiceService = archived ? $client.getArchivedInvoices : $client.getInvoices;
        
            invoiceService(data)
                .then(function (response) {
                    $scope.UI.invoicesLoaded = true;
                    if (!response.err) {
                        $scope.invoices = response.invoices;
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Retrieving Invoices.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.invoicesLoaded = true;
                    $log.error("Error fetching invoices:", err);
                });
        };
        $scope.initMarketing = function () {
            $scope.marketings = [];
            $scope.UI.marketingsLoaded = true;
        };
        $scope.initPhotos = function (type, obj) {
            $scope.UI.photosLoaded = false;
            $scope.photos = [];
            $scope.unassignedPhotos = [];
            $scope.eventPhotos = [];
            $scope.marketingPhotos = [];

            var data = {
                id: $routeParams.clientId,
                type: type,
            };
            if (type == 'events') {
                $scope.event = obj;
                data.eventId = obj.id;
            };
            if (type == 'marketing') {
                $scope.marketing = obj;
                data.marketingId = obj.id;
            };
            $client.getPhotos(data)
            .then(
                function (response) {
                    $scope.UI.photosLoaded = true;
                    
                    if (!response.err) {
                        $scope.photos = response.images;
                        $scope.initEstimates();
                        $scope.initEvents();
                        $scope.initMarketing();

                        switch (type) {
                            case 'events':
                                $scope.eventPhotos = response.images;
                            break
                            case 'marketing':
                                $scope.marketingPhotos = response.images;
                            break
                            default: 
                                $scope.unassignedPhotos = response.images;
                        };
                    }
                }
            )

        };
        $scope.initVideos = function (type, obj) {
            $scope.UI.videosLoaded = false;
            $scope.videos = [];
            $scope.unassignedVideos = [];
            $scope.eventVideos = [];
            $scope.marketingVideos = [];

            var data = {
                id: $routeParams.clientId,
                type: type,
            };
            if (type == 'events') {
                $scope.event = obj;
                data.eventId = obj.id;
            };
            if (type == 'marketing') {
                $scope.marketing = obj;
                data.marketingId = obj.id;
            };
            $client.getVideos(data)
            .then(
                function (response) {
                    $scope.UI.videosLoaded = true;

                    if (!response.err) {
                        $scope.videos = response.videos;
                        $scope.initEstimates();
                        $scope.initEvents();
                        $scope.initMarketing();

                        switch (type) {
                            case 'events':
                                $scope.eventVideos = response.videos;
                            break
                            case 'marketing':
                                $scope.marketingVideos = response.videos;
                            break
                            default: 
                                $scope.unassignedVideos = response.videos;
                        };
                    }
                }
            )
        };
        $scope.initDocuments = function (type, obj) {
            $scope.UI.documentsLoaded = false;
            $scope.documents = [];
            $scope.unassignedVideos = [];
            $scope.eventVideos = [];
            $scope.marketingVideos = [];

            var data = {
                id: $routeParams.clientId,
                type: type,
            };
            if (type == 'events') {
                $scope.event = obj;
                data.eventId = obj.id;
            };
            if (type == 'marketing') {
                $scope.marketing = obj;
                data.marketingId = obj.id;
            };
            $client.getDocuments(data)
            .then(
                function (response) {
                    $scope.UI.documentsLoaded = true;

                    if (!response.err) {
                        $scope.documents = response.documents;
                        $scope.initEstimates();
                        $scope.initEvents();
                        $scope.initMarketing();

                        switch (type) {
                            case 'events':
                                $scope.eventDocuments = response.documents;
                            break
                            case 'marketing':
                                $scope.marketingDocuments = response.documents;
                            break
                            default: 
                                $scope.unassignedDocuments = response.documents;
                        };
                    }
                }
            )
        };
        $scope.initEmail = function (email) {
            $scope.UI.emailLoaded = false;
            $scope.email = email;
            
            if (!email) {
                return;
            }

            // Determine template URL - use default if templateId is null
            var templateUrl = 'dist/partials/templates/emails/default.html';

            $q.all([
                $http.get(templateUrl),
                $setup.getCompany()
            ]).then(
                function(responses) {
                    if (
                        !responses[0].err &&
                        !responses[1].err
                    ) {
                        $scope.UI.emailLoaded = true;
                        var html = responses[0].data;
                        var tempDiv = document.createElement("div");
                        
                        tempDiv.innerHTML = html;
                        
                        $scope.company = responses[1].company;
                        
                        if (email.templateId) {
                            // Check for {{Content}} and replace it with email.message
                            var emailContentElement = angular.element(tempDiv).find('*').filter(function() {
                                return angular.element(this).html().includes('{{Content}}');
                            });
                            
                            if (emailContentElement.length) {
                                emailContentElement.html(emailContentElement.html().replace('{{Content}}', email.message || ''));
                            }
                        } else {
                            // Update the logo link and image for default template
                            angular.element(tempDiv).find('.logo-link').attr('href', $scope.company.logoUrl);
                            angular.element(tempDiv).find('.logo-image').attr('src', $scope.company.logoUrl);
                            angular.element(tempDiv).find('.default-text-body').html(email.message || '');
                        }
                        // Replace other template variables
                        var htmlContent = tempDiv.innerHTML;
                        
                        // Replace client information
                        if (email.Client) {
                            htmlContent = htmlContent.replace(/\{\{ClientName\}\}/g, `${email.Client.firstName} ${email.Client.lastName}`);
                            htmlContent = htmlContent.replace(/\{\{ClientFirstName\}\}/g, email.Client.firstName || '');
                            htmlContent = htmlContent.replace(/\{\{ClientLastName\}\}/g, email.Client.lastName || '');
                        }
                        
                        // Replace email subject
                        htmlContent = htmlContent.replace(/\{\{EmailSubject\}\}/g, email.subject || '');
                        
                        // Replace user information
                        if (email.User) {
                            htmlContent = htmlContent.replace(/\{\{UserName\}\}/g, `${email.User.firstName} ${email.User.lastName}`);
                            htmlContent = htmlContent.replace(/\{\{UserFirstName\}\}/g, email.User.firstName || '');
                            htmlContent = htmlContent.replace(/\{\{UserLastName\}\}/g, email.User.lastName || '');
                            htmlContent = htmlContent.replace(/\{\{UserEmail\}\}/g, email.User.email || '');
                        }
                        
                        // Replace company information
                        if ($scope.company) {
                            htmlContent = htmlContent.replace(/\{\{CompanyName\}\}/g, $scope.company.name || '');
                            htmlContent = htmlContent.replace(/\{\{CompanyPhone\}\}/g, $scope.company.phone || '');
                            htmlContent = htmlContent.replace(/\{\{CompanyEmail\}\}/g, $scope.company.email || '');
                        }
                        
                        // Replace hardcoded color with company primary color
                        if ($scope.company && $scope.company.primaryColor) {
                            htmlContent = htmlContent.replace(/#3f3faa/g, $scope.company.primaryColor);
                            htmlContent = htmlContent.replace(/3f3faa/g, $scope.company.primaryColor.replace('#', ''));
                        }
                        
                        // Get the iframe and write the updated HTML inside it
                        var iframe = document.getElementById("viewClientContactHistoryEmailIframe");
                        $log.log(iframe);
                        if (iframe) {
                            var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            
                            iframeDoc.open();
                            iframeDoc.write(htmlContent);
                            iframeDoc.close();
                        }
                        
                    }
                }
            ).catch(
                function(err) {
                    console.error("Error loading email template:", err);
                    $scope.UI.emailLoaded = true;
                }
            );
        };
        $scope.initEmails = function () {
            $scope.UI.emailsLoaded = false;
            $scope.emails = [];

            $client.listEmails({ id: $routeParams.clientId })
            .then(
                function (response) {
                    $scope.UI.emailsLoaded = true;

                    if (response.err) {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve emails.';
                        return;
                    }
                    $scope.emails = response.emails || [];
                }
            ).catch(
                function (err) {
                    $scope.UI.emailsLoaded = true;
                    $scope.UI.errMessage = err || 'Error retrieving emails.';
                }
            )
        };
        $scope.initPhoneCalls = function () {
            $scope.UI.phoneCallsLoaded = false;
            $scope.phoneCalls = [];

            $client.listPhoneCalls({ id: $routeParams.clientId })
            .then(
                function (response) {
                    $scope.UI.phoneCallsLoaded = true;

                    if (response.err) {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve phone calls.';
                        return;
                    }
                    $scope.phoneCalls = response.phoneCalls || [];
                }
            ).catch(
                function (err) {
                    $scope.UI.phoneCallsLoaded = true;
                    $scope.UI.errMessage = err || 'Error retrieving phone calls.';
                }
            )
        };
        $scope.initTextMessages = function () {
            $scope.UI.textMessagesLoaded = false;
            $scope.textMessages = [];

            $communication.getTextMessages({ clientId: $routeParams.clientId })
            .then(
                function (response) {
                    $scope.UI.textMessagesLoaded = true;
                    if (response.err) {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve text messages.';
                    }
                    $scope.textMessages = response.textMessages || [];
                }
            ).catch(function (err) {
                $scope.UI.textMessagesLoaded = true;
                $scope.UI.errMessage = `Error retrieving text messages: ${err.message}`;
            });
        };
        $scope.initEventForm = function (data) {
            $scope.UI.createAddress = false;
            $scope.UI.currentStep = 2;
            $scope.UI.eventLoaded = false;
        
            $scope.participant = null;

            $scope.addresses = [];
            $scope.emails = [];
            $scope.phoneNumbers = [];
            $scope.event = {};
            $scope.address = {};
            $scope.groups = [];
            $scope.users = [];
            $scope.eventTypes = [];
            $scope.priorities = [];

            const initCalls = [
                $setup.getAddresses(),
                $setup.getEmails(),
                $setup.getPhoneNumbers(),
                $setup.getStates(),
                $setup.getPriorities(),
                $setup.getPhoneNumberTypes(),
                $setup.getEmailTypes(),
                $setup.getRecurrence(),
                $setup.getReminderTypes(),
                $user.getGroups(),
                $event.getCategories(),
                $user.getUsers(),
                $user.getEventTypes(),
                $admin.getCompany(),
            ];
        
    
            // Default event structure
            $scope.event = {
                title: null,
                startDate: null,
                endDate: null,
                details: null,
                targetUserId: null,
                addressId: null,
                phoneNumberId: null,
                emailId: null,
                clientId: $scope.client.id,
                client: $scope.client,
                categoryType: 'client',
                eventTypeId: null,
                priorityId: 1,
                statusId: null,
                groupId: null,
                reminderTypeId: null,
                creatorId: $scope.user.id
            };
            $q.all(initCalls).then(function (responses) {

                var offset = 0;
                $scope.UI.eventLoaded = true;
        
                if (
                    !responses[offset].err &&
                    !responses[offset + 1].err &&
                    !responses[offset + 2].err &&
                    !responses[offset + 3].err &&
                    !responses[offset + 4].err &&
                    !responses[offset + 5].err &&
                    !responses[offset + 6].err &&
                    !responses[offset + 7].err &&
                    !responses[offset + 8].err &&
                    !responses[offset + 9].err &&
                    !responses[offset + 10].err &&
                    !responses[offset + 11].err &&
                    !responses[offset + 12].err &&
                    !responses[offset + 13].err
                ) {
                    $scope.addresses = responses[offset].addresses;
                    $scope.emails = responses[offset + 1].emails;
                    $scope.phoneNumbers = responses[offset + 2].phoneNumbers;
                    $scope.states = responses[offset + 3].states;
                    $scope.priorities = responses[offset + 4].priorities;
                    $scope.phoneNumberTypes = responses[offset + 5];
                    $scope.emailTypes = responses[offset + 6];
                    $scope.recurrencePatterns = responses[offset + 7];
                    $scope.reminderTypes = responses[offset + 8].reminderTypes;
                    $scope.groups = responses[offset + 9].groups;
                    $scope.eventCategories = responses[offset + 10].categories;
                    $scope.users = responses[offset + 11].users;
                    $scope.eventTypes = responses[offset + 12].eventTypes;
                    $scope.company = responses[offset + 13].company;

                    // Match EventReminderTypes with reminderTypes and set selected
                    if ($scope.event.EventReminderTypes && $scope.event.reminderTypes) {
                        $scope.event.reminderTypes.forEach(reminder => {
                            const matchingReminder = $scope.event.EventReminderTypes.find(
                                ert => ert.reminderTypeId === reminder.id
                            );
                            reminder.selected = !!matchingReminder;
                        });
                    }
                    $scope.event.EventCategory = $scope.eventCategories.find(
                        e => e.name === 'client'
                    );
                    $scope.event.eventCategoryId = $scope.event.EventCategory.id;
                    var googlePlacesAddress = null;
                    $scope.$on('googlePlacesAddressSelected', function (event, args) {
                        googlePlacesAddress = args.address;
                        $scope.isPlaceSelected = true;
                    });

                    $scope.$watch(
                        'address', 
                        function (newVal, oldVal) {
                        if ($scope.isPlaceSelected && newVal !== oldVal && !angular.equals(newVal, googlePlacesAddress)) {
                            $scope.UI.errMessage = 'Address was manually modified. It may cause problems for the result.';
                            $scope.isPlaceSelected = false;
                        }
                    }, true);
                    

                    $scope.UI.addressesLoaded = true;
                    $scope.UI.eventTypesLoaded = true;
                    $scope.UI.groupsLoaded = true;
                    $scope.UI.usersLoaded = true;
                }
            });
        };
        $scope.initEventType = function (id) {
            var type = _.find(
                $scope.eventTypes,
                function (type) {
                    return type.id == id; 
                }
            );
            $scope.event.EventType = type;
            
        };
        $scope.initAIEstimate = function (e, estimate) {
            if (e) {
                e.preventDefault();
            }
            if (!estimate.prompt) {
                $scope.UI.errMessage = 'Please provide a project description.';
                return;
            }

            $scope.UI.aiAnalyzing = true;
            $scope.UI.aiAnalysisComplete = false;
            $scope.UI.errMessage = null;
            $scope.UI.formSaving = true;

            // Prepare data for AI estimate generation
            const estimateData = {
                prompt: estimate.prompt,
                clientId: $scope.client ? $scope.client.id : null,
                projectType: 'general construction',
                markupPercentage: 0.0,
                salesTaxRate: 0.0,
                includeLabor: estimate.includeLabor,
                includeMaterials: estimate.includeMaterials,
                includeEquipment: estimate.includeEquipment
            };

            $ai.generateEstimate(estimateData)
            .then(
                function(response) {
                    $scope.UI.aiAnalyzing = false;
                    $scope.UI.formSaving = false;

                    if (!response.err && response.estimate) {
                        $scope.UI.aiAnalysisComplete = true;

                        $location.path('/estimates/estimate/' + response.estimate.id + '/edit');
                        
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to generate estimate. Please try again.';
                    }
                }
            ).catch(
                function(error) {
                    $scope.UI.aiAnalyzing = false;
                    console.error('AI Estimate Generation error:', error);
                    $scope.UI.errMessage = 'Error during AI estimate generation. Please check your connection and try again.';
                }
            );
        };
        $scope.getClients = function () {
            var data = {
                query: $scope.search.value,
                page: $scope.search.page
            };
            $client.getClients(data)
            .then(
                function (response) {
                    $scope.UI.clientsLoaded = true;
                    if (!response.err) {
                        $scope.total = response.total;
                        $scope.clients = response.clients.rows
                    };

                }
            )
        };
        $scope.createClient = function (e, client) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            $client.createClient(client)
            .then(
                function (response) {
                    $scope.UI.formSaving = true;
                    if (!response.err) {
                        var i = 0;
                        $scope.UI.formSaving = false;
                        $scope.client = response.client;

                        $location.url('/clients/client/' + response.client.id + '/edit');
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Create the Client.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Creating the Client: ${err.message}`;
                }
            );
        };
        $scope.createEmail = function (e, email) {
            if (e) {
                e.preventDefault();
            };

            $scope.UI.formSaving = true;

            email.clientId = $scope.client.id;

            $client.createClientEmail(email)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.UI.createEmail = false;
                        $scope.email = {};
                        $scope.initFormSaved(response.msg);
                        $scope.initClientForm();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Create the Email.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Updating the Email: ${err.message}`;
                }
            );
        };
        $scope.createPhoneNumber = function (e, phoneNumber) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            phoneNumber.clientId = $scope.client.id;
            $client.createClientPhoneNumber(phoneNumber)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.UI.createPhoneNumber = false;
                        $scope.phoneNumber = {};
                        $scope.initFormSaved(response.msg);
                        $scope.initClientForm();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Create the Phone Number.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Updating the Phone Number: ${err.message}`;
                }
            );
        };
        $scope.createAddress = function (e, address) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            address.clientId = $scope.client.id;
            $client.createClientAddress(address, $scope.user)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.UI.createAddress = false;
                        $scope.address = {};
                        $scope.initFormSaved(response.msg);
                        $scope.initClientForm();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Create the Address.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Creating the Address: ${err.message}`;
                }
            );
        };
        $scope.createNote = function (e, note) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            note.clientId = $scope.client.id;
            $client.createClientNote(note)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.UI.createNote = false;
                        $scope.note = {};
                        $scope.initFormSaved(response.msg);
                        $scope.initClientForm();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Create the Note.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Creating the Note: ${err.message}`;
                }
            );
        };
        $scope.createEstimate = function (e, estimate) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;

            estimate.clientId = $scope.client.id;
            $estimate.createEstimate(estimate)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $location.url('/estimates/estimate/' + response.estimate.id + '/edit');
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Create the Estimate.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Creating the Estimate: ${err.message}`;
                }
            );
        };
        $scope.createInvoice = function (e, invoice) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;

            invoice.clientId = $scope.client.id;
            $invoice.createInvoice(invoice)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $location.url('/invoices/invoice/' + response.invoice.id + '/edit');
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Create the Invoice.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Creating the Invoice: ${err.message}`;
                }
            );
        };
        $scope.updateClient = function (e, client) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;

            $client.updateClient(client)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                        $scope.initClientForm();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Update the Client.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Updating the Client: ${err.message}`;
                }
            );
        };
        $scope.updateClientsList = function () {
            $scope.UI.clientsLoaded = false;
            $scope.clients = [];

            $admin.getClients($scope.user.company)
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.formatClientsList(response.clients);
                    };
                }
            );
        };
        $scope.updateEmail = function (email) {
            $scope.UI.createEmail = false;

            const updatingEmail = _.find(
                $scope.client.ClientEmails,
                function (mail) {
                    return mail.id == email.id;
                }
            );
            updatingEmail.saving = true;
            $client.updateClientEmail(email)
            .then(
                function (response) {
                    updatingEmail.saving = false;
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                        $scope.initClientForm();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Update the Email.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Updating the Email: ${err.message}`;
                }
            );
        };
        $scope.updatePhoneNumber = function (phoneNumber) {
            $scope.UI.createPhoneNumber = false;

            const updatingPhoneNumber = _.find(
                $scope.client.ClientPhoneNumbers,
                function (phone) {
                    return phone.id == phoneNumber.id;
                }
            );
            updatingPhoneNumber.saving = true;
            $client.updateClientPhoneNumber(phoneNumber)
            .then(
                function (response) {
                    updatingPhoneNumber.saving = false;
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                        $scope.initClientForm();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Update the Phone Number.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Updating the Phone Number: ${err.message}`;
                }
            );
        };
        $scope.updateClientAddress = function (e, address) {
            if (e) {
                e.preventDefault();
            }
            address.primary_id = 0;
            address.type_id = parseInt(address.type_id);
            if (address.selected) {
                address.primary_id = 1;
            };
            if (!address.id) {
                $scope.UI.addressSaving = true;
                address.client_id = $scope.client.id;
                address.company_id = $scope.user.company_id;
                $client.createClientAddress(address, $scope.user)
                .then(
                    function (response) {
                        if (!response.err) {
                            $scope.initFormSaved(response.msg);
                            $scope.UI.addressSaving = false;
                            $scope.UI.createAddress = false;
                            $scope.initClientForm();
                        };
                    }
                );
            } else {
                var addr = _.find(
                    $scope.client.addresses,
                    function (ad) {
                        return ad.id == address.id;
                    }
                );
                addr.saving = true;
                $client.updateClientAddress(address, $scope.user)
                .then(
                    function (response) {
                        if (!response.err) {
                            addr.saving = false;
                            $scope.initFormSaved(response.msg);
                        };
                    }
                );
            };
        };
        $scope.updateClientNote = function (e, note) {
            if (e) {
                e.preventDefault();
            }
            _.each($scope.client.notes, function (n) {
                if (n.id == note.id) {
                    n.saving = true;
                }
            });
            $client.updateClientNote(note, $scope.user)
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                        $scope.initClientForm();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Update the Note.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Updating the Note: ${err.message}`;
                }
            );
        };
        $scope.deleteClientEmail = function (email) {

            const deletedEmail = _.find(
                $scope.client.ClientEmails,
                function (mail) {
                    return mail.id == email.id;
                }
            );
            deletedEmail.saving = true;
            $client.deleteClientEmail(email, $scope.user)
            .then(
                function (response) {
                    deletedEmail.saving = false;
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                        $scope.initClientForm();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Delete the Email.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Delete the Email: ${err.message}`;
                }
            );
        };
        $scope.deleteClientPhoneNumber = function (phoneNumber) {
            var p = _.find(
                $scope.client.phone_numbers,
                function (phn) {
                    return phn.id == phoneNumber.id;
                }
            );
            p.isActive = 0;
            p.saving = true;
            $client.updateClientPhoneNumber(phoneNumber, $scope.user)
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                    };
                }
            );
        };
        $scope.deleteClientAddress = function (address) {
            var a = _.find(
                $scope.client.addresses,
                function (addr) {
                    return addr.id == address.id;
                }
            );
            a.isActive = 0;
            a.saving = true;
            $client.updateClientAddress(address, $scope.user)
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                    };
                }
            );
        };
        $scope.deleteClientNote = function (note) {
            var n = _.find(
                $scope.client.notes,
                function (nt) {
                    return nt.id == note.id;
                }
            );
            n.isActive = 0;
            n.saving = true;
            $client.updateClientNote(note, $scope.user)
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                    };
                }
            );
        };
        $scope.deleteVideo = function (video) {
            $scope.videos = $scope.videos.filter((v) => v.id !== video.id);
        
            $client.deleteVideo({ id: video.id })
                .then(function (response) {
                    if (response.err) {
                        // Re-add the video on error
                        $scope.videos.push(video);
                        $log.error('Error deleting video:', response.msg);
                    }
                })
                .catch(function (err) {
                    // Re-add the video on error
                    $scope.videos.push(video);
                    $log.error('Error deleting video:', err);
                });
        };
        $scope.deleteVideos = function (videos) {
            const videoIds = videos.map((video) => video.id);
            $scope.videos = $scope.videos.filter((video) => !videoIds.includes(video.id));
        
            $client.deleteVideos({ ids: videoIds })
                .then(function (response) {
                    if (response.err) {
                        // Re-add the videos on error
                        $scope.videos = [...$scope.videos, ...videos];
                        $log.error('Error deleting videos:', response.msg);
                    }
                })
                .catch(function (err) {
                    // Re-add the videos on error
                    $scope.videos = [...$scope.videos, ...videos];
                    $log.error('Error deleting videos:', err);
                });
        };
        $scope.deleteDocument = function (document) {
            $scope.documents = $scope.documents.filter((d) => d.id !== document.id);
        
            $client.deleteDocument({ id: document.id })
                .then(function (response) {
                    if (response.err) {
                        // Re-add the document on error
                        $scope.documents.push(document);
                        $log.error('Error deleting document:', response.msg);
                    }
                })
                .catch(function (err) {
                    // Re-add the document on error
                    $scope.documents.push(document);
                    $log.error('Error deleting document:', err);
                });
        };
        $scope.deleteDocuments = function (documents) {
            const documentIds = documents.map((doc) => doc.id);
            $scope.documents = $scope.documents.filter((doc) => !documentIds.includes(doc.id));
        
            $client.deleteDocuments({ ids: documentIds })
                .then(function (response) {
                    if (response.err) {
                        // Re-add the documents on error
                        $scope.documents = [...$scope.documents, ...documents];
                        $log.error('Error deleting documents:', response.msg);
                    }
                })
                .catch(function (err) {
                    // Re-add the documents on error
                    $scope.documents = [...$scope.documents, ...documents];
                    $log.error('Error deleting documents:', err);
                });
        };        
        $scope.restoreEstimate = function (estimate) {
            $scope.UI.formSaving = true;

            $estimate.unArchiveEstimate(estimate)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                        $scope.initEstimate(estimate);
                        $scope.initEstimates();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to restore the Estimate.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.errMessage = `Error restoring Estimate: ${err.message}`;
                });
        };
        $scope.toggleClientsDetails = function (client, type) {
            var index = $scope.clients.findIndex(c => c.id === client.id);
            if (index !== -1) {
                $scope.clients[index].value = '';
                $scope.clients[index].showPhoneNumbers = false;
                $scope.clients[index].showEmails = false;
                $scope.clients[index].showAddresses = false;
                
                if (!type) {
                    return;
                };
                var fieldToToggle = 'show' + type.charAt(0).toUpperCase() + type.slice(1);
                $scope.clients[index][fieldToToggle] = !client[fieldToToggle];
            };
        };
        $scope.toggleSortDirection = function (type) {
            $scope.sort[type].reverse = !$scope.sort[type].reverse;
        };
        $scope.togglePhotoFolder = function(folder) {
            $scope.UI.photosLoaded = false;
            $scope.UI.photoFolder = ($scope.UI.photoFolder === folder) ? '' : folder;
            $scope.event = {};
            $scope.marketing = {};

            if ($scope.UI.photoFolder == 'events') {
                $scope.initEvents();
                return;
            }
            if ($scope.UI.photoFolder == 'marketing') {
                $scope.initMarketing();
                return;
            }
            $scope.initPhotos();

        };
        $scope.toggleVideoFolder = function(folder) {
            $scope.UI.videosLoaded = false;
            $scope.UI.videoFolder = ($scope.UI.videoFolder === folder) ? '' : folder;
            $scope.event = {};
            $scope.marketing = {};

            if ($scope.UI.videoFolder == 'events') {
                $scope.initEvents();
                return;
            }
            if ($scope.UI.videoFolder == 'marketing') {
                $scope.initMarketing();
                return;
            }
            $scope.initVideos();

        };
        $scope.toggleDocumentFolder = function(folder) {
            $scope.UI.documentsLoaded = false;
            $scope.UI.documentFolder = ($scope.UI.documentFolder === folder) ? '' : folder;
            $scope.event = {};
            $scope.marketing = {};

            if ($scope.UI.documentFolder == 'events') {
                $scope.initEvents();
                return;
            }
            if ($scope.UI.documentFolder == 'marketing') {
                $scope.initMarketing();
                return;
            }
            $scope.initDocuments();

        };
        $scope.togglePhotoSelection = function() {
            $scope.UI.selectPhotos = !$scope.UI.selectPhotos;
            $rootScope.$broadcast('togglePhotoSelection');
        };
        $scope.toggleVideoSelection = function() {
            $scope.UI.selectVideos = !$scope.UI.selectVideos;
            $rootScope.$broadcast('toggleVideoSelection');
        };
        $scope.toggleDocumentSelection = function() {
            $scope.UI.selectDocuments = !$scope.UI.selectDocuments;
            $rootScope.$broadcast('toggleDocumentSelection');
        };
        $scope.validateEventFormCategory = function(event) {
            var whitelist = [
                { value: 'clientId', display: 'Client ID' },
                { value: 'userId', display: 'User ID' },
                { value: 'priorityId', display: 'Priority' },
                { value: 'statusId', display: 'Status' },
                { value: 'groupId', display: 'Group' },
                { value: 'creatorId', display: 'Creator' },
                { value: 'createdDate', display: 'Created Date' },
                { value: 'eventTypeId', display: 'Event Type' },
                { value: 'startDate', display: 'Start Date' },
                { value: 'endDate', display: 'End Date' },
            ];
            var title = $scope.event.title;
            var input = document.getElementById('eventTitle');
        
            if (input && !$scope.UI.eventTitleTagify) {
                // Initialize Tagify for mixed content mode
                $scope.UI.eventTitleTagify = new Tagify(
                    input, 
                    {
                        mode: 'mix',  // Enable mixed-content mode
                        pattern: /@/, // The pattern to trigger the suggestions menu (@ symbol)
                        tagTextProp: 'display', // Display the 'display' property in the tag
                        whitelist: whitelist,  // Set the whitelist
                        dropdown: {
                            enabled: 1,   // Show the dropdown when the pattern is detected
                            position: 'text',  // Render the suggestions next to the typed text
                            highlightFirst: true  // Highlight the first suggestion automatically
                        }
                    }
                );
        
                // Handle the saving of data back to the model as a full string (tags + text)
                $scope.UI.eventTitleTagify.on('change', function(e) {
                    var fullText = e.detail.value;
                    console.log(fullText)
                    $timeout(
                        function () {
                            $scope.event.title = fullText;  // Save the full text (tags + plain text) to the model
                            $scope.$apply();
                        }
                    )
                });
                // Load the appropriate title template based on the event categoryType
                if (event.categoryType === 'client') {
                    title = $scope.company.defaultEventClientTitle;
                } else if (event.categoryType === 'group') {
                    title = $scope.company.defaultEventGroupTitle;
                } else if (event.categoryType === 'user') {
                    title = $scope.company.defaultEventUserTitle;
                } else if (event.categoryType === 'company') {
                    title = $scope.company.defaultEventCompanyTitle;
                }
                $scope.UI.eventTitleTagify.loadOriginalValues(title);
                window.TAGIFY_DEBUG = false;
            }
            if (!event.eventTypeId && event.EventType && event.EventType.map) {
                return false; // Bypass additional checks
            }
            // Validation logic based on the category type
            if (event.categoryType === 'client') {
                if ($scope.company.eventClientRequireType) {
                    return event.clientId && event.eventTypeId;  
                };
                return event.clientId;  // Ensure client is selected and type is chosen
            } else if (event.categoryType === 'group') {
                if ($scope.company.eventGroupRequireType) {
                    return event.groupId && event.eventTypeId;  
                };
                return event.groupId;   // Ensure group is selected and type is chosen
            } else if (event.categoryType === 'user') {
                if ($scope.company.eventUserRequireType) {
                    return event.targetUserId && event.eventTypeId;  
                };
                return event.targetUserId;  // Ensure user is selected and type is chosen
            } else if (event.categoryType === 'company') {
                if ($scope.company.eventCompanyRequireType) {
                    return event.eventTypeId;  
                };
                return event;
            } else {
                return event;
            }
        };
        $scope.updateStep = function(step, categoryId) {
            $timeout(function() {
                if (step === 'back') {
                    $scope.UI.currentStep -= 1;
                    return;
                }
                if (step == 2) {
                    $scope.event.eventCategoryId = categoryId;
                    $scope.event.categoryId = categoryId;
                }
                if (step === 4 && $scope.event.EventType.map){
                    if (
                        $scope.event.groupId && 
                        $scope.event.startDate &&
                        $scope.event.endDate
                    ) {
                        $scope.createEvent(null, $scope.event);
                        return;
                    };
                    $window.localStorage.setItem(
                        'goluraEventDraft', 
                        JSON.stringify($scope.event)
                    );
                    $location.path("/events/map");
                }
                $scope.UI.currentStep = step;
            });
        };
        $scope.playRecording = function(recordingUrl) {
            if (!recordingUrl) {
                $scope.UI.errMessage = 'No recording URL available.';
                return;
            }
            
            // Open recording in a new window/tab
            $window.open(recordingUrl, '_blank');
        };
        $scope.viewConferenceDetails = function(phoneCall) {
            if (!phoneCall) {
                return;
            }
            
            // Toggle the technical details view
            phoneCall.showTechnical = !phoneCall.showTechnical;
            
            // You could also implement a modal or detailed view here
            $log.log('Conference details for call:', phoneCall);
        };
        $scope.$on('photosUploaded', function(event, data) {
            if (data.eventId) {
                $scope.initPhotos('events', $scope.event);
                return;
            }
            if (data.marketingId) {
                $scope.initPhotos('marketing', $scope.marketing);
                return;
            }
            $scope.initPhotos();
        });
        $scope.$on('videosUploaded', function(event, data) {
            if (data.eventId) {
                $scope.initVideos('events', $scope.event);
                return;
            }
            if (data.marketingId) {
                $scope.initVideos('marketing', $scope.marketing);
                return;
            }
            $scope.initVideos();
        });
        $scope.$on('documentsUploaded', function(event, data) {
            if (data.eventId) {
                $scope.initDocuments('events', $scope.event);
                return;
            }
            $scope.initDocuments();
        });
        $scope.$on('photoRevealOpen', function(images, data) {
        });
    })
});