'use strict';

const { update } = require("lodash");

angular.module('ngEvents', [])
.factory('$event', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {
        getEvent: function (e) {
            return $http
            .post(
                '/events/event/get',
                e
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
        getCategories: function (e) {
            return $http
            .post(
                '/events/event/categories',
                e
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
        getPhotos: function (e) {
            return $http
            .post(
                '/events/event/photos',
                e
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
        getDocuments: function (e) {
            return $http
            .post(
                '/events/event/documents',
                e
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
        getVideos: function (e) {
            return $http
            .post(
                '/events/event/videos',
                e
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
        getEstimates: function (e) {
            return $http
            .post(
                '/events/event/estimates',
                e
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
        getEventTypes: function (u) {
            return $http
            .post(
                '/events/event-types',
                u
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
        getWorkOrder: function (u) {
            return $http
            .post(
                '/events/event/work-order',
                u
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
        getChecklist: function (data) {
            return $http
            .post(
                '/events/event/checklist',
                data)
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
        getChecklistSubmissions: function (data) {
            return $http
                .post(
                    '/events/event/checklist/submissions',
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
        getCheckIns: function (data) {
            return $http
                .post(
                    '/events/event/checkins',
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
        getToDos: function (data) {
            return $http
                .post(
                    '/events/event/to-dos',
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
        searchEvents: function (d) {
            return $http
                .post(
                    '/events',
                    d
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
        createEvent: function (e) {
            return $http
                .post(
                    '/events/event',
                    e
                )
                .then(function (response) {
                    return response.data;
                }).catch(
                    function (err) {
                        return err;
                    }
                );
        },
        updateEvent: function (e) {
            return $http
                .put(
                    '/events/event',
                    e
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
        updateEventReminders: function (data) {
            return $http
                .put(
                    '/events/event/reminders',
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
        updateCheckins: function (data) {
            return $http
                .put(
                    '/events/event/checkins',
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
        addEventParticipant: function (data) {
            return $http
                .post(
                    '/events/event/participants/add',
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
        removeEventParticipant: function (data) {
            return $http
                .post(
                    '/events/event/participants/remove',
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
        completeEvent: function (e) {
            return $http
                .post(
                    '/events/event/complete',
                    e
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
        archiveEvent: function (e) {
            return $http
                .post(
                    '/events/event/delete',
                    e
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
        archiveCheckIns: function (data) {
            return $http
                .post(
                    '/events/event/checkins/delete',
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
        restoreEvent: function (e) {
            return $http
                .post(
                    '/events/event/restore',
                    e
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
        checkInEvent: function (data) {
            return $http
                .post(
                    '/events/event/checkin',
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
        checkOutEvent: function (data) {
            return $http
                .post(
                    '/events/event/checkout',
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
    }
}]);