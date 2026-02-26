angular.module('ngNumberFormat', [])
.directive('formatNumber', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelController) {
            const allowDecimal = attrs.allowDecimal !== 'false'; // Allow decimals if not explicitly disabled
            const maxDecimalPlaces = parseInt(attrs.decimalPlaces, 10) || 2; // Default to 2 decimal places

            // Formatter: Formats the model value for display
            ngModelController.$formatters.push(function(modelValue) {
                if (modelValue !== null && !isNaN(modelValue)) {
                    return allowDecimal
                        ? parseFloat(modelValue).toFixed(maxDecimalPlaces)
                        : parseInt(modelValue, 10);
                }
                return modelValue;
            });

            // Parser: Parses the user input back to the model
            ngModelController.$parsers.push(function(viewValue) {
                if (!viewValue) return null;

                // Remove invalid characters
                let plainNumber = viewValue.replace(/[^0-9.]/g, '');

                if (allowDecimal) {
                    const parts = plainNumber.split('.');
                    if (parts.length > 2) {
                        // Retain only the first decimal
                        plainNumber = parts[0] + '.' + parts[1];
                    }
                    if (parts[1] && parts[1].length > maxDecimalPlaces) {
                        // Limit to the specified number of decimal places
                        plainNumber = parts[0] + '.' + parts[1].substring(0, maxDecimalPlaces);
                    }
                } else {
                    // Remove decimal points entirely if decimals are not allowed
                    plainNumber = plainNumber.replace(/\./g, '');
                }

                // Convert to numeric value
                const numericValue = allowDecimal
                    ? parseFloat(plainNumber)
                    : parseInt(plainNumber, 10);

                // Update the input display
                element.val(plainNumber);

                return isNaN(numericValue) ? null : numericValue;
            });

            // Format value on blur (when input loses focus)
            element.on('blur', function() {
                let modelValue = ngModelController.$modelValue;

                if (modelValue !== null && !isNaN(modelValue)) {
                    modelValue = allowDecimal
                        ? parseFloat(modelValue).toFixed(maxDecimalPlaces)
                        : parseInt(modelValue, 10).toString();

                    element.val(modelValue);
                } else {
                    element.val(''); // Clear invalid values
                }
            });

            // Sync with ui-mask if applied
            if (attrs.uiMask) {
                scope.$watch(attrs.ngModel, function(newValue) {
                    if (newValue && !isNaN(newValue)) {
                        const formattedValue = allowDecimal
                            ? parseFloat(newValue).toFixed(maxDecimalPlaces)
                            : parseInt(newValue, 10).toString();

                        ngModelController.$setViewValue(formattedValue);
                        ngModelController.$render();
                    }
                });
            }
        }
    };
});
