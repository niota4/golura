'use strict';

angular.module('ngClients', [])
.factory('$client', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {

        getClients: function (data) {
            return $http
                .post(
                    '/clients',
                    data
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
        getClient: function (data) {
            return $http
                .post(
                    '/clients/client/get',
                    data
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
        getPhotos: function (data) {
            return $http.post(
                '/clients/client/photos',
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
        getDocuments: function (data) {
            return $http.post(
                '/clients/client/documents',
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
        getVideos: function (data) {
            return $http.post(
                '/clients/client/videos',
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
        getEvents: function (data) {
            return $http.post(
                '/clients/client/events',
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
        getEstimates: function (data) {
            return $http.post(
                '/clients/client/estimates',
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
        getWorkOrders: function (data) {
            return $http.post(
                '/clients/client/work-orders',
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
        getInvoices: function (data) {
            return $http.post(
                '/clients/client/invoices',
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
        getArchived: function () {
            return $http.post('/clients/archived')
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getArchivedEvents: function (data) {
            return $http.post('/clients/archived/client/events', data)
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getArchivedEstimates: function (data) {
            return $http.post('/clients/archived/client/estimates', data)
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getArchivedPhotos: function (data) {
            return $http.post('/clients/archived/client/photos', data)
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getArchivedDocuments: function (data) {
            return $http.post('/clients/archived/client/documents', data)
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getArchivedVideos: function (data) {
            return $http.post('/clients/archived/client/videos', data)
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getArchivedWorkOrders: function (data) {
            return $http.post('/clients/archived/client/workorders', data)
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getArchivedInvoices: function () {
            return $http.post('/clients/archived/client/invoices')
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getArchivedClientAddresses: function (data) {
            return $http.post('/clients/archived/client/addresses', data)
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getArchivedClientEmails: function (data) {
            return $http.post('/clients/archived/client/emails', data)
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getArchivedClientNotes: function (data) {
            return $http.post('/clients/archived/client/notes', data)
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getArchivedClientPhoneNumbers: function (data) {
            return $http.post('/clients/archived/client/phonenumbers', data)
                .then(function (result) {
                    return result.data;
                })
                .catch(function (err) {
                    return err;
                });
        },        
        createClient: function (data) {
            return $http
            .post(
                '/clients/client/create',
                data
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
        listClientPhotos: function(data) {
            return $http
            .post(
                '/clients/client/photos',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        listClientVideos: function(data) {
            return $http
            .post(
                '/clients/client/videos',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        listClientEvents: function(data) {
            return $http
            .post(
                '/clients/client/events',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        listClientEstimates: function(data) {
            return $http
            .post(
                '/clients/client/estimates',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        listClientWorkOrders: function(data) {
            return $http
            .post(
                '/clients/client/work-orders',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        listClientInvoices: function(data) {
            return $http
            .post(
                '/clients/client/invoices',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        listClientAddresses: function(data) {
            return $http
            .post(
                '/clients/client/addresses',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        listClientEmails: function(data) {
            return $http
            .post(
                '/clients/client/emails',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        listClientNotes: function(data) {
            return $http
            .post(
                '/clients/client/notes',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        listClientPhoneNumbers: function(data) {
            return $http
            .post(
                '/clients/client/phone-numbers',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        listEmails: function(data) {
            return $http
            .post(
                '/clients/client/emails/list',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function(err) {
                    return err;
                }
            );
        },
        listPhoneCalls: function(data) {
            return $http
            .post(
                '/clients/client/calls',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function(err) {
                    return err;
                }
            );
        },
        createClient: function(data) {
            return $http
            .post(
                '/clients/client',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        createClientAddress: function(data) {
            return $http
            .post(
                '/clients/client/addresses/address',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        createClientEmail: function(data) {
            return $http
            .post(
                '/clients/client/emails/email',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        createClientNote: function(data) {
            return $http
            .post(
                '/client-notes/note',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        createClientPhoneNumber: function(data) {
            return $http
            .post(
                '/clients/client/phone-numbers/phone-number',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        updateClient: function(data) {
            return $http
            .put(
                '/clients/client',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        updateClientAddress: function(data) {
            return $http
            .put(
                '/clients/client/addresses/address',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        updateClientEmail: function(data) {
            return $http
            .put(
                '/clients/client/emails/email',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        updateClientNote: function(data) {
            return $http
            .put(
                '/clients/client/notes/note',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        updateClientPhoneNumber: function(data) {
            return $http
            .put(
                '/clients/client/phone-numbers/phone-number',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        deleteClient: function(data) {
            return $http
            .post(
                '/clients/client/delete',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        deleteClientAddress: function(data) {
            return $http
            .post(
                '/clients/client/addresses/address/delete',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        deleteClientEmail: function(data) {
            return $http
            .post(
                '/clients/client/emails/email/delete',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        deleteClientNote: function(data) {
            return $http
            .post(
                '/clients/client/notes/note/delete',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        },
        deleteClientPhoneNumber: function(data) {
            return $http
            .post(
                '/clients/client/phone-numbers/phone-number/delete',
                data
            )
            .then(
                function(response) {
                    return response.data;
                }
            )
            .catch(
                function (err) {
                    return err;
                }
            );
        }
    }
}]);