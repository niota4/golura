'use strict';

angular.module('ngSetup', [])
.factory(
    '$setup', 
    [
        '$rootScope',
        '$http', 
        '$cookies', 
        '$log', 
        '$q', 
        '$window',
        '$location',
        '$user',
        function (
            $rootScope, 
            $http, 
            $cookies, 
            $log, 
            $q,
            $window,
            $location,
            $user
        ) {

            return {
                getCompany: function() {
                    return $http.get('/settings/company')
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
                getCompanyByName: function(data) {
                    return $http.post('/company', data)
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
                getStates: function() {
                    return $http.get('settings/states')
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
                getDays: function() {
                    return $http.get('settings/days')
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
                getPhoneNumberTypes: function() {
                    return [
                        {
                            value: 'Home'
                        },
                        {
                            value: 'Mobile'
                        },
                        {
                            value: 'Work'
                        },
                        {
                            value: 'Other'
                        },
                    ]
                },
                getEmailTypes: function() {
                    return [
                        {
                            value: 'Personal'
                        },
                        {
                            value: 'Work'
                        },
                        {
                            value: 'Other'
                        },
                    ]
                },
                getTimeTypes: function () {
                    return [
                        {
                            value: 'hours'
                        },
                        {
                            value: 'days'
                        },
                        {
                            value: 'weeks'
                        },
                        {
                            value: 'months'
                        },
                    ]
                },
                getTemplateTypes: function () {
                    return [
                        {
                            value: 'SMS'
                        },
                        {
                            value: 'EMAIL'
                        },
                        {
                            value: 'PDF'
                        },
                    ]
                },
                getPayrollStatuses: function () {
                    return [
                        {
                            value: 'draft',
                            name: 'Draft'
                        },
                        {
                            value: 'pending',
                            name: 'Pending'
                        },
                        {
                            value: 'approved',
                            name: 'Approved'
                        },
                        {
                            value: 'paid',
                            name: 'Paid'
                        },
                        {
                            value: 'archived',
                            name: 'Archived'
                        }
                    ];
                },
                getPayRateTypes: function () {
                    return [
                        {
                            value: 'hourly',
                            name: 'Hourly'
                        },
                        {
                            value: 'daily',
                            name: 'Daily'
                        },
                        {
                            value: 'project',
                            name: 'Project'
                        },
                        {
                            value: 'fixed',
                            name: 'Fixed'
                        },
                    ]
                },
                getBankAccountTypes: function () {
                    return [
                        {
                            id: 'checking',
                            name: 'Checking'
                        },
                        {
                            id: 'savings',
                            name: 'Savings'
                        },
                    ]
                },
                getMinutes: function () {
                    return [
                        {
                            value: 5,
                            name: '5 minutes'
                        },
                        {
                            value: 10,
                            name: '10 minutes'
                        },
                        {
                            value: 15,
                            name: '15 minutes'
                        },
                        {
                            value: 30,
                            name: '30 minutes'
                        },
                        {
                            value: 60,
                            name: '1 hour'
                        },
                        {
                            value: 240,
                            name: '4 hours'
                        },
                        {
                            value: 480,
                            name: '8 hours'
                        },
                        {
                            value: 1440,
                            name: '1 day'
                        }
                    ]
                },
                getRecurrence: function () {
                    return [
                        { id: 'daily', name: 'Daily' },
                        { id: 'weekly', name: 'Weekly' },
                        { id: 'monthly', name: 'Monthly' },
                        { id: 'yearly', name: 'Yearly' },
                        { id: 'custom', name: 'Custom' }
                    ];
                },
                getMediaTypes: function() {
                    return [
                        {
                            value: 'event'
                        },
                        {
                            value: 'estimate'
                        },
                        {
                            value: 'marketing'
                        },
                    ]
                },
                getEventSchedulerModes: function () {
                    return [
                        { id: 'unit', name: 'Day' },
                        { id: 'week', name: 'Week' },
                        { id: 'month', name: 'Month' },
                    ];
                },
                getWidgetTimeTypes: function () {
                    return [
                        {
                            value: null,
                            name: '1 Day',
                        },
                        {
                            value: '7d',
                            name: '1 Week',
                        },
                        {
                            value: '30d',
                            name: '1 Month',
                        },
                        {
                            value: '90d',
                            name: '3 Months',
                        },
                        {
                            value: '180d',
                            name: '6 Months',
                        },
                        {
                            value: '365d',
                            name: '1 Year',
                        }
                    ]
                },
                getPages: function() {
                    return $http.post('/pages')
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
                getLinkPreview: function(data) {
                    return $http.post('/pages/url',
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
                getLocation: function(data) {
                    return $http.post('/settings/location',
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
                getAddressByName: function(data) {
                    return $http.post('/settings/search/address', data)
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
                getAddressDetails: function(data) {
                    return $http.post('/settings/search/address/details', data)
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
                getUserPermissionCategories: function() {
                    return $http.get('/api/setup/user/permissions/categories')
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
                getUserPreferences: function() {
                    return $http.get('/api/setup/user/preferences')
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
                getSortDirections: function () {
                    return [
                        {
                            id: 1,
                            name: 'ASC'
                        },
                        {
                            id: 2,
                            name: 'DESC'
                        }
                    ];
                },
                getPriorities: function () {
                    return $http.get('settings/priorities')
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
                getReminderTypes: function () {
                    return $http.get('settings/reminder-types')
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
                getCompanyTypes: function () {
                    return $http.get('settings/company-types')
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
                getInputs: function () {
                    return [
                        {
                            value: 'text'
                        },
                        {
                            value: 'number'
                        },
                        {
                            value: 'textarea'
                        },
                        {
                            value: 'select'
                        },
                        {
                            value: 'multi-select'
                        },
                        {
                            value: 'radio'
                        },
                        {
                            value: 'checkbox'
                        },
                        {
                            value: 'slider'
                        },
                        {
                            value: 'date'
                        },
                        {
                            value: 'file'
                        }
                    ];
                },
                getActions: function () {
                    return [
                        {
                            value: 'add'
                        },
                        {
                            value: 'update'
                        },
                        {
                            value: 'remove'
                        },
                        {
                            value: 'formula'
                        },
                    ]
                },
                getOperators: function () {
                    return [
                        {
                            value: '=',
                            name: 'equal to'
                        },
                        {
                            value: '!=',
                            name: 'not equal to'
                        },
                        {
                            value: '>',
                            name: 'greater than'
                        },
                        {
                            value: '<',
                            name: 'less than'
                        },
                        {
                            value: '>=',
                            name: 'greater than or equal to'
                        },
                        {
                            value: '<=',
                            name: 'less than or equal to'
                        },
                        {
                            value: 'includes',
                            name: 'includes'
                        }
                    ];
                },
                getUnits: function () {
                    return [
                        {
                            value: 'Hour'
                        },
                        {
                            value: 'Foot'
                        },
                        {
                            value: 'Each'
                        },
                        {
                            value: 'Portion'
                        }
                    ]
                },
                getCurrentPage: function() {
                    const baseCurrentUrl = window.location.pathname.split( '/' )[1];
                    // Get pages from rootScope instead of localStorage
                    const pages = $rootScope.pages || [];
                    if (pages.length > 0) {
                        const page = _.find(
                            pages,
                            function (page) {
                                return page.url == baseCurrentUrl;
                            }
                        );
                        return page;
                    } else {
                        return null;
                    }
                },
                getPermissionsForPage: function( pageId) {
                    // Get permissions from rootScope instead of localStorage
                    const permissions = $rootScope.permissions || [];
                    return _.filter(
                        permissions,
                        { 
                            'pageId': pageId 
                        }
                    );
                },
                getWeather: function (data) {
                    return $http.post('/settings/weather', data)
                    .then(
                        function (response) {
                            return response.data;
                        }
                    )
                    .catch(
                        function (err) {
                            return err;
                        }
                    );
                },
                getSubPages: function(type) {
                    var links = [];
                    var pages = [];
                    // Get pages from rootScope instead of localStorage
                    var userPages = $rootScope.pages || [];
                    
                    switch (type) {
                        case 'events' :
                            links = ['estimates', 'invoices', 'work orders', 'admin settings'];
                        break;
                        case 'estimates' :
                            links = ['admin settings'];
                        break;
                        case 'clients' :
                            links = ['contact history', 'events', 'estimates', 'invoices', 'work orders'];
                        break;
                        case 'users' :
                            links = ['events', 'estimates', 'payroll'];
                        break;
                        case 'chats' :
                            links = ['admin settings'];
                        break;
                    }
                    _.each(
                        userPages,
                        function (page) {
                            if (links.includes(page.name)) {
                                pages.push(page);
                            }
                        }
                    );
                    return pages;
                
                },
                getEventStatus: function () {
                    return $http
                    .post(
                        '/settings/event-statuses'
                    )
                    .then(
                        function (response) {
                            return response.data;
                        }
                    )
                },
                getSubscription: function() {
                    return $http.post('/subscriptions/subscription')
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                getSubscriptions: function() {
                    return $http.post('/subscriptions')
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                getTaxFilingStatuses: function () {
                    return [
                        {
                            id: 'single',
                            name: 'Single'
                        },
                        {
                            id: 'married',
                            name: 'Married'
                        },
                        {
                            id: 'head_of_household',
                            name: 'Head of Household'
                        },
                        {
                            id: 'qualifying_widow',
                            name: 'Qualifying Widow(er)'
                        }
                    ];
                },
                getEmploymentStatuses: function () {
                    return [
                        {
                            id: 'active',
                            name: 'Active'
                        },
                        {
                            id: 'inactive',
                            name: 'Inactive'
                        },
                        {
                            id: 'terminated',
                            name: 'Terminated'
                        },
                        {
                            id: 'on_leave',
                            name: 'On Leave'
                        }
                    ];
                },
                getAddresses: function() {
                    return $http.post('/settings/addresses')
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                getEmails: function() {
                    return $http.post('/settings/emails')
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                getPhoneNumbers: function() {
                    return $http.post('/settings/phone-numbers')
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                createAddress: function(addressData) {
                    return $http.post('/settings/address', addressData)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                createEmail: function(emailData) {
                    return $http.post('/settings/email', emailData)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                createPhoneNumber: function(phoneNumberData) {
                    return $http.post('/settings/phone-number', phoneNumberData)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                updateAddress: function(addressData) {
                    return $http.put('/settings/address', addressData)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                updateEmail: function(emailData) {
                    return $http.put('/settings/email', emailData)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                updatePhoneNumber: function(phoneNumberData) {
                    return $http.put('/settings/phone-number', phoneNumberData)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                updateScopes: function($scope, pageIds) {
                    // Handle null/undefined pageIds
                    if (!pageIds) {
                        return {
                            canCreate: false,
                            canEdit: false,
                            canView: false,
                            canArchive: false
                        };
                    }
                    
                    // Function to update permissions for a single page
                    function getPermissionsForPageId(pageId) {
                        var permissions = {
                            canCreate: false,
                            canEdit: false,
                            canView: false,
                            canArchive: false
                        };
                
                        var pagePermissions = self.getPermissionsForPage(pageId);
                        _.forEach(pagePermissions, function(permission) {
                            switch (permission.action) {
                                case 'create':
                                    permissions.canCreate = true;
                                    break;
                                case 'edit':
                                    permissions.canEdit = true;
                                    break;
                                case 'view':
                                    permissions.canView = true;
                                    break;
                                case 'archive':
                                    permissions.canArchive = true;
                                    break;
                                default:
                                    break;
                            }
                            switch (permission.subAction) {
                                case 'approve':
                                    permissions.canApprove = true;
                                    break;
                                case 'process':
                                    permissions.canProcess = true;
                                    break;
                                default:
                                    break;
                            }
                        });
                        return permissions;
                    }
                
                    var self = this;
                
                    if (!Array.isArray(pageIds)) {

                        var permissions = getPermissionsForPageId(pageIds);
                        return permissions;
                    } else {

                        var permissionsObj = {};
                        pageIds.forEach(function(page) {
                            var pageName = _.camelCase(page.name);

                            permissionsObj[pageName] = getPermissionsForPageId(page.id);
                        });
                
                        return permissionsObj;
                    }
                },
                deleteAddress: function(addressData) {
                    return $http.post('/settings/address/delete', { data: addressData })
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                deleteEmail: function(emailData) {
                    return $http.post('/settings/email/delete', { data: emailData })
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                deletePhoneNumber: function(phoneNumberData) {
                    return $http.post('/settings/phone-number/delete', { data: phoneNumberData })
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                }, 
                updateReminder: function(reminder) {
                    return $http.put('/settings/reminder', reminder)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                checkInternetSpeed: function ()  {
                    return $q( 
                        function(resolve) {
                            const image = new Image();
                            const startTime = new Date().getTime();
                            const cacheBuster = `?nnn=${startTime}`;
                            image.src = `https://www.google.com/images/phd/px.gif${cacheBuster}`;
                            image.onload = function () {
                                const endTime = new Date().getTime();
                                const duration = (endTime - startTime) / 1000;
                                const bitsLoaded = 1024 * 8;
                                const speedBps = (bitsLoaded / duration).toFixed(2);
                                resolve(speedBps);
                            };
                        }
                    );
                },
                readNotification: function(data) {
                    return $http.put('/notifications/notification/read', data)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
                resizeImage: function (file, maxWidth, maxHeight) {
                    const deferred = $q.defer();
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const img = new Image();
                        img.onload = function() {
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
            
                            const canvas = document.createElement('canvas');
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
            
                            canvas.toBlob(blob => {
                                blob.preview = URL.createObjectURL(blob);
                                blob.name = file.name;
                                deferred.resolve(blob);
                            }, file.type);
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
            
                    return deferred.promise;
                },
                lookUpAddress: function(data) {
                    return $http.post('/settings/look-up/address', data)
                    .then(function (result) {
                        return result.data;
                    })
                    .catch(function (err) {
                        return err;
                    });
                },
            }
        }
    ]
);