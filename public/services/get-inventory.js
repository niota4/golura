'use strict';
angular.module('ngInventory', [])
.factory('$inventory', ['$http', '$window',
function (
    $http, 
    $window
) {
    return {

        getItem: function (data) {
            return $http.post('/item/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryAisle: function (data) {
            return $http.post('/inventory/aisle/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryRow: function (data) {
            return $http.post('/inventory/row/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryShelf: function (data) {
            return $http.post('/inventory/shelf/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryRack: function (data) {
            return $http.post('/inventory/rack/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventorySection: function (data) {
            return $http.post('/inventory/section/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryItem: function (data) {
            return $http.post('/inventory-item/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryLabel: function (data) {
            return $http.post('/inventory/label/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryArea: function (data) {
            return $http.post('/inventory/area/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getWarehouse: function (data) {
            return $http.post('/inventory/warehouse/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getVendor: function (data) {
            return $http.post('/inventory/vendors/vendor/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getVendorItem: function (data) {
            return $http.post('/inventory/vendors/vendor/items/item/get', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryAisles: function (data) {
            return $http.post('/inventory/aisles', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryRows: function (data) {
            return $http.post('/inventory/rows', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryShelves: function (data) {
            return $http.post('/inventory/shelves', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryRacks: function (data) {
            return $http.post('/inventory/racks', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventorySections: function (data) {
            return $http.post('/inventory/sections', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryItems: function (data) {
            return $http.post('/inventory-items', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryLabels: function (data) {
            return $http.post('/inventory/labels', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getInventoryAreas: function (data) {
            return $http.post('/inventory/areas', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getWarehouses: function (data) {
            return $http.post('/inventory/warehouses', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getVendors: function () {
            return $http.post('/inventory/vendors')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        getPurchaseOrders: function () {
            return $http.post('/inventory/purchase-orders')
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        searchItems: function (data) {
            return $http.post('/items', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        searchVendorItems: function (data) {
            return $http.post('/inventory/vendors/vendor/items', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },        
        createItem: function (data) {
            return $http.post('/item', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createInventoryAisle: function (data) {
            return $http.post('/inventory/aisle', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createInventoryRow: function (data) {
            return $http.post('/inventory/row', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createInventoryShelf: function (data) {
            return $http.post('/inventory/shelf', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createInventoryRack: function (data) {
            return $http.post('/inventory/rack', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createInventorySection: function (data) {
            return $http.post('/inventory/section', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createInventoryItem: function (data) {
            return $http.post('/inventory-item', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createInventoryLabel: function (data) {
            return $http.post('/inventory/label', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createInventoryArea: function (data) {
            return $http.post('/inventory/area', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createWarehouse: function (data) {
            return $http.post('/warehouse', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createWarehouseType: function (data) {
            return $http.post('/warehouse-type', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createInventoryAreaType: function (data) {
            return $http.post('/inventory-area-type', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createVendor: function (data) {
            return $http.post('/inventory/vendors/vendor', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        createVendorItem: function (data) {
            return $http.post('/inventory/vendors/vendor/items/item', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateItem: function (data) {
            return $http.put('/item/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateInventoryAisle: function (data) {
            return $http.put('/inventory/aisle/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateInventoryRow: function (data) {
            return $http.put('/inventory/row/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateInventoryShelf: function (data) {
            return $http.put('/inventory/shelf/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateInventoryRack: function (data) {
            return $http.put('/inventory/rack/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateInventorySection: function (data) {
            return $http.put('/inventory/section/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateInventoryItem: function (data) {
            return $http.put('/inventory-item/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateInventoryLabel: function (data) {
            return $http.put('/inventory/label/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateInventoryArea: function (data) {
            return $http.put('/inventory/area/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateWarehouse: function (data) {
            return $http.put('/warehouse/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateWarehouseType: function (data) {
            return $http.put('/warehouse-type/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateInventoryAreaType: function (data) {
            return $http.put('/inventory-area-type/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateVendor: function (data) {
            return $http.put('/inventory/vendors/vendor/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        updateVendorItem: function (data) {
            return $http.put('/inventory/vendors/vendor/items/item/update', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },        
        deleteItem: function (data) {
            return $http.post('/item/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteInventoryAisle: function (data) {
            return $http.post('/inventory/aisle/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteInventoryRow: function (data) {
            return $http.post('/inventory/row/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteInventoryShelf: function (data) {
            return $http.post('/inventory/shelf/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteInventoryRack: function (data) {
            return $http.post('/inventory/rack/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteInventorySection: function (data) {
            return $http.post('/inventory/section/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteInventoryItem: function (data) {
            return $http.post('/inventory-item/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteInventoryLabel: function (data) {
            return $http.post('/inventory/label/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteInventoryArea: function (data) {
            return $http.post('/inventory/area/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteWarehouse: function (data) {
            return $http.post('/warehouse/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteWarehouseType: function (data) {
            return $http.post('/warehouse-type/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteInventoryAreaType: function (data) {
            return $http.post('/inventory-area-type/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteVendor: function (data) {
            return $http.post('/inventory/vendors/vendor/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        },
        deleteVendorItem: function (data) {
            return $http.post('/inventory/vendors/vendor/items/item/delete', data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err;
                });
        }        
    }
}]);
