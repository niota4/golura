define(['maps', 'foundation'], function (googleMaps) {
    angular.module('ngAddressMap', [])
        .directive('addressMap', ['$timeout', '$compile', function ($timeout, $compile) {
            return {
                restrict: 'E',
                template: `
                    <div class="view-event-address-image-container view-map-container text-center">
                        <button
                            class="view-event-address-view-button button white-button"
                            id="viewEventAddressViewButton"
                            type="button"
                            ng-click="openMapModal()"
                        >
                            <b>View Map</b>
                        </button>
                    </div>
                `,
                scope: {
                    latitude: '=',
                    longitude: '=',
                    color: '='
                },
                link: function (scope, element, attrs) {
                    let map, marker;

                    // Function to create the modal dynamically
                    function createModal() {
                        // Remove existing modal if it exists
                        const existingModal = document.getElementById('addressMapModal');
                        if (existingModal) {
                            existingModal.remove();
                        }

                        // Define the modal HTML
                        const modalHtml = `
                            <div
                                class="address-map-reveal reveal large"
                                id="addressMapModal"
                                data-reveal
                                data-close-on-click="false"
                            >
                                <div 
                                    class="address-map-container"
                                    id="addressMapContainer" 
                                ></div>
                                <button 
                                    class="close-button" 
                                    aria-label="closeUserPreferencesFormModal" 
                                    type="button" 
                                    data-close
                                >
                                    <span aria-hidden="true">
                                        <i class="fal fa-times-circle"></i>
                                    </span>
                                </button>
                            </div>
                        `;

                        // Append the modal to the body
                        const modalElement = $compile(modalHtml)(scope);
                        angular.element(document.body).append(modalElement);

                        // Initialize Foundation modal
                        $('#addressMapModal').foundation();
                    }

                    // Function to initialize the map
                    function initMap() {
                        const mapContainer = document.getElementById('addressMapContainer');
                        if (!mapContainer) return;

                        const coordinates = {
                            lat: parseFloat(scope.latitude) || 0,
                            lng: parseFloat(scope.longitude) || 0
                        };

                        // Create map instance
                        map = new googleMaps.Map(mapContainer, {
                            center: coordinates,
                            zoom: 10
                        });

                        // Add marker
                        marker = new googleMaps.Marker({
                            map: map, 
                            position: coordinates,
                            optimized: true,
                            icon: {
                                path:'M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0',
                                strokeColor: '#fff',
                                strokeWeight: 2,
                                fillColor: scope.color,
                                fillOpacity: 1,
                                scaledSize: new googleMaps.Size(1,1),
                                labelOrigin: new googleMaps.Point(0,0)
                            }
                        });
                    }

                    // Open the modal and initialize the map
                    scope.openMapModal = function () {
                        createModal(); // Ensure the modal is fresh
                        $('#addressMapModal').foundation('open');
                        $timeout(initMap, 300); // Ensure modal is open before initializing the map
                    };

                    // Clean up when the scope is destroyed
                    scope.$on('$destroy', function () {
                        if (map) {
                            googleMaps.event.clearInstanceListeners(map);
                            map = null;
                        }
                        marker = null;
                        const existingModal = document.getElementById('addressMapModal');
                        if (existingModal) {
                            existingModal.remove();
                        }
                    });
                }
            };
        }]);
});
