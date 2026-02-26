angular.module('ngEstimators', [])
.factory(
    '$estimator', 
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
                getEstimator: function (data) {
                    return $http.post('/estimators/estimator/get', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                getFinalEstimateCost: function (data) {
                    return $http.post('/estimators/estimate/cost/get', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                getEstimateVersion: function (data) {
                    return $http.post('/estimators/estimate/version/get', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                getAvailableLabor: function (data) {
                    return $http.post('/admin/labor/list', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                getEstimators: function () {
                    return $http.post('/estimators/estimators')
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                getLineItems: function () {
                    return $http.post('/estimators/line-items')
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                getEstimateVersions: function () {
                    return $http.post('/estimators/estimate/versions')
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                getQuestionContainer: function (data) {
                    return $http.post('/estimators/question-container/get', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                getFormula: function (data) {
                    return $http.post('/estimators/formula/get', data)
                        .then(function (response) {
                            return response.data;
                        }
                    ).catch(function (err) {
                        return err;
                    });
                },
                evaluateFormula: function (data) {
                    return $http.post('/estimators/formula/evaluate', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                createEstimator: function (data) {
                    return $http.post('/estimators/estimator', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                generateEstimator: function (data) {
                    return $http.post('/estimators/estimator/generate', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                createQuestionContainer: function (data) {
                    return $http.post('/estimators/question-container', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                createQuestion: function (data) {
                    return $http.post('/estimators/question', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                createFormula: function (data) {
                    return $http.post('/estimators/formula', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                createEstimateVersion: function (data) {
                    return $http.post('/estimators/estimate/version', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                updateEstimator: function (data) {
                    return $http.put('/estimators/estimator', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                updateLineItem: function (data) {
                    return $http.put('/estimators/line-item', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                updateLabor: function (data) {
                    return $http.put('/estimators/labor', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                updateQuestionContainer: function (data) {
                    return $http.put('/estimators/question-container', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                updateQuestion: function (data) {
                    return $http.put('/estimators/question', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                updateFormula: function (data) {
                    return $http.put('/estimators/formula', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                updateUserPermission: function (data) {
                    return $http.put('/estimators/user', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                deleteEstimator: function (data) {
                    return $http.post('/estimators/estimator/delete', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                deleteQuestionContainer: function (data) {
                    return $http.post('/estimators/question-container/delete', data)
                        .then(function (response) {
                            return response.data;
                        }
                    ).catch(function (err) {
                        return err;
                    });
                },
                deleteQuestion: function (data) {
                    return $http.post('/estimators/question/delete', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                addLineItem: function (data) {
                    return $http.post('/estimators/line-item', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                addLabor: function (data) {
                    return $http.post('/estimators/labor', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                addQuestion: function (data) {
                    return $http.post('/estimators/question', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                addAdjustment: function (data) {
                    return $http.post('/estimators/adjustment', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                addUserToEstimator: function (data) {
                    return $http.post('/estimators/user', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                removeLineItem: function (data) {
                    return $http.post('/estimators/line-item/delete', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                removeLabor: function (data) {
                    return $http.post('/estimators/labor/delete', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                removeAdjustment: function (data) {
                    return $http.post('/estimators/adjustment/delete', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                removeUserFromEstimator: function (data) {
                    return $http.post('/estimators/user/delete', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                calculateLineItemTotal: function (data) {
                    return $http.post('/estimators/line-item/total', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                calculateEstimateTotal: function (data) {
                    return $http.post('/estimators/estimate/total', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                },
                createEstimateFromEstimator: function (data) {
                    return $http.post('/estimators/estimate/create', data)
                        .then(function (response) {
                            return response.data;
                        }).catch(function (err) {
                            return err;
                        });
                }
            };
        }
    ]
);