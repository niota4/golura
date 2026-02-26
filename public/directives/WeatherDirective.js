angular.module('ngWeather', [])
.directive('weatherDisplay', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict: 'E',
        scope: {
            weather: '=', // Weather data object
            forecast: '@' // Optional: If "true", show the full forecast by default
        },
        template: `
            <div class="weather-container">
                <div 
                    class="weather text-left"
                    ng-if="!showFullForecast"
                >
                    <h3>{{currentPeriod.shortForecast}}</h3>
                    <h5>
                        {{currentPeriod.temperature}}
                        <span>°{{currentPeriod.temperatureUnit}}</span> 
                    </h5>
                    <h6>
                        <i>{{currentPeriod.windSpeed}} {{currentPeriod.windDirection}}</i>
                    </h6>
                </div>
                <div 
                    class="weather-forecast-container text-left"
                    ng-if="showFullForecast"
                >
                    <ul class="weather-forecast-list grid-x grid-margin-x align-center">
                        <li 
                            class="cell small-12 medium-auto large-auto weather-forecast-list-item"
                            ng-repeat="day in forecastArray track by $index"
                        >
                            <div class="weather text-center">
                                <h2>{{day.dayName}}</h2>
                                <div class="weather-period">
                                    <h5>
                                        {{day.periods[0].temperature}}
                                        <span>°{{day.periods[0].temperatureUnit}}</span>
                                        <p>
                                            / {{day.periods[1].temperature}}
                                        </p>
                                    </h5>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        `,
        controller: ['$scope', function($scope) {
            $scope.showFullForecast = false;

            // Default to the first forecast period
            $scope.currentPeriod = $scope.weather.weather.properties.periods[0];
            if ($scope.forecast === 'true') {
                $scope.showFullForecast = true;
            }

            // Watch for changes in the weather data
            $scope.$watch('weather', function(newVal) {
                if (newVal && newVal.weather && newVal.weather.properties && newVal.weather.properties.periods) {
                    // Update the current period to the first one in the list
                    $scope.currentPeriod = newVal.weather.properties.periods[0];
                    $scope.groupForecastByDay(newVal.weather.properties.periods);
                }
            });

            // Group forecast periods by day
            $scope.groupForecastByDay = function(periods) {
                const grouped = {};
                periods.forEach(period => {
                    const dayName = new Date(period.startTime).toLocaleDateString('en-US', { weekday: 'long' });
                    if (!grouped[dayName]) {
                        grouped[dayName] = {
                            dayName: dayName,
                            periods: []
                        };
                    }
                    grouped[dayName].periods.push(period);
                });
                $scope.forecastArray = Object.values(grouped);
            };

            // Initialize forecastArray
            if ($scope.weather && $scope.weather.weather && $scope.weather.weather.properties && $scope.weather.weather.properties.periods) {
                $scope.groupForecastByDay($scope.weather.weather.properties.periods);
            }
        }]
    };
}]);
