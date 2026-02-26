define(['app-controller', 'dhtmlx-suite'], function (app, dhx) {
    app.register.controller('InventoryController',
    function (
        $scope,
        $rootScope,
        $routeParams,
        $location,
        $window,
        $document,
        $log,
        $q,
        $timeout,
        $interval,
        $user,
        $inventory,
        $setup,
        $compile
    ) {
        const urlParams = new URLSearchParams(window.location.search);

        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];
        $scope.page = $setup.getCurrentPage() || {};
        $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null);

        $scope.search = {
            inventoryWarehouseSearch: {
                value: null
            },
            items: {
                value: null,
                page: null,
                limit: null,
                count: null,
                total: null
            },
            vendorItems: {
                value: null,
                page: null,
                limit: null,
                count: null,
                total: null
            }
        };
        $scope.sort = {
            inventoryWarehouse: {
                value: 'name'
            },
            items: {
                value: '-id',
                defaults: 'id'
            }
        };
        $scope.inventory = {}; 
        $scope.vendor = {};
        $scope.vendorItem = {}; 
        $scope.treeGrid = {};
        $scope.address = {};
        $scope.itemQuantities = {};
        $scope.inventoryArea = {};
        $scope.inventoryAreaType = {};
        $scope.inventoryAisle = {};
        $scope.inventoryRow = {};
        $scope.inventoryShelf = {};
        $scope.inventoryRack = {};
        $scope.inventorySection = {};
        $scope.inventoryItem = {};
        $scope.inventoryLabel = {};
        $scope.warehouse = {};
        $scope.warehouseType = {};
              
        
        $scope.states = [];
        $scope.items = [];
        $scope.inventoryAisles = [];
        $scope.inventoryRows = [];
        $scope.inventoryShelves = [];
        $scope.inventoryRacks = [];
        $scope.inventorySections = [];
        $scope.inventoryLabels = [];
        $scope.inventoryAreas = [];
        $scope.inventoryItems = [];
        $scope.inventoryAreaTypes = [];
        $scope.warehouses = [];
        $scope.warehouseTypes = [];
        $scope.inventoryAreaTypes = [];
        $scope.treeGridOptions = [];
        $scope.vendors = [];
        $scope.vendorItems = [];

        $scope.units = $setup.getUnits();

        $scope.UI = {
            tab: urlParams.get('tab'),
            currentUrl: window.location.pathname.split( '/' ),
            createInventory: false,
            inventoryLoaded: false,
            itemsLoaded: false,
            aislesLoaded: false,
            rowsLoaded: false,
            shelvesLoaded: false,
            racksLoaded: false,
            sectionsLoaded: false,
            labelsLoaded: false,
            areasLoaded: false,
            warehousesLoaded: false,
            warehouseTypesLoaded: false,
            inventoryAreaTypesLoaded: false,
            formSaving: false,
            newInventoryAisle: false,
            inventoryAisleLoaded: false,
            newInventoryArea: false,
            inventoryAreaLoaded: false,
            newInventoryAreaType: false,
            inventoryAreaTypeLoaded: false,
            newInventoryItem: false,
            inventoryItemLoaded: false,
            newInventoryLabel: false,
            inventoryLabelLoaded: false,
            newInventoryRack: false,
            inventoryRackLoaded: false,
            newInventoryRow: false,
            inventoryRowLoaded: false,
            newInventorySection: false,
            inventorySectionLoaded: false,
            newInventoryShelf: false,
            inventoryShelfLoaded: false,
            newWarehouse: false,
            warehouseLoaded: false,
            newWarehouseType: false,
            warehouseTypeLoaded: false,
            vendorsLoaded: false,
            vendorItemsLoaded: false,
            vendorsDisplayed: 10,
            warehousesDisplayed: 10,
            itemsDisplayed: 10,
            formSaving: false,
            formSaved: false,
            formSaving: false,
            message: null,
            errMessage: null,
        };
        $setup.updateScopes($scope, $scope.page.id || null);

        $scope.initInventory = function () {
            $scope.UI.inventoryLoaded = true;
            $scope.UI.warehousesLoaded = true;
            $q.all(
                [
                    $inventory.getWarehouses(),
                    $scope.initInventoryTabs()
                ]
            ).then(
                function (responses) {
                    $scope.UI.warehousesLoaded = true;
                    $scope.UI.inventoryLoaded = true;
                    if (!responses.err) {
                        $scope.warehouses = responses[0].warehouses;
                    }
                }
            );
        };    
        $scope.initInventoryTabs = function () {
            var i = 0;
            $scope.initTabs = $interval(
                function() {
                    i++;
                    if ($('#' + $scope.UI.tab + '-label').length) {
                        $('.tabs-title').removeClass('is-active');
                        $('.tabs-title a').attr('aria-selected', false);
                        $('.tabs-panel').removeClass('is-active');
                        $('#' + $scope.UI.tab + '-label').parent().addClass('is-active');
                        $('#' + $scope.UI.tab + '-label').attr('aria-selected', true)
                        $('#' + $scope.UI.tab).addClass('is-active');
                        angular.element('#' + $scope.UI.tab + '-label').triggerHandler('click');
                        $interval.cancel($scope.initTabs);
                        $(document).foundation();
                    } else {
                        $(document).foundation();
                        $interval.cancel($scope.initTabs);
                    }
                }, 100
            );
        };          
        $scope.initInventoryAisle = function (data) {
            $scope.UI.aislesLoaded = false;
            $inventory.initInventoryAisle(data)
            .then(
                function (response) {
                    $scope.UI.aislesLoaded = true;
                    if (!response.err) {
                        $scope.inventoryAisles = response.inventoryAisles;
                    }
                }
            );
        };       
        $scope.initInventoryRow = function (data) {
            $scope.UI.rowsLoaded = false;
            $inventory.initInventoryRow(data)
            .then(
                function (response) {
                    $scope.UI.rowsLoaded = true;
                    if (!response.err) {
                        $scope.inventoryRows = response.inventoryRows;
                    }
                }
            );
        };        
        $scope.initInventoryShelf = function (data) {
            $scope.UI.shelvesLoaded = false;
            $inventory.initInventoryShelf(data)
            .then(
                function (response) {
                    $scope.UI.shelvesLoaded = true;
                    if (!response.err) {
                        $scope.inventoryShelves = response.inventoryShelves;
                    }
                }
            );
        };        
        $scope.initInventoryRack = function (data) {
            $scope.UI.racksLoaded = false;
            $inventory.initInventoryRack(data)
            .then(
                function (response) {
                    $scope.UI.racksLoaded = true;
                    if (!response.err) {
                        $scope.inventoryRacks = response.inventoryRacks;
                    }
                }
            );
        };        
        $scope.initInventorySection = function (data) {
            $scope.UI.sectionsLoaded = false;
            $inventory.initInventorySection(data)
            .then(
                function (response) {
                    $scope.UI.sectionsLoaded = true;
                    if (!response.err) {
                        $scope.inventorySections = response.inventorySections;
                    }
                }
            );
        };        
        $scope.initInventoryItem = function (data) {
            $scope.UI.itemsLoaded = false;
            $inventory.initInventoryItem(data)
            .then(
                function (response) {
                    $scope.UI.itemsLoaded = true;
                    if (!response.err) {
                        $scope.inventoryItems = response.inventoryItems;
                    }
                }
            );
        };        
        $scope.initInventoryLabel = function (data) {
            $scope.UI.labelsLoaded = false;
            $inventory.initInventoryLabel(data)
            .then(
                function (response) {
                    $scope.UI.labelsLoaded = true;
                    if (!response.err) {
                        $scope.inventoryLabels = response.inventoryLabels;
                    }
                }
            );
        };        
        $scope.initInventoryArea = function (data) {
            $scope.UI.areasLoaded = false;
            $inventory.initInventoryArea(data)
            .then(
                function (response) {
                    $scope.UI.areasLoaded = true;
                    if (!response.err) {
                        $scope.inventoryAreas = response.inventoryAreas;
                    }
                }
            );
        };        
        $scope.initWarehouse = function () {
            $scope.UI.warehouseLoaded = false;
            $scope.warehouse = {};
            $scope.inventoryAreas = [];
            $scope.inventoryAisles = [];
            $scope.inventoryRows = [];
            $scope.inventoryShelves = [];
            $scope.inventoryRacks = [];
            $scope.inventorySections = [];
            $scope.inventoryItems = [];
            $inventory.getWarehouse({ id: $routeParams.warehouseId })
                .then(function (response) {
                    $scope.UI.warehouseLoaded = true;
                    $scope.warehouse = response.warehouse;

                    if (response.err) {
                        $scope.initErrorMessage('Error fetching warehouse.');
                        return;
                    }
                    if (!$rootScope.UI.isMobile) {
                        $scope.treeGridData = $scope.formatTreeGridData(response.warehouse);
                        $scope.initTreeGrid($scope.treeGridData);
                    }
                    _.forEach($scope.warehouse.InventoryAreas, function (area) {
                        $scope.inventoryAreas.push(area);
                        if (area.Aisles) {
                            $scope.inventoryAisles = $scope.inventoryAisles.concat(area.Aisles);
                            _.forEach(area.Aisles, function (aisle) {
                                if (aisle.Rows) {
                                    $scope.inventoryRows = $scope.inventoryRows.concat(aisle.Rows);
                                    _.forEach(aisle.Rows, function (row) {
                                        if (row.Shelves) {
                                            $scope.inventoryShelves = $scope.inventoryShelves.concat(row.Shelves);
                                            _.forEach(row.Shelves, function (shelf) {
                                                if (shelf.Racks) {
                                                    $scope.inventoryRacks = $scope.inventoryRacks.concat(shelf.Racks);
                                                    _.forEach(shelf.Racks, function (rack) {
                                                        if (rack.Sections) {
                                                            $scope.inventorySections = $scope.inventorySections.concat(rack.Sections);
                                                            _.forEach(rack.Sections, function (section) {
                                                                if (section.InventoryItems) {
                                                                    $scope.inventoryItems = $scope.inventoryItems.concat(section.InventoryItems);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    $timeout(
                        function() {
                            $(document).foundation();
                        }, 100
                    )
                }
            ).catch(function (err) {
                $scope.UI.warehouseLoaded = true;
                $scope.initErrorMessage(err || 'Error fetching warehouse.');
            }) 
        };
        $scope.initVendor = function () {
            $scope.UI.vendorLoaded = false;
            $q.all([
                $inventory.getVendor({id: $routeParams.vendorId}),
            ]).then(function (responses) {
                $scope.UI.vendorLoaded = true;
                if (!responses[0].err) {
                    $scope.vendor = responses[0].vendor;
                    $scope.searchVendorItems();
                }
            });

            $scope.$watch(
                'search.vendorItem.value',
                function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $scope.search.page = 1;
                        $scope.searchVendorItems();
                    }
                }
            );

            angular.element($document).bind('scroll', function () {
                var container = angular.element(document.getElementById('vendorItemsList'));
                var lastLi = container.find('li').last();

                if (lastLi.length) {
                    var lastLiOffset = lastLi.offset().top + lastLi.outerHeight();
                    var containerOffset = container.offset().top + container.outerHeight();

                    if (containerOffset >= lastLiOffset) {
                        if ($scope.search.page < $scope.pages) {
                            $scope.search.page++;
                            $scope.searchVendorItems();
                            $scope.$apply(); // Trigger a digest cycle to update the view
                        }
                    }
                }
            });
        };
        $scope.initVendorItem = function (data) {
            $scope.UI.vendorItemsLoaded = false;
            $inventory.getVendorItem(data)
            .then(function (response) {
                $scope.UI.vendorItemsLoaded = true;
                if (!response.err) {
                    $scope.vendorItem = response.vendorItem;
                }
            });
        };
        $scope.initItems = function (data) {
            $scope.UI.itemsLoaded = false;
            $inventory.searchItems(data)
            .then(
                function (response) {
                    $scope.UI.itemsLoaded = true;
                    if (!response.err) {
                        $scope.items = response.items;
                    }
                }
            );

            $scope.$watch(
                'search.items.value',
                function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $scope.search.page = 1;
                        $scope.searchVendorItems();
                    }
                }
            );

            angular.element($document).bind('scroll', function () {
                var container = angular.element(document.getElementById('itemsList'));
                var lastLi = container.find('li').last();

                if (lastLi.length) {
                    var lastLiOffset = lastLi.offset().top + lastLi.outerHeight();
                    var containerOffset = container.offset().top + container.outerHeight();

                    if (containerOffset >= lastLiOffset) {
                        if ($scope.search.page < $scope.pages) {
                            $scope.search.page++;
                            $scope.searchVendorItems();
                            $scope.$apply(); // Trigger a digest cycle to update the view
                        }
                    }
                }
            });
        };        
        $scope.initInventoryAisles = function (data) {
            $scope.UI.aislesLoaded = false;
            $inventory.initInventoryAisles(data)
            .then(
                function (response) {
                    $scope.UI.aislesLoaded = true;
                    if (!response.err) {
                        $scope.inventoryAisles = response.inventoryAisles;
                    }
                }
            );
        };        
        $scope.initInventoryRows = function (data) {
            $scope.UI.rowsLoaded = false;
            $inventory.initInventoryRows(data)
            .then(
                function (response) {
                    $scope.UI.rowsLoaded = true;
                    if (!response.err) {
                        $scope.inventoryRows = response.inventoryRows;
                    }
                }
            );
        };        
        $scope.initInventoryShelves = function (data) {
            $scope.UI.shelvesLoaded = false;
            $inventory.initInventoryShelves(data)
            .then(
                function (response) {
                    $scope.UI.shelvesLoaded = true;
                    if (!response.err) {
                        $scope.inventoryShelves = response.inventoryShelves;
                    }
                }
            );
        };        
        $scope.initInventoryRacks = function (data) {
            $scope.UI.racksLoaded = false;
            $inventory.initInventoryRacks(data)
            .then(
                function (response) {
                    $scope.UI.racksLoaded = true;
                    if (!response.err) {
                        $scope.inventoryRacks = response.inventoryRacks;
                    }
                }
            );
        };        
        $scope.initInventorySections = function (data) {
            $scope.UI.sectionsLoaded = false;
            $inventory.initInventorySections(data)
            .then(
                function (response) {
                    $scope.UI.sectionsLoaded = true;
                    if (!response.err) {
                        $scope.inventorySections = response.inventorySections;
                    }
                }
            );
        };        
        $scope.initInventoryItems = function (data) {
            $scope.UI.itemsLoaded = false;
            $inventory.initInventoryItems(data)
            .then(
                function (response) {
                    $scope.UI.itemsLoaded = true;
                    if (!response.err) {
                        $scope.inventoryItems = response.inventoryItems;
                    }
                }
            );
        };
        $scope.initInventoryLabels = function (data) {
            $scope.UI.labelsLoaded = false;
            $inventory.initInventoryLabels(data)
            .then(
                function (response) {
                    $scope.UI.labelsLoaded = true;
                    if (!response.err) {
                        $scope.inventoryLabels = response.inventoryLabels;
                    }
                }
            );
        };
        $scope.initInventoryAreas = function (data) {
            $scope.UI.areasLoaded = false;
            $inventory.getInventoryAreas(data)
            .then(
                function (response) {
                    $scope.UI.areasLoaded = true;
                    if (!response.err) {
                        $scope.inventoryAreas = response.inventoryAreas;
                    }
                }
            );
        };
        $scope.initWarehouses = function (data) {
            $scope.UI.warehousesLoaded = false;
            $inventory.getWarehouses(data)
            .then(
                function (response) {
                    $scope.UI.warehousesLoaded = true;
                    if (!response.err) {
                        $scope.warehouses = response.warehouses;
                    }
                }
            );
        };
        $scope.initWarehouseTypes = function (data) {
            $scope.UI.warehouseTypesLoaded = false;
            $inventory.getWarehouseTypes(data)
            .then(
                function (response) {
                    $scope.UI.warehouseTypesLoaded = true;
                    if (!response.err) {
                        $scope.warehouseTypes = response.warehouseTypes;
                    }
                }
            );
        };
        $scope.initInventoryAreaTypes = function (data) {
            $scope.UI.inventoryAreaTypesLoaded = false;
            $inventory.initInventoryAreaTypes(data)
            .then(
                function (response) {
                    $scope.UI.inventoryAreaTypesLoaded = true;
                    if (!response.err) {
                        $scope.inventoryAreaTypes = response.inventoryAreaTypes;
                    }
                }
            );
        };
        $scope.initVendors = function () {
            $scope.UI.vendorsLoaded = false;
            $inventory.getVendors()
            .then(function (response) {
                $scope.UI.vendorsLoaded = true;
                if (!response.err) {
                    $scope.vendors = response.vendors;
                    $log.log($scope.vendors);
                }
            });
        };   
        $scope.initPurchaseOrders = function () {
            $scope.UI.purchaseOrdersLoaded = false;
            
            $inventory.getPurchaseOrders()
            .then(function (response) {
                $scope.UI.purchaseOrdersLoaded = true;
                if (!response.err) {
                    $scope.purchaseOrders = response.purchaseOrders;
                } else {
                    $scope.initErrorMessage('Error fetching purchase orders.');
                }
            }).catch(function (err) {
                $scope.UI.purchaseOrdersLoaded = true
                $scope.initErrorMessage('Error fetching purchase orders.')
            });
        };
        $scope.initItemForm = function () {
            $scope.UI.formSaving = false;
            $scope.UI.newItem = false;
            $scope.UI.itemLoaded = false;
            $scope.item = {};
        
            if ($routeParams.itemId) {
                $inventory.getItem({ id: $routeParams.itemId })
                    .then(function (response) {
                        $scope.UI.itemLoaded = true;
                        if (!response.err) {
                            $scope.item = response.item;
                        }
                    });
            } else {
                $scope.UI.newItem = true;
                $scope.item = {
                    name: null,
                    partNumber: null,
                    manufacturerId: null,
                    rate: null,
                    unitId: null,
                    taxable: null,
                    description: null,
                    imageName: null,
                    userId: null,
                    itemTypeId: null,
                    reorderPoint: null,
                    quantity: null,
                    cost: null,
                    markUpRate: null,
                    isActive: 1,
                    salesTaxRateId: null,
                    businessUnitId: null,
                    created: null,
                    modified: null,
                    minimumOrderAmount: null,
                    parentManufacturerPartNumber: null,
                    adHocEstimates: null,
                    discountItem: 0,
                    isPercent: 0,
                    imgUrl: null,
                    manufacturerPartNumber: null,
                    isVariable: false,
                };
                $scope.UI.itemLoaded = true;
            }
        };
        $scope.initInventoryAisleForm = function (aisle) {
            $scope.UI.formSaving = false;
            $scope.UI.newInventoryAisle = false;
            $scope.UI.inventoryAisleLoaded = false;
            $scope.inventoryAisle = aisle;
            if (!aisle) {
                $scope.UI.newInventoryAisle = true;
                $scope.inventoryAisle = {
                    name: null,
                    description: null,
                    inventoryAreaId: null,
                    step: null
                };
            }
            $scope.UI.inventoryAisleLoaded = true;
        };
        $scope.initInventoryRowForm = function (row) {
            $scope.UI.formSaving = false;
            $scope.UI.newInventoryRow = false;
            $scope.UI.inventoryRowLoaded = false;
            $scope.inventoryRow = row;
            if (!row) {
                $scope.UI.newInventoryRow = true;
                $scope.inventoryRow = {
                    name: null,
                    description: null,
                    inventoryAisleId: null,
                    step: null
                };
            }
            $scope.UI.inventoryRowLoaded = true;
        };
        $scope.initInventoryShelfForm = function (shelf) {
            $scope.UI.formSaving = false;
            $scope.UI.newInventoryShelf = false;
            $scope.UI.inventoryShelfLoaded = false;
            $scope.inventoryShelf = shelf;
            if (!shelf) {
                $scope.UI.newInventoryShelf = true;
                $scope.inventoryShelf = {
                    name: null,
                    description: null,
                    inventoryRowId: null,
                    step: null
                };
            }
            $scope.UI.inventoryShelfLoaded = true;
        };
        $scope.initInventoryRackForm = function (rack) {
            $scope.UI.formSaving = false;
            $scope.UI.newInventoryRack = false;
            $scope.UI.inventoryRackLoaded = false;
            $scope.inventoryRack = rack;
            if (!rack) {
                $scope.UI.newInventoryRack = true;
                $scope.inventoryRack = {
                    name: null,
                    description: null,
                    inventoryShelfId: null,
                    step: null
                };
            }
            $scope.UI.inventoryRackLoaded = true;
        };
        $scope.initInventorySectionForm = function (section) {
            $scope.UI.formSaving = false;
            $scope.UI.newInventorySection = false;
            $scope.UI.inventorySectionLoaded = false;
            $scope.inventorySection = section;
            if (!section) {
                $scope.UI.newInventorySection = true;
                $scope.inventorySection = {
                    name: null,
                    description: null,
                    inventoryRackId: null,
                    step: null
                };
            }
            $scope.UI.inventorySectionLoaded = true;
        };
        $scope.initInventoryItemForm = function (item) {
            $scope.UI.formSaving = false;
            $scope.UI.newInventoryItem = false;
            $scope.UI.inventoryItemLoaded = false;
            $scope.inventoryItem = item;
            if (!item) {
                $scope.UI.newInventoryItem = true;
                $scope.inventoryItem = {
                    name: null,
                    description: null,
                    sectionId: null,
                    quantity: null
                };
            }
            $scope.UI.inventoryItemLoaded = true;
        };
        $scope.initInventoryLabelForm = function (label) {
            $scope.UI.formSaving = false;
            $scope.UI.newInventoryLabel = false;
            $scope.UI.inventoryLabelLoaded = false;
            $scope.inventoryLabel = label;
            if (!label) {
                $scope.UI.newInventoryLabel = true;
                $scope.inventoryLabel = {
                    name: null,
                    description: null,
                    itemId: null
                };
            }
            $scope.UI.inventoryLabelLoaded = true;
        };
        $scope.initInventoryAreaForm = function (area) {
            $scope.UI.formSaving = false;
            $scope.UI.newInventoryArea = false;
            $scope.UI.inventoryAreaLoaded = false;
            $scope.inventoryArea = area;
            if (!area) {
                $scope.UI.newInventoryArea = true;
                $scope.inventoryArea = {
                    name: null,
                    description: null,
                    warehouseId: $scope.warehouse.id,
                };
            }
            $scope.UI.inventoryAreaLoaded = true;
        };
        $scope.initInventoryAreaTypeForm = function (areaType) {
            $scope.UI.formSaving = false;
            $scope.UI.newInventoryAreaType = false;
            $scope.UI.inventoryAreaTypeLoaded = false;
            $scope.inventoryAreaType = areaType;
            if (!areaType) {
                $scope.UI.newInventoryAreaType = true;
                $scope.inventoryAreaType = {
                    name: null,
                    description: null
                };
            }
            $scope.UI.inventoryAreaTypeLoaded = true;
        };
        $scope.initInventoryShelfForm = function(inventoryShelf) {
            $scope.UI.formSaving = false;
            $scope.UI.newInventoryShelf = false;
            $scope.UI.inventoryShelfLoaded = false;
            $scope.inventoryShelf = inventoryShelf;
            if (!inventoryShelf) {
                $scope.UI.newInventoryShelf = true;
                $scope.inventoryShelf = {
                    name: null,
                    description: null,
                    inventoryRowId: null
                };
            }
            $scope.UI.inventoryShelfLoaded = true;
        };
        $scope.initWarehouseForm = function(warehouse) {
            $scope.UI.formSaving = false;
            $scope.UI.newWarehouse = false;
            $scope.UI.warehouseLoaded = false;
            $scope.warehouse = warehouse;
            if (!warehouse) {
                $scope.UI.newWarehouse = true;
                $scope.warehouse = {
                    name: null,
                    description: null,
                    warehouseTypeId: null
                };
            }
            $scope.UI.warehouseLoaded = true;
        };
        $scope.initVendorForm = function(vendor) {
            $scope.UI.formSaving = false;
            $scope.UI.newVendor = false;
            $scope.UI.vendorLoaded = false;
            $scope.vendor = vendor;
            $setup.getStates()
            .then(
                function (response) {
                    $scope.states = response.states;

                    if (!vendor) {
                        $scope.UI.newVendor = true;
                        $scope.vendor = {
                            name: null,
                            contactName: null,
                            contactEmail: null,
                            contactPhone: null,
                            address: null,
                            city: null,
                            stateId: null,
                            zipCode: null,
                        }
                    } else {

                        $scope.address = {
                            street1: vendor.street1,
                            street2: vendor.street2,
                            city: vendor.city,
                            stateId: vendor.stateId,
                            zipCode: vendor.zipCode,
                        }

                    }
                    $scope.UI.vendorLoaded = true;
                }
            );
        };
        $scope.initWarehouseTypeForm = function(warehouseType) {
            $scope.UI.formSaving = false;
            $scope.UI.newWarehouseType = false;
            $scope.UI.warehouseTypeLoaded = false;
            $scope.warehouseType = warehouseType;
            if (!warehouseType) {
                $scope.UI.newWarehouseType = true;
                $scope.warehouseType = {
                    name: null
                };
            }
            $scope.UI.warehouseTypeLoaded = true;
        };
        $scope.initFormSaved = function (msg) {
            $scope.UI.formSaved = true;
            $scope.UI.message = msg;
            $timeout(function () {
                $scope.UI.message = null;
                $scope.UI.formSaved = false;
            }, 3000);
        };
        $scope.initErrorMessage = function (msg) {
            $scope.UI.errMessage = msg;

            $timeout(
                function () {
                    $scope.UI.errMessage = null;
                }, 3000
            );
        };   
        $scope.initTreeGrid = function (data) {
            var treeGridLoaded = _.isEmpty($scope.treeGrid);
            if (!treeGridLoaded) {
                $scope.treeGrid.destructor();
            }

            $scope.treeGridColumnsSelectize = [
                {
                    id: 'name', 
                    name: 'Name',
                }, 
                {
                    id: 'type', 
                    name: 'Type',
                }, 
                {
                    id: 'quantity', 
                    name: 'Quantity',
                },
                {
                    id: 'unitOfMeasure', 
                    name: 'Unit',
                },
                {
                    id: 'partNumber', 
                    name: 'Part Number'
                },
                {
                    id: 'parentManufacturerPartNumber', 
                    name: 'Manufacturer Part Number',
                }
            ];
            $scope.treeGridColumns = [
                { 
                    id: 'name', 
                    header: [
                        { 
                            text: $scope.warehouse.name 
                        }
                    ], 
                    minWidth: 300,
                    adjust: true
                },
                { 
                    id: 'type', 
                    name: 'Type',
                    header: [
                        { 
                            text: 'Type' 
                        }
                    ], 
                    minWidth: 200,
                    adjust: true
                },
                { 
                    id: 'quantity', 
                    name: 'Quantity',
                    header: [
                        { 
                            text: 'Quantity' 
                        }
                    ], 
                    minWidth: 500,
                    adjust: true
                },
                { 
                    id: 'unitOfMeasure', 
                    name: 'Unit',
                    header: [
                        { 
                            text: 'Unit' 
                        }
                    ], 
                    minWidth: 200,
                    adjust: true
                },
                { 
                    id: 'partNumber', 
                    name: 'Part Number',
                    header: [
                        { 
                            text: 'Part Number' 
                        }
                    ], 
                    minWidth: 200,
                    adjust: true
                },
                { 
                    id: 'parentManufacturerPartNumber', 
                    name: 'Manufacturer Part Number',
                    header: [
                        { 
                            text: 'Manufacturer Part Number' 
                        }
                    ], 
                    minWidth: 300,
                    adjust: true
                },
            ];
            $scope.treeGrid = new dhx.TreeGrid('warehouse', {
                columns: $scope.treeGridColumns,
                autoHeight: true,
                rowHeight: 'auto',
                autoWidth: true,
                htmlEnable: true,
                tooltip: false
            });
            $scope.treeGrid.data.parse(data);

            $scope.treeGrid.events.on(
                "cellDblClick", 
                function (item, column, event) {
                    var id = item.editId;
                    if (item.editId) {
                        switch (item.inventoryType) {
                            case 'Area':
                                var area = _.find(
                                    $scope.inventoryAreas,
                                    function (area) {
                                        return area.id == id;
                                    }
                                )
                                $scope.initInventoryAreaForm(area);
                            break;
                            case 'Aisle':
                                var aisle = _.find(
                                    $scope.inventoryAisles,
                                    function (aisle) {
                                        return aisle.id == id;
                                    }
                                )
                                $log.log(aisle);
                                $scope.initInventoryAisleForm(aisle);
                            break;
                            case 'Row':
                                var row = _.find(
                                    $scope.inventoryRows,
                                    function (row) {
                                        return row.id == id;
                                    }
                                )
                                $scope.initInventoryRowForm(row);
                            break;
                            case 'Shelf':
                                var shelf = _.find(
                                    $scope.inventoryShelves,
                                    function (shelf) {
                                        return shelf.id == id;
                                    }
                                )
                                $scope.initInventoryShelfForm(shelf);
                            break;
                            case 'Rack':
                                var rack = _.find(
                                    $scope.inventoryRacks,
                                    function (rack) {
                                        return rack.id == id;
                                    }
                                )
                                $scope.initInventoryRackForm(rack);
                            break;
                            case 'Section':
                                var section = _.find(
                                    $scope.inventorySections,
                                    function (section) {
                                        return section.id == id;
                                    }
                                )
                                $scope.initInventorySectionForm(section);
                            break;
                            default:
                                return;
                        };
                        $scope.UI.createInventory = item.inventoryType;
                        $scope.$apply();
                        $('#viewWarehouseCreationReveal').foundation('open');
                    };
                }
            );
            $timeout(function() {
                var element = angular.element(document.getElementById('warehouse'));
                $compile(element.contents())($scope);
            }, 0);
        };    
        $scope.searchVendorItems = function () {
            var data = {
                id: $routeParams.vendorId,
                query: $scope.search.vendorItems.value,
                page: $scope.search.page
            };

            $inventory.searchVendorItems(data)
            .then(function (response) {
                $scope.UI.vendorItemsLoaded = true;
                if (!response.err) {
                    $scope.total = response.total;
                    $scope.vendorItems = response.items;
                    $log.log($scope.vendorItems);
                }
            });
        };
        $scope.createItem = function (e, item) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createItem(item)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $rootScope.goBack();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating item.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating item: ${err}`;
                }
            );
        };
        $scope.createInventoryAisle = function (e, aisle) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createInventoryAisle(aisle)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#viewWarehouseCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating inventory aisle.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating inventory aisle: ${err}`;
                }
            );
        };
        $scope.createInventoryRow = function (e, row) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createInventoryRow(row)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#viewWarehouseCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating inventory row.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating inventory row: ${err}`;
                }
            );
        };
        $scope.createInventoryShelf = function (e, shelf) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createInventoryShelf(shelf)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#viewWarehouseCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating inventory shelf.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating inventory shelf: ${err}`;
                }
            );
        };
        $scope.createInventoryRack = function (e, rack) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createInventoryRack(rack)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#viewWarehouseCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating inventory rack.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating inventory rack: ${err}`;
                }
            );
        };
        $scope.createInventorySection = function (e, section) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createInventorySection(section)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#viewWarehouseCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating inventory section.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating inventory section: ${err}`;
                }
            );
        };
        $scope.createInventoryItem = function (e, item) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createInventoryItem(item)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryItems();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating inventory item.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating inventory item: ${err}`;
                }
            );
        };
        $scope.createInventoryLabel = function (e, label) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createInventoryLabel(label)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryLabels();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating inventory label.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating inventory label: ${err}`;
                }
            );
        };
        $scope.createInventoryArea = function (e, area) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            $inventory.createInventoryArea(area)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#inventoryAreaCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating inventory area.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating inventory area: ${err}`;
                }
            );
        };
        $scope.createWarehouse = function (e, warehouse) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createWarehouse(warehouse)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouses();
                        $scope.initFormSaved(response.msg);
                        $('#warehouseCreateFormReveal').foundation('close');
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating warehouse.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating warehouse: ${err}`;
                }
            );
        };
        $scope.createWarehouseType = function (e, warehouseType) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createWarehouseType(warehouseType)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouseTypes();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating warehouse type.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating warehouse type: ${err}`;
                }
            );
        };
        $scope.createInventoryAreaType = function (e, areaType) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createInventoryAreaType(areaType)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryAreaTypes();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating inventory area type.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating inventory area type: ${err}`;
                }
            );
        };
        $scope.createVendor = function (e, vendor) {
            if (e) {
                e.preventDefault();
            };

            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            if ($scope.address) {
                vendor.street1 = $scope.address.street1;
                vendor.street2 = $scope.address.street2;
                vendor.city = $scope.address.city;
                vendor.stateId = $scope.address.stateId;
                vendor.zipCode = $scope.address.zipCode;
            }
            $inventory.createVendor(vendor)
            .then(function (response) {
                $scope.UI.formSaving = false;
                if (!response.err) {
                    $scope.initVendors();
                    $scope.initFormSaved(response.msg);
                    $('#vendorCreateFormReveal').foundation('close');
                } else {
                    $scope.UI.errMessage = response.msg || 'Error creating vendor.';
                }
            }).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating vendor: ${err}`;
                }
            );
        };
        $scope.createVendorItem = function (e, vendorItem) {
            if (e) e.preventDefault();
            $scope.UI.formSaving = true;
            $inventory.createVendorItem(vendorItem)
            .then(function (response) {
                $scope.UI.formSaving = false;
                if (!response.err) {
                    $scope.initVendorItems();
                    $scope.initFormSaved(response.msg);
                } else {
                    $scope.UI.errMessage = response.msg || 'Error creating vendor item.';
                }
            }).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error creating vendor item: ${err}`;
                }
            );
        };
        $scope.updateItem = function (item) {
            $scope.UI.formSaving = true;
            $inventory.updateItem(item)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $rootScope.goBack();
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating item.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating item: ${err}`;
                }
            );
        };
        $scope.updateInventoryAisle = function (aisle) {
            $scope.UI.formSaving = true;
            $inventory.updateInventoryAisle(aisle)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#viewWarehouseCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating inventory aisle.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating inventory aisle: ${err}`;
                }
            );
        };
        $scope.updateInventoryRow = function (row) {
            $scope.UI.formSaving = true;
            $inventory.updateInventoryRow(row)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#viewWarehouseCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating inventory row.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating inventory row: ${err}`;
                }
            );
        };
        $scope.updateInventoryShelf = function (shelf) {
            $scope.UI.formSaving = true;
            $inventory.updateInventoryShelf(shelf)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#viewWarehouseCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating inventory shelf.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating inventory shelf: ${err}`;
                }
            );
        };
        $scope.updateInventoryRack = function (rack) {
            $scope.UI.formSaving = true;
            $inventory.updateInventoryRack(rack)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#viewWarehouseCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating inventory rack.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating inventory rack: ${err}`;
                }
            );
        };
        $scope.updateInventorySection = function (section) {
            $scope.UI.formSaving = true;
            $inventory.updateInventorySection(section)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#viewWarehouseCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating inventory section.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating inventory section: ${err}`;
                }
            );
        };
        $scope.updateInventoryItem = function (item) {
            $scope.UI.formSaving = true;
            $inventory.updateInventoryItem(item)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryItems();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating inventory item.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating inventory item: ${err}`;
                }
            );
        };
        $scope.updateInventoryLabel = function (label) {
            $scope.UI.formSaving = true;
            $inventory.updateInventoryLabel(label)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryLabels();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating inventory label.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating inventory label: ${err}`;
                }
            );
        };
        $scope.updateInventoryArea = function (area) {
            $scope.UI.formSaving = true;
            $inventory.updateInventoryArea(area)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouse();
                        $('#viewWarehouseCreationReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating inventory area.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating inventory area: ${err}`;
                }
            );
        };
        $scope.updateWarehouse = function (warehouse) {
            $scope.UI.formSaving = true;
            $inventory.updateWarehouse(warehouse)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouses();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating warehouse.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating warehouse: ${err}`;
                }
            );
        };
        $scope.updateWarehouseType = function (warehouseType) {
            $scope.UI.formSaving = true;
            $inventory.updateWarehouseType(warehouseType)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouseTypes();
                        $scope.initFormSaved(response.msg);
                        $('#vendorCreateFormReveal').foundation('close');
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating warehouse type.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating warehouse type: ${err}`;
                }
            );
        };
        $scope.updateInventoryAreaType = function (areaType) {
            $scope.UI.formSaving = true;
            $inventory.updateInventoryAreaType(areaType)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryAreaTypes();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating inventory area type.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating inventory area type: ${err}`;
                }
            );
        };
        $scope.updateInventoryItemQuantity = function (itemId, quantity) {
            var itemToUpdate = {
                id: itemId,
                quantity: quantity
            };
            $inventory.updateInventoryItem(itemToUpdate)
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error updating inventory item quantity.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error updating inventory item quantity: ${err}`;
                }
            );
        };  
        $scope.updateVendor = function (vendor) {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;


            if ($scope.address) {
                vendor.street1 = $scope.address.street1;
                vendor.street2 = $scope.address.street2;
                vendor.city = $scope.address.city;
                vendor.stateId = $scope.address.stateId;
                vendor.zipCode = $scope.address.zipCode;
            };

            $inventory.updateVendor(vendor)
            .then(function (response) {
                $scope.UI.formSaving = false;
                if (!response.err) {
                    $scope.initVendors();
                    $scope.initFormSaved(response.msg);
                } else {
                    $scope.UI.errMessage = response.msg || 'Error updating vendor.';
                }
            }).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating vendor: ${err}`;
                }
            );
        };
        $scope.updateVendorItem = function (vendorItem) {
            $scope.UI.formSaving = true;
            $inventory.updateVendorItem(vendorItem)
            .then(function (response) {
                $scope.UI.formSaving = false;
                if (!response.err) {
                    $scope.initVendorItems();
                    $scope.initFormSaved(response.msg);
                } else {
                    $scope.UI.errMessage = response.msg || 'Error updating vendor item.';
                }
            }).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error updating vendor item: ${err}`;
                }
            );
        };
        $scope.deleteItem = function (item) {
            $scope.UI.formSaving = true;
            $inventory.deleteItem({ id: item.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initItems();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting item.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting item: ${err}`;
                }
            );
        };
        $scope.deleteInventoryAisle = function (aisle) {
            $scope.UI.formSaving = true;
            $inventory.deleteInventoryAisle({ id: aisle.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryAisles();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting inventory aisle.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting inventory aisle: ${err}`;
                }
            );
        };
        $scope.deleteInventoryRow = function (row) {
            $scope.UI.formSaving = true;
            $inventory.deleteInventoryRow({ id: row.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryRows();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting inventory row.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting inventory row: ${err}`;
                }
            );
        };
        $scope.deleteInventoryShelf = function (shelf) {
            $scope.UI.formSaving = true;
            $inventory.deleteInventoryShelf({ id: shelf.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryShelves();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting inventory shelf.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting inventory shelf: ${err}`;
                }
            );
        };
        $scope.deleteInventoryRack = function (rack) {
            $scope.UI.formSaving = true;
            $inventory.deleteInventoryRack({ id: rack.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryRacks();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting inventory rack.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting inventory rack: ${err}`;
                }
            );
        };
        $scope.deleteInventorySection = function (section) {
            $scope.UI.formSaving = true;
            $inventory.deleteInventorySection({ id: section.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventorySections();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting inventory section.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting inventory section: ${err}`;
                }
            );
        };
        $scope.deleteInventoryItem = function (item) {
            $scope.UI.formSaving = true;
            $inventory.deleteInventoryItem({ id: item.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryItems();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting inventory item.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting inventory item: ${err}`;
                }
            );
        };
        $scope.deleteInventoryLabel = function (label) {
            $scope.UI.formSaving = true;
            $inventory.deleteInventoryLabel({ id: label.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryLabels();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting inventory label.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting inventory label: ${err}`;
                }
            );
        };
        $scope.deleteInventoryArea = function (area) {
            $scope.UI.formSaving = true;
            $inventory.deleteInventoryArea({ id: area.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryAreas();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting inventory area.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting inventory area: ${err}`;
                }
            );
        };
        $scope.deleteWarehouse = function (warehouse) {
            $scope.UI.formSaving = true;
            $inventory.deleteWarehouse({ id: warehouse.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouses();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting warehouse.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting warehouse: ${err}`;
                }
            );
        };        
        $scope.deleteWarehouseType = function (warehouseType) {
            $scope.UI.formSaving = true;
            $inventory.deleteWarehouseType({ id: warehouseType.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initWarehouseTypes();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting warehouse type.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting warehouse type: ${err}`;
                }
            );
        };        
        $scope.deleteInventoryAreaType = function (areaType) {
            $scope.UI.formSaving = true;
            $inventory.deleteInventoryAreaType({ id: areaType.id })
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initInventoryAreaTypes();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error deleting inventory area type.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting inventory area type: ${err}`;
                }
            );
        }; 
        $scope.deleteVendor = function (vendor) {
            $scope.UI.formSaving = true;
            $inventory.deleteVendor({ id: vendor.id })
            .then(function (response) {
                $scope.UI.formSaving = false;
                if (!response.err) {
                    $scope.initVendors();
                    $scope.initFormSaved(response.msg);
                } else {
                    $scope.UI.errMessage = response.msg || 'Error deleting vendor.';
                }
            }).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting vendor: ${err}`;
                }
            );
        };
        $scope.deleteVendorItem = function (vendorItem) {
            $scope.UI.formSaving = true;
            $inventory.deleteVendorItem({ id: vendorItem.id })
            .then(function (response) {
                $scope.UI.formSaving = false;
                if (!response.err) {
                    $scope.initVendorItems();
                    $scope.initFormSaved(response.msg);
                } else {
                    $scope.UI.errMessage = response.msg || 'Error deleting vendor item.';
                }
            }).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = `Error deleting vendor item: ${err}`;
                }
            );
        };        
        $scope.filterTreeGrid = function(value) {
            if (!value) {
                $scope.treeGrid.data.filter();
            } else {
                const column = $scope.sort.inventoryWarehouse.value;
                $scope.treeGrid.data.filter(
                    {
                        by: column,
                        match: value,
                        compare: function (val, match) { return new RegExp(match, "i").test(val) }
                    }
                );
            }
        };
        $scope.formatTreeGridData = function (warehouse) {
            var data = [];
            $scope.itemQuantities = [];
        
            // Sort InventoryAreas by step
            const sortedAreas = _.sortBy(warehouse.InventoryAreas, 'step');
            _.forEach(sortedAreas, function (area) {
                data.push({
                    id: 'area_' + area.id,
                    url: '/inventory/areas/area/' + area.id + '/edit',
                    editId: area.id,
                    inventoryType: 'Area',
                    name: area.name,
                    type: area.Type.name
                });
        
                // Sort Aisles by step
                const sortedAisles = _.sortBy(area.Aisles, 'step');
                _.forEach(sortedAisles, function (aisle) {
                    data.push({
                        id: 'aisle_' + aisle.id,
                        url: '/inventory/aisles/aisle/' + aisle.id + '/edit',
                        editId: aisle.id,
                        inventoryType: 'Aisle',
                        name: aisle.name,
                        parent: 'area_' + area.id
                    });
        
                    // Sort Rows by step
                    const sortedRows = _.sortBy(aisle.Rows, 'step');
                    _.forEach(sortedRows, function (row) {
                        data.push({
                            id: 'row_' + row.id,
                            url: '/inventory/rows/row/' + row.id + '/edit',
                            editId: row.id,
                            inventoryType: 'Row',
                            name: row.name,
                            parent: 'aisle_' + aisle.id
                        });
        
                        // Sort Shelves by step
                        const sortedShelves = _.sortBy(row.Shelves, 'step');
                        _.forEach(sortedShelves, function (shelf) {
                            data.push({
                                id: 'shelf_' + shelf.id,
                                url: '/inventory/shelves/shelf/' + shelf.id + '/edit',
                                editId: shelf.id,
                                inventoryType: 'Shelf',
                                name: shelf.name,
                                parent: 'row_' + row.id
                            });
        
                            // Sort Racks by step
                            const sortedRacks = _.sortBy(shelf.Racks, 'step');
                            _.forEach(sortedRacks, function (rack) {
                                data.push({
                                    id: 'rack_' + rack.id,
                                    url: '/inventory/racks/rack/' + rack.id + '/edit',
                                    editId: rack.id,
                                    inventoryType: 'Rack',
                                    name: rack.name,
                                    parent: 'shelf_' + shelf.id
                                });
        
                                // Sort Sections by step
                                const sortedSections = _.sortBy(rack.Sections, 'step');
                                _.forEach(sortedSections, function (section) {
                                    data.push({
                                        id: 'section_' + section.id,
                                        url: '/inventory/sections/section/' + section.id + '/edit',
                                        editId: section.id,
                                        inventoryType: 'Section',
                                        name: section.name,
                                        parent: 'rack_' + rack.id
                                    });
        
                                    // Items are not sorted by step as it is not specified in the item structure
                                    _.forEach(section.Items, function (item) {
                                        $scope.itemQuantities[item.id] = item.quantity;
                                        data.push({
                                            id: 'item_' + item.id,
                                            name: '<a href="inventory/item/' + item.id + '">' + item.Item.name + '</a>',
                                            parent: 'section_' + section.id,
                                            quantity: '<div class="input-container">' +
                                                '<label for="itemQuantity-' + item.id + '">Quantity</label><input class="form-input" type="number" step="0.01"' +
                                                'id="itemQuantity-' + item.id + '" name="itemQuantity-' + item.id + '" ng-model="itemQuantities[' + item.id + ']" placeholder="Enter a quantity"' +
                                                'ng-value="' + item.quantity + '"/></div><button class="edit-button submit-button button warning white-text"' + 
                                                'type="button" ng-click="updateInventoryItemQuantity(' + item.id + ', itemQuantities[' + item.id + '])">' +
                                                '<i class="fal fa-check-circle"></i> Update</button>',
                                            unit: item.unitOfMeasure,
                                            partNumber: item.Item.partNumber,
                                            parentManufacturerPartNumber: item.Item.parentManufacturerPartNumber,
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
            return data;
        };
        $scope.updateVendorsDisplayed = function() {
            if ($scope.UI.vendorsDisplayed <= $scope.vendors.length) {
                $scope.UI.vendorsDisplayed += 10;
            }
        };
        $scope.updateWarehousesDisplayed = function() {
            if ($scope.UI.warehousesDisplayed <= $scope.warehouses.length) {
                $scope.UI.warehousesDisplayed += 10;
            }
        };
        $scope.initVendorsInfiniteScroll = function () {
            var observer = new IntersectionObserver(function(entries) {
                if(entries[0].isIntersecting === true) {
                    angular.element('#vendorsListInfiniteScroll').triggerHandler('click');
                }
            }, { threshold: [0] });
            observer.observe(document.getElementById('vendorsListInfiniteScroll'));
        };
        $scope.initWarehousesInfiniteScroll = function () {
            var observer = new IntersectionObserver(function(entries) {
                if(entries[0].isIntersecting === true) {
                    angular.element('#warehousesListInfiniteScroll').triggerHandler('click');
                }
            }, { threshold: [0] });
            observer.observe(document.getElementById('warehousesListInfiniteScroll'));
        };
        $rootScope.$on('csvUploaded', function (e, data) {
            switch (data.subType) {

                case 'items':
                    $scope.initFormSaved(data.msg);
                    $scope.initItems();
                break;
            };
        });
    });
});
