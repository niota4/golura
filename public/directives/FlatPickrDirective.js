define(
    [
        'flatpickr'
    ],
    function (flatpickr) {
        angular.module(
            'ngFlatPickr',
            []
        ).directive(
            'flatpickr',
            [
                '$parse', '$timeout',
                function ($parse, $timeout) {
                    return {
                        restrict: 'A',
                        require: 'ngModel',
                        scope: {
                            defaultDate: '@?',
                            timeOnly: '@?',
                            dateOnly: '@?',
                            twelveHour: '@?',
                            minDateModel: '=?',
                            maxDateModel: '=?',
                            allowPast: '@?',
                        },
                        link: function (scope, element, attrs, ngModel) {
                            // Fix: ensure allowPast is handled as a lowercase string for robustness
                            const allowPast = (scope.allowPast || '').toString().toLowerCase() === 'true';
                            const dateOnly = (scope.dateOnly || '').toString().toLowerCase() === 'true';
                            const timeOnly = (scope.timeOnly || '').toString().toLowerCase() === 'true';
                            
                            // Determine minDate dynamically based on allowPast
                            const minDate = allowPast ? null : (scope.minDateModel || new Date());

                            // Flatpickr configuration
                            const flatpickrConfig = {
                                enableTime: !dateOnly, // Disable time if dateOnly is true
                                dateFormat: dateOnly ? "Y-m-d" : "Y-m-d H:i:S", // Use date format or datetime format
                                altInput: true, // Use an alternative input for display
                                altFormat: dateOnly ? "M j, Y" : "M j, Y \\a\\t h:iK", // Conditional display format
                                time_24hr: scope.twelveHour !== 'true', // Use 24-hour or 12-hour clock
                                minDate: minDate, // Set minDate dynamically
                                defaultHour: 12, // Default to noon if no time is set
                                defaultMinute: 0,
                                noCalendar: timeOnly, // Hide calendar if timeOnly is true
                                onChange: function (selectedDates) {
                                    scope.$apply(function () {
                                        if (selectedDates.length > 0) {
                                            // Format date based on dateOnly setting
                                            const formattedDate = dateOnly ? 
                                                formatToMySQLDate(selectedDates[0]) : 
                                                formatToMySQLDatetime(selectedDates[0]);
                                            ngModel.$setViewValue(formattedDate);
                                        } else {
                                            ngModel.$setViewValue(null);
                                        }
                                    });
                                },
                                onReady: function (selectedDates, dateStr, instance) {
                                    if (instance.altInput) {
                                        instance.altInput.classList.add('flatpickr-input');
                                    }
                                },
                            };

                            // Format Date to MySQL date (YYYY-MM-DD)
                            function formatToMySQLDate(date) {
                                const pad = (num) => num.toString().padStart(2, '0');
                                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                            }

                            // Format Date to MySQL datetime
                            function formatToMySQLDatetime(date) {
                                const pad = (num) => num.toString().padStart(2, '0');
                                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
                                    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
                            }

                            // Parse MySQL datetime string or date string to Date object
                            function parseMySQLDatetime(mysqlDatetime) {
                                if (!mysqlDatetime) return null;
                                // Handle both date (YYYY-MM-DD) and datetime (YYYY-MM-DD HH:MM:SS) formats
                                let date;
                                if (mysqlDatetime.includes(' ')) {
                                    // Datetime format
                                    date = new Date(mysqlDatetime.replace(' ', 'T'));
                                } else {
                                    // Date only format
                                    date = new Date(mysqlDatetime + 'T00:00:00');
                                }
                                return isNaN(date.getTime()) ? null : date;
                            }

                            // Initialize Flatpickr with model or default date
                            function initializeFlatpickr() {
                                const modelDate = ngModel.$viewValue ? parseMySQLDatetime(ngModel.$viewValue) : null;
                                if (modelDate) {
                                    flatpickrConfig.defaultDate = modelDate;
                                } else if (scope.defaultDate) {
                                    const parsedDefaultDate = parseMySQLDatetime(scope.defaultDate);
                                    if (parsedDefaultDate) {
                                        flatpickrConfig.defaultDate = parsedDefaultDate;
                                    }
                                }

                                flatpickrInstance = flatpickr(element[0], flatpickrConfig);
                            }

                            // Flatpickr instance
                            let flatpickrInstance;

                            // Initialize Flatpickr
                            initializeFlatpickr();

                            // Ensure model updates reflect in Flatpickr
                            ngModel.$render = function () {
                                if (ngModel.$viewValue) {
                                    const date = parseMySQLDatetime(ngModel.$viewValue);
                                    if (flatpickrInstance) {
                                        flatpickrInstance.setDate(date, false); // Prevent triggering onChange
                                    }
                                }
                            };

                            // Watch for changes in the ngModel
                            scope.$watch('defaultDate', function (newVal) {
                                if (flatpickrInstance && newVal) {
                                    const date = parseMySQLDatetime(newVal);
                                    const currentFlatpickrDate = flatpickrInstance.selectedDates[0];
                                    if (!currentFlatpickrDate || date.getTime() !== currentFlatpickrDate.getTime()) {
                                        $timeout(function () {
                                            flatpickrInstance.setDate(date, true); // Update Flatpickr with new value
                                        });
                                    }
                                }
                            });

                            // Watch for minDate and maxDate changes
                            scope.$watch('minDateModel', function (newVal) {
                                if (flatpickrInstance) {
                                    flatpickrInstance.set('minDate', allowPast ? null : newVal || new Date());
                                }
                            });

                            scope.$watch('maxDateModel', function (newVal) {
                                if (flatpickrInstance) {
                                    flatpickrInstance.set('maxDate', newVal);
                                }
                            });

                            // Cleanup on destroy
                            scope.$on('$destroy', function () {
                                if (flatpickrInstance) {
                                    flatpickrInstance.destroy();
                                    flatpickrInstance = null;
                                }
                            });
                        }
                    };
                }
            ]
        );
    }
);
