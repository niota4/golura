define([
    'app-controller', 
    'maps',
    'dhtmlx-events-calendar',
    'dhtmlx-scheduler',
    'dhtmlx-units', 
    'dhtmlx-day-timeline', 
    'dhtmlx-active-links', 
    'dhtmlx-todo',
    'moment',
    'flatpickr',
    'tagify',
    'form-render',
], function (
    app,
    map,
    eventCalendar,
    eventScheduler, 
    units, 
    timeline, 
    activeLinks,
    dhx,
    moment, 
    flatpickr,
    Tagify,
    formRender,
) {
    app.register.controller('EventsController',
    function (
        $scope,
        $rootScope,
        $routeParams,
        $location,
        $window,
        $log,
        $q,
        $cookies,
        $compile,
        $timeout,
        $interval,
        $user,
        $admin,
        $client,
        $event,
        $estimate,
        $estimator,
        $activity,
        $media,
        $inventory,
        $workOrder,
        $form,
        $setup,
        $comment,
        $toDo
    ) {
        const urlParams = new URLSearchParams(window.location.search);

        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];
        $scope.page = $setup.getCurrentPage() || {};
        $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null);
        $scope.subPermissions = $setup.updateScopes($scope, $setup.getSubPages('events'));
        $scope.eventSchedulerModes = $setup.getEventSchedulerModes();

        $scope.company = {};
        $scope.today = {};
        $scope.days = {};
        $scope.user = {};
        $scope.address = {};
        $scope.event = {};
        $scope.workOrder = {};
        $scope.client = {};
        $scope.image = {};
        $scope.eventType = {};
        $scope.reminder = {};
        $scope.map = {};
        $scope.total = {};
        $scope.toDo = {};
        $scope.search = {
            value: null,
            page: null,
            limit: null,
            count: null,
            total: null,
            events: '',
        };

        $scope.participant = null;
        $scope.eventScheduler = null;
        $scope.eventCalendar = null;
        $scope.todoWidget = null;
        $scope.checklistForm = null;

        $scope.addresses = [];
        $scope.emails = [];
        $scope.phoneNumbers = [];
        $scope.priorities = [];
        $scope.states = [];
        $scope.events = [];
        $scope.groups = [];
        $scope.photos = [];
        $scope.userGroups = [];
        $scope.userEventTypes = [];
        $scope.eventStatuses = [];
        $scope.users = [];
        $scope.types = [];
        $scope.recurrencePatterns = [];
        $scope.categories = [];
        $scope.estimates = [];
        $scope.eventPhotos = [];
        $scope.eventCategories = [];
        $scope.eventSortCategories = [];
        $scope.emailTypes = [];
        $scope.phoneNumberTypes = [];
        $scope.comments = [];
        $scope.activities = [];
        $scope.checklist = [];
        $scope.vendors = [];
        $scope.purchaseOrders = [];
        $scope.reminders = [];
        $scope.eventTypes = [];
        $scope.checklistSubmissions = [];
        $scope.checkIns = [];
        $scope.eventTypes = [];
        $scope.toDos = [];

        $scope.UI = {
            currentUrl: window.location.pathname.split( '/' ),
            isMobile: $media.getMedia(),
            tab: urlParams.get('tab'),
            eventTitleTagify: null,
            categoryType: null,
            errMessage: null,
            message: null,
            date: null,
            step: 1,
            eventDeleteConfirmation: false,
            workOrderDeleteConfirmation: false,
            participantLimit: 12,
            dateChange: false,
            newPurchaseOrder: false,
            newQuestion: false,
            addressesLoaded: false,
            clientsLoaded: false,
            eventLoaded: false,
            eventsLoaded: false,
            photosLoaded: false,
            documentsLoaded: false,
            videosLoaded: false,
            purchaseOrdersLoaded: false,
            eventActivitiesLoaded: false,
            eventCommentsLoaded: false,
            eventTypesLoaded: false,
            groupsLoaded: false,
            groupTypesLoaded: false,
            usersLoaded: false,
            workOrderLoaded: false,
            remindersLoaded: false,
            commentsLoaded: false,
            checklistLoaded: false,
            purchaseOrderLoaded: false,
            toDoLoaded: false,
            toDosLoaded: false,
            formLoaded: false,
            createAddress: false,
            createEstimate: null,
            showAllDayEvents: true,
            showTodoForm: false,
            addEventParticipant: false,
            newEvent: false,
            newTask: false,
            eventDraft: false,
            currentStep: 1,
            eventForm: false,
            checklist: false,
            customTitle: false,
            today: new Date(),
            dateSettings: {
                eventHeight: 40,
                eventsOverlay: true, 
                timeStep: 15,
                timeRange: [0, 24],
                hourScaleWidth: 50, 
                hourHeight: 40, 
            },
            calendarConfig: {
                viewControl: 'toggle',
                editorOnDblClick: false,
                views: [
                    {
                        id: 'day', 
                        label: 'Day', 
                        layout: 'day',
                        config: $scope.UI.dateSettings,
                    },
                    { 
                        id: 'week', 
                        label: 'Week', 
                        layout: 'week',
                        config: $scope.UI.dateSettings,
                    },
                    { 
                        id: 'month', 
                        label: 'Month',
                        layout: 'month' 
                    },
                    { 
                        id: 'agenda', 
                        label: 'List', 
                        layout: 'agenda' 
                    }
                ]
            },
            calenderDatePickerConfig: {
                enableTime: false,
                dateFormat: "F j, Y h:i K",
                time_24hr: false,
                onChange: function(selectedDate, dateStr) {
                    $scope.UI.eventsLoaded = false;
                    var config = $scope.eventScheduler.date.add(dateStr, null);
                    $scope.eventScheduler.setCurrentView(config);
                }
            }
        };
        $scope.initEvent = function (event) {
            $scope.UI.eventLoaded = false;
            $scope.UI.eventActivitiesLoaded = false;
            
            $scope.event = {};

            $scope.comments = [];

            if (!event) {
                event = {
                    id: $routeParams.eventId
                }
            };
            if ($scope.UI.currentUrl[4]) {
                $scope.UI.subPage = $scope.UI.currentUrl[4];
            };
            if ($rootScope.UI.isMobile) {
                $scope.UI.participantLimit = 6;
            }
            $q.all(
                [
                    $event.getEvent(event),
                    $setup.getReminderTypes(),
                    $activity.getEventActivities(event),
                    $user.getUsers(),
                    $admin.getCompany(),
                    $scope.initPhotos(event),
                ]
            ).then(
                function (responses) {
                    $scope.UI.eventLoaded = true;
                    $scope.UI.eventActivitiesLoaded = true;
                    if (
                        !responses[0].err &&
                        !responses[1].err &&
                        !responses[2].err &&
                        !responses[3].err &&
                        !responses[4].err

                    ) {
                        $scope.event = responses[0].event;
                        $scope.reminderTypes = responses[1].reminderTypes;
                        $scope.event.reminderTypes = responses[1].reminderTypes;
                        if ($scope.event.EventCategory) {
                            $scope.event.categoryType = $scope.event.EventCategory.name;
                        }
                        $scope.activities = responses[2].activities;
                        $scope.users = responses[3].users;
                        $scope.company = responses[4].company;
                        $scope.client = $scope.event.Client;

                        $rootScope.UI.titleName = $scope.event.title;

                        // Ensure $scope.user.id is the first in EventParticipants if found
                        const userParticipantIndex = $scope.event.EventParticipants.findIndex(p => p.userId === $scope.user.id);
                        if (userParticipantIndex > -1) {
                            const [userParticipant] = $scope.event.EventParticipants.splice(userParticipantIndex, 1);
                            $scope.event.EventParticipants.unshift(userParticipant);
                        }

                        if ($scope.event.EventReminderTypes && $scope.event.reminderTypes) {
                            $scope.event.reminderTypes.forEach(reminder => {
                                const matchingReminder = $scope.event.EventReminderTypes.find(
                                    ert => ert.reminderTypeId === reminder.id
                                );
                                reminder.selected = !!matchingReminder;
                            });
                        };
                        if ($scope.UI.currentUrl[4]) {
                            switch ($scope.UI.currentUrl[4]) {

                                case 'photos':
                                    $scope.initPhotos($routeParams.eventId || $scope.event.id);
                                break;
                                case 'videos':
                                    $scope.initVideos();
                                break;
                                case 'estimates':
                                    $scope.initEstimates();
                                break;
                                case 'activity':
                                    $scope.initEventActivity();
                                break;
                                case 'work-order':
                                    $scope.initWorkOrder()
                                break;
                                case 'invoices':

                                break;
                                case 'documents':
                                    $scope.initDocuments();
                                break;
                            };
                        };
                        $scope.initEventComments(event);
                        $(document).foundation();
                        if (
                            $scope.eventCalendar ||
                            $scope.eventScheduler
                        ) {
                            // reset checklist
                            $scope.checklist = [];
                            $scope.UI.checklistLoaded = false;
                            $scope.UI.checkInsLoaded = false;

                            const eventDetails = $('#details');
                            $('#eventPreviewTabs').foundation('selectTab', eventDetails);
                        }
                    };
                }
            );
        };
        $scope.initEvents = function () {
            const MAX_RECURRENCES = 30; // Limit to 30 recurrences to avoid freezing
            $scope.UI.eventsLoaded = false;
            $scope.UI.addressesLoaded = false;
            $scope.UI.eventTypesLoaded = false;
            $scope.UI.clientsLoaded = false;
            $scope.UI.groupsLoaded = false;
            $scope.UI.usersLoaded = false;
            $scope.user = $rootScope.user;
            
            $scope.event = {};
            $scope.address = {};
            $scope.user.groups = [];
            $scope.events = [];
            $scope.addresses = [];
            $scope.groups = [];
            $scope.clients = [];
            $scope.users = [];
            $scope.eventTypes = [];
            $scope.priorities = [];
            
            // Check for date parameter and set $scope.UI.date if valid
            const dateParam = urlParams.get('date');
            if (dateParam && moment(dateParam, 'YYYY-MM-DD', true).isValid()) {
                $scope.UI.date = moment(dateParam, 'YYYY-MM-DD').toDate();
                // Clear the date parameter from the URL
                $location.search('date', null); // This will remove the date parameter from the URL
            } else {
                $scope.UI.date = new Date();
            }
        
            var data = { 
                date: moment($scope.UI.date).format('YYYY-MM-DD') // Format date for the data object
            };
            $q.all([
                $user.getGroups(),
                $user.getEventTypes(),
                $setup.getPriorities(),
                $event.searchEvents(data),
                $event.getCategories(),
                $admin.getCompany(),
                $user.getUsers(),
                $setup.getEventSchedulerModes(),
                $user.getReminders()
            ]).then(function (responses) {
                if (
                    !responses[0].err &&
                    !responses[1].err &&
                    !responses[2].err &&
                    !responses[3].err &&
                    !responses[4].err &&
                    !responses[5].err &&
                    !responses[6].err &&
                    !responses[7].err &&
                    !responses[8].err
                ) {
                    $scope.groups = responses[0].groups;
                    $scope.eventTypes = responses[1].eventTypes;
                    $scope.priorities = responses[2].priorities;
                    $scope.eventCategories = responses[4].categories;
                    $scope.company = responses[5].company;
                    $scope.users = responses[6].users;
                    $scope.eventSchedulerModes = responses[7];
                    $scope.reminders = responses[8].reminders;
        
                    _.each($scope.eventCategories, function (category) {
                        $scope.eventSortCategories.push(category);
                    });
                    _.each($scope.eventTypes, function(eventType) {
                        var matchingType = _.find($rootScope.preferences.eventTypes, { id: eventType.id });
                        if (matchingType) {
                            eventType.active = true;
                        } else {
                            eventType.active = false;
                        }
                    });
                    $scope.eventSortCategories.push(
                        { id: 'all', name: 'All' },
                        { id: 'reminders', name: 'Reminders' },
                    );
        
                    _.each($scope.groups, function (group) {
                        group.label = group.name;
                        group.color = {
                            background: '#51b9a3',
                            border: '#51b9a3',
                            textColor: '#fff'
                        };
                    });
                    const expandedEvents = [];
        
                    _.each(responses[3].events, function (event) {
                        event.id = event.id;
                        event.text = event.title;
                        event.type = event.groupId;
                        event.details = event.description;
                        event.start_date = event.startDate;
                        event.end_date = event.endDate;
                        event.originalId = event.id;

                        event.color = {
                            background: event.EventType.backgroundColor,
                            border: event.EventType.backgroundColor,
                            textColor: '#ffffff'
                        };
        
                        if (event.recurring && event.RecurrencePattern) {
                            const recurrencePattern = event.RecurrencePattern;
                            const frequency = recurrencePattern.frequency;
                            const interval = recurrencePattern.interval || 1;
                            const startDate = moment(event.startDate);
                            const endDate = moment(event.endDate);
                            const recurrenceEndDate = recurrencePattern.endDate ? moment(recurrencePattern.endDate) : null;
        
                            let nextDate = startDate.clone();
                            let count = 0;
                            while ((!recurrenceEndDate || nextDate.isBefore(recurrenceEndDate)) && count < MAX_RECURRENCES) {
                                const recurrenceInstance = _.cloneDeep(event);
                                recurrenceInstance.start_date = nextDate.toISOString();
                                recurrenceInstance.end_date = nextDate.clone().add(endDate.diff(startDate)).toISOString();
                                
                                recurrenceInstance.id = `recurring-${event.id}-${nextDate.format('YYYYMMDD')}-${event.id}`;

        
                                // Drop the recurring property to prevent issues in the calendar
                                delete recurrenceInstance.recurring;
        
                                expandedEvents.push(recurrenceInstance);
                                
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
                            // Drop the recurring property to prevent issues in the calendar
                            delete event.recurring;
                            expandedEvents.push(event);
                        }
                    });
                    _.each(
                        $scope.reminders,
                        function (reminder) {
                            reminder.id = 'reminder ' + reminder.id;
                            reminder.text = reminder.title;
                            reminder.type = 'reminders';
                            reminder.details = reminder.description;
                            reminder.start_date = reminder.date;
                            reminder.end_date = reminder.date;
                            reminder.originalId = reminder.id;
                            reminder.color = {
                                background: '#ffb401',
                                border: '#ffb401',
                                textColor: '#ffffff'
                            };
                            expandedEvents.push(reminder);
                        }
                    )
                    $scope.events = expandedEvents;
                    
                    if ($rootScope.preferences.eventCategory) {
                        $scope.updateCategory($rootScope.preferences.eventCategory);
                    } else {
                        $scope.UI.categoryType = 'all';
                    }
                    if ($scope.UI.currentUrl.includes('events') && !$scope.UI.currentUrl.includes('map')) {
                        $scope.initEventsCalendar(expandedEvents, $scope.UI.date);
                    } else if ($scope.UI.currentUrl.includes('events') && $scope.UI.currentUrl.includes('map')) {
                        $scope.initMapCalendar($scope.UI.date);
                    }
                    $(document).foundation();
                }
            });
        };        
        $scope.initPhotos = function (event) {
            $scope.UI.photosLoaded = false;
            $scope.eventPhotos = [];
            $scope.photos = [];
            
            var id = event.id || $routeParams.eventId ||  $scope.event.id;
            var data = {
                id: id,
            };
            $event.getPhotos(data)
            .then(
                function (response) {
                    $scope.UI.photosLoaded = true;
                    if (!response.err) {
                        $scope.eventPhotos = response.images;
                        $scope.photos = response.images;
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to retrieve the Photos.');
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.photosLoaded = true;
                    $scope.initErrorMessage(err || 'Failed to retrieve the Photos.');
                }
            );
        };
        $scope.initDocuments = function (type, obj) {
            $scope.UI.documentsLoaded = false;
            $scope.eventDocuments = [];

            var data = {
                id: $routeParams.eventId,
            };
            $event.getDocuments(data)
            .then(
                function (response) {
                    $scope.UI.documentsLoaded = true;
                    if (!response.err) {
                        $scope.eventDocuments = response.documents;
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to retrieve the Documents.');
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.documentsLoaded = true;
                    $scope.initErrorMessage(err || 'Failed to retrieve the Documents.');
                }
            );
        };
        $scope.initVideos = function (type, obj) {
            $scope.UI.videosLoaded = false;
            $scope.eventPhotos = [];

            var data = {
                id: $routeParams.eventId,
            };
            $event.getVideos(data)
            .then(
                function (response) {
                    $scope.UI.videosLoaded = true;
                    if (!response.err) {
                        $scope.eventVideos = response.videos;
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to retrieve the Videos.');
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.videosLoaded = true;
                    $scope.initErrorMessage(err || 'Failed to retrieve the Videos.');
                }
            );
        };
        $scope.initImage = function (image) {
            $scope.UI.imageLoaded = false;
            $log.log(image)
            $media.getPhotoByUrl({url: image.url})
            .then(
                function (response) {
                    $scope.UI.imageLoaded = true;
                    if (!response.err) {
                        $scope.image = response.image;
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to retrieve the Image.');
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.imageLoaded = true;
                    $scope.initErrorMessage(err || 'Failed to retrieve the Image.');
                }
            );
        };
        $scope.initEstimate = function (estimate) {
            $scope.UI.estimateLoaded = false;
            $scope.estimate = {};
            $estimate.getEstimate({id: estimate.id})
            .then(
                function (response) {
                    $scope.UI.estimateLoaded = true;
                    if (!response.err) {
                        $scope.estimate = response.estimate;
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve the Estimate.';
                    }
                }
            )
        };
        $scope.initWorkOrder = function () {
            $scope.UI.workOrderLoaded = false;
            $scope.workOrder = {};
            
            $scope.vendors = [];

            $q.all(
                [
                    $event.getWorkOrder($scope.event),
                    $inventory.listVendors()
                ])
            .then(
                function (responses) {
                    $scope.UI.workOrderLoaded = true;
                    
                    if (
                        !responses[0].err &&
                        !responses[1].err
                    ) {
                        $scope.workOrder = responses[0].workOrder;
                        $scope.vendors = responses[1].vendors;

                        if ($scope.workOrder) {
                            $scope.initWorkOrderActivity();
                        };

                    }
                }
            )
        };
        $scope.initEventAdmin = function (event) {
            $scope.UI.checklistLoaded = false;
            $scope.UI.checklistSubmissionsLoaded = false;
            $scope.UI.checkInsLoaded = false;
            $scope.UI.toDosLoaded = false;

            $scope.todo = {};

            $scope.checklistSubmissions = [];
            $scope.checkIns = [];
            $scope.toDos = [];

            $q.all(
                [
                    $event.getChecklistSubmissions({id: event.id}),
                    $event.getCheckIns({id: event.id}),
                    $event.getToDos({eventId: event.id}),
                    $user.getUsers()
                ]
            ).then(
                function (responses) {
                    $scope.UI.checklistSubmissionsLoaded = true;
                    $scope.UI.checkInsLoaded = true;

                    if (
                        !responses[0].err &&
                        !responses[1].err &&
                        !responses[2].err &&
                        !responses[3].err
                    ) {
                        $scope.UI.toDosLoaded = true;
                        $scope.UI.checklistSubmissionsLoaded = true;
                        $scope.UI.checkInsLoaded = true;

                        $scope.checklistSubmissions = responses[0].submissions;
                        $scope.toDos = responses[2].toDos;
                        $scope.users = responses[3].users;

                        $log.log($scope.toDos);

                        const checkIns = responses[1].checkIns;

                        _.each(
                            $scope.users,
                            function (user) {
                                const userCheckIns = _.filter(checkIns, { userId: user.id });

                                if (userCheckIns.length > 0) {
                                    const checkInTimes = [];
                                    const checkOutTimes = [];
                                    const totalTimes = [];
                                    let totalTime = 0;
                                    let currentlyCheckedIn = false;
                                
                                    // Clone the checkOutTimes array to avoid modifying the original
                                    const remainingCheckOutTimes = [...userCheckIns.filter(ci => ci.checkOutTime)];
                                
                                    // Match each checkInTime with the closest valid checkOutTime
                                    userCheckIns
                                    .filter(ci => ci.checkInTime)
                                    .forEach(checkIn => {
                                        const checkInTime = moment(checkIn.checkInTime);
                                
                                        // Find the closest valid checkOutTime after the current checkInTime
                                        const closestCheckOutIndex = remainingCheckOutTimes.findIndex(
                                            checkOut => moment(checkOut.checkOutTime).isAfter(checkInTime)
                                        );
                                
                                        let checkOut = null;
                                        if (closestCheckOutIndex !== -1) {
                                            checkOut = remainingCheckOutTimes[closestCheckOutIndex];
                                            remainingCheckOutTimes.splice(closestCheckOutIndex, 1); // Remove matched checkOutTime
                                        } else {
                                            // If no valid checkOutTime is found, use the current time
                                            checkOut = { checkOutTime: moment().toISOString() };
                                        }
                                
                                        // Add the checkInTime and its matched checkOutTime to their respective arrays
                                        checkInTimes.push(checkIn);
                                        checkOutTimes.push(checkOut);
                                
                                        // Calculate the time difference if both checkInTime and checkOutTime exist
                                        if (checkOut && checkOut.checkOutTime) {
                                            const time = moment(checkOut.checkOutTime).diff(checkInTime, 'seconds'); // Calculate difference in seconds
                                            totalTimes.push({ time, checkIn, checkOut });
                                            totalTime += time;
                                        }
                                    });

                                    const oldestCheckOut = _.minBy(checkOutTimes, co => moment(co.checkOutTime).unix());
                                    const mostRecentCheckIn = _.maxBy(checkInTimes, ci => moment(ci.checkInTime).unix());
                                    currentlyCheckedIn = mostRecentCheckIn && oldestCheckOut && moment(mostRecentCheckIn.checkInTime).isBefore(moment(oldestCheckOut.checkOutTime));
                                
                                    $scope.checkIns.push({
                                        User: user,
                                        checkInTimes,
                                        checkOutTimes,
                                        totalTimes,
                                        totalTime,
                                        currentlyCheckedIn,
                                    });
                                }
                            }
                        );
                        $(document).foundation();

                        const checklistSubmissions = $('#checklistSubmissions');
                        $('#eventAdminSettingsTabs').foundation('selectTab', checklistSubmissions);
                    } else {
                        $scope.UI.errMessage = responses[0].msg || 
                        responses[1].msg || 
                        responses[2].msg ||
                        responses[3].msg ||
                        'Failed to retrieve the Event Admin data.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.checklistSubmissionsLoaded = true;
                    $scope.UI.checkInsLoaded = true;
                    $scope.UI.errMessage = err || 'Failed to retrieve the Event Admin data.';
                }
            );
        };
        $scope.initTodos = function () {
            $scope.UI.toDosLoaded = false;
            $scope.toDos = [];
            $scope.todo = {};

            $event.getToDos({eventId: $scope.event.id})
            .then(
                function (response) {
                    $scope.UI.toDosLoaded = true;
                    if (!response.err) {
                        $scope.toDos = response.toDos;
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve the ToDos.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.toDosLoaded = true;
                    $scope.UI.errMessage = err || 'Failed to retrieve the ToDos.';
                }
            );
        };
        $scope.initEstimates = function (type, obj) {
            $scope.UI.estimatesLoaded = false;
            $scope.eventEstimates = [];

            var data = {
                id: $routeParams.eventId,
            };
            $event.getEstimates(data)
            .then(
                function (response) {
                    $scope.UI.estimatesLoaded = true;
                    if (!response.err) {
                        $scope.estimates = response.estimates;
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve Estimates.';
                    }
                }
            )
        };
        $scope.initEstimators = function () {
            $scope.UI.estimatorsLoaded = false;
            $scope.UI.createEstimate = null;
            $scope.estimators = [];

            $estimator.listEstimators()
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.UI.estimatorsLoaded = true;
                        $scope.estimators = response.estimators;
                    };
                }
            );
        };
        $scope.initPurchaseOrders = function () {
            $scope.UI.purchaseOrdersLoaded = false;
            $scope.purchaseOrders = [];
            $workOrder.getPurchaseOrders({id: $scope.workOrder.id})
            .then(
                function (response) {
                    $scope.UI.purchaseOrdersLoaded = true;
                    if (!response.err) {
                        $scope.purchaseOrders = response.purchaseOrders;
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve the Pruchase Orders.';
                    }

                }
            );
        };
        $scope.initEventsCalendar = function (events, date) {
            $scope.UI.eventCalendarLoaded = false;
     
            var mode = $rootScope.preferences.eventMap;
            var userGroups = [];
            
            if (mode == 'unit') {
                mode = 'day';
            }
            var sidebar = { show: true }
        
            const locale = eventCalendar.en;
            locale.calendar.timeFormat = 12;
            locale.calendar.hourFormat = 'H';
            locale.calendar.minuteFormat = 'mm';
            locale.calendar.ampmFormat = ' A';
            locale.calendar.hours = 'Hours';
            locale.calendar.minutes = 'Minutes';
            locale.calendar.weekStart = 1;
            locale.scheduler.monthFormat = 'EEE';
            locale.scheduler.dateFormat = 'EEE, d';
            locale.scheduler.agendaDateFormat = 'MMMM d EEEE';
            locale.scheduler.unassignFormat = 'd MMM yyyy';

            function convertTimeScaleTo12HourFormat() {
                // Select all elements that represent time slots in the scheduler
                
                const timeSlots = document.querySelectorAll('.wx-event-calendar-time-column-time'); // Adjust the selector based on DHTMLX structure
            
                timeSlots.forEach(slot => {
                    // Get the current time in 24-hour format
                    const timeText = slot.textContent.trim();
                    const [hour, minute] = timeText.split(':').map(Number);
            
                    // Convert to 12-hour format
                    let formattedHour = hour % 12 || 12; // Convert 0 to 12
                    let period = hour < 12 ? 'AM' : 'PM';
            
                    // Update the slot with 12-hour format time
                    slot.textContent = `${formattedHour}:00 ${period}`;
                });
            }
            
            // Match saved group preferences
            _.each($scope.groups, function(group) {
                var matchingGroup = _.find($rootScope.preferences.eventSchedulerGroups, { id: group.id });
                group.active = false;
                if (matchingGroup) {
                    group.active = true;
                }
                userGroups.push(group);
            });
            // Match saved event type preferences
            userGroups.push({ 
                id: 'reminders', 
                label: 'Reminders', 
                color: { 
                    background: '#ffb401', 
                    border: '#ffb401', 
                    textColor: '#fff' 
                } 
            });
            // filter events by active event types
            if ($rootScope.preferences.eventTypes && $rootScope.preferences.eventTypes.length > 0) {
                if (!events || events.length === 0) {
                    events = $scope.events;
                };
                events = events.filter(event => {
                    const eventType = $scope.eventTypes.find(et => et.id === event.eventTypeId);
                    return event.type === 'reminders' || (eventType && eventType.active);
                });
            }
            if ($scope.eventCalendar) {
                $scope.eventCalendar.destructor();
            }  
            if ($rootScope.UI.isMobile) {
                mode = 'month';
                sidebar.show = false;
                $scope.UI.calendarConfig.views = [
                    {
                        id: 'day', 
                        label: 'Day', 
                        layout: 'day',
                        config: $scope.UI.dateSettings,
                    },
                    { 
                        id: 'month', 
                        label: 'Month', 
                        layout: 'month' 
                    }
                ];
            }
            $scope.eventCalendar = new eventCalendar.EventCalendar(
                '#eventsCalendar', 
                {
                    events: events,
                    theme: 'material',
                    mode: mode,
                    sidebar,
                    dateFormat: "%h:%i %A",
                    calendars: userGroups,  // Use updated $scope.groups with active status
                    dimPastEvents: true,
                    dragCreate: true,
                    dragResize: true,
                    dragMove: false,
                    date: date || new Date(),
                    config: $scope.UI.calendarConfig,
                    locale: locale,
                    templates: {
                        weekEvent: ({ event, calendar }) => {
                            const start_date = moment(event.start_date, 'HH:mm').format('h:mm a');
                            const end_date = moment(event.end_date, 'HH:mm').format('h:mm a');
                            return `
                                <div className="week-event-wrapper">
                                    <div>${event.text}</div>
                                    <div> ${start_date} - ${end_date}</div>    
                                </div>
                            `;
                        },
                        agendaEvent: ({ event, calendar }) => {
                            const start = moment(event.start_date, 'HH:mm').format('h:mm a');
                            const end = moment(event.end_date, 'HH:mm').format('h:mm a');

                            if (!event.color) {
                                event.color = {
                                    background: '#6f7182'
                                }
                            }
                            const label = `
                                <div class="agenda-event-wrapper">
                                    <div class="grid-x grid-margin-x align-middle">
                                        <div class="cell shrink">
                                            <div 
                                                class="wx-event-calendar-agenda-event-marker svelte-92bs52"
                                                style="background: #${event.color.background}"
                                            >
                                                
                                            </div>
                                        </div>
                                        <div class="cell small-12 medium-2 large-2">
                                            <span>${start}</span> to <span>${end}</span>
                                        </div>
                                        <div class="cell small-12 medium-auto large-auto">
                                            <p>${event.text}</p>
                                        </div>
                                    </div>
                                </div>`;
                            return `
                                <div>
                                    <span className="label"> ${label} </span>
                                </div>
                            `;
                        },
                    }
                }
            );
            $scope.eventCalendar.api.intercept('select-event', 
                function (data) {
                    var event = { id: data.id };
                    if (!_.isInteger(event.id) && event.id.includes('reminder')) {
                        const reminder = $scope.reminders.find(r => r.id === event.id);
                        if (reminder) {
                            $scope.reminder = reminder;
                            $('#eventReminderReveal').foundation('open');
                            $scope.$apply();
                            return false;
                        }
                    };
                    if (!_.isInteger(event.id) && event.id.includes('recurring')) {
                        // get the id from the recurring event id by extracting the part after the last dash
                        // Example: 'recurring-123-20231001-132' -> '132'
                        const match = event.id.match(/-(\d+)$/);
                        if (match) {
                            const extractedId = match[1];
                            event.id = extractedId;
                        }
                    }
                    
                    if ($rootScope.UI.isMobile) {
                        $location.path('/events/event/' + event.id);
                    } else {
                        $(document).foundation();
                        $('#eventsCalendarEventReveal').foundation('open');
                    };
                    $scope.initEvent(event);
                    $scope.UI.eventForm = false;

                    return false;
                }
            );
            $scope.eventCalendar.api.intercept('edit-event', 
                function (data) {
                    if (data.add && data.add.start_date && data.add.start_date.valueOf() < date.valueOf()) {
                        $scope.eventCalendar.deleteEvent(data.add);
                        return false;
                    }
                    $scope.initEventForm(data.add || data);
                    $scope.UI.eventForm = true;
                    $scope.UI.eventLoaded = false;
                    $scope.UI.currentStep = 1;
                    $(document).foundation();
                    $('#eventsCreateEventReveal').foundation('open');
                    return false;
                }
            );
            $scope.eventCalendar.api.intercept('update-event', 
                function (data) {
                    const startDate = data.event.start_date;
                    const endDate = data.event.end_date;
                    var eventId = data.event.id;
                    if (!_.isInteger(data.event.id) && data.event.id.includes('recurring')) {
                        // get the original event id from the recurring event id by extracting the part after the last dash
                        // Example: 'recurring-123-20231001-132' -> '132'
                            
                        const match = data.event.id.match(/-(\d+)$/);
                        if (match) {
                            const extractedId = match[1];
                            eventId = extractedId;
                        }
                    }
                    
                    sessionStorage.setItem(
                        'eventData',
                        JSON.stringify({
                            eventId: eventId,
                            startDate: startDate,
                            endDate: endDate
                        })
                    );

                    // Navigate to the edit page
                    $location.path('/events/event/' + eventId + '/edit');
                    $scope.$apply();
            
                    return false; // Prevent default behavior if needed
                }
            );
            $scope.eventCalendar.api.on('update-calendar', function (object) {
                const incomingGroup = object.calendar; // Extract the incoming calendar group
                const preferences = $rootScope.preferences.eventSchedulerGroups || [];
                
                // Check if the group is already in the preferences
                const existingIndex = preferences.findIndex(group => group.id === incomingGroup.id);
            
                if (incomingGroup.active) {
                    // Add the group if it's not already present
                    if (existingIndex === -1) {
                        preferences.push(incomingGroup);
                    }
                } else {
                    // Remove the group if it exists
                    if (existingIndex !== -1) {
                        preferences.splice(existingIndex, 1);
                    }
                }
            
                // Update preferences in the root scope
                $rootScope.preferences.eventSchedulerGroups = preferences;
            
                // Save the updated preferences
                $user.updatePreferences($rootScope.preferences)
                .then(function (response) {
                    if (!response.err) {
                        $rootScope.preferences.eventSchedulerGroups = response.preferences.eventSchedulerGroups;
                        $user.setUser($scope.user);
                        $(document).foundation();
                    }
                })
                .catch(function (err) {
                    console.error('Error updating preferences:', err);
                });
            });
            $scope.eventCalendar.api.on('set-date', 
                function (object) {
                    
                    $scope.validateEventDates();
                    $timeout(
                        function () {
                            $scope.UI.date = $scope.eventCalendar.getState().date;
                            $scope.$apply();
                        }
                    );
                }
            );
            $scope.eventCalendar.api.on('set-bound', 
                function (direction) {
                    $scope.validateEventDates();

                    $timeout(
                        function () {
                            $scope.UI.date = $scope.eventCalendar.getState().date;
                            $scope.$apply();
                        }
                    );
                }
            );
            $scope.eventCalendar.api.on('set-mode', 
                function (object) {
                    var mode = object.value;

                    $timeout(
                        function () {
                            convertTimeScaleTo12HourFormat();
                        }
                    );

                    if (mode == 'day') {
                        mode = 'unit';
                    };
                    $rootScope.preferences.eventMap = mode;

                    $user.updatePreferences($rootScope.preferences)
                    .then(function (response) {
                        if (!response.err) {
                            $rootScope.preferences.eventSchedulerGroups = response.preferences.eventSchedulerGroups;
                            $user.setUser($scope.user);
                            $(document).foundation();
                        }
                    });
                }
            );
            $('.wx-event-calendar-buttons .wxi-plus').remove();
            $('.wx-event-calendar-wrapper .wxi').remove();

            var listButton = $('button[title="List"]');
            
            // Create the selectize element
            var optionButtons = `
                <a
                    class="map-button svelte-otciin"
                    id="mapButton"
                    ng-href="events/map?date={{UI.date | date:'yyyy-MM-dd'}}"
                >
                    <span class="svelte-otciin white-text">
                        <i class="fal fa-map"></i> View Map
                    </span>
                </a>
                <button
                    class="settings-button svelte-otciin"
                    id="settingsButton"
                    data-toggle="eventCalendarSettingsOffCanvas"
                    ng-disabled="!UI.eventMapLoaded"
                >
                    <span class="svelte-otciin white-text">
                        <i class="fal fa-sliders"></i> Settings
                    </span>
                </button>
            `;
            
            // Insert the selectize element after the div with data-id="add"
            listButton.after(optionButtons);
            
            var angularMapButton = angular.element(listButton.next());
            
            $compile(angularMapButton)($scope);
        
            $scope.UI.eventCalendarLoaded = true;
        
            $scope.$watch('UI.canCreate', function(newVal) {
                if (newVal) {
                    const createEventButton = document.querySelector('.dhx_cal_create_btn');
                    if (createEventButton) {
                        createEventButton.style.display = 'none';
                    }
                }
            });
        
            $scope.UI.eventsLoaded = true;
            $scope.UI.addressesLoaded = true;
            $scope.UI.eventTypesLoaded = true;
            $scope.UI.groupsLoaded = true;
            $scope.UI.usersLoaded = true;

            $timeout(
                function () {
                    convertTimeScaleTo12HourFormat();
                    $(document).foundation();
                }
            )
        };
        $scope.initMapCalendar = function (date) {
            const eventDraft = $window.localStorage.getItem('goluraEventDraft');
            const eventMap = document.getElementById('eventMap');
            let mode = $rootScope.preferences.eventMap;
        
            if (mode === 'agenda') {
                mode = 'unit';
                $rootScope.preferences.eventMap = 'unit';
            }
        
            // Determine active groups
            let activeGroups = [];
            $scope.UI.eventMapLoaded = false;
            $scope.groups.push(
                { 
                    id: 'reminders', 
                    label: 'Reminders', 
                    name: 'Reminders',
                    key: 'reminders',
                    active: true,
                    color: { background: '#ffb401', border: '#ffb401', textColor: '#fff' } 
                }
            );
            $scope.groups.forEach(group => {
                const matchingGroup = $rootScope.preferences.eventSchedulerGroups.find(prefGroup => prefGroup.id === group.id);
                if (matchingGroup) group.active = matchingGroup.active;
                if (group.active) activeGroups.push(group);
            });
        
        
            const bounds = new map.LatLngBounds();
        
            // Filter events by active groups and selected category
            const filteredEvents = $scope.events.filter(event => {
                const isInActiveGroup = activeGroups.some(group => group.id === event.groupId);
                const isInActiveEventType = $scope.eventTypes.some(eventType => eventType.id === event.eventTypeId && eventType.active);
                const isInSelectedCategory = $scope.UI.categoryType === 'all' || event.eventCategoryId === $scope.UI.categoryType;
                return isInActiveGroup && isInSelectedCategory && isInActiveEventType;
            });
            const addressCoords = new map.LatLng(
                parseFloat($scope.company.latitude || 0),
                parseFloat($scope.company.longitude || 0)
            );
            const mapOptions = {
                zoom: 10,
                center: addressCoords,
                mapTypeControl: true,
                mapTypeControlOptions: { style: map.MapTypeControlStyle.DROPDOWN_MENU },
                mapTypeId: map.MapTypeId.ROADMAP,
                tileSize: new map.Size(256, 256),
                maxZoom: 21,
                minZoom: 1,
                name: 'NoWrap',
            };
        
            $scope.userGroups = $scope.groups;
            $scope.map = new map.Map(eventMap, mapOptions);
            $scope.createMapMarker(1, { coords: addressCoords });
            bounds.extend(addressCoords);
        
            // Handle eventDraft markers and group filtering
            if (eventDraft) {
                const parsedEvent = JSON.parse(eventDraft);
                const matchingEventType = $scope.eventTypes.find(eventType => eventType.id === parsedEvent.eventTypeId);
                $scope.UI.eventDraft = true;
        
                if (matchingEventType) {
                    activeGroups.push(...matchingEventType.Groups);
                    activeGroups = _.uniqBy(activeGroups, 'id');
                }
        
                const addressPromise = parsedEvent.clientId
                    ? $client.listClientAddresses({ id: parsedEvent.clientId })
                    : $setup.getAddresses();
        
                addressPromise.then(response => {
                    if (!response.err) {
                        const eventAddress = response.addresses.find(addr => addr.id === parsedEvent.addressId);
                        if (eventAddress) {
                            const draftCoords = new map.LatLng(
                                parseFloat(eventAddress.latitude),
                                parseFloat(eventAddress.longitude)
                            );
                            $scope.createMapMarker(2, {
                                coords: draftCoords,
                                color: parsedEvent.EventType.backgroundColor,
                                id: parsedEvent.EventType.id
                            });
                            $scope.map.setCenter(draftCoords);
                            bounds.extend(draftCoords);
                        }
                    }
                });
                activeGroups = _.filter(activeGroups, function (group)
                {
                    return group.id !== 'reminders'
                });
            }
        
            activeGroups.forEach(group => {
                group.label = group.name;
                group.key = group.id;
                group.color = { background: '#51b9a3', border: '#51b9a3', textColor: '#fff' };
            });
            if ($scope.eventScheduler) {
                $scope.eventScheduler.destructor();
            }
        
            $scope.eventScheduler = scheduler;
            $scope.eventScheduler.plugins({
                units: true,
                timeline: true,
                treetimeline: true,
                daytimeline: true,
                active_links: true
            });
        
            $scope.eventScheduler.config.prevent_cache = true;
            $scope.eventScheduler.config.all_timed = true;
            $scope.eventScheduler.config.hour_date = "%h:%i %A";
            $scope.eventScheduler.config.max_month_events = 5;
            $scope.eventScheduler.config.drag_resize = true;
            $scope.eventScheduler.config.drag_move = false;
            $scope.eventScheduler.config.details_on_dblclick = false;
            $scope.eventScheduler.config.drag_create = true;
            $scope.eventScheduler.config.dblclick_create = false;
            $scope.eventScheduler.config.active_link_view = "unit";
        
            $scope.eventScheduler.createUnitsView({
                name: 'unit',
                property: 'groupId',
                size: 10,
                step: 10,
                skip_incorrect: true,
                list: $scope.eventScheduler.serverList('units-list', activeGroups),
            });
        
            $scope.eventScheduler.attachEvent("onViewChange", function (newMode, newDate) {
                $scope.UI.date = newDate;
                $scope.validateEventDates();
                $timeout(
                    function () {
                        $scope.$apply();
                    }
                )
            });
            $scope.eventScheduler.attachEvent('onBeforeDrag', function (id, mode, e) {
                if (mode === 'create') {
                    const currentTime = new Date();
                    var startDate = $scope.eventScheduler.getActionData(e).date;
        
                    // Disable drag-create for past times
                    if (startDate < currentTime) {
                        return false; // Prevent drag creation for past times
                    }
                }
                return true;
            });
            $scope.eventScheduler.attachEvent('onDragEnd', function(id, mode, e) {
                if (eventDraft) {
                    var drag = $scope.eventScheduler.getEvent(id);

                    $scope.event = JSON.parse(eventDraft);
                    $scope.event.dragId = id;
                    $scope.event.groupId = drag.groupId;
                    $scope.event.startDate = moment(drag.start_date).toISOString();
                    $scope.event.endDate = moment(drag.end_date).toISOString();

                    if (!drag.groupId) {
                        $scope.initAssignGroupForm();
                        $('#eventsAssignGroupReveal').foundation('open');

                        $('#eventsAssignGroupReveal').on('closed.zf.reveal', function () {
                            $('#eventsAssignGroupReveal').off('closed.zf.reveal');
                            $scope.eventScheduler.deleteEvent(id);
                        });
                        return false;
                    };

                    $scope.createEvent(null, $scope.event);
                };
                return false;
            });
            $scope.eventScheduler.attachEvent("onClick", function (id, e) {
                if ($scope.event.dragId) return false;
        
                var event = { id: id };
                
                if (!_.isInteger(event.id) && event.id.includes('reminder')) {
                    const reminder = $scope.reminders.find(r => r.id === event.id);
                    if (reminder) {
                        $scope.reminder = reminder;
                        $('#eventReminderReveal').foundation('open');
                        $scope.$apply();
                        return false;
                    }
                };
                
                if (!_.isInteger(event.id) && event.id.includes('recurring')) {
                    const match = event.id.match(/recurring-(.+?)-/);
                    if (match) {
                        event.id = match[1];
                    }
                }
        
                $scope.initEvent(event);
                $scope.UI.eventForm = false;
                $(document).foundation();
                $('#eventsMapCalendarEventReveal').foundation('open');
                return false;
            });
            scheduler.attachEvent("onBeforeLightbox", function (id) {
                return false;
            });
        
            $scope.eventScheduler.init('eventMapCalendarGroups', date, mode);
            $scope.eventScheduler.updateCollection('units-list', activeGroups);
            $scope.eventScheduler.parse(filteredEvents, 'json');
            $scope.UI.eventMapLoaded = true;
            $("#eventMapSearchDateButton").flatpickr($scope.UI.calenderDatePickerConfig);
        };
        $scope.initEventForm = function (data) {
        
            $scope.user = $rootScope.user;
            $scope.UI.checklist = false;
            $scope.UI.createAddress = false;
            $scope.UI.currentStep = 1;
            $scope.UI.eventLoaded = false;
        
            $scope.participant = null;

            $scope.addresses = [];
            $scope.emails = [];
            $scope.phoneNumbers = [];
        
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
            ];
        
            // Conditionally add event retrieval if `eventId` exists
            if ($routeParams.eventId) {
                initCalls.unshift($event.getEvent({ id: $routeParams.eventId }));
            } else {
                // Default event structure
                $scope.event = {
                    title: null,
                    startDate: null,
                    endDate: null,
                    details: null,
                    targetUserId: null,
                    addressId: null,
                    clientSearch: null,
                    phoneNumberId: null,
                    emailId: null,
                    clientId: null,
                    eventTypeId: null,
                    priorityId: 1,
                    userId: null,
                    statusId: null,
                    groupId: null,
                    reminderTypeId: null,
                    creatorId: $scope.user.id
                };
            }
            if (data) {
                if (data.start_date) {
                    $scope.event.startDate = data.start_date.toISOString() || null;
                };
                if (data.end_date) {
                    $scope.event.endDate = data.end_date.toISOString() || null;
                }
                $scope.event.groupId = data.groupId || null;
            }
            if ($scope.UI.tab) {
                $scope.initEventTabs();
            };
            $q.all(initCalls).then(function (responses) {
                const eventData = JSON.parse(sessionStorage.getItem('eventData'));

                var offset = 0;
                $scope.UI.eventLoaded = true;
                
                if ($routeParams.eventId) {
                    // If `eventId` exists, the first response is the event data
                    if (!responses[0].err) {
                        $scope.event = responses[0].event;
                        
                    }
                    offset = 1; // Adjust index for subsequent responses
                }
        
                if (
                    !responses[offset].err &&
                    !responses[offset + 1].err &&
                    !responses[offset + 2].err &&
                    !responses[offset + 3].err &&
                    !responses[offset + 4].err &&
                    !responses[offset + 8].err &&
                    !responses[offset + 9].err &&
                    !responses[offset + 10].err &&
                    !responses[offset + 11].err
                ) {
                    $scope.addresses = responses[offset].addresses;
                    $scope.emails = responses[offset + 1].emails;
                    $scope.phoneNumbers = responses[offset + 2].phoneNumbers;
                    $scope.states = responses[offset + 3].states;
                    $scope.priorities = responses[offset + 4].priorities;
                    $scope.reminderTypes = responses[offset + 8].reminderTypes;
                    $scope.event.reminderTypes = responses[offset + 8].reminderTypes;
                    $scope.phoneNumberTypes = responses[offset + 5];
                    $scope.emailTypes = responses[offset + 6];
                    $scope.recurrencePatterns = responses[offset + 7];
                    $scope.groups = responses[offset + 9].groups;
                    $scope.eventCategories = responses[offset + 10].categories;
                    $scope.users = responses[offset + 11].users;

                    if (eventData) {
                        if (eventData.startDate || eventData.endDate) {
                            $scope.UI.dateChange == true;
                        } 
                        angular.extend($scope.event, eventData);
                        sessionStorage.removeItem('eventData');
                    };

                    // Match EventReminderTypes with reminderTypes and set selected
                    if ($scope.event.EventReminderTypes && $scope.event.reminderTypes) {
                        $scope.event.reminderTypes.forEach(reminder => {
                            const matchingReminder = $scope.event.EventReminderTypes.find(
                                ert => ert.reminderTypeId === reminder.id
                            );
                            reminder.selected = !!matchingReminder;
                        });
                    }

                    var googlePlacesAddress = null;
                    $scope.$on('googlePlacesAddressSelected', function (event, args) {
                        googlePlacesAddress = args.address;
                        $scope.isPlaceSelected = true;
                    });
        
                    $scope.$watch(
                        'event.clientSearch', 
                        function(newVal, oldVal) {
                            if (newVal !== oldVal) {
                                $scope.search.page = 1;
                                $scope.getClients();
                            }
                        }
                    );
                    $scope.$watch(
                        'address', 
                        function (newVal, oldVal) {
                        if ($scope.isPlaceSelected && newVal !== oldVal && !angular.equals(newVal, googlePlacesAddress)) {
                            $scope.UI.errMessage = 'Address was manually modified. It may cause problems for the result.';
                            $scope.isPlaceSelected = false;
                        }
                    }, true);
                    $scope.validateEventFormCategory($scope.event);
                    $scope.UI.eventsLoaded = true;
                    $scope.UI.addressesLoaded = true;
                    $scope.UI.eventTypesLoaded = true;
                    $scope.UI.groupsLoaded = true;
                    $scope.UI.usersLoaded = true;
                    
                    $window
                    .localStorage
                    .removeItem('goluraEventDraft');
                }
            });
        };
        $scope.initPurchaseOrderForm = function (purchaseOrder) {
            $scope.UI.formSaving = false;
            $scope.UI.newPurchaseOrder = false;
            $scope.UI.purchaseOrderLoaded = false;

            $scope.purchaseOrder = purchaseOrder;

            if (!purchaseOrder) {
                $scope.UI.newGroup = true;
                $scope.purchaseOrder = {
                    eventId: $scope.event.id,
                    workOrderId: null,
                    vendorId: null,
                    clientId: $scope.event.clientId
                };
            };
            $scope.UI.newPurchaseOrder = true;
        };
        $scope.initAssignGroupForm = function () {
            $scope.UI.groupsLoaded = false;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $user.getGroups()
            .then(
                function (response) {
                    $scope.UI.groupsLoaded = true;

                    if (!response.err) {
                        $scope.groups = response.groups;

                        if ($scope.event.groupId) {
                            $scope.event.group = _.find(
                                $scope.groups,
                                function (group) {
                                    return group.id == $scope.event.groupId; 
                                }
                            );
                        } else {
                            $scope.event.group = null;
                        }
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to load groups.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.groupsLoaded = true;
                    $scope.UI.errMessage = err.message || 'Failed to load groups.';
                }
            );
        };
        $scope.initToDoListForm = function (toDo) {
            $scope.UI.formSaving = false;
            $scope.UI.message = '';
            $scope.UI.errMessage = '';
            $scope.UI.step = 1;
            $scope.UI.newToDo = false;

            if (!toDo) {
                $scope.UI.newToDo = true;
            };
            $scope.toDo = toDo ? angular.copy(toDo) : {
                name: '',
                description: '',
                clientId: $scope.event.clientId || null,
                eventId: $scope.event.id || null,
                workOrderId: $scope.workOrder.id || null,
                assignedUserId: null,
                userId: null,
                data: [],
            };
            $scope.clients = $scope.clients || [];
            $scope.events = $scope.events || [];
            $scope.workOrders = $scope.workOrders || [];
            $scope.users = $scope.users || [];
            $scope.UI.showTodoForm = true;
            $scope.UI.toDoFormLoaded = true;
        };
        $scope.initEventTabs = function () {
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
        $scope.initEventType = function (id) {
            var type = _.find(
                $scope.eventTypes,
                function (type) {
                    return type.id == id; 
                }
            );
            $scope.event.EventType = type;
            
        };
        $scope.initEventActivity = function () {
            $scope.UI.eventActivitiesLoaded = false;

            $activity.getEventActivities($scope.event)
            .then(
                function (response) {
                    $scope.UI.eventActivitiesLoaded = true;
                    if (!response.err) {
                        $scope.activities = response.activities;
                    }
                }
            );

        };
        $scope.initWorkOrderActivity = function () {
            $scope.UI.workOrderActivitiesLoaded = false;

            $activity.getWorkOrderActivities($scope.workOrder)
            .then(
                function (response) {
                    $scope.UI.workOrderActivitiesLoaded = true;
                    if (!response.err) {
                        $scope.activities = response.activities;
                    }
                }
            );

        };
        $scope.initEventChecklist = function (event) {
            $scope.UI.checklistLoaded = false;
            $scope.UI.toDosLoaded = false;
            $scope.UI.formView = false;

            $scope.form = {};
            $scope.toDo = {};

            $scope.toDos = [];
            $scope.checklist = [];

            $q.all(
                [
                    $event.getChecklist({eventId: event.id, folderId: $scope.company.eventChecklistFolderId}),
                    $event.getToDos({eventId: event.id}),
                ]
            ).then(
                function (responses) {
                    if (
                        !responses[0].err &&
                        !responses[1].err
                    ) {
                        $scope.UI.checklistLoaded = true;
                        $scope.UI.toDosLoaded = true;
                        $scope.UI.formView = false;
                        $scope.UI.formSaved = false;
                        
                        $scope.checklist = responses[0].checklist;
                        $scope.toDos = responses[1].toDos;
                        _.each(
                            $scope.checklist,
                            function (item) {
                                if (item.FormSubmissions.length) {
                                    item.completed = true
                                }
                            }
                        )
                    }
                }
            )
        };
        $scope.initEventChecklistItem = function (item) {
            if (item.completed) {
                return;
            }
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.formLoaded = false;
            $scope.UI.formView = true;
            $scope.UI.formSaved = false;
            $scope.UI.photosLoaded = false;
            $scope.UI.videosLoaded = false;
            $scope.UI.documentsLoaded = false;

            $scope.checklistForm = null;
            $scope.form = {};
            
            $q.all(
                [
                    $form.getForm({ id: item.id }),
                    $event.getPhotos($scope.event),
                    $event.getVideos($scope.event),
                    $event.getDocuments($scope.event)
                ]
            )
            .then(function (responses) {
                $scope.UI.formLoaded = true;
                $scope.UI.photosLoaded = true;
                $scope.UI.videosLoaded = true;
                $scope.UI.documentsLoaded = true;
    
                if (
                    !responses[0].err &&
                    !responses[1].err &&
                    !responses[2].err &&
                    !responses[3].err
                ) {
                    $scope.form = responses[0].form;
                    $scope.photos = responses[1].images;
                    $scope.videos = responses[2].videos;
                    $scope.documents = responses[3].documents;
                    
                    $scope.UI.errMessage = ''; // Clear error messages on success
    
                    // Render the form in adminFormView
                    const formElement = document.getElementById('eventChecklistFormView');
                    if (formElement) {
                        // Clear any existing content
                        formElement.innerHTML = '';
                        
                        // Use FormBuilder's render feature
                        $scope.checklistForm = $(formElement).formRender({
                            dataType: 'json',
                            formData: $scope.form.data,
                            notify: {
                                error: e => {
                                }
                                ,
                                success: e => {
                                    if ($scope.form.data.length) {
                                        const formData = JSON.parse($scope.form.data);
                                        _.each(
                                            formData,
                                            function (data) {
                                                switch (data.subtype) {
                                                    case 'Photo Select':


                                                        const photoSelectField = document.querySelector('.form-control[type="Photo Select"]');
                                                        const parentField = photoSelectField ? photoSelectField.closest('.formbuilder-text') : null;
                                                        if (photoSelectField) {
                                                            parentField.insertAdjacentHTML(
                                                                'afterend', 
                                                                `<format-images 
                                                                    class="container" 
                                                                    images="photos"
                                                                ></format-images>`
                                                            );
                                                            $compile(parentField.nextElementSibling)($scope);
                                                            parentField.remove();
                                                            $rootScope.$broadcast('togglePhotoSelection');
                                                        };
                                                    break;
                                                    case 'Video Select':
                                                        const videoSelectField = document.querySelector('.form-control[type="Video Select"]');  
                                                        const parentVideoField = videoSelectField ? videoSelectField.closest('.formbuilder-text') : null;
                                                        if (videoSelectField) {
                                                            parentVideoField.insertAdjacentHTML(
                                                                'afterend',
                                                                `<format-videos 
                                                                    class="container" 
                                                                    videos="videos"
                                                                ></format-videos>`
                                                            );
                                                            $compile(parentVideoField.nextElementSibling)($scope);
                                                            parentVideoField.remove();
                                                            $rootScope.$broadcast('toggleVideoSelection');
                                                        };
                                                    break;
                                                    case 'Document Select':
                                                        const documentSelectField = document.querySelector('.form-control[type="Document Select"]');
                                                        const parentDocumentField = documentSelectField ? documentSelectField.closest('.formbuilder-text') : null;
                                                        if (documentSelectField) {
                                                            parentDocumentField.insertAdjacentHTML(
                                                                'afterend',
                                                                `<format-documents 
                                                                    class="container" 
                                                                    documents="documents"
                                                                ></format-documents>`
                                                            );
                                                            $compile(parentDocumentField.nextElementSibling)($scope);
                                                            parentDocumentField.remove();
                                                            $rootScope.$broadcast('toggleDocumentSelection');
                                                        };
                                                    break;
                                                }
                                            }
                                        )
                                    }
                                },
                                warning: e => {
                                }
                            },
                        });
                    }
                } else {
                    $scope.UI.errMessage = responses[0].msg;
                }
            })
            .catch(function (err) {
                $scope.UI.formLoaded = true;
                $scope.UI.photosLoaded = true;
                $scope.UI.videosLoaded = true;
                $scope.UI.documentsLoaded = true;
                $scope.UI.errMessage = err || 'An error occurred while fetching the form.';
            });
        };
        $scope.initAddParticipants = function () {
            $scope.UI.usersLoaded = false;
            $scope.UI.addEventParticipant = !$scope.UI.addEventParticipant;
            $scope.participant = null;
            $user.getUsers()
                .then(function (response) {
                    if (!response.err) {
                        const eventParticipants = $scope.event.EventParticipants || [];
                        
                        // Filter out users already in EventParticipants
                        const participantUserIds = eventParticipants.map(participant => participant.userId);
        
                        $scope.users = response.users.filter(user => !participantUserIds.includes(user.id));
        
                        $scope.UI.usersLoaded = true;
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to load users.');
                    }
                })
                .catch(function (err) {
                    $scope.initErrorMessage(`Error fetching users: ${err.message}`);
                });
        };        
        $scope.initEventAdvancedSettings = function () {
            $q.all(
                [
                    $admin.getGroups(),
                    $setup.getEventStatus()
                ]
            ).then(
                function (responses) {
                    if (
                        !responses[0].err &&
                        !responses[1].err

                    ) {
                        $scope.groups = responses[0].groups;
                        $scope.eventStatuses = responses[1].eventStatuses;
                    }
                }
            )
        };
        $scope.initEventComments = function (event) {
            $scope.UI.commentsLoaded = false;
            
            $comment.getEventComments(event)
                .then(function (response) {
                    $scope.UI.commentsLoaded = true;
                    if (!response.err) {
                        $scope.comments = response.comments;
                        $timeout(function () {
                            $(document).foundation();
                        }, 1000);
        
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to load comments.';
                    }
                });
        };    
        $scope.initErrorMessage = function (msg) {
            $scope.UI.errMessage = msg;

            $timeout(
                function () {
                    $scope.UI.errMessage = null;
                }, 3000
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
        $scope.createEvent = function (e, event) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            $scope.UI.eventLoaded = false;

            event.creatorId = $scope.user.id;

            $event.createEvent(event)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    $scope.UI.eventLoaded = true;

                    if (!response.err) {
                        $('#eventsCreateEventReveal').foundation('close');
                        $location.path('/events/event/' + response.event.id + '/edit');
                    }
                }
            );
        };
        $scope.createEstimate = function (e, estimate) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            $scope.UI.estimateLoaded = false;
            
            $estimate.createEstimate(estimate)
            .then(
                function (response) {
                    $scope.UI.formSaving = false; // Reset saving state
                    $scope.UI.estimateLoaded = true; // Mark estimate as loaded
                    if (!response.err) {
                        // Successfully created estimate, close the modal
                        $('#estimateCreationReveal').foundation('close');
                        // Optionally redirect to the estimate view or perform other actions
                        if (response.estimate && response.estimate.id) {
                            $location.path('/estimates/estimate/' + response.estimate.id + '/edit');
                        } else {
                            $scope.initFormSaved('Estimate created successfully.');
                        }
                    } else {
                        // Handle error in estimate creation
                        $scope.UI.errMessage = response.msg || 'Failed to create estimate.';
                    }
                }
            ).catch(
                function (error) {
                    // Handle unexpected errors
                    $scope.UI.formSaving = false; // Reset saving state
                    $scope.UI.estimateLoaded = true; // Ensure loaded state is set
                    $scope.UI.errMessage = error.msg || 'An unexpected error occurred while creating the estimate.';
                }
            );
        };
        $scope.createPurchaseOrder = function (e, purchaseOrder) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            $scope.UI.purchaseOrderLoaded = false;

            $workOrder.createPurchaseOrder(purchaseOrder)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    $scope.UI.purchaseOrderLoaded = true;

                    if (response.workOrder) {
                        $scope.workOrder = response.workOrder;
                    }

                    if (!response.err) {
                        $('#createPurchaseOrderReveal').foundation('close');
                        $scope.initWorkOrder();
                    }
                }
            );
        };
        $scope.createToDo = function (e, toDo) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $toDo.createToDo(toDo)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    $scope.UI.toDoFormLoaded = true;
                    if (!response.err) {
                        $scope.UI.newToDo = false;
                        $scope.UI.showTodoForm = false;
                        $scope.UI.step = 1;

                        $scope.toDo = null;

                        $scope.initTodos();
                        $scope.initFormSaved(response.msg || 'To Do created successfully.');
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to create ToDo.';
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.toDoFormLoaded = true;
                    $scope.UI.errMessage = err.msg || 'An error occurred while creating the To Do.';
                }
            );
        };
        $scope.createAddress = function(e, address) {
            if (e) {
                e.preventDefault(); // Prevent default form submission
            }
        
            $scope.UI.formSaving = true; // Set the form saving state
        
            // Set default values for the address fields
            address.user_id = $scope.user.id;
            address.street2 = address.street2 || null;
        
            // Determine the service function and endpoint based on clientId presence
            const isClientAddress = $scope.event && $scope.event.clientId;
            const serviceFunction = isClientAddress ? $client.createClientAddress : $setup.createAddress;
        
            // If it's a client address, set the clientId
            if (isClientAddress) {
                address.clientId = $scope.event.clientId;
            }
        
            // Call the appropriate service function
            serviceFunction(address)
            .then(function(response) {
        
                if (!response.err) {
                    $scope.UI.createAddress = false; // Reset UI state for address creation
                    $scope.address = response.address; // Set the newly created address

                    if (isClientAddress) {
                        $client.listClientAddresses($scope.client)
                        .then(
                            function (response) {
                                if (!response.err) {
                                    $scope.UI.formSaving = false; // Reset form saving state
                                    $scope.client.ClientAddress = response.addresses;
                                    $scope.event.addressId = $scope.address.id;
                                    $scope.initFormSaved(response.msg); // Notify user about success
                                };
                            }
                        );
                    } else {
                        $setup.getAddresses()
                        .then(
                            function (response) {
                                if (!response.err) {
                                    $scope.UI.formSaving = false; // Reset form saving state
                                    $scope.addresses = response.addresses;
                                    $scope.event.addressId = $scope.address.id;
                                    $scope.initFormSaved(response.msg); // Notify user about success
                                };
                            }
                        )
                    }
                } else {
                    $scope.UI.errMessage = response.msg; // Show error message
                }
            })
            .catch(function(err) {
                $scope.UI.formSaving = false; // Reset form saving state
                $scope.UI.errMessage = err.msg || 'An error occurred'; // Show error message
            });
        };
        $scope.createMapMarker = function (type, options) {
            var config = {};
            var i = 0;
        
            switch (type) {
                case 1: 
                    config = {
                        map: $scope.map, 
                        position: options.coords,
                        optimized: true,
                        zIndex: 99999999,
                        icon: {
                            url: $scope.company.logoUrl, // Use the company logo URL
                            scaledSize: new map.Size(35, 35), // Adjust size as needed
                            labelOrigin: new map.Point(0, 0)
                        }
                    };
                    break;
                case 2:
                    config = {
                        map: $scope.map, 
                        position: options.coords,
                        optimized: true,
                        zIndex: i++,
                        icon: {
                            path: 'M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0',
                            strokeColor: '#fff',
                            strokeWeight: 2,
                            fillColor: options.color,
                            fillOpacity: 1,
                            scaledSize: new map.Size(1, 1),
                            labelOrigin: new map.Point(0, 0)
                        }
                    };
                    break;
            }
        
            // Create and return the marker
            var marker = new map.Marker(config);
            return marker;
        };
        $scope.updateEvents = function (date, month) {
            let mode = $rootScope.preferences.eventMap;

            const MAX_RECURRENCES = 30; // Limit to 30 recurrences to avoid freezing
            const data = { date };
            if (month) {
                data.month = true;
            }
            $event.searchEvents(data)
                .then(function (response) {
                    if (response.err) {
                        $scope.UI.errMessage = response.msg || 'Error fetching events.';
                        return;
                    }
        
                    const expandedEvents = [];
                    const newEvents = response.events.map(event => {
                        event.id = event.id;
                        event.text = event.title;
                        event.type = event.groupId;
                        event.details = event.description;
                        event.start_date = event.startDate;
                        event.end_date = event.endDate;
        
                        event.color = {
                            background: event.EventType.backgroundColor,
                            border: event.EventType.backgroundColor,
                            textColor: '#ffffff'
                        };
        
                        return event;
                    });
        
                    // Add events to expandedEvents array with recurrences if applicable
                    newEvents.forEach(event => {
     
                        if (event.recurring && event.RecurrencePattern) {
                            const recurrencePattern = event.RecurrencePattern;
                            const frequency = recurrencePattern.frequency;
                            const interval = recurrencePattern.interval || 1;
                            const startDate = moment(event.startDate);
                            const endDate = moment(event.endDate);
                            const recurrenceEndDate = recurrencePattern.endDate ? moment(recurrencePattern.endDate) : null;
        
                            let nextDate = startDate.clone();
                            let count = 0;
                            while ((!recurrenceEndDate || nextDate.isBefore(recurrenceEndDate)) && count < MAX_RECURRENCES) {
                                const recurrenceInstance = _.cloneDeep(event);
                                recurrenceInstance.start_date = nextDate.toISOString();
                                recurrenceInstance.end_date = nextDate.clone().add(endDate.diff(startDate)).toISOString();
                                
                                recurrenceInstance.id = `recurring-${event.id}-${nextDate.format('YYYYMMDD')}-${event.id}`;

        
                                // Drop the recurring property to prevent issues in the calendar
                                delete recurrenceInstance.recurring;
        
                                expandedEvents.push(recurrenceInstance);
                                
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
                            // Drop the recurring property to prevent issues in the calendar
                            delete event.recurring;
                            expandedEvents.push(event);
                        }
                    });
        
                    let uniqueCalendarEvents = _.uniqBy([...expandedEvents], 'id');

                    $scope.events = uniqueCalendarEvents;
                    
                    uniqueCalendarEvents.forEach(newEvent => {
                        if ($scope.eventCalendar) {
                            newEvent.color = {
                                background: newEvent.EventType.backgroundColor,
                                border: newEvent.EventType.backgroundColor,
                                textColor: '#ffffff'
                            };
                        } else {
                            newEvent.color = newEvent.EventType?.backgroundColor;
                        }
                    });

                    if ($scope.eventCalendar) {
                        if (mode === 'unit') {
                            mode = 'day';
                        };

                        _.each(
                            $scope.reminders,
                            function (reminder) {
                                reminder.id = 'reminder ' + reminder.id;
                                reminder.text = reminder.title;
                                reminder.type = 'reminders';
                                reminder.details = reminder.description;
                                reminder.start_date = reminder.date;
                                reminder.end_date = reminder.date;
                                reminder.originalId = reminder.id;
                                reminder.color = '#ffb401';
                                
                                uniqueCalendarEvents.push(reminder);
                            }
                        )

                        // Add reminders to the calendar
                        $timeout(function () {;
                            $scope.eventCalendar.parse({events: uniqueCalendarEvents});
                        }
                        , 100);
                    }  else {
                        // Get the date range based on the mode
                        var startDate, endDate;
                        const currentDate = moment($scope.UI.date);
                    
                        switch (mode) {
                            case 'day':
                                startDate = currentDate.clone().startOf('day');
                                endDate = currentDate.clone().endOf('day');
                                break;
                            case 'week':
                                startDate = currentDate.clone().startOf('week');
                                endDate = currentDate.clone().endOf('week');
                                break;
                            case 'month':
                                startDate = currentDate.clone().startOf('month');
                                endDate = currentDate.clone().endOf('month');
                                break;
                            default:
                                startDate = currentDate.clone().startOf('day');
                                endDate = currentDate.clone().endOf('day');
                        }
                    

                        // Filter events by date range
                        const filteredEventsByDate = uniqueCalendarEvents.filter(event => {
                            const eventStart = moment(event.start_date);
                            const eventEnd = moment(event.end_date);
                            return (
                                event.type === 'reminders' || // Ensure reminders are included
                                eventStart.isBetween(startDate, endDate, null, '[)') || 
                                eventEnd.isBetween(startDate, endDate, null, '[)') ||
                                (eventStart.isBefore(startDate) && eventEnd.isAfter(endDate))
                            );
                        });
                        let filteredEvents = filteredEventsByDate;
                        // Further filter events by active groups
                        const activeGroups = _.filter($scope.groups, function (group) {
                            return group.active;
                        });
                        filteredEvents = $scope.updateEventSchedulerEventsByGroup(filteredEvents, activeGroups);
                        filteredEvents = $scope.updateEventsByEventTypes(filteredEvents);
                        _.each(
                            $scope.reminders,
                            function (reminder) {
                                reminder.id = 'reminder ' + reminder.id;
                                reminder.text = reminder.title;
                                reminder.type = 'reminders';
                                reminder.details = reminder.description;
                                reminder.start_date = reminder.date;
                                reminder.end_date = reminder.date;
                                reminder.originalId = reminder.id;
                                reminder.color = '#ffb401';
                                
                                filteredEvents.push(reminder);
                            }
                        )
                        
                        $scope.eventScheduler.parse(filteredEvents);
                        $scope.addEventMarkers(filteredEvents);
                    }

                    
                })
                .catch(function (err) {
                    $scope.UI.errMessage = `Error updating events: ${err.message}`;
                });
        };
        $scope.updateEvent = function (e, event) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            $scope.UI.eventLoaded = false;
            if (event.RecurrencePattern) {
                event.frequency = event.RecurrencePattern.frequency;
                event.interval = event.RecurrencePattern.interval || 1;
            }
            $event.updateEvent(event)
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.UI.formSaving = false;
                        $scope.UI.eventLoaded = true;
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg; // Show error message
                    }
                }
            );
        };
        $scope.updateToDo = function (toDo) {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $toDo.updateToDo(toDo)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.UI.newToDo = false;
                        $scope.toDo = null;
                        $scope.UI.showTodoForm = false;
                        $scope.UI.step = 1;

                        $scope.initTodos();
                        $scope.initFormSaved(response.msg || 'To Do updated successfully.');
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to update To Do.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err.msg || 'An error occurred while updating the ToDo.';
                }
            );
        };
        $scope.updateEventReminders = function(reminders, reminder) {
            reminder.selected = !reminder.selected;

            if (!$scope.event.id || !Array.isArray(reminders)) {
                $scope.UI.errMessage = 'Invalid reminders data.';
                return;
            }
        
            const requestData = {
                eventId: $scope.event.id,
                reminders,
            };
        
            $event.updateEventReminders(requestData)
                .then(response => {
                    if (!response.err) {
                        $scope.event.Reminders = response.updatedReminders;
                    } else {
                    }
                })
                .catch(err => {
                    $scope.UI.errMessage = `Error updating reminders: ${err.message}`;
                });
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
                $(document).foundation();
                $scope.UI.currentStep = step;
            });
        };
        $scope.updateEventFormClient = function (client) {
            if (!client) {
                $scope.event.client = null;
                $scope.event.clientId = null;
                return;
            }
            $scope.event.client = client;
            $scope.event.clientId = client.id;
            $scope.event.clientSearch = "";

            var $dropdown = $('#eventFormClientContent');
            $dropdown.foundation('close');
        }; 
        $scope.updateCategoryRequireType = function(categoryType, event) {
            if (categoryType === 'client' && $scope.company.eventClientRequireType) {
                return true;
            }
            if (categoryType === 'company' && $scope.company.eventCompanyRequireType) {
                return true;
            }
            if (categoryType === 'group' && $scope.company.eventGroupRequireType) {
                return true;
            }
            if (categoryType === 'user' && $scope.company.eventUserRequireType) {
                return true;
            }
            return false;
        };
        $scope.updateCategory = function (categoryId) {

            var filteredEvents = _.filter($scope.events, function (event) {
                return categoryId ? event.categoryId === categoryId : true;
            });

            var date = new Date();

            $scope.UI.categoryType = categoryId; 
            
            if (categoryId === 'all') {
                filteredEvents = $scope.events;
                $rootScope.preferences.eventCategory = null;
            } else if (categoryId === 'reminders') {
                filteredEvents = $scope.events.filter(event => event.type === 'reminders');
                $rootScope.preferences.eventCategory = null;

            } else {
                filteredEvents = $scope.events.filter(event => event.eventCategoryId === categoryId);
                $rootScope.preferences.eventCategory = categoryId;
                
            }
            if ($scope.eventCalendar) {
                date = $scope.eventCalendar.getState().date;
                $scope.initEventsCalendar(filteredEvents, date);
            } else if ($scope.eventScheduler) {
                $scope.eventScheduler.clearAll();
                $scope.eventScheduler.parse(filteredEvents, 'json');
            }
        

            $user.updatePreferences($rootScope.preferences)
            .then(function (response) {
                if (!response.err) {
                    $rootScope.preferences.eventCategory = response.preferences.categoryId;
                    $user.setUser($scope.user);
                    $(document).foundation();
                }
            });
        };
        $scope.updateCheckins = function (checkIns, checkOut) {
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            
            if (checkIns.addCheckIn) {

                if (checkIns.addCheckInTime) {
                    checkIns.checkInTimes.push({
                        checkInTime: checkIns.addCheckInTime
                    })
                }
                if (checkIns.addCheckOutTime) {
                    checkIns.checkOutTimes.push({
                        checkOutTime: checkIns.addCheckOutTime
                    })
                }
            }
            $event.updateCheckins({
                eventId: $scope.event.id,
                userId: checkIns.User.id,
                checkIns: checkIns,
                checkOut: checkOut || false
            }).then(
                function (response) {
                    if (!response.err) {
                        $scope.event.checkIns = response.checkIns;
                        $scope.initFormSaved(response.msg || 'Check-ins updated successfully.');
                        $scope.initEventAdmin($scope.event);
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to update check-ins.');
                    }
                }
            ).catch(
                function (err) {
                    $scope.initErrorMessage(err || 'An error occurred while updating check-ins.');
                }
            )
        };
        $scope.updateEventSchedulerEventsByGroup = function (events, activeGroups) {
            const currentDate = $scope.eventScheduler.getState().date;

            // Filter events for the displayed date
            var displayedEvents = events.filter(event => {
                const eventStart = new Date(event.start_date);
                const eventEnd = new Date(event.end_date);

                if ($rootScope.preferences.eventMap == 'week') {
                    // Check if the event is within a week before or after the current date
                    const oneWeekBefore = new Date(currentDate);
                    oneWeekBefore.setDate(currentDate.getDate() - 7);

                    const oneWeekAfter = new Date(currentDate);
                    oneWeekAfter.setDate(currentDate.getDate() + 7);

                    return (
                        (eventStart >= oneWeekBefore && eventStart <= oneWeekAfter) ||
                        (eventEnd >= oneWeekBefore && eventEnd <= oneWeekAfter) ||
                        (eventStart <= oneWeekBefore && eventEnd >= oneWeekAfter)
                    );
                }

                // Default behavior for other modes
                return (
                    eventStart.toDateString() === currentDate.toDateString() ||
                    (eventStart <= currentDate && eventEnd >= currentDate)
                );
            });

            const activeGroupIds = activeGroups.map(group => group.id);

            if ($rootScope.preferences.eventMap == 'month') {
                return _.filter(events, function (event) {
                    return activeGroupIds.includes(event.groupId);
                });
            }

            return _.filter(displayedEvents, function (event) {
                return activeGroupIds.includes(event.groupId);
            });
        };
        $scope.updateEventsByEventTypes = function (events) {
            if (!events || !Array.isArray(events)) {
                $scope.UI.errMessage = 'Invalid events data.';
                return [];
            }
            // Filter events based on the active event types
            const selectedEventTypes = $scope.eventTypes.filter(type => type.active).map(type => type.id);
            if (selectedEventTypes.length === 0) {
                // If no event types are active, return all events
                return events;
            }
            return events.filter(event => selectedEventTypes.includes(event.eventTypeId));
        };
        $scope.validateEventFormByCategory = function (event) {
            if (!event || !event.eventCategoryId) {
                return false; // Return false if event or category is missing
            }
        
            // Populate event.EventCategory if not already defined
            if (event.eventCategoryId && !event.EventCategory) {
                event.EventCategory = $scope.eventCategories.find(category => category.id === event.eventCategoryId);
            }
        
            // Define category-specific required fields
            const requiredFieldsByCategory = {
                client: ['clientId', 'eventTypeId', 'startDate', 'endDate'],
                group: ['groupId', 'eventTypeId', 'startDate', 'endDate'],
                user: ['targetUserId', 'eventTypeId', 'startDate', 'endDate'],
                company: ['eventTypeId', 'startDate',            'endDate']
            };
        
            // Get the required fields for the selected category
            const categoryType = event.EventCategory?.name.toLowerCase();
            const requiredFields = requiredFieldsByCategory[categoryType] || [];
        
            // Validate that each required field has a value
            return requiredFields.every(field => event[field]);
        };        
        $scope.validateEventFormCategory = function(event) {
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
            var title = $scope.event.title || null;
            var input = document.getElementById('eventTitle');
        
            if (input) {
                // Initialize Tagify for mixed content mode
                $scope.UI.eventTitleTagify = new Tagify(
                    input, 
                    {
                        mode: 'mix',  // Enable mixed-content mode
                        pattern: /@/, // The pattern to trigger the suggestions menu (@ symbol)
                        tagTextProp: 'display', // Display the 'display' property in the tag                        whitelist: whitelist,  // Set the whitelist
                        dropdown: {
                            enabled: 1,   // Show the dropdown when the pattern is detected
                            position: 'text',  // Render the suggestions next to the typed text
                            highlightFirst: true  // Highlight the first suggestion automatically
                        },
                        whitelist: whitelist,  // Set the whitelist for tag suggestions
                    }
                );
        
                // Handle the saving of data back to the model as a full string (tags + text)
                $scope.UI.eventTitleTagify.on('change', function(e) {
                    var fullText = e.detail.value;
                    $scope.event.title = fullText;  // Save the full text (tags + plain text) to the model
                    $timeout(function() {
                        $scope.$apply();  // Apply the scope changes
                    });
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
                if (title) {
                    $scope.UI.eventTitleTagify.loadOriginalValues(title);
                };
                window.TAGIFY_DEBUG = false;
            }
        
            if (!event.eventTypeId && event.EventType && event.EventType.map){
                return false; // Bypass additional checks
            }
        
            // Validation logic based on the category type
            if (event.categoryType === 'client') {
                if ($scope.company.eventClientRequireType) {
                    return event.clientId && event.eventTypeId;  
                }
                return event.clientId;  // Ensure client is selected and type is chosen
            } else if (event.categoryType === 'group') {
                if ($scope.company.eventGroupRequireType) {
                    return event.groupId && event.eventTypeId;  
                }
                return event.groupId;   // Ensure group is selected and type is chosen
            } else if (event.categoryType === 'user') {
                if ($scope.company.eventUserRequireType) {
                    return event.targetUserId && event.eventTypeId;  
                }
                return event.targetUserId;  // Ensure user is selected and type is chosen
            } else if (event.categoryType === 'company') {
                if ($scope.company.eventCompanyRequireType) {
                    return event.eventTypeId;  
                }
                return event;
            } else {
                return event;
            }
        };
        $scope.validateAdminEditPermission = function () {
            return $rootScope.permissions.some(permission => 
                permission.Page && permission.Page.name === "admin settings" && permission.action === "edit"
            );
        };
        $scope.validateEventDates = function () {
            const currentUI = moment($scope.UI.date).add(1, 'month'); // Current stored date

            if ($scope.eventCalendar) {
                const eventCalendarState = $scope.eventCalendar.api.getState();
                const newCalendarUI = moment(eventCalendarState.date); // New date from the scheduler view
            
                if (eventCalendarState.mode === 'month') {
                    // Calculate the difference in months between the new date and the current date
                    if (
                        newCalendarUI.diff(currentUI, "months") >= 1 || 
                        newCalendarUI.diff(currentUI, "months") == -1
                    ) {
                        $scope.UI.date = newCalendarUI.toDate(); // Update the UI date
                        $scope.updateEvents($scope.UI.date, true); // Call updateEvents with the 'month' type
                    }
                } else {
                    // For non-month mode, validate day difference
                    if (
                        newCalendarUI.diff(currentUI, "days") > 10 || 
                        newCalendarUI.diff(currentUI, "days") < -10
                    ) {
                        $scope.UI.date = newCalendarUI.toDate(); // Update the UI date
                        $scope.updateEvents($scope.UI.date); // Call updateEvents
                    }
                }
                
            }
            if ($scope.eventScheduler) {
                const eventSchedularState = $scope.eventScheduler.getState();
                const newSchedulerUI = moment(eventSchedularState.date); // New date from the scheduler view
                
                if (eventSchedularState.mode === 'month') {
                    // Calculate the difference in months between the new date and the current date
                    if (
                        newSchedulerUI.diff(currentUI, "months") >= 1 || 
                        newSchedulerUI.diff(currentUI, "months") == -1
                    ) {
                        // If the difference is 2 months or more
                        $scope.UI.date = newSchedulerUI.toDate(); // Update the UI date
                        $scope.updateEvents($scope.UI.date, true); // Call updateEvents with the 'month' type
                        return;
                    }
                } else {
                
                    // For non-month mode, validate day difference
                    if (
                        newSchedulerUI.diff(currentUI, "days") > 10 || 
                        newSchedulerUI.diff(currentUI, "days") < -10
                    ) {
                        $scope.UI.date = newSchedulerUI.toDate(); // Update the UI date
                        $scope.updateEvents($scope.UI.date); // Call updateEvents
                    }
                }
            }
        };    
        $scope.validateCheckInOrOut = function (event) {
            // Check to see if event EventCheckins has length
            if (!event || !event.EventCheckins || !Array.isArray(event.EventCheckins)) {
                return false;
            }
            if (event.EventCheckins.length > 0) {
                // If there are check-ins, check if the last one is checked out
                const lastCheckin = event.EventCheckins[event.EventCheckins.length - 1];
                return !lastCheckin.checkOutTime; // Return true if the last check-in is not checked out
            } else {
                // If there are no check-ins, return false
                return false;
            }
        };        
        $scope.toggleParticipantReminder = function(participant, reminder) {
            
            reminder.selected = true;
            // Find the existing reminder in participant.Reminders
            const existingReminder = participant.Reminders.find(r => r.reminderTypeId === reminder.id);
        
            const requestData = {
                userId: participant.userId || null,
                clientId: participant.clientId || null,
                reminderTypeId: reminder.id,
                eventId: $scope.event.id,
                addressId: $scope.event.addressId,
                emailId: participant.userId ? null : $scope.event.emailId,
                phoneNumberId: participant.userId ? null : $scope.event.phoneNumberId,
            };
            if (existingReminder) {
                requestData.id = !reminder.selected ? existingReminder.id : undefined;
                reminder.selected = false;
            }
            
            // Use updateReminder to add or remove based on selected status
            $setup.updateReminder(requestData)
                .then(response => {
                    if (!response.err) {
                        if (reminder.selected && !existingReminder) {
                            // Add reminder to participant.Reminders if newly selected
                            participant.Reminders.push({ id: response.reminder.id, ...requestData, name: reminder.name });
                        } else if (!reminder.selected && existingReminder) {
                            // Remove reminder from participant.Reminders if deselected
                            participant.Reminders = participant.Reminders.filter(r => r.reminderTypeId !== reminder.id);
                        }
                    } else {
                        // Revert selection and display error if there was an issue
                        reminder.selected = !reminder.selected;
                        $scope.UI.errMessage = `Error ${reminder.selected ? 'adding' : 'removing'} reminder: ${response.msg}`;
                    }
                })
                .catch(err => {
                    reminder.selected = !reminder.selected;
                    $scope.UI.errMessage = `Failed to ${reminder.selected ? 'add' : 'remove'} reminder: ${err.message}`;
                });
        };  
        $scope.toggleEventCommentLike = function (comment) {
            if (!comment || !comment.id) {
                $scope.UI.errMessage = 'Invalid comment data.';
                return;
            }

            
            const userId = $rootScope.user.id;
            const userIndex = comment.likeUserIds.indexOf(userId);
            
            comment.liked = !comment.liked;
            comment.likeLoading = true;
            if (userIndex > -1) {
                // User already liked; remove the user
                comment.likeUserIds.splice(userIndex, 1);
            } else {
                // User not in likeUserIds; add the use
                comment.likeUserIds.push(userId);
            }

            // Prepare the request data
            const data = {
                id: comment.id,
            };

            if (comment.likeUserIds.includes(userId)) {
                comment.liked = false;
            };
            // Call the server to update the like status
            $comment.updateEventCommentLike(data)
            .then(function (response) {
                if (response.err) {
                    // Rollback the like state if server update fails
                    comment.like = !comment.like;
                    $scope.UI.errMessage = response.msg || 'Failed to update like.';
                }
                $scope.initEventComments($scope.event);
                comment.likeLoading = false;
                
            })
            .catch(function (err) {
                // Rollback the like state if there's an error
                comment.like = !comment.like;
                $scope.UI.errMessage = `Error updating like: ${err.message}`;
            });
        };
        $scope.toggleEventMapGroup = function (group) {
        
            const eventSchedulerState = $scope.eventScheduler.getState();

            _.each($scope.userGroups, function (existingGroup) {
                if (existingGroup.id === group.id) {
                    // Toggle the 'active' state of the matching group
                    existingGroup.active = !existingGroup.active;
                }
            });
            // Filter active groups to update the collection
            var activeGroups = _.filter($scope.userGroups, function (group) {
                return group.active;
            });
            // Update the collection in the event scheduler
            $rootScope.preferences.eventSchedulerGroups = activeGroups;
            $scope.eventScheduler.updateCollection('units-list', activeGroups);

            if (eventSchedulerState === 'month') {
                $scope.updateEvents($scope.UI.date, eventSchedulerState.mode === 'month');
            }
            const schedulerState = $scope.eventScheduler.getState();
            const startDate = moment(schedulerState.min_date);
            const endDate = moment(schedulerState.max_date);
    
            // Filter events based on active groups and date range
            const visibleEvents = $scope.updateEventSchedulerEventsByGroup($scope.events, activeGroups).filter(event => {
                const eventStart = moment(event.start_date);
                const eventEnd = moment(event.end_date);
                return (
                    eventStart.isBetween(startDate, endDate, null, '[)') ||
                    eventEnd.isBetween(startDate, endDate, null, '[)') ||
                    (eventStart.isBefore(startDate) && eventEnd.isAfter(endDate))
                );
            });
    
            // Ensure colors are applied
            visibleEvents.forEach(event => {
                if (event.color) {
                    event.color = event.EventType?.backgroundColor;
                }
                if (event.type === 'reminders') {
                    event.color = '#ffb401';
                }
            });
    
            // Update the scheduler and map markers
            $scope.eventScheduler.clearAll();
            visibleEvents.forEach(event => $scope.eventScheduler.addEvent(event));
            $scope.clearMapMarkers();
            $scope.addEventMarkers(visibleEvents);
    

            $user.updatePreferences($rootScope.preferences)
            .then(function (response) {
                if (!response.err) {
                    $rootScope.preferences.eventSchedulerGroups = response.preferences.eventSchedulerGroups;
                    $user.setUser($scope.user);
                    $(document).foundation();
                }
            });
        };
        $scope.toggleEventType = function (eventType) {
            if (!eventType || !eventType.id) {
                $scope.UI.errMessage = 'Invalid event type data.';
                return;
            }
        
            // Toggle the active state of the event type
            eventType.active = !eventType.active;
        
            // Ensure the UI updates immediately
            $timeout(function () {
                const activeEventTypes = $scope.eventTypes.filter(type => type.active);
        
                if ($scope.eventScheduler) {
                    // Update the scheduler's collection with active event types
                    $scope.eventScheduler.updateCollection('units-list', activeEventTypes);
        
                    // Filter events by active event types
                    const filteredEvents = $scope.events.filter(event =>
                        activeEventTypes.some(type => type.id === event.eventTypeId)
                    );
        
                    // Update the scheduler with filtered events
                    $scope.eventScheduler.clearAll();
                    filteredEvents.forEach(event => $scope.eventScheduler.addEvent(event));
                }
        
                if ($scope.eventCalendar) {
                    // Filter events by active event types
                    const filteredEvents = $scope.events.filter(event =>
                        activeEventTypes.some(type => type.id === event.eventTypeId)
                    );
        
                    // Reinitialize the calendar with filtered events
                    const currentDate = $scope.eventCalendar.getState().date;
                    $scope.initEventsCalendar(filteredEvents, currentDate);
                }
        
                // Save preferences
                $rootScope.preferences.eventTypes = activeEventTypes;
                $user.updatePreferences($rootScope.preferences)
                    .then(function (response) {
                        if (!response.err) {
                            $rootScope.preferences.eventTypes = response.preferences.eventTypes;
                            $user.setUser($scope.user);
                            $(document).foundation();
                        }
                    });
            });
        };
        $scope.toggleMapSchedulerView = function (updatedMode) {
            var currentDate = $scope.eventScheduler.getState().date; // Get the current date
            $scope.eventScheduler.setCurrentView(currentDate, updatedMode); // Switch to unit view
            $rootScope.preferences.eventMap = updatedMode;
            
            switch (updatedMode) {
                case 'month':
                    $scope.updateEvents(currentDate, true);
                break;
                default:
                    $scope.updateEvents(currentDate);
            };
            $user.updatePreferences($rootScope.preferences)
            .then(function (response) {
                if (!response.err) {
                    $rootScope.preferences.eventMap = response.preferences.eventMap;
                    $user.setUser($scope.user);
                    $(document).foundation();
                }
            });
        };
        $scope.toggleParticipantLimit = function () {
            var collapsed = $rootScope.UI.isMobile ? 6 : 12;
            if ($scope.UI.participantLimit === collapsed) {
                $scope.UI.participantLimit = Array.isArray($scope.event.EventParticipants) ? $scope.event.EventParticipants.length : collapsed;
            } else {
                $scope.UI.participantLimit = collapsed;
            }
        };
        $scope.togglePhotoSelection = function() {
            $scope.UI.selectPhotos = !$scope.UI.selectPhotos;
            $rootScope.$broadcast('togglePhotoSelection');
        };
        $scope.toggleToDoItem = function (toDoId, index) {
            if (!toDoId || !index) {
                $scope.initErrorMessage('Invalid To Do data.');
            };
            $scope.UI.errorMessage = null;


            if (!$scope.toDos || !$scope.toDos.length) {
                $scope.initErrorMessage('No To Dos available to update photos:', data);
            };
            if (toDoId) {
                if (isNaN(toDoId)) {
                    $scope.initErrorMessage('Invalid To Do ID provided.');
                    return;
                }
            };
            $toDo.toggleToDoItem({
                id: toDoId,
                index: index,
            })
            .then(
                function (response) {
                    if (response.err) {
                        $scope.initTodos();
                        $scope.initErrorMessage(response.msg || 'Failed to complete the To Do item.');
                    }
                }
            ).catch(
                function (err) {
                    $scope.initTodos();
                    $scope.initErrorMessage(`Error completing To Do item: ${err.message}`);
                }
            )
        };
        $scope.checkInEvent = function (event) {
            if (!event || !event.id) {
                $scope.initErrorMessage('Invalid event data.');
                return;
            }
            $scope.UI.formSaving = true;
            
            $event.checkInEvent(event)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                        $scope.initEvent(event);
                    } else {
                        if ($scope.eventCalendar) {
                            $('#eventsCalendarEventReveal').foundation('close');
                        }
                        $scope.initErrorMessage(response.msg || 'Failed to check in the event.');
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.initErrorMessage(`Error checking in event: ${err.message}`);
                }
            )
        };
        $scope.checkOutEvent = function (event) {
            if (!event || !event.id) {
                $scope.initErrorMessage('Invalid event data.');
                return;
            }
            $scope.UI.formSaving = true;

            $event.checkOutEvent(event)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                        $scope.initEvent(event);
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to check out the event.');
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.initErrorMessage(`Error checking out event: ${err.message}`);
                }
            )
        };
        $scope.completeEvent = function (event) {
            if (!event || !event.id) {
                $scope.initErrorMessage('Invalid event data.');
                return;
            };
            $scope.UI.formSaving = true;
            $scope.UI.errorMessage = null;
            $scope.UI.confirmComplete = false;

            $event.completeEvent(event)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    $scope.UI.confirmComplete = false;

                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                        $scope.initEvent(event);
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to complete the event.');
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.initErrorMessage(`Error completing event: ${err.message}`);
                }
            )
        };
        $scope.viewAllReplies = function (comment) {
            $scope.comment = comment;
            $('#allRepliesModal').foundation('open');
        };
        $scope.addEventMarkers = function (events) {
            var bounds = new map.LatLngBounds();
        
            // Clear existing markers
            $scope.clearMapMarkers();
        
            // Add markers for each event
            events.forEach(event => {
                if (event.Address && event.Address.latitude && event.Address.longitude) {
                    var eventCoords = new map.LatLng(
                        parseFloat(event.Address.latitude),
                        parseFloat(event.Address.longitude)
                    );
        
                    var markerOptions = {
                        coords: eventCoords,
                        color: event.EventType?.backgroundColor || 'blue', // Default color if none provided
                        id: event.id
                    };
        
                    // Create and store the marker
                    var marker = $scope.createMapMarker(2, markerOptions);
        
                    // Add marker to the markers array
                    if (!$scope.markers) {
                        $scope.markers = [];
                    }
                    if (marker) {

                        marker.addListener("click", function (object) {
                            $scope.initEvent(event);
                            $scope.UI.eventForm = false;
                            $(document).foundation();
                            $('#eventsMapCalendarEventReveal').foundation('open');
                            return false;

                        });
                    }
                    $scope.markers.push(marker);
        
                    // Extend bounds to include this marker's coordinates
                    bounds.extend(eventCoords);
                }
            });
        
            // Adjust the map to fit the bounds
            if (!bounds.isEmpty()) {
                $scope.map.fitBounds(bounds);
            } else {
                var addressCoords = new map.LatLng(
                    parseFloat($scope.company.latitude),
                    parseFloat($scope.company.longitude)
                );
                if ($scope.company.latitude && $scope.company.longitude) {
                    $scope.map.setCenter(addressCoords);
                } else {
                    $scope.map.setCenter(new map.LatLng(0, 0));
                };
                $scope.map.setZoom(10)
            }
        };
        $scope.addEventParticipant = function(participant) {
            if (!participant) {
                $scope.UI.errMessage = 'Invalid participant data.';
                return;
            }
        
            const data = {
                eventId: $scope.event.id,
                userId: participant || null,
            };
        
            $event.addEventParticipant(data)
                .then(response => {
                    if (!response.err) {
                        $scope.initFormSaved('Participant added successfully.');
                        $scope.initEventForm();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to add participant.';
                    }
                })
        };
        $scope.addToDoItem = function (toDo) {
            if (!toDo || !toDo.name) {
                $scope.UI.errMessage = 'Invalid ToDo data.';
                return;
            }

            const newToDoItem = {
                title: null,
                requireImages: false,
                requireVideos: false,
                requireDocuments: false,
                dueDate: null,
                eventId: $scope.event.id
            };

            $scope.toDo.data.unshift(newToDoItem);
        };
        $scope.removeEventParticipant = function(participant) {
            if (!participant || (!$scope.event.id && !participant.userId && !participant.clientId)) {
                $scope.UI.errMessage = 'Invalid participant data.';
                return;
            }
        
            const requestData = {
                eventId: $scope.event.id,
                userId: participant.userId || null,
                clientId: participant.clientId || null,
            };
        
            $event.removeEventParticipant(requestData)
                .then(response => {
                    if (!response.err) {
                        $scope.event.Participants = $scope.event.Participants.filter(p =>
                            !(p.userId === participant.userId && p.clientId === participant.clientId)
                        );
                        $scope.initFormSaved('Participant removed successfully.');
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to remove participant.';
                    }
                })
                .catch(err => {
                    $scope.UI.errMessage = `Error removing participant: ${err.message}`;
                });
        };        
        $scope.removeToDoItemMedia = function (toDoId, itemIndex, index, type) {   
            if (!toDoId || index === undefined) {
                $scope.UI.errMessage = 'Invalid To Do data.';
                return;
            }
            $scope.UI.errorMessage = null;
            const toDo = $scope.toDos.find(item => item.id === toDoId);
            console.log(toDo);
            if (!toDo || !toDo.data || !toDo.data.length) {
                $scope.UI.errMessage = 'To Do item not found or has no data.';
                return;
            }
            const item = toDo.data[itemIndex];

            switch (type) {
                case 'photo':
                    if (!item || !item.photos || !item.photos.length) {
                        $scope.UI.errMessage = 'No photos available to remove.';
                        return;
                    }
                    item.photos.splice(index, 1); 
                break;
                case 'video':
                    if (!item || !item.videos || !item.videos.length) {
                        $scope.UI.errMessage = 'No videos available to remove.';
                        return;
                    }
                    item.videos.splice(index, 1);
                break;
                case 'document':
                    if (!item || !item.documents || !item.documents.length) {
                        $scope.UI.errMessage = 'No documents available to remove.';
                        return;
                    }
                    item.documents.splice(index, 1);
                break;
                default:
                    $scope.UI.errMessage = 'Invalid media type specified.';
                    return;
            }

            toDo.data[itemIndex] = item;
            $toDo.updateToDo(toDo)
            .then(
                function (response) {
                    if (response.err) {
                        $scope.UI.errMessage = response.msg || 'Failed to remove the photo from the To Do item.';
                        $scope.initTodos();
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error removing photo from To Do item: ${err.message}`;
                    $scope.initTodos();
                }
            );
        };  
        $scope.submitEventChecklistForm = function (e, form) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;

            const formData = JSON.parse(form.data);
            _.each(
                formData,
                function (data) {
                    switch (data.subtype) {
                        case 'Photo Select':
                            data.type = 'Photo Select';
                            data.userData = $scope.photos.filter(
                                function (photo) {
                                    return photo.selected;
                                }
                            );
                        break;
                        case 'Video Select':
                            data.type = 'Video Select';
                            data.userData = $scope.videos.filter(
                                function (video) {
                                    return video.selected;
                                }
                            );
                        break;
                        case 'Document Select':
                            data.type = 'Document Select';
                            data.userData = $scope.documents.filter(
                                function (document) {
                                    return document.selected;
                                }
                            );
                        break;
                    }
                }
            )
            const formSubmission = {
                formId: form.id,
                data: formData,
                eventId: $scope.event.id
            }
            $form.submitForm(formSubmission)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                        $scope.initEventChecklist($scope.event);
                    } else {
                        $scope.UI.errMessage = response.msg; // Show error message
                    }
                }
            );
        };
        $scope.moveToDoItem = function(index, direction) {

            if (direction === 'up') {
                if (index > 0 && $scope.toDo.data && $scope.toDo.data.length > 1) {
                    var temp = $scope.toDo.data[index - 1];
                    $scope.toDo.data[index - 1] = $scope.toDo.data[index];
                    $scope.toDo.data[index] = temp;
                }
            } else if (direction === 'down') {
                if ($scope.toDo.data && index < $scope.toDo.data.length - 1) {
                    var temp = $scope.toDo.data[index + 1];
                    $scope.toDo.data[index + 1] = $scope.toDo.data[index];
                    $scope.toDo.data[index] = temp;
                };
            };
        };
        $scope.cancelEvent = function () {
            $window
            .localStorage
            .removeItem('goluraEventDraft');
            $location.path("/events");
        };
        $scope.deleteEventComment = function (comment) {
            if (!comment || !comment.id) {
                $scope.UI.errMessage = 'Invalid comment data.';
                return;
            }

            // Archive the comment on the server
            $comment.archiveEventComment(comment)
                .then(function (response) {
                    if (!response.err) {
                        // Remove the comment from the $scope.comments array
                        function removeCommentRecursive(comments) {
                            for (let i = 0; i < comments.length; i++) {
                                if (comments[i].id === comment.id) {
                                    comments.splice(i, 1);
                                    return true;
                                }
                                if (comments[i].replies && removeCommentRecursive(comments[i].replies)) {
                                    return true;
                                }
                            }
                            return false;
                        }
        
                        if (!removeCommentRecursive($scope.comments)) {
                            console.warn("Comment to delete not found in the current comments array.");
                        } else {
                            $scope.initFormSaved('Comment deleted successfully.');
                        }
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to delete the comment.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.errMessage = `Error deleting comment: ${err.message}`;
                });
        };  
        $scope.deleteEvent = function (event) {
            if (!event || !event.id) {
                $scope.initErrorMessage('Invalid event data.');
                return;
            }

            $event.archiveEvent(event)
                .then(function (response) {
                    if (!response.err) {
                        $scope.initFormSaved('Event deleted successfully.');
                        $location.path('/events');
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to delete the event.');
                    }
                })
                .catch(function (err) {
                    $scope.initErrorMessage(`Error deleting Event: ${err.message}`);
                });
        };  
        $scope.deleteCheckins = function (checkIns, index) { 
            const checkInTime = checkIns.checkInTimes[index];
            const checkOutTime = checkIns.checkOutTimes[index];
            const checkInsToDelete = [];
            
            if (checkInTime) {
                checkInsToDelete.push(checkInTime);
            };
            if (checkOutTime) {
                checkInsToDelete.push(checkOutTime);
            };
            $event.archiveCheckIns(checkInsToDelete)
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                        $scope.initEventAdmin($scope.event);
                    } else {
                        $scope.initErrorMessage(response.msg || 'Failed to delete check-in.');
                    }
                }
            ).catch(
                function (err) {
                    $scope.initErrorMessage(`Error deleting check-in: ${err.message}`);
                }
            );
        };
        $scope.getClients = function () {
            var data = {
                query: $scope.event.clientSearch,
                page: $scope.search.page
            };
            if ($scope.event.clientSearch) {
                if ($scope.event.clientSearch.length > 3) {
                    $client.getClients(data)
                    .then(
                        function (response) {
                            $scope.UI.clientsLoaded = true;
                            if (!response.err) {
                                $scope.total = response.total;
                                const newClients = response.clients.rows;
                                // Check if the new clients are already in the $scope.clients array and add only new ones
                                if (!$scope.clients) {
                                    $scope.clients = [];
                                }
                                newClients.forEach(client => {
                                    if (!$scope.clients.some(existingClient => existingClient.id === client.id)) {
                                        $scope.clients.push(client);
                                    }
                                });
                                $timeout(
                                    function () {
                                        var $dropdown = $('#eventFormClientContent');
                                    }
                                )
                            };
    
                        }
                    );
                    return;
                };
            }
            $scope.clients = [];
        };
        $scope.clearMapMarkers = function () {
            if ($scope.markers && $scope.markers.length > 0) {
                $scope.markers.forEach(marker => marker.setMap(null)); // Remove marker from map
                $scope.markers = []; // Reset the markers array
            }
        };
        $scope.isEventToday = function (event) {
            if (!event || !event.startDate || !event.endDate) {
                return false;
            }
            const startDate = moment(event.startDate).startOf('day');
            const endDate = moment(event.endDate).endOf('day');
            const today = moment().startOf('day');

            return today.isBetween(startDate, endDate, null, '[]');
        };
        $scope.isParticipantOfEvent = function () {
            const eventParticipants = $scope.event.EventParticipants || [];
            const userId = $scope.user.id;

            // Check if the user is a participant in the event
            return eventParticipants.some(participant =>
                (participant.userId && participant.userId === userId) ||
                (participant.clientId && participant.clientId === userId)
            );
        };
        $scope.isReminderSelected = function(participant, reminder) {
            const existingReminder = participant.Reminders.find(r => r.reminderTypeId === reminder.id);
            
            if (existingReminder) {
                existingReminder.selected = true;  // Set selected to true in the reminder object
                return true;
            }
            return false;
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
            $scope.initVideos();
        });
        $scope.$on('documentsUploaded', function(event, data) {
            if (data.eventId) {
                $scope.initDocuments('events', $scope.event);
                return;
            }
            $scope.initDocuments();
        });
        $scope.$on('toDoPhotosUploaded', function(event, data) {
            if (!$scope.toDos || !$scope.toDos.length) {
                $scope.initErrorMessage('No To Dos available to update photos:', data);
            };
            if (data.toDoId) {
                const toDoId = parseInt(data.toDoId);
                if (isNaN(toDoId)) {
                    $scope.initErrorMessage('Invalid To Do ID provided.');
                    return;
                }
                const toDo = $scope.toDos.find(item => item.id === toDoId);
                if (toDo) {
                    const toDoItemIndex = data.toDoItemIndex;
                    if (toDoItemIndex >= 0 && toDoItemIndex < toDo.data.length) {
                        toDo.data[toDoItemIndex].photos = toDo.data[toDoItemIndex].photos || [];

                        const newPhotos = data.images.map(photo => ({
                            id: photo.media.id,
                            url: photo.media.url
                        }));
                        if (!toDo.data[toDoItemIndex].photos) {
                            toDo.data[toDoItemIndex].photos = [];
                        }
                        toDo.data[toDoItemIndex].photos.push(...newPhotos);

                        $toDo.updateToDo(toDo)
                        .then(function (response) {
                            if (!response.err) {
                                $scope.initFormSaved('ToDo item photos updated successfully.');
                                $scope.initTodos();
                            } else {
                                $scope.initErrorMessage(response.msg || 'Failed to update ToDo item photos.');
                            }
                        }).catch(function (err) {
                            $scope.initErrorMessage(`Error updating ToDo item photos: ${err.message}`);
                        });
                    } else {
                        console.warn('Invalid toDoItemIndex:', toDoItemIndex);
                    }
                }
            }
        });
        $rootScope.$on(
            'commentUpdated', 
            function (event, updatedComment) {
                function updateCommentRecursive(comments) {
                    for (let i = 0; i < comments.length; i++) {
                        comments[i].edit = false;
                        comments[i].reply = false;
                        if (comments[i].id === updatedComment.id) {
                            updatedComment.User = comments[i].User;
                            // Preserve replies
                            const replies = comments[i].replies;
                            comments[i] = { ...updatedComment, replies: replies || [] };
                            // Ensure replies have edit and reply set to false
                            if (comments[i].replies) {
                                comments[i].replies.forEach(reply => {
                                    reply.edit = false;
                                    reply.reply = false;
                                });
                            }
                            return true;
                        }
                        if (comments[i].replies && updateCommentRecursive(comments[i].replies)) {
                            return true;
                        }
                    }
                    return false;
                }

                if (!updateCommentRecursive($scope.comments)) {
                    console.warn("Updated comment not found in the current comments array.");
                }

                // Reapply Angular's digest cycle to ensure the UI updates
                $scope.$applyAsync();
            }
        );
        $rootScope.$on(
            'commentCreated', 
            function (event, newComment) {
                if (!newComment.parentCommentId) {
                    // Add as a root comment
                    $scope.comments.unshift({
                        ...newComment,
                        replies: [],
                        depth: 1,
                        edit: false,
                        reply: false,
                    });
                } else {
                    // Add as a reply to the appropriate parent comment
                    function addReplyRecursive(comments) {
                        for (let i = 0; i < comments.length; i++) {
                            if (comments[i].id === newComment.parentCommentId) {
                                comments[i].replies.unshift({
                                    ...newComment,
                                    replies: [],
                                    depth: comments[i].depth + 1,
                                    edit: false,
                                    reply: false,
                                });
                                return true;
                            }
                            if (comments[i].replies && addReplyRecursive(comments[i].replies)) {
                                return true;
                            }
                        }
                        return false;
                    }

                    if (!addReplyRecursive($scope.comments)) {
                        console.warn("Parent comment for new reply not found in the current comments array.");
                    }
                }

                // Ensure all comments and replies are reset
                _.each($scope.comments, function (comment) {
                    comment.edit = false;
                    comment.reply = false;
                    if (comment.replies) {
                        comment.replies.forEach(reply => {
                            reply.edit = false;
                            reply.reply = false;
                        });
                    }
                });

                // Reapply Angular's digest cycle to ensure the UI updates
                $scope.$applyAsync();
            }
        );
    })
});