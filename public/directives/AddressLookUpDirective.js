angular.module('ngAddressLookup', [])
.directive('addressLookup', function($rootScope, $timeout) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            address: '=?',  
            lat: '=?',      
            lng: '=?',      
            required: '@?', 
            inputId: '@',   
            ngModel: '=',
            states: '=?',
            city: '=?'
        },
        template: `
            <div id="autocomplete-container-{{inputId}}">
                <input 
                    type="text" 
                    class="form-input" 
                    placeholder="Enter address" 
                    id="{{inputId}}"
                    ng-model="address.street1"
                    ng-required="required"
                    autocomplete="off"
                    autofill="off"
                    style="display: none;"
                />
            </div>
        `,
        link: function(scope, element, attrs, ngModelController) {
            // Ensure address is an object to avoid errors when binding
            if (!scope.address || typeof scope.address !== 'object') {
                scope.address = {
                    street1: '',
                    street2: '',
                    city: '',
                    stateId: null,
                    zipCode: '',
                    latitude: null,
                    longitude: null
                };
            }

            // Get the container and the hidden input
            var container;
            var hiddenInput;
            var placeAutocompleteElement;

            // Initialize the new PlaceAutocompleteElement after Google Maps loads
            function initPlaceAutocomplete() {
                // Wait for Angular to process the template and get the elements
                $timeout(function() {
                    container = element[0].querySelector('#autocomplete-container-' + scope.inputId);
                    hiddenInput = element[0].querySelector('input');
                    
                    if (!container) {
                        console.error('Container element not found:', '#autocomplete-container-' + scope.inputId);
                        return;
                    }

                    // Check if the new API is available and import the library
                    if (google.maps.importLibrary) {
                        google.maps.importLibrary("places").then(function() {
                            if (google.maps.places.PlaceAutocompleteElement) {
                                createAutocompleteElement();
                            } else {
                                console.warn('PlaceAutocompleteElement not available, falling back to legacy');
                                initLegacyAutocomplete();
                            }
                        }).catch(function(error) {
                            console.error('Failed to load Google Places library:', error);
                            // If new API fails, try legacy
                            initLegacyAutocomplete();
                        });
                    } else {
                        // Old style loading, check if available
                        if (google.maps.places && google.maps.places.PlaceAutocompleteElement) {
                            createAutocompleteElement();
                        } else {
                            initLegacyAutocomplete();
                        }
                    }
                }, 0);
            }

            function createAutocompleteElement() {
                try {
                    if (!container) {
                        console.error('Container not available for PlaceAutocompleteElement');
                        initLegacyAutocomplete();
                        return;
                    }

                    // Create the PlaceAutocompleteElement
                    placeAutocompleteElement = new google.maps.places.PlaceAutocompleteElement({
                        // Add configuration options as needed
                    });

                    // Apply styling to match the original input
                    placeAutocompleteElement.style.width = '100%';
                    placeAutocompleteElement.className = 'form-input';
                    
                    // Set placeholder if needed
                    var inputField = placeAutocompleteElement.querySelector('input');
                    if (inputField) {
                        inputField.placeholder = 'Enter address';
                        inputField.className = 'form-input';
                    }

                    // Insert the element into the container
                    container.appendChild(placeAutocompleteElement);

                    // Add event listener for place selection
                    placeAutocompleteElement.addEventListener('gmp-select', function(event) {
                        handlePlaceSelect(event);
                    });

                    // Add error handling
                    placeAutocompleteElement.addEventListener('gmp-error', function(event) {
                        console.error('Place Autocomplete Error:', event);
                    });

                    // If there's an initial value, set it
                    if (scope.address.street1) {
                        setInitialValue(scope.address.street1);
                    }
                } catch (error) {
                    console.error('Error creating PlaceAutocompleteElement:', error);
                    // Fallback to legacy implementation
                    initLegacyAutocomplete();
                }
            }

            // Handle place selection with new API
            async function handlePlaceSelect(event) {
                try {
                    const placePrediction = event.placePrediction;
                    if (!placePrediction) {
                        console.error('No placePrediction in event:', event);
                        return;
                    }
                    
                    const place = placePrediction.toPlace();
                    
                    // Fetch the required fields
                    await place.fetchFields({
                        fields: ['displayName', 'formattedAddress', 'addressComponents', 'location']
                    });

                    handlePlaceChange(place);
                } catch (error) {
                    console.error('Error handling place selection:', error);
                }
            }

            function handlePlaceChange(place) {
                if (!place || !place.location || !place.addressComponents) return;

                // Preserve existing fields
                var currentAddress = angular.copy(scope.address);
                if (!currentAddress) {
                    currentAddress = {
                        street1: '',
                        street2: '',
                        city: '',
                        stateId: null,
                        zipCode: '',
                        latitude: null,
                        longitude: null
                    };
                }

                // Reset street1 to build it from components
                currentAddress.street1 = '';

                // Extract address components - new API uses different structure
                if (place.addressComponents) {
                    place.addressComponents.forEach(function(component) {
                        var types = component.types;
                        var value = component.longText || component.shortText;
                        
                        if (types.includes('street_number')) {
                            currentAddress.street1 = value;
                        } else if (types.includes('route')) {
                            currentAddress.street1 += (currentAddress.street1 ? ' ' : '') + value;
                        } else if (types.includes('locality')) {
                            currentAddress.city = value;
                        } else if (types.includes('administrative_area_level_1')) {
                            if (scope.states) {
                                currentAddress.stateId = findStateIdByAbbreviation(scope.states, component.shortText);
                            }
                        } else if (types.includes('postal_code')) {
                            currentAddress.zipCode = value;
                        }
                    });
                }

                // Handle city-only mode
                if (scope.city && scope.states) {
                    const state = _.find(scope.states, function (state) {
                        return state.id === currentAddress.stateId;
                    });
                    if (state) {
                        currentAddress.street1 = currentAddress.city + ', ' + state.abbreviation;
                    }
                }

                // Update latitude and longitude
                if (place.location) {
                    scope.lat = place.location.lat;
                    scope.lng = place.location.lng;
                    currentAddress.latitude = scope.lat;
                    currentAddress.longitude = scope.lng;
                }

                // Update the model with the new address data
                scope.address = currentAddress;
                
                // Update the hidden input for form validation
                hiddenInput.value = scope.address.street1;

                // Set model validity
                ngModelController.$setViewValue(scope.address.street1);
                ngModelController.$setValidity('required', true);

                scope.$apply();

                $rootScope.$broadcast('googlePlacesAddressSelected', {
                    address: angular.copy(scope.address)
                });
            }

            // Fallback to legacy implementation if new API fails
            function initLegacyAutocomplete() {
                if (!hiddenInput) {
                    console.error('Hidden input not available for legacy autocomplete');
                    return;
                }

                var legacyInput = hiddenInput;
                legacyInput.style.display = 'block';

                if (google.maps.places && google.maps.places.Autocomplete) {
                    var autocomplete = new google.maps.places.Autocomplete(legacyInput);
                    autocomplete.addListener('place_changed', function() {
                        var place = autocomplete.getPlace();
                        if (place && place.geometry && place.address_components) {
                            // Convert legacy place to new format for consistency
                            var convertedPlace = {
                                location: {
                                    lat: place.geometry.location.lat(),
                                    lng: place.geometry.location.lng()
                                },
                                addressComponents: place.address_components.map(function(component) {
                                    return {
                                        types: component.types,
                                        longText: component.long_name,
                                        shortText: component.short_name
                                    };
                                })
                            };
                            handlePlaceChange(convertedPlace);
                        }
                    });
                } else {
                    console.error('Google Maps Places API is not available.');
                }
            }

            function setInitialValue(value) {
                if (placeAutocompleteElement) {
                    var inputField = placeAutocompleteElement.querySelector('input');
                    if (inputField) {
                        inputField.value = value;
                    }
                }
            }

            // Watch for changes in the ngModel and update the autocomplete
            scope.$watch('ngModel', function(newVal) {
                if (newVal && placeAutocompleteElement) {
                    setInitialValue(newVal);
                }
            });

            scope.$watch('address', function(newVal) {
                if (newVal && newVal.street1 && placeAutocompleteElement) {
                    setInitialValue(newVal.street1);
                }
            });

            // Find state ID by abbreviation
            function findStateIdByAbbreviation(states, abbreviation) {
                var matchingState = states.find(function(state) {
                    return state.abbreviation === abbreviation;
                });
                return matchingState ? matchingState.id : null;
            }

            // Initialize when the Google Maps API is ready
            if (typeof google !== 'undefined' && google.maps) {
                initPlaceAutocomplete();
            } else {
                // Wait for Google Maps to load
                var checkGoogleMaps = setInterval(function() {
                    if (typeof google !== 'undefined' && google.maps) {
                        clearInterval(checkGoogleMaps);
                        initPlaceAutocomplete();
                    }
                }, 100);
            }
        }
    };
});
