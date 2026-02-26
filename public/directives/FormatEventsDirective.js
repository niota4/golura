angular.module(
    'ngEventsFormat',
    []
)
.directive('formatEvents', function($filter) {
    return {
        restrict: 'A',
        scope: {
            events: '=',
            event: '=',  // Add support for a single event
            pastEvents: '=?',
            futureEvents: '=?'
        },
        link: function(scope) {
            var dateFilter = $filter('date');
            var customFormat = 'EEEE MMMM dd, yyyy hh:mm a';
            var customShortFormat = 'MMM d, yyyy';
            var customTimeFormat = 'h:mm a';
            var recurringFormat = 'EEEE hh:mm a'; // Format without the month

            function formatEventDates(event) {
                if (event.recurring) {
                    // Exclude the month for recurring events
                    event.formattedStartDate = dateFilter(event.startDate, recurringFormat);
                    event.formattedEndDate = dateFilter(event.endDate, recurringFormat);
                    event.formattedShortStartDate = dateFilter(event.startDate, 'EEEE'); // Short version without the month
                    event.formattedShortEndDate = dateFilter(event.endDate, 'EEEE');
                    event.recurringOriginalStartDate = dateFilter(event.startDate, 'MMMM d, yyyy');
                    event.recurringOriginalEndDate = dateFilter(event.endDate, 'MMMM d, yyyy');
                } else {
                    event.formattedStartDate = dateFilter(event.startDate, customFormat);
                    event.formattedEndDate = dateFilter(event.endDate, customFormat);
                    event.formattedShortStartDate = dateFilter(event.startDate, customShortFormat);
                    event.formattedShortEndDate = dateFilter(event.endDate, customShortFormat);
                }
                event.formattedShortStartTime = dateFilter(event.startDate, customTimeFormat);
                event.formattedShortEndTime = dateFilter(event.endDate, customTimeFormat);
                return event;
            }

            function formatDates(eventArray) {
                if (Array.isArray(eventArray)) {
                    return eventArray.map(formatEventDates);
                } else if (eventArray) {
                    formatEventDates(eventArray);
                    return eventArray;
                }
                return [];
            }

            function updateAllDates() {
                if (scope.events) {
                    scope.events = formatDates(scope.events);
                }
                if (scope.pastEvents) {
                    scope.pastEvents = formatDates(scope.pastEvents);
                }
                if (scope.futureEvents) {
                    scope.futureEvents = formatDates(scope.futureEvents);
                }
            }

            function updateSingleEvent() {
                if (scope.event) {
                    formatEventDates(scope.event);
                }
            }

            // Watch for changes in events and individual event
            scope.$watch('events', function(newEvent) {
                if (newEvent) {
                    updateAllDates();
                }
            }, true);
            scope.$watch('event', function(newEvent) {
                if (newEvent) {
                    updateSingleEvent();
                }
            }, true);
            scope.$watch('pastEvents', function(newEvent) {
                if (newEvent) {
                    updateAllDates();
                }
            }, true);
            scope.$watch('futureEvents', function(newEvent) {
                if (newEvent) {
                    updateAllDates();
                }
            }, true);
        }
    };
});
