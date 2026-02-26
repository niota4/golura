angular.module('ngDocumentUploader', ['ngUploaders'])
.directive('documentUploader', ['$rootScope', '$uploader', '$timeout', '$compile', '$media', function($rootScope, $uploader, $timeout, $compile, $media) {
    return {
        restrict: 'E',
        scope: {
            clientId: '@',
            eventId: '@',
            marketingId: '@',
            estimateId: '@',
            userDrive: '@?',
            folderId: '@',
        },
        template: `
            <button 
                class="add-documents-button button success white-text" 
                ng-class="{'expanded': isMobile}"
                type="button" 
                ng-click="openUploaderModal()"
            >
                <i class="fal fa-plus-circle"></i>
                <span>Add Documents</span>
            </button>
            <input id="documentUploaderInput" type="file" accept=".pdf,.doc,.docx,.txt,.xlsx, image/*" multiple style="display: none" />
        `,
        controller: ['$scope', function($scope) {
            $scope.uploadProgress = {};
            $scope.errMessages = [];
            $scope.files = [];
            $scope.document = { title: '' };
            $scope.isMobile = $media.getMedia();

            var modalHtml = `<div class="reveal" id="documentUploaderModal" data-reveal data-close-on-click="false">
                <button class="close-button" aria-label="Close modal" type="button" data-close>
                    <span aria-hidden="true">
                        <i class="fal fa-times-circle"></i>
                    </span>
                </button>
                <div class="document-uploader-container uploader-container golura-form">
                    <div class="grid-y">
                        <div class="cell shrink">
                            <h3 class="text-center"><b>Upload Documents</b></h3>
                        </div>
                        <div class="cell small-12 medium-12 large-12">
                            <div 
                                class="document-preview-container preview-container"
                                ng-show="files.length"
                            >
                                <div class="grid-x grid-margin-x align-top">
                                    <div class="cell small-6 medium-4 large-4" ng-repeat="file in files track by $index">
                                        <div 
                                            class="document-container text-center"
                                            title="{{file.name}}"
                                        >
                                            <i class="{{getFileIcon(file)}}" style="font-size: 3rem;"></i>
                                            <div class="file-name">{{file.name}}</div>
                                            <div class="progress success" role="progressbar" ng-if="uploadProgress[file.name] !== undefined">
                                                <div class="progress-meter" ng-style="{'width': uploadProgress[file.name] + '%'}"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="cell shrink">
                            <div class="grid-x grid-margin-x align-middle">
                                <div class="cell small-12 medium-auto large-auto">
                                    <label class="file-uploader button expanded">
                                        <input id="documentUploader" type="file" accept=".pdf,.doc,.docx,.txt,.xlsx, image/*" multiple ng-model="files" />
                                        <i class="fal fa-plus-circle"></i>
                                        <span>Add Documents</span>
                                    </label>
                                </div>
                                <div class="cell small-12 medium-auto large-auto" ng-if="files.length">
                                    <button 
                                        class="upload-documents-button upload button expanded success white-text" 
                                        type="button" 
                                        ng-click="uploadFiles()"
                                        ng-disabled="userDrive && files.length === 0 || !files.length"
                                    >
                                        Upload Documents
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            $scope.openUploaderModal = function() {
                var modalElement = $compile(modalHtml)($scope);
                angular.element(document.body).append(modalElement);
                $(document).foundation(); // Initialize Foundation
                $timeout(function() {
                    $('#documentUploaderModal').foundation('open');
                    document.getElementById('documentUploaderInput').click();

                    $('#documentUploaderModal').on('closed.zf.reveal', function() {
                        $timeout(function() {
                            $scope.files = [];
                            $scope.uploadProgress = {};
                            $scope.errMessages = [];
                            $scope.document.title = ''; // Reset document title
                        });
                        $('#documentUploaderModal').parent().remove();
                    });

                    $('#documentUploaderInput').on('change', function(event) {
                        $scope.prepareFiles(event);
                    });
                });
            };

            $scope.getFileIcon = function(file) {
                const extension = file.name.split('.').pop().toLowerCase();
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

            $scope.prepareFiles = function(event) {
                const files = event.target.files;
                $scope.files = [];

                Array.from(files).forEach(file => {
                    $timeout(() => {
                        $scope.files.push(file);
                        $scope.$applyAsync();
                    });
                });
            };

            $scope.uploadFiles = async function() {
                if ($scope.files.length === 0) return;
                var type = 'documents';
                if ($scope.userDrive) {
                    type = 'userDrive'
                }
                $uploader.uploadFile($scope.files, $scope.clientId, $scope.eventId, $scope.marketingId, $scope.estimateId, type, (progress, fileName) => {
                    $timeout(() => {
                        $scope.uploadProgress[fileName] = Math.round(progress);
                    });
                }, null, null, null, parseInt($scope.folderId), $scope.document.title).then((responses) => {
                    $timeout(() => {
                        responses.forEach(response => {
                            if (response.err) {
                                $scope.errMessages.push(`File: ${response.fileName}, Error: ${response.msg}`);
                            }
                        });
                        if (!$scope.errMessages.length) {
                            $rootScope.$broadcast('documentsUploaded', { clientId: $scope.clientId, eventId: $scope.eventId, marketingId: $scope.marketingId, estimateId: $scope.estimateId });
                            $('#documentUploaderModal').foundation('close');
                        }
                    });
                }).catch((error) => {
                    $timeout(() => {
                        $scope.errMessages.push(`File: ${error.fileName}, Error: ${error.msg}`);
                    });
                });
            };
            $scope.$watch('folderId', function(newVal) {
                if (newVal) {
                    $scope.folderId = newVal;
                }
            });
        }]
    };
}]);
