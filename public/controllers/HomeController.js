define(['app-controller'], function (app) {
    app.register.controller('HomeController',
    function (
        $scope,
        $rootScope,
        $location,
        $window,
        $timeout,
        $user,
        $setup,
        $media
    ) {
        // Only set user from cookie if it's not already set
        if (!$rootScope.user) {
            $rootScope.user = $user.getUserFromCookie() || null;
        }
        $scope.user = {
            email: null,
            password: null
        };
        $scope.currentYear = new Date().getFullYear();
        $scope.UI = { 
            timeOut: true,
            isMobile: $media.getMedia(),
            connectionError: null, 
            loginView: false,
            loginError: null,
            loginAttempt: null,
            loginMessage: null,
            formSaving: false,
            passwordResetSent: false,
            errMessage: null
        };
        $scope.initHome = function () {
            $scope.UI.timeOut = false;
            $scope.UI.connectionError = false;
            $scope.UI.loginView = false;
            $scope.UI.loginError = false;
            $scope.UI.loginAttempt = false;
            $scope.UI.loginMessage = null;
            $scope.UI.formSaving = false;
            $scope.UI.passwordResetSent = false;
            $scope.UI.errMessage = null;

            $scope.user = {
                email: null,
                password: null
            };
            var host = $location.host();
            var parts = host.split('.');
            var subDomain = null;

            if (parts.length > 2) {
                subDomain = parts[0];
                if (subDomain === 'www' || subDomain === 'app') {
                    subDomain = null; // ignore www subdomain
                }
            } else {
                subDomain = null;
            }
            if (subDomain) {
                $setup.getCompanyByName({subDomain: subDomain, name: subDomain})
                .then(
                    function (response) {
                        if (response.err) {
                            $rootScope.UI.errMessage = response.msg || 'Error loading company information.';
                            return;
                        }
                        $rootScope.company = response.company;
                    }
                );
            }
        };
        $scope.initCompanyCheck = function (e, company) {
            if (e) {
                e.preventDefault();
            };
            if (!company) {
                $scope.UI.errMessage = 'Please enter a company name.';
                return;
            };
            $scope.UI.formSaving = false;
            $scope.UI.errMessage = null;

            $setup.getCompanyByName({
                name: company,
                subDomain: company
            })
            .then(
                function (response) {
                    if (!response.err) {
                        $rootScope.company = response.company;
                    }
                    else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while fetching company information.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while fetching company information.';
                }
            );
        };
        $scope.login = function (e, u) {
            var user = {};
            if (e) {
                e.preventDefault();
            }
            if (!u.email || !u.password) {
                $scope.UI.loginError = true;
                $scope.UI.loginMessage = 'Please enter your email and password.';
                return;
            };
            if ($rootScope.company) {
                u.companyId = $rootScope.company.id;
            };
            $scope.UI.loginAttempt = true;
            $scope.UI.loginError = false;
            $user.logIn(u)
            .then( 
                function (response) {
                    if (response.err) {
                        $scope.UI.loginAttempt = false;
                        $scope.UI.loginError = true;
                        $scope.UI.loginMessage = response.msg;
                        return;
                    };
                    user = response.user;
                    user.token = response.token;
                    $user.setUser(user);
                    // Ensure the rootScope user is set immediately
                    $rootScope.user = user;
                }
            );
        };
        $scope.sendPasswordReset = function (email) {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.passwordResetSent = false;

            $user.sendPasswordResetEmail({email: email})
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.UI.forgotPassword = false;
                        $scope.UI.passwordResetSent = true;
                    }
                    else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while sending the password reset email.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while sending the password reset email.';
                }
            );
        };
        $scope.reset = function () {
            if ($scope.loginForm){
                $scope.loginForm.$setValidity("notFound", true);
                $scope.loginForm.$setValidity("serverError", true);
            }
        };
        $rootScope.$on(
            'currentUserLoaded',
            function (event, user) {
                // Add a small delay to ensure user state is propagated
                $timeout(function() {
                    $window.location.href = '/dashboard';
                }, 50);
            }
        );

        $scope.initFormSaved = function (msg) {
            $scope.UI.formSaved = true;
            $scope.UI.message = msg;
            
            $timeout(
                function () {
                    $scope.UI.message = null;
                    $scope.UI.formSaved = false;
                }, 3000
            );
        };
        $scope.initErrorMessage = function (msg) {
            $scope.UI.errMessage = msg;

            $timeout(
                function () {
                    $scope.UI.errMessage = null;
                }, 3000
            );
        };
    });
});
