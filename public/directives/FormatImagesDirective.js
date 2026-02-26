define(['foundation', 'swiper'], function() {
    angular.module('ngImages', [])
        .directive('formatImages', ['$rootScope', '$timeout', '$compile', '$setup', '$media', function($rootScope, $timeout, $compile, $setup, $media) {
            return {
                restrict: 'E',
                scope: {
                    images: '=',
                    events: '=?',
                    estimates: '=?',
                    marketing: '=?',
                    deleteButton: '@?'
                },
                template: `
                    <h3 
                        class="text-center"
                        ng-if="!visibleImages.length"
                    >
                        <b>
                            Oops! 
                        </b>
                        Looks like their no Images found!
                    </h3>
                    <div 
                        class="delete-image-container text-right"
                        ng-if="selectPhotos"
                    >
                        <button
                            class="delete-images-button button alert white-text"
                            type="button"
                            ng-if="deleteButton"
                            ng-class="{'expanded': isMobile}"
                            ng-click="confirmDelete()"
                        >      
                            <span>
                                <i class="fal fa-archive"></i> Delete
                            </span>
                        </button>
                    </div>
                    <div class="grid-x grid-margin-x align-top">
                        <div 
                            class="cell small-12 medium-4 large-3 position-relative" 
                            style="height: 15rem; margin-bottom: 1rem; cursor: pointer;" 
                            ng-repeat="image in visibleImages track by $index" 
                        >
                            <div 
                                class="image-select-button-container select-container"
                                style="position: absolute; left: 1rem; top: 1rem;"
                                ng-if="selectPhotos"
                            >
                                <button 
                                    class="image-select-button select-button button"
                                    type="button"
                                    ng-click="image.selected = !image.selected"
                                    ng-class="{'selected': image.selected}"
                                >
                                    <div 
                                        class="check-icon"
                                        ng-if="image.selected"
                                    >
                                        <i class="fal fa-check"></i>
                                    </div>
                                </button>
                            </div>
                            <div 
                                class="background" 
                                ng-style="{'background-image': 'url(' + image.url + ')'}" 
                                style="background-repeat: no-repeat; 
                                background-position: center; 
                                background-size: cover; 
                                height: 100%; 
                                width: 100%; 
                                border-radius: 0.25rem;"
                                ng-click="openModal($index)"
                            ></div>
                        </div>
                    </div>
                    <div 
                        class="images-delete-confirm-overlay black-overlay"
                        ng-show="imagesDeleteComfirm"
                    >
                        <div class="golura-block grid-x grid-padding-x align-center-middle text-center">
                            <div class="cell small-12 medium-shrink large-shrink">
                                <span class="delete-icon">
                                    <i class="fal fa-circle-exclamation"></i>
                                </span>
                            </div>
                            <div class="cell small-12 medium-shrink large-shrink">
                                <h4>
                                    <b class="alert-text">Warning: </b>
                                    <span class="white-text">Are you sure you want to Delete 
                                        these Images?
                                    </span>
                                </h4>
                            </div>
                            <div class="cell small-12 medium-12 large-12">
                                <button 
                                    class="delete-estimate-button button alert white-text"
                                    type="button"
                                    ng-disabled="imagesDeleting"
                                    ng-class="{'form-alert': imagesDeleting}"
                                    ng-click="deleteImages(images)"
                                >
                                    <span ng-if="!imagesDeleting">
                                        <i class="fal fa-check-circle"></i> Confirm
                                    </span>
                                    <span ng-if="imagesDeleting">
                                        Please Wait...
                                    </span>
                                </button>
                                <button 
                                    class="cancel-button button warning white-text"
                                    type="button"
                                    data-close
                                >
                                    <i class="fal fa-times-circle"></i> Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                    <div 
                        id="loadMore" 
                        style="width: 100%; 
                        height: 2rem;" 
                        ng-click="loadMoreImages()"
                    ></div>
                `,
                link: function(scope, element) {
                    scope.image = null;
                    scope.media = null;
                    scope.selectPhotos = false;
                    scope.imageDeleting = false;
                    scope.imagesDeleting = false;
                    scope.imagesDeleteComfirm = false;
                    scope.mediaTypes = $setup.getMediaTypes();
                    scope.isMobile = $media.getMedia();
                    
                    function loadInitialImages() {
                        scope.visibleImages = scope.images.slice(0, 16);
                    }

                    scope.loadMoreImages = function() {
                        var newImages = scope.images.slice(scope.visibleImages.length, scope.visibleImages.length + 8);
                        $timeout(function() {
                            scope.visibleImages = scope.visibleImages.concat(newImages);
                            scope.$apply();
                        });
                    };

                    function createObserver() {
                        var observer = new IntersectionObserver(function(entries) {
                            if (entries[0].isIntersecting === true) {
                                entries.forEach(function(entry) {
                                    if (entry.isIntersecting) {
                                        scope.loadMoreImages();
                                    }
                                });
                            }
                        }, { threshold: [0] });
                        observer.observe(document.getElementById('loadMore'));
                    }

                    scope.$watch('images', function(newVal) {
                        if (newVal) {
                            if (!scope.imageModel) {
                                loadInitialImages();
                                createObserver();
                            }
                        }
                    }, true);

                    scope.openModal = function(index) {
                        var modalHtml = `
                            <div 
                                class="media-reveal image-reveal reveal" 
                                id="imageModal" 
                                style="background: transparent;" 
                                data-reveal 
                                data-close-on-click="false"
                            >
                                <button 
                                    class="close-button" 
                                    aria-label="Close" 
                                    type="button" 
                                    data-close
                                    ng-click="media.delete = false"
                                >
                                    <i class="fal fa-times-circle"></i>
                                </button>
                                <div class="swiper-container">
                                    <div class="swiper-wrapper">
                                        <div 
                                            class="swiper-slide position-relative" 
                                            ng-repeat="image in images" 
                                        >
                                            <div 
                                                class="image"
                                                ng-style="{'background-image': 'url(' + image.url + ')'}"
                                            ></div>
                                            <div class="button-container">
                                                <button 
                                                    class="download-button button white-text"
                                                    type="button" 
                                                    ng-click="$root.downloadFromUrl(image.url)"
                                                    ng-if="!image.options"
                                                >
                                                    <b>
                                                        <i class="fal fa-cloud-arrow-down"></i> 
                                                        <span ng-if="!$root.UI.isMobile">
                                                            Download
                                                        </span>
                                                    </b>
                                                </button>
                                                <button 
                                                    class="options-button button warning white-text"
                                                    ng-class="{'float-right': $root.UI.isMobile,
                                                    'white-text': !$root.UI.isMobile}"
                                                    type="button"
                                                    ng-click="image.options = !image.options"
                                                    ng-if="!image.options"
                                                >
                                                    <b>
                                                        <i class="fal fa-gear"></i>
                                                        <span ng-if="!$root.UI.isMobile">
                                                            Options
                                                        </span>
                                                    </b>
                                                </button>
                                            </div>
                                            <div 
                                                class="media-associate-overlay media-overlay black-overlay"
                                                ng-if="media.associate"
                                            >
                                                <div class="media-overlay-content">
                                                    <button 
                                                        class="media-close-button button warning white-text"
                                                        type="button"
                                                        ng-click="initTabs('options')"
                                                        ng-if="!media.associationType.length"
                                                    >
                                                        <b>
                                                            <i class="fal fa-times-circle"></i> Close
                                                        </b>
                                                    </button>
                                                    <div ng-include="'dist/forms/media/associate-form.html'"></div>
                                                </div>
                                            </div>
                                            <div 
                                                class="image-delete-confirm-overlay media-overlay black-overlay"
                                                ng-if="media.delete"
                                            >
                                                <div class="media-overlay-content">
                                                    <div class="golura-block grid-x grid-padding-x align-center-middle text-center">
                                                        <div class="cell small-12 medium-shrink large-shrink">
                                                            <span class="delete-icon">
                                                                <i class="fal fa-circle-exclamation"></i>
                                                            </span>
                                                        </div>
                                                        <div class="cell small-12 medium-shrink large-shrink">
                                                            <h4>
                                                                <b class="alert-text">Warning: </b>
                                                                <span class="white-text">Are you sure you want to Delete 
                                                                    this Image?
                                                                </span>
                                                            </h4>
                                                        </div>
                                                        <div class="cell small-12 medium-12 large-12">
                                                            <button 
                                                                class="delete-estimate-button button alert white-text"
                                                                type="button"
                                                                ng-disabled="imageDeleting"
                                                                ng-class="{'form-alert': imageDeleting}"
                                                                ng-click="deleteImage(image)"
                                                            >
                                                                <span ng-if="!imageDeleting">
                                                                    <i class="fal fa-check-circle"></i> Confirm
                                                                </span>
                                                                <span ng-if="imageDeleting">
                                                                    Please Wait...
                                                                </span>
                                                            </button>
                                                            <button 
                                                                class="cancel-button button warning white-text"
                                                                type="button"
                                                                ng-click="initTabs('options')"
                                                            >
                                                                <i class="fal fa-times-circle"></i> Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div 
                                                class="media-options-overlay media-overlay black-overlay"
                                                ng-if="media.options"
                                            >
                                                <div class="media-overlay-content">
                                                    <div ng-include="'dist/partials/media/image-details.html'"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    class="prev button clear white-text"
                                    ng-show="!media && images.length > 1"
                                >
                                    <i class="fal fa-circle-arrow-left"></i>
                                </button>
                                <button 
                                    class="next button clear white-text"
                                    ng-show="media && images.length > 1"
                                >
                                    <i class="fal fa-circle-arrow-right"></i>
                                </button>
                            </div>`;
                        
                        var modalElement = $compile(modalHtml)(scope);
                        angular.element(document.body).append(modalElement);

                        $('#imageModal').foundation();

                        $timeout(function() {
                            var swiper = new Swiper('.swiper-container', {
                                slidesPerView: 1,
                                spaceBetween: 10,
                                loop: true,
                                navigation: {
                                    nextEl: '.next',
                                    prevEl: '.prev',
                                },
                                pagination: {
                                    el: '.swiper-pagination',
                                    clickable: true,
                                },
                            });
                            scope.imageModel = true;
                            scope.media = null;

                            scope.image = scope.images && scope.images[index] ? scope.images[index] : null;
                            
                            if (!scope.events) {
                                scope.events = [];
                            };
                            if (!scope.estimates) {
                                scope.estimates = [];
                            };
                            if (!scope.marketing) {
                                scope.marketing = [];
                            };
                            $media.getPhoto(scope.image)
                            .then(
                                function (response) {
                                    scope.image = response.image;
                                    scope.image.childImages = response.childImages;
    
                                    if (scope.image) {
                                        // Mark the corresponding event and estimate as selected for the current image
                                        if (Array.isArray(scope.events) && scope.events.length) {
                                            scope.events.forEach(event => {
                                                if (event.id === scope.image.eventId) {
                                                    event.selected = true;
                                                }
                                            });
                                        }
                                        if (Array.isArray(scope.estimates) && scope.estimates.length) {
                                            scope.estimates.forEach(estimate => {
                                                if (estimate.id === scope.image.estimateId) {
                                                    estimate.selected = true;
                                                }
                                            });
                                        }
        
                                        // Additionally, mark events and estimates associated with childImages as selected
                                        if (scope.image.childImages && Array.isArray(scope.image.childImages)) {
                                            scope.image.childImages.forEach(childImage => {
                                                if (Array.isArray(scope.events) && scope.events.length) {
                                                    scope.events.forEach(event => {
                                                        if (event.id === childImage.eventId) {
                                                            event.selected = true;
                                                        }
                                                    });
                                                }
                                                if (Array.isArray(scope.estimates) && scope.estimates.length) {
                                                    scope.estimates.forEach(estimate => {
                                                        if (estimate.id === childImage.estimateId) {
                                                            estimate.selected = true;
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }
                            )
                            swiper.slideTo(index, 0, false); // Move to the specified slide without animation
                        }, 0);

                        $('#imageModal').on('closed.zf.reveal', function() {
                            $(this).remove();
                        });

                        $('#imageModal').foundation('open');
                        
                    };
                    scope.confirmDelete = function () {
                        scope.imagesDeleteComfirm = !scope.imagesDeleteComfirm;
                    };
                    scope.initTabs = function(type) {
                        scope.media = {};
                        if (!scope.image || !scope.image.id || !Array.isArray(scope.images)) {
                            return;
                        }
                    
                        // Find the object in the scope.images array by id
                        const imageIndex = scope.images.findIndex(img => img.id === scope.image.id);
                    
                        if (imageIndex === -1) {
                            return;
                        }
                        scope.media.options = false;
                        scope.media.delete = false;
                        scope.media.associate = false;
                        
                        // Update the object based on the type
                        switch (type) {
                            case 'options':
                                scope.media.associate = null;
                                scope.media.associationType = null;
                                scope.media.options = true;
                            break;
                    
                            case 'delete':
                                scope.media.delete = true;
                            break;
                    
                            case 'associate':
                                scope.media.associate = true;
                            break;
                        }
                    };
                    
                    scope.downloadImage = function(url) {
                        var a = document.createElement('a');
                        a.href = url;
                        a.download = url.split('/').pop();
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    };
                    scope.deleteImage = function (image) {
                        scope.imageDeleting = true;
                    
                        $media.deletePhoto({ id: image.id })
                            .then(function (response) {
                                scope.images = scope.images.filter((p) => p.id !== image.id);
                                scope.imageDeleting = false;
                                $('#imageModal').foundation('close');
                                $rootScope.$broadcast('togglePhotoSelection');
                                
                                if (response.err) {
                                    scope.images.push(image);
                                }
                            })
                            .catch(function (err) {
                                scope.images.push(image);
                            });
                    };
                    scope.deleteImages = function () {
                        // Filter images where selected is true
                        const imagesToDelete = scope.images.filter((image) => image.selected);
                        const imageIds = imagesToDelete.map((image) => image.id);
                    
                        if (imageIds.length === 0) {
                            return;
                        }
                    
                        scope.imagesDeleting = true;
                    
                        $media.deletePhotos({ ids: imageIds })
                            .then(function (response) {
                                scope.selectPhotos = false;
                                scope.imagesDeleting = false;
                                scope.imagesDeleteComfirm = false;

                                $rootScope.$broadcast('togglePhotoSelection');
                    
                                if (!response.err) {
                                    // Remove successfully deleted images from the list
                                    scope.images = scope.images.filter((image) => !imageIds.includes(image.id));
                                } else {
                                    console.error('Error deleting images:', response.msg);
                                }
                            })
                            .catch(function (err) {
                                scope.imagesDeleting = false;
                                console.error('Error deleting images:', err);
                            });
                    };
                    scope.associateMedia = function (type) {
                        var type = scope.media.associationType;
                        var data = {
                            associations: []
                        };

                        // Update the object based on the type
                        switch (type) {
                            case 'event':
                                data.type = 'events';
                                data.associations = scope.events;
                            break;
                    
                            case 'estimate':
                                data.type = 'estimates';
                                data.associations = scope.estimates;
                            break;
                    
                            case 'marketing':
                                data.type = 'marketing';
                                data.associations = scope.marketing;
                            break;
                        }
                        data.associations = data.associations
                        .filter(association => association.selected)
                        .map(association => ({
                            ...association,
                            imageId: scope.image.id,
                        }));
                        $media.associatePhoto(data)
                        .then(
                            function (response) {
                            }
                        )
                    };
                    scope.$on('togglePhotoSelection', function(images, data) {
                        scope.selectPhotos = !scope.selectPhotos;
                    });
                    scope.$watch('deleteButton', function(newVal) {
                        scope.deleteButton = newVal === true || newVal === 'true';
                    });
                }
            };
        }]);
});
