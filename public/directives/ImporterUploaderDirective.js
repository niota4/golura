angular.module('ngImporterUploader', ['ngUploaders'])
.directive('importerUploader', ['$rootScope', '$uploader', '$timeout', '$compile', function($rootScope, $uploader, $timeout, $compile) {
    return {
        restrict: 'E',
        scope: {
            subType: '@',
        },
        template: `
            <button 
                class="add-csv-button button white-text" 
                type="button" 
                ng-click="openUploaderModal()"
            >
                <i class="fal fa-plus-circle"></i>
                <span>Import CSV</span>
            </button>
            <input id="importerUploaderInput" type="file" accept=".csv" style="display: none" />
        `,
        controller: ['$scope', function($scope) {
            $scope.uploadProgress = {};
            $scope.errMessages = [];
            $scope.files = [];
            var modalHtml = `<div class="reveal" id="importerUploaderModal" data-reveal data-close-on-click="false">
                <button class="close-button" aria-label="Close modal" type="button" data-close>
                    <span aria-hidden="true">
                        <i class="fal fa-times-circle"></i>
                    </span>
                </button>
                <div class="importer-uploader-container uploader-container">
                    <div class="grid-y">
                        <div class="cell shrink">
                            <h3 class="text-center"><b>Import CSV</b></h3>
                        </div>
                        <div class="cell small-12 medium-12 large-12">
                            <div class="import-preview-container preview-container">
                                <div class="grid-x grid-margin-x align-middle">
                                    <div class="cell small-6 medium-4 large-4" ng-repeat="file in files track by $index">
                                        <div 
                                            class="import-container text-center"
                                            title="{{file.name}}"
                                        >
                                            <i class="fa-solid fa-file-csv" style="font-size: 3rem;"></i>
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
                                        <input id="importerUploader" type="file" accept=".csv" ng-model="files" />
                                        <i class="fal fa-plus-circle"></i>
                                        <span>Add CSV</span>
                                    </label>
                                </div>
                                <div class="cell small-12 medium-auto large-auto" ng-if="files.length">
                                    <button class="upload-csv-button upload button expanded success white-text" type="button" ng-click="uploadFiles()">Upload CSV</button>
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
                    $('#importerUploaderModal').foundation('open');
                    document.getElementById('importerUploaderInput').click();

                    $('#importerUploaderModal').on('closed.zf.reveal', function() {
                        $timeout(function() {
                            $scope.files = [];
                            $scope.uploadProgress = {};
                            $scope.errMessages = [];
                        });
                        $('#importerUploaderModal').parent().remove();
                    });

                    $('#importerUploaderInput').on('change', function(event) {
                        $scope.prepareFiles(event);

                        event.target.value = '';
                    });

                    $('#importerUploader').on('change', function(event) {
                        $scope.prepareFiles(event);

                        event.target.value = '';
                    });
                });
            };

            $scope.prepareFiles = function(event) {
                const files = event.target.files;

                Array.from(files).forEach(file => {
                    $timeout(() => {
                        $scope.files.push(file);
                        $scope.$applyAsync();
                    });
                });
            };

            $scope.uploadFiles = function() {
                if ($scope.files.length === 0) return;

                $uploader.uploadFile($scope.files, null, null, null, null, 'import', (progress, fileName) => {
                    $timeout(() => {
                        $scope.uploadProgress[fileName] = Math.round(progress);
                    });
                }, null, $scope.subType).then((responses) => {
                    $timeout(() => {
                        responses.forEach(response => {
                            if (response.err) {
                                $scope.errMessages.push(`File: ${response.fileName}, Error: ${response.msg}`);
                            }
                        });
                        if (!$scope.errMessages.length) {
                            $rootScope.$broadcast('csvUploaded', { msg: `(${responses[0].count}) Items has been imported`, subType: $scope.subType });
                            $('#importerUploaderModal').foundation('close');
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
