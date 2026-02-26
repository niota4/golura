angular.module('ngVideoUploader', ['ngUploaders'])
.directive('videoUploader', ['$rootScope', '$uploader', '$timeout', '$compile', '$sce', '$media', function($rootScope, $uploader, $timeout, $compile, $sce, $media) {
    return {
        restrict: 'E',
        scope: {
            clientId: '@',
            eventId: '@',
            marketingId: '@',
            estimateId: '@'
        },
        template: `
            <button 
                class="add-videos-button button success white-text" 
                ng-class="{'expanded': isMobile}"
                type="button" 
                ng-click="openUploaderModal()"
            >
                <i class="fal fa-plus-circle"></i>
                <span>Add Videos</span>
            </button>
            <input id="videoUploaderInput" type="file" accept="video/*" multiple style="display: none" />
        `,
        controller: ['$scope', function($scope) {
            $scope.uploadProgress = {};
            $scope.errMessages = [];
            $scope.files = [];
            $scope.isMobile = $media.getMedia();

            var modalHtml = `<div class="reveal" id="videoUploaderModal" data-reveal data-close-on-click="false">
                <button class="close-button" aria-label="Close modal" type="button" data-close>
                    <span aria-hidden="true">
                        <i class="fal fa-times-circle"></i>
                    </span>
                </button>
                <div class="video-uploader-container uploader-container">
                    <div class="grid-y">
                        <div class="cell shrink">
                            <h3 class="text-center"><b>Upload Videos</b></h3>
                        </div>
                        <div class="cell small-12 medium-12 large-12">
                            <div class="video-preview-container preview-container">
                                <div class="grid-x grid-margin-x align-middle">
                                    <div class="cell small-6 medium-4 large-4" ng-repeat="file in files track by $index">
                                        <div class="video-container">
                                            <video style="width: 100%; height: auto;" controls>
                                                <source ng-src="{{file.trustedPreview}}" type="video/mp4">
                                            </video>
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
                                        <input id="videoUploader" type="file" accept="video/*" multiple ng-model="files" />
                                        <i class="fal fa-plus-circle"></i>
                                        <span>Add Videos</span>
                                    </label>
                                </div>
                                <div class="cell small-12 medium-auto large-auto" ng-if="files.length">
                                    <button class="upload-videos-button upload button expanded success white-text" type="button" ng-click="uploadFiles()">Upload Videos</button>
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
                    $('#videoUploaderModal').foundation('open');
                    document.getElementById('videoUploaderInput').click();

                    $('#videoUploaderModal').on('closed.zf.reveal', function() {
                        $timeout(function() {
                            $scope.files = [];
                            $scope.uploadProgress = {};
                            $scope.errMessages = [];
                        });
                        $('#videoUploaderModal').parent().remove();
                    });

                    $('#videoUploaderInput').on('change', function(event) {
                        $scope.prepareFiles(event);
                    });
                });
            };

            function createPreview(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        resolve(e.target.result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            $scope.prepareFiles = function(event) {
                const files = event.target.files;
                $scope.files = [];

                Array.from(files).forEach(file => {
                    createPreview(file).then(preview => {
                        $timeout(() => {
                            file.trustedPreview = $sce.trustAsResourceUrl(preview);
                            $scope.files.push(file);
                            $scope.$applyAsync();
                        });
                    }).catch(error => {
                        console.error('Error creating preview for file:', file.name, error);
                        $timeout(() => {
                            $scope.files.push(file);
                            $scope.$applyAsync();
                        });
                    });
                });
            };

            function resizeVideo(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const blob = new Blob([e.target.result], { type: 'video/mp4' });
                        resolve(blob);
                    };
                    reader.readAsArrayBuffer(file);
                });
            }

            $scope.uploadFiles = async function() {
                if ($scope.files.length === 0) return;

                const resizedFilesPromises = $scope.files.map(file => resizeVideo(file));
                const resizedBlobs = await Promise.all(resizedFilesPromises);

                const fileObjects = resizedBlobs.map((blob, index) => {
                    const file = new File([blob], $scope.files[index].name, { type: 'video/mp4' });
                    file.trustedPreview = URL.createObjectURL(blob);
                    return file;
                });

                $uploader.uploadFile(fileObjects, $scope.clientId, $scope.eventId, $scope.marketingId, $scope.estimateId, 'videos', (progress, fileName) => {
                    $timeout(() => {
                        $scope.uploadProgress[fileName] = Math.round(progress);
                    });
                }).then((responses) => {
                    $timeout(() => {
                        responses.forEach(response => {
                            if (response.err) {
                                $scope.errMessages.push(`File: ${response.fileName}, Error: ${response.msg}`);
                            }
                        });
                        if (!$scope.errMessages.length) {
                            $rootScope.$broadcast('videosUploaded', { clientId: $scope.clientId, eventId: $scope.eventId, marketingId: $scope.marketingId, estimateId: $scope.estimateId });
                            $('#videoUploaderModal').foundation('close');
                        }
                    });
                }).catch((error) => {
                    $timeout(() => {
                        $scope.errMessages.push(`File: ${error.fileName}, Error: ${error.msg}`);
                    });
                });
            };
        }]
    };
}]);
