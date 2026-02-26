angular.module('ngVideos', [])
.directive('formatVideos', ['$timeout', '$compile', '$setup', '$media', function($timeout, $compile, $setup, $media) {
    return {
        restrict: 'E',
        scope: {
            videos: '=',
            events: '=?',
            estimates: '=?',
            marketing: '=?'
        },
        template: `
            <h3 
                class="text-center"
                ng-if="!visibleVideos.length"
            >
                <b>
                    Oops! 
                </b>
                Looks like their no Videos found!
            </h3>
            <div class="grid-x grid-margin-x">
                <div class="cell small-12 medium-12 large-12 text-right">
                    <button
                        class="delete-videos-button button alert white-text"
                        type="button"
                        ng-click="confirmDelete()"
                        ng-if="selectVideos"
                    >      
                        <span>
                            <i class="fal fa-archive"></i> Delete
                        </span>
                    </button>
                </div>
                <div 
                    class="cell small-12 medium-4 large-3 position-relative" 
                    style="height: 15rem; 
                    margin-bottom: 1rem; 
                    cursor: pointer; 
                    position: relative;
                    overflow: hidden;
                    border-radius: 0.25rem" 
                    ng-repeat="video in visibleVideos track by $index" 
                >
                    <div 
                        class="video-select-button-container select-container"
                        style="position: absolute; left: 1rem; top: 1rem; z-index: 2;"
                        ng-if="selectVideos"
                    >
                        <button 
                            class="video-select-button select-button button"
                            type="button"
                            ng-click="video.selected = !video.selected"
                            ng-class="{'selected': video.selected}"
                        >
                            <div 
                                class="check-icon"
                                ng-if="video.selected"
                            >
                                <i class="fal fa-check"></i>
                            </div>
                        </button>
                    </div>
                    <div 
                        class="background" 
                        ng-style="{'background-image': 'url(' + video.thumbNail + ')'}" 
                        style="background-repeat: no-repeat; 
                        background-position: center; 
                        background-size: cover; 
                        height: 100%; 
                        width: 100%;"
                    ></div>
                    <div 
                        class="background-overlay text-center"
                        style="width: 100%; 
                        height: 100%; 
                        position: absolute;
                        top: 0px;
                        background: rgba(0,0,0, 0.5);
                        color: #fff";
                        ng-click="openModal($index)"
                    >
                        <i 
                            class="fal fa-play"
                            style="position: absolute;
                            top: 50%;
                            left: 0px;
                            right: 0px;
                            margin auto;
                            font-size: 2rem;
                            -webkit-transform: translateY(-50%);  
                            transform: translateY(-50%);"
                        ></i>
                    </div>
                </div>
            </div>
            <div 
                class="videos-delete-confirm-overlay black-overlay"
                ng-show="videosDeleteConfirm"
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
                                these Videos?
                            </span>
                        </h4>
                    </div>
                    <div class="cell small-12 medium-12 large-12">
                        <button 
                            class="delete-estimate-button button alert white-text"
                            type="button"
                            ng-disabled="videosDeleting"
                            ng-class="{'form-alert': videosDeleting}"
                            ng-click="deleteVideos(videos)"
                        >
                            <span ng-if="!videosDeleting">
                                <i class="fal fa-check-circle"></i> Confirm
                            </span>
                            <span ng-if="videosDeleting">
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
                id="loadMore" style="width: 100%; height: 2rem;" 
                ng-click="loadMoreVideos()"
            ></div>
        `,
        link: function(scope, element) {
            scope.video = null;
            scope.media = null;
            scope.currentSlideIndex = null;
            scope.selectVideos = false;
            scope.videoDeleting = false;
            scope.videosDeleting = false;
            scope.videosDeleteConfirm = false;
            scope.mediaTypes = $setup.getMediaTypes();

            function loadInitialVideos() {
                scope.visibleVideos = scope.videos.slice(0, 16);
            }

            scope.loadMoreVideos = function() {
                var newVideos = scope.videos.slice(scope.visibleVideos.length, scope.visibleVideos.length + 8);
                $timeout(function() {
                    scope.visibleVideos = scope.visibleVideos.concat(newVideos);
                    scope.$apply();
                });
            };

            function updateVideoUrls() {
                scope.videos.forEach(function(video) {
                    video.thumbNail = video.url.replace(/(\.mp4|\.mov|\.avi|\.mkv)$/, '.jpg');
                });
            }
            function createObserver() {
                var observer = new IntersectionObserver(function(entries) {
                    if (entries[0].isIntersecting === true) {
                        entries.forEach(function(entry) {
                            if (entry.isIntersecting) {
                                scope.loadMoreVideos();
                            }
                        });
                    }
                }, { threshold: [0] });
                observer.observe(document.getElementById('loadMore'));
            }

            scope.$watch('videos', function(newVal) {
                if (newVal) {
                    updateVideoUrls();
                    loadInitialVideos();
                    createObserver();
                }
            }, true);

            scope.openModal = function(index) {
                const modalHtml = `
                <div 
                    class="video-reveal media-reveal reveal" 
                    id="videoModal" 
                    style="background: transparent;" 
                    data-reveal 
                    data-close-on-click="false"
                >
                    <button 
                        class="close-button" 
                        aria-label="Close" 
                        type="button" 
                        data-close
                    >
                        <i class="fal fa-times-circle"></i>
                    </button>
                    <div class="swiper-container">
                        <div class="swiper-wrapper">
                            <div 
                                class="swiper-slide position-relative" 
                                ng-repeat="video in videos" 
                            >
                                <video 
                                    controls 
                                    width="100%" 
                                    height="100%" 
                                    id="video-{{$index}}" 
                                    class="media-video"
                                >
                                    <source ng-src="{{video.url}}" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                <div class="button-container">
                                    <button 
                                        class="download-button button white-button" 
                                        type="button" 
                                        ng-click="downloadVideo(video.url)"
                                    >
                                        <b>
                                            <i class="fal fa-cloud-arrow-down"></i> 
                                            Download
                                        </b>
                                    </button>
                                    <button 
                                        class="download-button button warning white-text"
                                        type="button"
                                        ng-click="initTabs('options')"
                                    >
                                        <b>
                                            <i class="fal fa-gear"></i> Options
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
                                    class="video-delete-confirm-overlay media-overlay black-overlay"
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
                                                        this Video?
                                                    </span>
                                                </h4>
                                            </div>
                                            <div class="cell small-12 medium-12 large-12">
                                                <button 
                                                    class="delete-estimate-button button alert white-text"
                                                    type="button"
                                                    ng-disabled="videoDeleting"
                                                    ng-class="{'form-alert': videoDeleting}"
                                                    ng-click="deleteVideo(video)"
                                                >
                                                    <span ng-if="!videoDeleting">
                                                        <i class="fal fa-check-circle"></i> Confirm
                                                    </span>
                                                    <span ng-if="videoDeleting">
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
                                <div class="media-options-overlay media-overlay black-overlay" ng-if="media.options">
                                    <div class="media-overlay-content">
                                        <div 
                                            class="media-options-overlay media-overlay black-overlay"
                                            ng-if="media.options"
                                        >
                                            <div class="media-overlay-content">
                                                <div ng-include="'dist/partials/media/video-details.html'"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button 
                        class="prev button clear white-text"
                        ng-show="!media"
                    >
                        <i class="fal fa-circle-arrow-left"></i>
                    </button>
                    <button 
                        class="next button clear white-text"
                        ng-show="!media"
                    >
                        <i class="fal fa-circle-arrow-right"></i>
                    </button>
                </div>`;
                var modalElement = $compile(modalHtml)(scope);
                angular.element(document.body).append(modalElement);

                $('#videoModal').foundation();

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
                        on: {
                            slideChange: function(i) {
                                scope.currentSlideIndex = i.activeIndex;
                                $('video').each(function() {
                                    this.pause();
                                    this.currentTime = 0;
                                });
                                $timeout(
                                    function () {
                                        document.getElementById('video-' + scope.currentSlideIndex).play();
                                    }, 1000
                                )
                            }
                        }
                    });

                    scope.videoModel = true;
                    scope.media = null;

                    scope.video = scope.videos && scope.videos[index] ? scope.videos[index] : null;

                    if (!scope.events) {
                        scope.events = [];
                    };
                    if (!scope.estimates) {
                        scope.estimates = [];
                    };
                    if (!scope.marketing) {
                        scope.marketing = [];
                    };
                    
                    $media.getVideo(scope.video)
                    .then(
                        function (response) {
                            scope.video = response.video;
                            scope.video.childVideos = response.childVideos;

                            if (scope.video) {

                                // Mark the corresponding event and estimate as selected for the current video

                                if (Array.isArray(scope.events) && scope.events.length) {
                                    scope.events.forEach(event => {
                                        if (event.id === scope.video.eventId) {
                                            event.selected = true;
                                        }
                                    });
                                }

                                if (Array.isArray(scope.estimates) && scope.estimates.length) {
                                    scope.estimates.forEach(estimate => {
                                        if (estimate.id === scope.video.estimateId) {
                                            estimate.selected = true;
                                        }
                                    });
                                }

                                // Additionally, mark events and estimates associated with childVideos as selected
                                if (scope.video.childVideos && Array.isArray(scope.video.childVideos)) {
                                    scope.video.childVideos.forEach(childVideo => {
                                        if (Array.isArray(scope.events) && scope.events.length) {
                                            scope.events.forEach(event => {
                                                if (event.id === childVideo.eventId) {
                                                    event.selected = true;
                                                }
                                            });
                                        }
                                        if (Array.isArray(scope.estimates) && scope.estimates.length) {
                                            scope.estimates.forEach(estimate => {
                                                if (estimate.id === childVideo.estimateId) {
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

                $('#videoModal').on('closed.zf.reveal', function() {
                    $(this).remove();
                });

                $('#videoModal').foundation('open');
            };

            scope.confirmDelete = function () {
                scope.videosDeleteConfirm = !scope.videosDeleteConfirm;
            };

            scope.initTabs = function(type) {
                scope.media = {};
                if (!scope.video || !scope.video.id || !Array.isArray(scope.videos)) {
                    return;
                }
            
                // Find the object in the scope.videos array by id
                const videoIndex = scope.videos.findIndex(video => video.id === scope.video.id);
            
                if (videoIndex === -1) {
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

                        $timeout(
                            function () {
                                document.getElementById('video-' + scope.currentSlideIndex).pause();
                            }, 1000
                        );
                    break;
            
                    case 'delete':
                        scope.media.delete = true;
                    break;
            
                    case 'associate':
                        scope.media.associate = true;
                    break;
                    default: 
                    document.getElementById('video-' + scope.currentSlideIndex).play();
                }
            };

            scope.downloadVideo = function(url) {
                var a = document.createElement('a');
                a.href = url;
                a.download = url.split('/').pop();
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
            scope.deleteVideo = function (video) {
                scope.videoDeleting = true;
            
                $media.deleteVideo({ id: video.id })
                    .then(function (response) {
                        scope.videos = scope.videos.filter((p) => p.id !== video.id);
                        scope.videoDeleting = false;
                        $('#videoModal').foundation('close');
                        
                        if (response.err) {
                            scope.videos.push(video);
                        }
                    })
                    .catch(function (err) {
                        scope.videos.push(video);
                    });
            };
            scope.deleteVideos = function () {
                // Filter videos where selected is true
                const videosToDelete = scope.videos.filter((video) => video.selected);
                const videoIds = videosToDelete.map((video) => video.id);
            
                if (videoIds.length === 0) {
                    return;
                }
            
                scope.videosDeleting = true;
            
                $media.deleteVideos({ ids: videoIds })
                    .then(function (response) {
                        scope.selectPhotos = false;
                        scope.videosDeleting = false;
                        scope.videosDeleteComfirm = false;
            
                        if (!response.err) {
                            // Remove successfully deleted videos from the list
                            scope.videos = scope.videos.filter((video) => !videoIds.includes(video.id));
                        } else {
                            console.error('Error deleting videos:', response.msg);
                        }
                    })
                    .catch(function (err) {
                        scope.videosDeleting = false;
                        console.error('Error deleting videos:', err);
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
                        videoId: scope.video.id, // Use video.id instead of media.id
                    }));
            
                $media.associateVideo(data) // Update the API call to associateVideo
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.error('Error associating video:', error);
                    });
            };
            
            scope.$on('toggleVideoSelection', function(videos, data) {
                scope.selectVideos = !scope.selectVideos;
            });
        }
    };
}]);
