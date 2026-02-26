angular.module('ngVariableFormat', [])
.directive('formatVariable', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            itemName: '=ngModel',
            itemVariableName: '='
        },
        link: function(scope, element, attrs, ngModel) {

            // Function to transform input to camel case
            function toCamelCase(inputValue) {
                if (inputValue == null) return ''; // Handle null input

                // Strip special characters and convert to camel case
                return inputValue
                    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
                    .replace(/\s(.)/g, function(match, group1) { // Convert to camel case
                        return group1.toUpperCase();
                    })
                    .replace(/\s/g, '') // Remove spaces
                    .replace(/^(.)/, function(match, group1) { // Ensure first character is lower case
                        return group1.toLowerCase();
                    });
            }

            // Watch for changes in item.name and update item.variableName
            scope.$watch('itemName', function(newVal) {
                scope.itemVariableName = toCamelCase(newVal);
            });

            // Transform initial value if item.name is provided
            if (scope.itemName) {
                scope.itemVariableName = toCamelCase(scope.itemName);
            }
        }
    };
});
