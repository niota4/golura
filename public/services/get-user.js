angular.module('ngUsers', [])
.factory(
    '$user', 
    [
        '$rootScope',
        '$http', 
        '$cookies', 
        '$log', 
        '$window',
        function (
            $rootScope, 
            $http, 
            $cookies, 
            $log, 
            $window
        ) {

            return {
                setUser: function (user) {

                    $rootScope.user = user;
                    
                    // Only store essential user data in cookie to avoid size limit
                    const essentialUserData = {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        token: user.token,
                        roleId: user.roleId,
                        companyId: user.companyId,
                        profilePictureUrl: user.profilePictureUrl,
                        loggedIn: true
                    };
                    
                    // Set secure cookie with proper flags
                    var cookieOptions = {
                        secure: true,      // Only send over HTTPS
                        httpOnly: true,    // Prevent XSS access via JavaScript
                        sameSite: 'strict' // CSRF protection
                    };
                    
                    // For development only - remove in production
                    if (location.protocol === 'http:') {
                        cookieOptions.secure = false;
                    }
                    
                    $cookies.putObject('goluraUser', essentialUserData, cookieOptions);
                    $rootScope.$broadcast('currentUserLoaded', user);
                },
                setPages: function (pages) {

                    $rootScope.pages = pages;
                    // Don't store pages in cookies due to size constraints
                    // Pages will be fetched fresh on each session
                    $rootScope.$broadcast('currentPagesLoaded', pages);
                },
                setPage: function (page) {

                    $rootScope.page = page;
                    // Don't store page in cookies due to size constraints
                    $rootScope.$broadcast('currentPageLoaded', page);
                },
                setPermissions: function (permissions) {

                    $rootScope.permissions = permissions;
                    // Don't store permissions in cookies due to size constraints  
                    // Permissions will be fetched fresh on each session
                    $rootScope.$broadcast('currentPermissionsLoaded', permissions);
                },
                createUser: function (data) {
                    return $http.post('/users/user', data)
                    .then(
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                createReminder: function (data) {
                    return $http.post('/users/user/reminders/reminder/create', data)
                    .then(
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                createFolder: function (data) {
                    return $http.post('/users/user/folders/folder/create', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                createDocument: function (data) {
                    return $http.post('/users/user/documents/document/create', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                logIn: function (user) {
                    return $http.post('/users/user/login', user)
                    .then(
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                logOut: function (user) {
                    return $http.post('/users/user/logout', user)
                    .then(
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                validateUser: function (u) {
                    return $http.post('/users/user/validate', u)
                    .then(
                        function (result) {
                            var data = result.data;
                            return data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                resetPassword: function (data) {
                    return $http.post('/users/user/password/reset', data)
                    .then(
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getUser: function (data) {
                    return $http.post(
                        '/users/user/get',
                        data
                    )
                    .then( 
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getUserFromCookie: function() {
                    try {
                        const essentialUser = $cookies.getObject('goluraUser');
                        if (essentialUser && typeof essentialUser === 'object' && essentialUser.id) {
                            // Create a user object with essential data from cookie
                            const user = {
                                id: essentialUser.id,
                                email: essentialUser.email,
                                firstName: essentialUser.firstName,
                                lastName: essentialUser.lastName,
                                token: essentialUser.token,
                                roleId: essentialUser.roleId,
                                companyId: essentialUser.companyId,
                                profilePictureUrl: essentialUser.profilePictureUrl || null,
                                loggedIn: true
                            };
                            $rootScope.user = user;
                            return user;
                        }
                        // Return null if no valid user data
                        $rootScope.user = null;
                        return null;
                    } catch (error) {
                        console.error('Error reading user cookie:', error);
                        $rootScope.user = null;
                        return null;
                    }
                },
                getReminder: function (data) {
                    return $http.post(
                        '/users/user/reminders/reminder/get',
                        data
                    )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getFolder: function (data) {
                    return $http.post('/users/user/folders/folder/get', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getDocument: function (data) {
                    return $http.post('/users/user/documents/document/get', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getWeather: function (data) {
                    return $http.post(
                        '/users/user/weather/get',
                        data
                    )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getPayStub: function(data) {
                    return $http.post('/users/user/pay-stub/get', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getUsers: function () {
                    return $http.post('/users')
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getGroups: function () {
                    return $http.post(
                        '/users/user/groups'
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getNotifications: function () {
                    return $http.post(
                        '/users/user/notifications'
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getReadNotifications: function () {
                    return $http.post(
                        '/users/user/notifications/read-notifications'
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getEventTypes: function () {
                    return $http.post(
                        '/users/user/event-types'
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getPages: function () {
                    return $http.post(
                        '/users/user/pages'
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getPermissions: function () {
                    return $http.post(
                        '/users/user/permissions'
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            
                            return err;
                        }
                    );
                },
                getPreferences: function () {
                    return $http.post(
                        '/users/user/preferences'
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getOnboarding: function () {
                    return $http.post(
                        '/users/user/onboarding'
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getWidgets: function () {
                    return $http.post(
                        '/users/user/widgets'
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getDevices: function () {
                    return $http.post(
                        '/users/user/devices'
                    )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getCounts: function () {
                    return $http.post(
                        '/users/user/counts'
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getReminders: function () {
                    return $http.post(
                        '/users/user/reminders'
                    )
                    .then(
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getFolders: function (data) {
                    return $http.post('/users/user/folders', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getDocuments: function (data) {
                    return $http.post('/users/user/documents', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getEstimates: function (data) {
                    return $http.post('/users/user/estimates', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getEstimators: function (data) {
                    return $http.post('/users/user/estimators', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getEvents: function (data) {
                    return $http.post('/users/user/events', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getStatistics: function (data) {
                    return $http.post('/users/user/statistics', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getPayRates: function (data) {
                    return $http.post('/users/user/pay-rates', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getCredentials: function (data) {
                    return $http.post('/users/user/credentials/get', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getPayStubs: function(data) {
                    return $http.post('/users/user/pay-stubs', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                getChatRooms: function (data) {
                    return $http.post('/users/user/chats/rooms', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                searchUser: function (d, u) {
                    return $http
                        .post(
                            '/api/users/user/search',
                            d
                        )
                        .then(
                            function (response) {
                                return response.data;
                            }
                        )
                },
                sendValidateEmail: function (data) {
                    return $http.post(
                        '/users/user/validate/email',
                        data
                    )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                sendPasswordResetEmail: function (data) {
                    return $http.post(
                        '/users/user/password/reset/email',
                        data
                    )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                setupUser: function (data) {
                    return $http.put(
                        '/users/user/setup',
                        data
                    )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                restoreUser: function (data) {
                    return $http.post(
                        '/users/user/restore',
                        data
                    )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                addWidget: function (data) {
                    return $http.put(
                        '/users/user/widget/add', 
                        data
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                addUserPayRate: function(data) {
                    return $http.put('/users/user/pay-rates/add', data)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                removeWidget: function (data) {
                    return $http.post(
                        '/users/user/widget/remove', 
                        data
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                updateUser: function (data) {
                    return $http.put(
                        '/users/user', 
                        data
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                updateUserWidget: function (data) {
                    return $http.put(
                        '/users/user/widget', 
                        data
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                updatePreferences: function (p) {
                    return $http.put(
                        '/users/user/preferences', 
                        p
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                updateOnboard: function (data) {
                    return $http.put(
                        '/users/user/onboard', 
                        data
                    )
                    .then( 
                        function (result) {
                            return result.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                updateFolder: function (data) {
                    return $http.put('/users/user/folders/folder/update', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                updateDocument: function (data) {
                    return $http.put('/users/user/documents/document/update', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                updateUserPayRate: function(data) {
                    return $http.put('/users/user/pay-rates/update', data)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                updateUserCredentials: function (data) {
                    return $http.put('/users/user/credentials/update', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                updateUserPermissions: function (data) {
                    return $http.put('/users/user/permissions', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                deleteUser: function (data) {
                    return $http.post(
                        '/users/user/delete', 
                        data
                    )
                    .then( 
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                deleteReminders: function (data) {
                    return $http.post(
                        '/users/user/reminders/delete',
                        data
                    )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                deleteReminder: function (data) {
                    return $http.post(
                        '/users/user/reminders/reminder/delete', 
                        data
                    )
                    .then( 
                        function (response) {
                            return response.data;
                        }
                    ).catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                deleteFolder: function (data) {
                    return $http.post('/users/user/folders/folder/delete', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                deleteDocument: function (data) {
                    return $http.post('/users/user/documents/document/delete', data)
                    .then(function (response) {
                        return response.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                removeUser: function() {
                    $rootScope.user = null;
                    $rootScope.page = null
                    $rootScope.routeHistory = null;
                    $rootScope.pages = [];
                    
                    // Remove from cookies (only user data is stored in cookies now)
                    $cookies.remove('goluraUser');
                    
                    // Remove from localStorage (for backward compatibility)
                    $window
                    .localStorage
                    .removeItem('routeHistory');
                    $window
                    .localStorage
                    .removeItem('goluraUser');
                    $window
                    .localStorage
                    .removeItem('goluraPendingUser');
                    $window
                    .localStorage
                    .removeItem('goluraPages');
                    $window
                    .localStorage
                    .removeItem('goluraPermissions');
                    $window
                    .localStorage
                    .removeItem('goluraToken');
                    $window
                    .localStorage
                    .removeItem('theme');
                    $window
                    .localStorage
                    .removeItem('routeHistory');

                },
                removeDevice: function (data) {
                    return $http.post('/users/user/device/remove', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                removeProfilePicture: function (data) {
                    return $http.post('/users/user/profile-picture/remove', data)
                    .then(function (result) {
                        return result.data;
                    }).catch(function (err) {
                        return err;
                    });
                },
                removeUserPayRate: function(data) {
                    return $http.post('/users/user/pay-rates/remove', data)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                readNotifications: function(data) {
                    return $http.put('/users/user/notifications/read', data)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                readNotification: function(data) {
                    return $http.put('/users/user/notifications/notification/read', data)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
            };
        }
    ]
);