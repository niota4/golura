angular.module('ngImageUploader', ['ngUploaders'])
.directive('imageUploader', ['$rootScope', '$uploader', '$timeout', '$compile', '$media', function($rootScope, $uploader, $timeout, $compile, $media) {
    return {
        restrict: 'E',
        scope: {
            clientId: '@?',
            eventId: '@?',
            marketingId: '@?',
            estimateId: '@?',
            userId: '@?',
            commentId: '@?',
            chatRoomId: '@?',
            message: '@?',
            toDoId: '@?',
            toDoItemIndex: '@?',
            ngDisabled: '<?',
        },
        template: `
            <button 
                class="add-images-button button success white-text" 
                ng-class="{'expanded': isMobile}"
                type="button" 
                ng-click="openUploaderModal()"
                ng-disabled="ngDisabled"
            >
                <i class="fal fa-plus-circle"></i>
                <span>Add Photos</span>
            </button>
            <input id="imageUploaderInput" type="file" accept="image/*" multiple style="display: none" />
        `,
        controller: ['$scope', function($scope) {
            $scope.uploadProgress = {};
            $scope.errMessages = [];
            $scope.files = [];
            $scope.isMobile = $media.getMedia();
            
            var modalHtml = `<div class="reveal" id="imageUploaderModal" data-reveal data-close-on-click="false">
                <button class="close-button" aria-label="Close modal" type="button" data-close>
                    <span aria-hidden="true">
                        <i class="fal fa-times-circle"></i>
                    </span>
                </button>
                <div class="image-uploader-container uploader-container">
                    <div class="grid-y">
                        <div class="cell shrink">
                            <h3 class="text-center"><b>Upload Photos</b></h3>
                        </div>
                        <div class="cell small-12 medium-12 large-12">
                            <div class="image-preview-container preview-container">
                                <div class="grid-x grid-margin-x align-middle">
                                    <div class="cell small-6 medium-4 large-4" ng-repeat="file in files track by $index">
                                        <div class="image-container">
                                            <button class="remove-button alert-text button" type="button" ng-click="files.splice($index, 1)">
                                                <i class="fal fa-times-circle"></i>
                                            </button>
                                            <div style="background-image: url('{{file.preview}}'); background-repeat: no-repeat; background-position: center; background-size: contain; border-radius: $container-radius; border-bottom-left-radius: 0px; border-bottom-right-radius: 0px; padding: 4rem;"></div>
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
                                        <input id="imageUploader" type="file" accept="image/*" multiple ng-model="files" ng-disabled="ngDisabled" />
                                        <i class="fal fa-plus-circle"></i>
                                        <span>Add Photos</span>
                                    </label>
                                </div>
                                <div class="cell small-12 medium-auto large-auto" ng-if="files.length">
                                    <button class="upload-images-button upload button expanded success white-text" type="button" ng-click="uploadFiles()" ng-disabled="ngDisabled">Upload Images</button>
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
                    $('#imageUploaderModal').foundation('open');
                    if (document.getElementById('imageUploaderInput')) {
                        document.getElementById('imageUploaderInput').click();
                    }

                    $('#imageUploaderModal').on('closed.zf.reveal', function() {
                        $timeout(function() {
                            $scope.files = [];
                            $scope.uploadProgress = {};
                            $scope.errMessages = [];
                        });
                        $('#imageUploaderModal').parent().remove();
                    });

                    $('#imageUploaderInput').on('change', function(event) {
                        $scope.prepareFiles(event);

                        event.target.value = '';
                    });

                    $('#imageUploader').on('change', function(event) {
                        $scope.prepareFiles(event);

                        event.target.value = '';
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

                Array.from(files).forEach(file => {
                    createPreview(file).then(preview => {
                        $timeout(() => {
                            file.preview = preview;
                            $scope.files.push(file);
                            $scope.$applyAsync();
                        });
                    }).catch(error => {
                        $timeout(() => {
                            $scope.files.push(file);
                            $scope.$applyAsync();
                        });
                    });
                });
            };

            function resizeImage(file, maxWidth, maxHeight) {
                return new Promise((resolve, reject) => {
                    const img = document.createElement('img');
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        img.src = e.target.result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > maxWidth) {
                                    height *= maxWidth / width;
                                    width = maxWidth;
                                }
                            } else {
                                if (height > maxHeight) {
                                    width *= maxHeight / height;
                                    height = maxHeight;
                                }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            canvas.toBlob(blob => resolve(blob), 'image/jpeg');
                        };
                    };
                    reader.readAsDataURL(file);
                });
            }

            $scope.uploadFiles = async function() {
                if ($scope.files.length === 0) return;

                const resizedFilesPromises = $scope.files.map(file => resizeImage(file, 1200, 1200));
                const resizedBlobs = await Promise.all(resizedFilesPromises);

                const fileObjects = resizedBlobs.map((blob, index) => {
                    const file = new File([blob], $scope.files[index].name, { type: 'image/jpeg' });
                    file.preview = URL.createObjectURL(blob);
                    return file;
                });
                var type = 'images';
                if ($scope.commentId) {
                    type = 'comment';
                }
                if ($scope.message) {
                    type = 'message';
                };
                if ($scope.eventId) {
                    type = 'event';
                }
                $uploader.uploadFile(fileObjects, $scope.clientId, $scope.eventId, $scope.marketingId, $scope.estimateId, type, (progress, fileName) => {
                    $timeout(() => {
                        $scope.uploadProgress[fileName] = Math.round(progress);
                    });
                }, null, $scope.userId, null, null, null, $scope.chatRoomId).then((responses) => {
                    $timeout(() => {
                        responses.forEach(response => {
                            if (response.err) {
                                $scope.errMessages.push(`File: ${response.fileName}, Error: ${response.msg}`);
                            }
                        });
                        if (!$scope.errMessages.length) {
                            $rootScope.$broadcast('photosUploaded', { clientId: $scope.clientId, eventId: $scope.eventId, marketingId: $scope.marketingId, estimateId: $scope.estimateId });

                            if ($scope.toDoId && $scope.toDoItemIndex !== undefined) {
                                $rootScope.$broadcast('toDoPhotosUploaded', { toDoId: $scope.toDoId, toDoItemIndex: $scope.toDoItemIndex, images: responses });
                            }
                            $('#imageUploaderModal').foundation('close');
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
