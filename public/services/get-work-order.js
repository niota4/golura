angular.module('ngWorkOrders', [])
.factory('$workOrder', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {
        getWorkOrder: function (data) {
            return $http
            .post(
                '/work-orders/work-order/get',
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
        getPurchaseOrder: function (data) {
            return $http
            .post(
                '/work-orders/work-order/purchase-orders/purchase-order/get',
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
        getLineItem: function (data) {
            return $http
            .post(
                '/work-orders/items/item/get',
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
        getWorkOrders: function (data) {
            return $http
            .post(
                '/work-orders',
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
        getPurchaseOrders: function (data) {
            return $http
            .post(
                '/work-orders/work-order/purchase-orders',
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
        getWorkOrderStatuses: function (data) {
            return $http
            .post(
                '/work-orders/statuses',
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
        getPurchaseOrderStatuses: function (data) {
            return $http
            .post(
                '/work-orders/work-order/purchase-orders/statuses',
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
        searchWorkOrders: function (data) {
            return $http
            .post(
                '/work-orders/work-order/search',
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
        createWorkOrder: function (workOrder) {
            return $http
            .post(
                '/work-orders/work-order', 
                workOrder
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
        createPurchaseOrder: function (workOrder) {
            return $http
            .post(
                '/work-orders/work-order/purchase-orders/purchase-order', 
                workOrder
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
        approvePurchaseOrder: function (data) {
            return $http
            .post(
                '/work-orders/work-order/approve', 
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
        generateWorkOrder: function (data) {
            return $http
            .post(
                '/work-orders/work-order/generate', 
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
        cloneWorkOrder: function (data) {
            return $http
            .post(
                '/work-orders/work-order/clone', 
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
        addWorkOrderLineItem: function (item) {
            return $http
            .post(
                '/work-orders/items/item', 
                item
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
        addItemToPurchaseOrder: function (data) {
            return $http
            .post(
                '/work-orders/work-order/purchase-orders/items/item/add',
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
        updateWorkOrder: function (workOrder) {
            return $http
            .put(
                '/work-orders/work-order', 
                workOrder
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
        updateWorkOrdersPriorities: function () {
            return $http
            .put(
                '/work-orders/priorities'
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
        updateWorkOrderLineItem: function (item) {
            return $http
            .put(
                '/work-orders/items/item', 
                item
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
        updateWorkOrderStatus: function (data) {
            return $http
            .put(
                '/work-orders/work-order/status/update', 
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
        assignUserToWorkOrder: function (data) {
            console.log(data);
            return $http
            .put(
                '/work-orders/work-order/assign', 
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
        bulkUpdateWorkOrders: function (data) {
            return $http
            .put(
                '/work-orders/work-order/bulk-update', 
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
        removeItemFromPurchaseOrder: function (data) {
            return $http
            .post(
                '/work-orders/work-order/purchase-orders/items/item/remove',
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
        removeWorkOrderLineItem: function (data) {
            return $http
            .post(
                '/work-orders/items/item/remove',
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
        deleteWorkOrder: function (data) {
            return $http
            .post(
                '/work-orders/work-order/delete',
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
        }
    };
}]);
