angular.module(
    'ngAddressesFormat', 
    []
)
.directive('formatAddresses', function() {
    return {
        restrict: 'A',
        scope: {
            addresses: '=',
            address: '='
        },
        link: function(scope) {

            function formatFullAddress(address) {
                if (address) {
                    address.fullAddress = `${address.street1} ${address.street2 || ''}, ${address.city}, ${address.State.abbreviation} ${address.zipCode}`;
                } else {
                    address.fullAddress = '';
                }
            }


            scope.$watch('addresses', function(newVal) {
                if (newVal && Array.isArray(newVal)) {
                    newVal.forEach(function(address) {
                        formatFullAddress(address);
                    });
                }
            }, true);
            scope.$watch('address', function(newVal) {
                if (newVal) {
                    formatFullAddress(newVal);
                }
            }, true);
        }
    };
});
