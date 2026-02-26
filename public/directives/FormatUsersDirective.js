angular.module(
    'ngUsersFormat', 
    []
).directive('formatUsers', function() {
    return {
        restrict: 'A',
        scope: {
            users: '=',
            user: '='
        },
        link: function(scope) {
            function setFullNameAndShortName(user) {
                if (!user.fullName) {
                    user.fullName = user.firstName + ' ' + user.lastName;
                }
                if (
                    user.firstName &&
                    user.lastName
                ) {
                    user.shortName = user.firstName.substring(0, 1) + user.lastName.substring(0, 1);
                };
            }

            function processUsers(users) {
                users.forEach(function(user) {
                    setFullNameAndShortName(user);
                });
            }

            function processUser(user) {
                setFullNameAndShortName(user);
            }

            scope.$watch('users', function(newUsers) {
                if (newUsers) {
                    processUsers(newUsers);
                }
            }, true);

            scope.$watch('user', function(newUser) {
                if (newUser) {
                    processUser(newUser);
                }
            }, true);
        }
    };
});
