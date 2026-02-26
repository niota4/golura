angular.module('ngUserIcon', [])
.directive('userIcon', ['$rootScope', '$timeout', '$compile', function($rootScope, $timeout, $compile) {
    return {
        restrict: 'E',
        scope: {
            user: '=',
            preferences: '='
        },
        template: `
            <div class="golura-user-icon-container text-center frame-container">
                <div 
                    class="golura-user-icon text-center" 
                    title="{{user.firstName + ' ' + user.lastName}}"
                    ng-style="{'background-color': user.profilePictureUrl ? 'transparent' : (preferences.backgroundColor || user.Preferences.backgroundColor), 'background-image': user.profilePictureUrl ? 'url(' + user.profilePictureUrl + ')' : 'none'}"
                    ng-click="openUserIconModal()"
                >
                    <h2 class="flex-child-auto align-middle white-text" ng-if="!user.profilePictureUrl">
                        {{user.shortName}}
                    </h2>
                </div>
            </div>
        `,
        controller: ['$scope', function($scope) {
            var modalHtml = `<div class="reveal" id="userIconModal" data-reveal data-close-on-click="false">
                <button class="close-button" aria-label="Close modal" type="button" data-close>
                    <span aria-hidden="true">
                        <i class="fal fa-times-circle"></i>
                    </span>
                </button>
                <div class="user-icon-modal-content">
                    <div class="golura-user-icon-container text-center frame-container">
                        <div 
                            class="golura-user-icon text-center" 
                            title="{{user.firstName + ' ' + user.lastName}}"
                            ng-style="{'background-color': user.profilePictureUrl ? 'transparent' : (preferences.backgroundColor || user.Preferences.backgroundColor), 'background-image': user.profilePictureUrl ? 'url(' + user.profilePictureUrl + ')' : 'none'}"
                            ng-click="openUserIconModal()"
                        >
                            <h2 class="flex-child-auto align-middle white-text" ng-if="!user.profilePictureUrl">
                                {{user.shortName}}
                            </h2>
                        </div>
                    </div>
                        <h3 class="text-center">
                            <a href="/users/user/{{user.id}}">
                                {{user.firstName + ' ' + user.lastName}}
                            </a>
                        </h3>
                        <h4 class="text-capitalize text-center">
                            <b>
                                {{user.Role.name}}
                            </b>
                        </h4>
                        <h6 class="text-center">
                            <b>Phone: </b>
                            <button
                                class="phone-number-button"
                                ng-model="user.phoneNumber"
                                ng-if="user.phoneNumber"
                                ng-cloak
                                phone-number
                            >
                                {{user.phoneNumber}}
                            </button>
                            <span ng-if="!user.phoneNumber">
                                N/A
                            </span>
                        </h6>
                        <h6 class="text-center">
                            <b>Email: </b>
                            <span ng-if="user.email">
                                {{user.email}}
                            </span>
                            <span ng-if="!user.email">
                                N/A
                            </span>
                        </h6>
                        <hr/>
                    </div>
                    <h6 class="text-center">
                        <b>
                            Last Seen: 
                        </b>
                        <span>
                            {{user.lastSeen | TimeAgoFormat}}
                        </span>
                    </h6>
                    <div class="text-right">
                        <a
                            class="user-icon-view-button button"
                            href="/users/user/{{user.id}}"
                            ng-if="user.id"
                            ng-cloak
                            data-close
                        >
                            <i class="fal fa-search"></i> View Profile
                        </a>
                    </div>
                </div>
            </div>`;

            $scope.openUserIconModal = function() {
                var modalElement = $compile(modalHtml)($scope);
                angular.element(document.body).append(modalElement);
                $(document).foundation(); // Initialize Foundation

                $timeout(function() {
                    $('#userIconModal').foundation('open');

                    $('#userIconModal').on('closed.zf.reveal', function() {
                        $timeout(function() {
                            $('#userIconModal').parent().remove();
                        });
                    });
                });
            };
        }]
    };
}]);
