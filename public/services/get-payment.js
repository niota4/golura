'use strict';

angular.module('ngPayments', [])
.factory('$payment', ['$http',
function ($http) {
    return {
        addPaymentMethod: function (data) {
            return $http
            .post('/payments/method/add', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getPayment: function (data) {
            return $http
            .post('/payments/get', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getPaymentMethods: function () {
            return $http
            .post('/payments/methods/list')
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getPayments: function () {
            return $http
            .post('/payments/list')
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getACHPaymentStatus: function (data) {
            return $http
            .post('/payments/ach/payment/status', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getCustomerACHPaymentMethods: function (data) {
            return $http
            .post('/payments/ach/payment-methods', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        removePaymentMethod: function (data) {
            return $http
            .post('/payments/method/remove', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        savePayment: function (data) {
            return $http
            .post('/payments/save', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        createStripeConnectedAccount: function () {
            return $http
            .post('/payments/stripe/account')
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        createStripePaymentIntent: function (data) {
            return $http
            .post('/payments/stripe/payment', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        createACHSetupIntent: function (data) {
            return $http
            .post('/payments/ach/setup-intent', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        createACHPaymentIntent: function (data) {
            return $http
            .post('/payments/ach/payment-intent', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        removeACHPaymentMethod: function (data) {
            return $http
            .post('/payments/ach/payment-method/remove', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        saveACHPayment: function (data) {
            return $http
            .post('/payments/ach/payment/save', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        verifyACHBankAccount: function (data) {
            return $http
            .post('/payments/ach/verify-bank-account', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        attachACHPaymentMethod: function (data) {
            return $http
            .post('/payments/ach/payment-method/attach', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        attachVerifiedACHPaymentMethod: function (data) {
            return $http
            .post('/payments/ach/payment-method/attach-verified', data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        }
    }
}]);
