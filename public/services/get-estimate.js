const { get, create } = require("lodash");

angular.module('ngEstimates', [])
.factory('$estimate', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {
        searchItems: function (data) {
            return $http
            .post(
                '/estimates/items',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        getEstimate: function (data) {
            return $http
            .post(
                '/estimates/estimate/get',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        getEstimateTemplate: function (data) {
            return $http
            .post(
                '/estimates/estimate/template/get',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        getLineItem: function (data) {
            return $http
            .post(
                '/estimates/line-items/line-item/get',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        getEstimateTemplates: function () {
            return $http
            .post('/estimates/estimate/templates')
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        getEstimateFollowUps: function (data) {
            return $http
            .post(
                '/estimates/estimate/follow-ups',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        getStatuses: function () {
            return $http
            .post('/estimates/statuses')
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        getLineItems: function () {
            return $http
            .post('/estimates/line-items')
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        getAdHocLineItems: function () {
            return $http
            .post('/estimates/line-items/adhoc')
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        getPhotos: function (d) {
            return $http.post(
                '/estimates/estimate/photos',
                d
            )
            .then( 
                function (result) {
                    return result.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        getVideos: function (d) {
            return $http.post(
                '/estimates/estimate/videos',
                d
            )
            .then( 
                function (result) {
                    return result.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        createEstimate: function (estimate) {
            return $http
            .post(
                '/estimates/estimate', 
                estimate
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        createEstimateTemplate: function (template) {
            return $http
            .post(
                '/estimates/estimate/template', 
                template
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        createLineItem: function (lineItem) {
            return $http
            .post(
                '/estimates/line-items/line-item', 
                lineItem
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        createEstimateLineItem: function (estimateLineItem) {
            return $http
            .post(
                '/estimates/estimate/line-item', 
                estimateLineItem
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        createEstimateFollowUp: function (data) {
            return $http
            .post(
                '/estimates/estimate/follow-up',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        createEstimatePdf: function (data) {
            return $http
            .post(
                '/estimates/estimate/pdf',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        updateEstimate: function (estimate) {
            return $http
            .put(
                '/estimates/estimate', 
                estimate
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        updateEstimateTemplate: function (template) {
            return $http
            .put(
                '/estimates/estimate/template', 
                template
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        updateLineItem: function (lineItem) {
            return $http
            .put(
                '/estimates/line-items/line-item', 
                lineItem
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        updateLineItemItemQuantity: function (item) {
            return $http
            .put(
                '/estimates/line-items/line-item/item/quantity', 
                item
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        updateEstimateLineItem: function (data) {
            return $http
                .put(
                    '/estimates/estimate/line-items/line-item', 
                    data
                )
                .then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    return err;
                });
        },
        addLineItemToEstimate: function (data) {
            return $http
                .put(
                    '/estimates/estimate/line-items/line-item/add', 
                    data
                )
                .then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    return err;
                });
        },
        addItemToLineItem: function (data) {
            return $http
                .put(
                    '/estimates/line-items/item/add', 
                    data
                )
                .then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    return err;
                });
        },
        removeLineItemFromEstimate: function (data) {
            return $http
                .post(
                    '/estimates/estimate/line-items/line-item/remove', 
                    data
                )
                .then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    return err;
                });
        },
        removeItemFromLineItem: function (data) {
            return $http
                .post(
                    '/estimates/line-items/item/remove', 
                    data
                )
                .then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    return err;
                });
        },
        signEstimate: function (data) {
            return $http
                .post(
                    '/estimates/estimate/sign', 
                    data
                )
                .then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    return err;
                });
        },
        convertEstimateToInvoice: function (data) {
            return $http
                .post(
                    '/estimates/estimate/convert', 
                    data
                )
                .then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    return err;
                });
        },
        archiveEstimate: function (estimate) {
            return $http
            .post(
                '/estimates/estimate/delete', 
                estimate
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        archiveEstimateTemplate: function (template) {
            return $http
            .post(
                '/estimates/estimate/template/delete', 
                template
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        unArchiveEstimate: function (estimate) {
            return $http
            .post(
                '/estimates/estimate/restore', 
                estimate
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        trackEstimateView: function (data) {
            return $http
            .post(
                '/estimates/estimate/track-view',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        clientApproveEstimate: function (data) {
            return $http
            .post(
                '/estimates/estimate/client-approve',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        clientRejectEstimate: function (data) {
            return $http
            .post(
                '/estimates/estimate/client-reject',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        clientRequestChanges: function (data) {
            return $http
            .post(
                '/estimates/estimate/client-request-changes',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        submitClientFeedback: function (data) {
            return $http
            .post(
                '/estimates/estimate/client-feedback',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
        acceptTerms: function (data) {
            return $http
            .post(
                '/estimates/estimate/accept-terms',
                data
            )
            .then(
                function (response) {
                    return response.data;
                }
            ).catch(function (err) {
                return err;
            });
        },
    }
}]);
