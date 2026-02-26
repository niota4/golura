define(['foundation', 'swiper'], function() {
    angular.module('ngDocuments', [])
        .directive('formatDocuments', ['$timeout', '$compile', '$setup', '$media', '$sce', function($timeout, $compile, $setup, $media, $sce) {
            return {
                restrict: 'E',
                scope: {
                    documents: '=',
                    events: '=?',
                    estimates: '=?',
                    marketing: '=?'
                },
                template: `
                    <h3 
                        class="text-center"
                        ng-if="!visibleDocuments.length"
                    >
                        <b>
                            Oops! 
                        </b>
                        Looks like their no Documents found!
                    </h3>
                    <div class="grid-x grid-margin-x" style="min-height: 40rem;">
                        <div 
                            class="cell small-12 medium-4 large-3 text-center" 
                            style="height: 15rem; margin-bottom: 1rem; cursor: pointer;" 
                            ng-repeat="doc in visibleDocuments track by $index" 
                        >
                            <div 
                                class="document-link"
                                ng-click="openModal($index)"
                            >
                                <i class="{{getFileIcon(doc)}}" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                                <div 
                                    class="document-name" 
                                    title="{{doc.url}}"
                                    style="                                        
                                        white-space: -moz-nowrap; /* Firefox */
                                        white-space: -o-nowrap; /* Opera */
                                        white-space: nowrap; /* Chrome */
                                        word-wrap: no-break; /* IE */
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                        width: 100%;
                                        max-height: 3rem; /* Optional: Limit the height */
                                        line-height: 1.5rem; /* Optional: Adjust line height */"
                                >
                                    <p>
                                        {{getFileName(doc.url)}}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div 
                        id="loadMoreDocuments" 
                        style="width: 100%; 
                        height: 2rem;" 
                        ng-click="loadMoreDocuments()"
                    ></div>
                `,
                link: function(scope, element) {
                    scope.document = null;
                    scope.media = null;
                    scope.selectDocuments = false;
                    scope.documentDeleting = false;
                    scope.documentsDeleting = false;
                    scope.documentsDeleteComfirm = false;
                    scope.mediaTypes = $setup.getMediaTypes();

                    function loadInitialDocuments() {
                        scope.visibleDocuments = scope.documents.slice(0, 16);
                    }

                    scope.loadMoreDocuments = function() {
                        const newDocs = scope.documents.slice(scope.visibleDocuments.length, scope.visibleDocuments.length + 8);
                        $timeout(function() {
                            scope.visibleDocuments = scope.visibleDocuments.concat(newDocs);
                            scope.$apply();
                        });
                    };

                    function createObserver() {
                        const observer = new IntersectionObserver(function(entries) {
                            if (entries[0].isIntersecting === true) {
                                entries.forEach(function(entry) {
                                    if (entry.isIntersecting) {
                                        scope.loadMoreDocuments();
                                    }
                                });
                            }
                        }, { threshold: [0] });
                        observer.observe(document.getElementById('loadMoreDocuments'));
                    }

                    scope.$watch('documents', function(newVal) {
                        if (newVal) {
                            loadInitialDocuments();
                            createObserver();
                        }
                    }, true);

                    scope.getFileIcon = function(doc) {
                        if (!doc || !doc.url) {
                            return 'fal fa-file text-secondary'; // Default icon for undefined or invalid documents
                        }
                        const extension = doc.url.split('.').pop().toLowerCase();
                        switch (extension) {
                            case 'pdf': return 'fal fa-file-pdf text-danger';
                            case 'doc':
                            case 'docx': return 'fal fa-file-word text-primary';
                            case 'xlsx':
                            case 'xls': return 'fal fa-file-excel text-success';
                            case 'txt': return 'fal fa-file-alt text-muted';
                            case 'jpg':
                            case 'jpeg':
                            case 'png':
                            case 'gif': return 'fal fa-file-image text-info';
                            default: return 'fal fa-file text-secondary';
                        }
                    };

                    scope.getFileName = function(url) {
                        if (!url) return 'Unknown File';
                        const pathParts = url.split('/');
                        return pathParts[pathParts.length - 1]; // Return the last part of the URL (file name with extension)
                    };

                    scope.openModal = function(index) {
                        const doc = scope.documents[index];
                        const modalHtml = `
                            <div 
                                class="document-reveal media-reveal reveal" 
                                id="documentReveal" 
                                data-reveal 
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
                                            class="swiper-slide" 
                                            ng-repeat="doc in documents track by $index"
                                        >
                                            <div
                                                class="golura-block"
                                                ng-if="isSupported(doc.url)"
                                            >
                                                <embed 
                                                    ng-src="{{getTrustedUrl(doc.url)}}" 
                                                    style="width: 100%; height: 100%; border: none;" 
                                                    title="{{getFileName(doc.url)}}"
                                                />
                                            </div>
                                            <div class="button-container">
                                                <button 
                                                    class="download-button button white-button" 
                                                    type="button" 
                                                    ng-click="downloadVideo(document.url)"
                                                    ng-if="!document.options"
                                                >
                                                    <b>
                                                        <i class="fal fa-cloud-arrow-down"></i> 
                                                        <span ng-if="!$root.UI.isMobile">
                                                            Download
                                                        </span>
                                                    </b>
                                                </button>
                                                <button 
                                                    class="download-button button warning white-text"
                                                    type="button"
                                                    ng-class="{'float-right': $root.UI.isMobile,
                                                    'white-text': !$root.UI.isMobile}"
                                                    ng-click="initTabs('options')"
                                                    ng-if="!document.options"
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
                                                class="document-delete-confirm-overlay media-overlay black-overlay"
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
                                                                    this Document?
                                                                </span>
                                                            </h4>
                                                        </div>
                                                        <div class="cell small-12 medium-12 large-12">
                                                            <button 
                                                                class="delete-estimate-button button alert white-text"
                                                                type="button"
                                                                ng-disabled="documentDeleting"
                                                                ng-class="{'form-alert': documentDeleting}"
                                                                ng-click="deleteDocument(document)"
                                                            >
                                                                <span ng-if="!documentDeleting">
                                                                    <i class="fal fa-check-circle"></i> Confirm
                                                                </span>
                                                                <span ng-if="documentDeleting">
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
                                                    <div ng-include="'dist/partials/media/document-details.html'"></div>
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
                                </div>

                            </div>
                        `;

                        const modalElement = $compile(modalHtml)(scope);
                        angular.element(document.body).append(modalElement);

                        const modal = angular.element('#documentReveal');
                        modal.foundation();

                        $timeout(function() {
                            const swiper = new Swiper('.swiper-container', {
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
                        
                            swiper.slideTo(index, 0, false); // Move to the specified slide without animation
                            swiper.on('slideChange', function () {
                                scope.$apply(function () {
                                    scope.currentIndex = swiper.realIndex;
                                });
                            });
                            scope.documentModel = true;
                            scope.media = null;

                            scope.document = scope.documents && scope.documents[index] ? scope.documents[index] : null;
                            
                            if (!scope.events) {
                                scope.events = [];
                            };
                            if (!scope.estimates) {
                                scope.estimates = [];
                            };
                            if (!scope.marketing) {
                                scope.marketing = [];
                            };
                            $media.getDocument(scope.document)
                            .then(
                                function (response) {
                                    scope.document = response.document;
                                    scope.document.childDocuments = response.childDocuments;
    
                                    if (scope.document) {
                                        // Mark the corresponding event and estimate as selected for the current document
                                        if (Array.isArray(scope.events) && scope.events.length) {
                                            scope.events.forEach(event => {
                                                if (event.id === scope.document.eventId) {
                                                    event.selected = true;
                                                }
                                            });
                                        }

                                        if (Array.isArray(scope.estimates) && scope.estimates.length) {
                                            scope.estimates.forEach(estimate => {
                                                if (estimate.id === scope.document.estimateId) {
                                                    estimate.selected = true;
                                                }
                                            });
                                        }
        
                                        // Additionally, mark events and estimates associated with childDocuments as selected
                                        if (scope.document.childDocuments && Array.isArray(scope.document.childDocuments)) {
                                            scope.document.childDocuments.forEach(childDocument => {
                                                if (Array.isArray(scope.events) && scope.events.length) {
                                                    scope.events.forEach(event => {
                                                        if (event.id === childDocument.eventId) {
                                                            event.selected = true;
                                                        }
                                                    });
                                                }
                                                if (Array.isArray(scope.estimates) && scope.estimates.length) {
                                                    scope.estimates.forEach(estimate => {
                                                        if (estimate.id === childDocument.estimateId) {
                                                            estimate.selected = true;
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }
                            )
                        }, 0);


                        modal.on('closed.zf.reveal', function() {
                            modal.remove();
                        });

                        modal.foundation('open');
                    };

                    scope.getTrustedUrl = function(url) {
                        return $sce.trustAsResourceUrl(url);
                    };
                    scope.getMimeType = function(url) {
                        const extension = url.split('.').pop().toLowerCase();
                        switch (extension) {
                            case 'pdf': return 'application/pdf';
                            case 'jpg':
                            case 'jpeg': return 'image/jpeg';
                            case 'png': return 'image/png';
                            case 'gif': return 'image/gif';
                            case 'webp': return 'image/webp';
                            default: return 'application/octet-stream'; // Fallback for unknown types
                        }
                    };

                    scope.isSupported = function(url) {
                        const supportedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
                        const extension = url.split('.').pop().toLowerCase();
                        return supportedExtensions.includes(extension);
                    };

                    scope.initTabs = function(type) {
                        scope.media = {};
                        if (!scope.document || !scope.document.id || !Array.isArray(scope.documents)) {
                            return;
                        }
                    
                        // Find the object in the scope.documents array by id
                        const documentIndex = scope.documents.findIndex(img => img.id === scope.document.id);
                    
                        if (documentIndex === -1) {
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
                    scope.downloadDocument = function(doc) {
                        const a = document.createElement('a');
                        a.href = doc.url;
                        a.download = scope.getFileName(doc.url);
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    };
                    scope.deleteDocument = function (document) {
                        scope.documentDeleting = true;
                    
                        $media.deleteDocument({ id: document.id })
                            .then(function (response) {
                                scope.documents = scope.documents.filter((p) => p.id !== document.id);
                                scope.documentDeleting = false;
                                $('#documentModal').foundation('close');
                                $rootScope.$broadcast('toggleDocumentSelection');
                                
                                if (response.err) {
                                    scope.documents.push(document);
                                }
                            })
                            .catch(function (err) {
                                scope.documents.push(document);
                            });
                    };
                    scope.deleteDocuments = function () {
                        // Filter documents where selected is true
                        const documentsToDelete = scope.documents.filter((document) => document.selected);
                        const documentIds = documentsToDelete.map((document) => document.id);
                    
                        if (documentIds.length === 0) {
                            return;
                        }
                    
                        scope.documentsDeleting = true;
                    
                        $media.deleteDocuments({ ids: documentIds })
                            .then(function (response) {
                                scope.selectDocuments = false;
                                scope.documentsDeleting = false;
                                scope.documentsDeleteComfirm = false;

                                $rootScope.$broadcast('toggleDocumentSelection');
                    
                                if (!response.err) {
                                    // Remove successfully deleted documents from the list
                                    scope.documents = scope.documents.filter((document) => !documentIds.includes(document.id));
                                } else {
                                    console.error('Error deleting documents:', response.msg);
                                }
                            })
                            .catch(function (err) {
                                scope.documentsDeleting = false;
                                console.error('Error deleting documents:', err);
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
                            documentId: scope.document.id,
                        }));
                        $media.associateDocument(data)
                        .then(
                            function (response) {
                            }
                        )
                    };
                    scope.$on('toggleDocumentSelection', function(documents, data) {
                        scope.selectDocuments = !scope.selectDocuments;
                    });
                }
            };
        }]);
});
