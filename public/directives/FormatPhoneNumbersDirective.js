angular.module('ngPhoneNumbersFormat', [])
.directive('formatPhoneNumbers', function() {
    return {
        restrict: 'A',
        scope: {
            phoneNumbers: '=',
            phoneNumber: '=',
            formatNumber: '='
        },
        template: '<span ng-if="formatNumber">{{formattedNumber}}</span><ng-transclude ng-if="!formatNumber"></ng-transclude>',
        transclude: true,
        link: function(scope) {

            function formatPhoneNumber(number) {
                if (!number || typeof number !== 'string') return '';
                
                // Remove non-numeric characters
                const cleaned = number.replace(/\D/g, '');
                
                // Format the cleaned number
                if (cleaned.length === 10) {
                    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
                }
                
                return number; // Return unformatted if not 10 digits
            }

            // Watch for changes in the array of phone numbers
            scope.$watch('phoneNumbers', function(newVal) {
                if (newVal && Array.isArray(newVal)) {
                    newVal.forEach(function(phoneObj) {
                        if (phoneObj.number) {
                            phoneObj.formattedNumber = formatPhoneNumber(phoneObj.number);
                        }
                    });
                }
            }, true);

            // Watch for changes in a single phone number object
            scope.$watch('phoneNumber', function(newVal) {
                if (newVal && newVal.number) {
                    // check if newVal is an object
                    if (newVal && typeof newVal === 'object') {
                        newVal.formattedNumber = formatPhoneNumber(newVal.number);
                    } else {
                        
                    }
                }
            }, true);

            // Watch for changes in a simple phone number string
            scope.$watch('formatNumber', function(newVal) {
                if (newVal && typeof newVal === 'string') {
                    scope.formattedNumber = formatPhoneNumber(newVal);
                }
            }, true);
        }
    };
})