const { create } = require("lodash");

angular.module('ngInvoices', [])
.factory('$invoice', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {
        getInvoice: function (data) {
            return $http
            .post(
                '/invoices/invoice/get',
                data
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        getInvoiceLineItem: function (data) {
            return $http
            .post(
                '/invoices/line-items/line-item/get',
                data
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        listInvoices: function (data) {
            return $http
            .post(
                '/invoices',
                data
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        searchInvoices: function (data) {
            return $http
            .post(
                '/invoices/invoice/search',
                data
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        createInvoice: function (invoice) {
            return $http
            .post(
                '/invoices/invoice', 
                invoice
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        createInvoiceLineItem: function (lineItem) {
            return $http
            .post(
                '/invoices/line-items/line-item', 
                lineItem
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        createInvoicePdf: function (data) {
            return $http
            .post(
                '/invoices/invoice/pdf',
                data
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        updateInvoice: function (invoice) {
            return $http
            .put(
                '/invoices/invoice', 
                invoice
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        updateInvoiceLineItem: function (lineItem) {
            return $http
            .put(
                '/invoices/line-items/line-item', 
                lineItem
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        updateInvoiceTotal: function (data) {
            return $http
            .put(
                '/invoices/invoice/total/update', 
                data
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        addInvoiceLineItem: function (lineItem) {
            return $http
            .post(
                '/invoices/line-items/line-item', 
                lineItem
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        removeInvoiceLineItem: function (data) {
            return $http
            .post(
                '/invoices/line-items/line-item/remove',
                data
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        cloneInvoice: function (data) {
            return $http
            .post(
                '/invoices/invoice/clone', 
                data
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        bulkUpdateInvoices: function (data) {
            return $http
            .put(
                '/invoices/invoice/bulk-update', 
                data
            )
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
    };
}]);
