angular.module('ngAdmin', [])
.factory('$admin', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {
        setupCompany: function (data) {
            return $http
                .post('/company/setup', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getCompany: function () {
            return $http
            .post(
                '/company/get'
            )
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
        getWidget: function () {
            return $http
            .post(
                '/admin/widget/get'
            )
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
        getRoleWidget: function () {
            return $http
            .post(
                '/admin/roles/widget/get'
            )
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
        getTemplate: function (data) {
            return $http
                .post('/admin/templates/template/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getIntegrations: function () {
            return $http
            .post('/admin/integrations/integration/get')
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getGroups: function () {
            return $http
            .post(
                '/admin/groups'
            )
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
        getRoles: function () {
            return $http
            .post(
                '/admin/roles'
            )
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
        getPermissions: function () {
            return $http
            .post(
                '/admin/permissions'
            )
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
        getRolePermissions: function () {
            return $http
            .post(
                '/admin/role-permissions'
            )
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
        getRoleWidgets: function () {
            return $http
            .post(
                '/admin/roles/widgets'
            )
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
        getEventTypes: function () {
            return $http
            .post(
                '/admin/event-types'
            )
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
        getTemplates: function () {
            return $http
                .post('/admin/templates')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getShortCodes: function () {
            return $http
                .post('/admin/short-codes')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getVariables: function () {
            return $http
                .post('/admin/variables')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getWidgets: function () {
            return $http
            .post('/admin/widgets')
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getRoleWidgets: function () {
            return $http
            .post('/admin/roles/widgets')
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getIntegrations: function () {
            return $http
            .post('/admin/integrations')
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getArchivedEvents: function () {
            return $http
            .post('/admin/archived/events')
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getArchivedUsers: function () {
            return $http
            .post('/admin/archived/users')
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getArchivedEstimates: function () {
            return $http
            .post('/admin/archived/estimates')
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        createGroup: function (group) {
            return $http
            .post(
                '/admin/groups/group',
                group
            )
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
        createRole: function (role) {
            return $http
            .post(
                '/admin/role',
                role
            )
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
        createEventType: function (eventType) {
            return $http
            .post(
                '/admin/event-type',
                eventType
            )
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
        createTemplate: function (data) {
            return $http
                .post('/admin/template', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createVariable: function (data) {
            return $http
                .post('/admin/variables/variable', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createStripeConnectedAccount: function (data) {
            return $http
                .post('/admin/stripe', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        addIntegration: function (data) {
            return $http
                .post('/admin/integrations/integrations/add', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateCompany: function (company) {
            return $http
            .put(
                '/admin/company',
                company
            )
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
        updateGroup: function (group) {
            console.log(group);
            return $http
            .put(
                '/admin/groups/group',
                group
            )
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
        updateRole: function (role) {
            return $http
            .put(
                '/admin/role',
                role
            )
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
        updateEventType: function (eventType) {
            return $http
            .put(
                '/admin/event-type',
                eventType
            )
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
        updateTemplate: function (data) {
            return $http
                .put('/admin/template', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateVariable: function (data) {
            return $http
                .put('/admin/variables/variable', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteGroup: function (group) {
            return $http
            .post('/admin/groups/group/delete', group)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        deleteEventType: function (eventType) {
            return $http
            .post('/admin/event-types/event-type/delete', eventType)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        deleteTemplate: function (data) {
            return $http
                .post('/admin/templates/template/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteVariable: function (data) {
            return $http
                .post('/admin/variables/variable/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        removeIntegration: function (data) {
            return $http
                .post('/admin/integrations/integrations/remove', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        // Labor Management Functions
        getLabor: function (data) {
            return $http
                .post('/admin/labor/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getLabors: function () {
            return $http
                .post('/admin/labor/list')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createLabor: function (data) {
            return $http
                .post('/admin/labor', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateLabor: function (data) {
            return $http
                .put('/admin/labor', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteLabor: function (data) {
            return $http
                .post('/admin/labor/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        validateCompanySecurityToken: function (data) {
            return $http
                .post('/company/validate', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        sendValidateEmail: function (data) {
            return $http.post(
                '/company/validate/email',
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
        getStripeSettings: function () {
            return $http
                .post('/admin/stripe/settings')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createStripeAccount: function (data) {
            return $http
                .post('/admin/stripe', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getStripeAccount: function () {
            return $http
                .post('/admin/stripe/account')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createStripeOnboardingLink: function (data) {
            return $http
                .post('/admin/stripe/onboarding', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateStripeACHSettings: function (data) {
            return $http
                .post('/admin/stripe/ach/settings', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        enabletripePaymentMethod: function (data) {
            return $http
                .post('/admin/stripe/payment-method/enable', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        disableStripePaymentMethod: function (data) {
            return $http
                .post('/admin/stripe/payment-method/disable', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createStripeTestPayment: function () {
            return $http
                .post('/admin/stripe/test-payment')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        // Communications Management Functions
        getCommunicationsSettings: function () {
            return $http
                .post('/admin/communications/settings')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateCommunicationsSettings: function (data) {
            return $http
                .put('/admin/communications/settings', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        addCompanyPhoneNumber: function (data) {
            return $http
                .post('/admin/communications/phone-number/add', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        removeCompanyPhoneNumber: function (data) {
            return $http
                .post('/admin/communications/phone-number/remove', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        completeCommunicationsSetup: function () {
            return $http
                .post('/admin/communications/setup/complete')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        // Twilio phone number functions
        searchTwilioPhoneNumbers: function (data) {
            return $http
                .post('/admin/communications/twilio/search', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        purchaseTwilioPhoneNumber: function (data) {
            return $http
                .post('/admin/communications/twilio/purchase', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        releaseTwilioPhoneNumber: function (data) {
            return $http
                .post('/admin/communications/twilio/release', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
    }
}]);
