const { assign } = require("lodash");

define(['app-controller', 'kanban'], function (app, kanban) {
    app.register.controller('WorkOrderController',
    function (
        $scope,
        $rootScope,
        $routeParams,
        $location,
        $window,
        $document,
        $log,
        $q,
        $compile,
        $timeout,
        $estimate,
        $user,
        $workOrder,
        $inventory,
        $setup,
        $media,
        $activity,
    ) {

        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];
        $scope.page = $setup.getCurrentPage() || {};
        $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null);

        $scope.kanbanBoard = null;

        $scope.workOrder = {};
        $scope.purchaseOrder = {};

        $scope.workOrders = [];
        $scope.users = [];
        $scope.lineItems = [];
        $scope.vendors = [];
        $scope.purchaseOrders = [];
        $scope.workOrderStatuses = [];
        $scope.purchaseOrderStatuses = [];

        $scope.UI = {
            currentUrl: window.location.pathname.split( '/' ),
            isMobile: $media.getMedia(),
            workOrderView: false,
            message: null,
            errMessage: null,
            formSaving: false,
            formSaved: false,
            modalFormSaved: false,
            workOrderLoaded: false,
            purchaseOrderLoaded: false,
            vendorsLoaded: false,
            workOrdersLoaded: false,
            purchaseOrdersLoaded: false,
            workOrderStatusesLoaded: false,
            purchaseOrderStatusesLoaded: false,
            workOrderActivitiesLoaded: false,
            editBoard: false,
            
        };

        $scope.initWorkOrder = function (id) {
            const isPurchaseOrders = $location.search().purchaseOrders;

            if ($routeParams.workOrderId) {
                id = $routeParams.workOrderId;
            };
            $scope.UI.workOrderLoaded = false;
            $scope.UI.workOrderView = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;
            
            $workOrder.getWorkOrder({id: id})
            .then(
                function (response) {
                    $scope.UI.workOrderLoaded = true;
                    
                    if (!response.err) {
                        $scope.workOrder = response.workOrder;

                        if (isPurchaseOrders) {
                            $scope.initPurchaseOrders();
                            $('#viewPurchaseOrdersReveal').foundation('open');
                        }
                        $scope.initWorkOrderActivity();

                        $timeout(
                            function () {
                                $(document).foundation();
                            }, 500
                        )
                        
                    };
                }
            );
        };
        $scope.initWorkOrders = function () {
            $scope.UI.workOrdersLoaded = false;
            $scope.UI.workOrderStatusesLoaded = false;
            $scope.UI.usersLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $scope.workOrders = [];
            $scope.workOrderStatus = [];
            $scope.users = [];

            var data = {
                status: 1,
                priority: 2,
            }
            $q.all(
                [
                    $workOrder.searchWorkOrders(data),
                    $workOrder.getWorkOrderStatuses(),
                    $user.getUsers(),
                ]
            ).then(
                function (responses) {
                    $scope.UI.workOrdersLoaded = true;
                    $scope.UI.workOrderStatusesLoaded = true;
                    $scope.UI.usersLoaded = true;

                    if (
                        !responses[0].err && 
                        !responses[1].err &&
                        !responses[2].err
                    ) {
                        $scope.workOrders = responses[0].workOrders;
                        $scope.workOrderStatuses = responses[1].workOrderStatuses;
                        $scope.users = responses[2].users;

                        $scope.initWorkOrderBoard($scope.workOrders);
                        
                    }
                },
                function (error) {
                    $scope.UI.workOrdersLoaded = true;
                    $scope.UI.errMessage = error?.msg || 'An error occurred while fetching the Work Orders.';
                }
            );
        };
        $scope.initWorkOrderBoard = function () {
            $scope.UI.workOrderBoardLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            const id = '#workOrderBoard';
            if ($scope.kanbanBoard) {
                $(id).remove();
                $('#workOrderBoardContainer').append(
                    `<div 
                        class="work-order-board"
                        id="workOrderBoard"
                    >
                    </div>`
                )
            };
            
            // Define columns dynamically from $scope.workOrderStatuses
            const kanbanBoards = $scope.workOrderStatuses.map(status => ({
                id: status.id.toString(), // jKanban requires string IDs
                title: status.name, // Column header
                statusId: status.id
            }));
        
            // Transform work order data into jKanban format
            const kanbanData = {};
            $scope.workOrders.forEach(order => {
                const statusId = order.statusId.toString();
                if (!kanbanData[statusId]) kanbanData[statusId] = [];
        
                // Use AngularJS binding in HTML (to be compiled later)
                kanbanData[statusId].push({
                    id: order.id.toString(), // Required field
                    title: `
                    <div class="kanban-item-content ${order.Priority.level} ${order.WorkOrderStatus.name}">
                        <div class="grid-x grid-margin-x align-middle">
                            <div class="cell small-12 medium-auto large-auto">
                                <h4><b>{{ '${order.title}' }}</b></h4>
                            </div>
                            <div class="cell small-12 medium-shrink large-shrink text-right" ng-if="!$root.UI.isMobile">
                                <h6 class="work-order-kanban-item-date">
                                    <i>{{ '${order.createdAt}' | DateTimeFormat }}</i>
                                </h6>
                            </div>
                            <div class="cell small-12 medium-12 large-12">
                                <h6>
                                    <b ng-if="$root.UI.isMobile">Date:</b>
                                    <span ng-if="$root.UI.isMobile">{{ '${order.createdAt}' | DateTimeFormat }}</span>
                                </h6>
                                <h6>
                                    <b>
                                        Assigned To: {{ order.assignedUserId || 'Unassigned' }}
                                    </b>
                                </h6>
                            </div>
                        </div>
                    </div>`,
                    workOrderNumber: order.workOrderNumber,
                    client: `${order.Client.firstName} ${order.Client.lastName}`,
                    createdBy: `${order.Creator.firstName} ${order.Creator.lastName}`,
                    createdAt: order.createdAt
                });
            });
        
            // Initialize jKanban with mobile-friendly options
            $scope.kanbanBoard = new jKanban({
                element: id,
                dragItems: $scope.UI.editBoard,
                widthBoard: $rootScope.UI.isMobile ? '280px' : '300px', // Narrower columns on mobile
                responsivePercentage: $rootScope.UI.isMobile, // Enable responsive mode on mobile
                boards: kanbanBoards.map(board => ({
                    id: board.id,
                    title: board.title,
                    item: kanbanData[board.id] || []
                })),
                itemAddOptions: false,
                click: function (element) {
                    $scope.UI.workOrderLoaded = false;
                        const workOrderId = element.getAttribute("data-eid"); 
                    
                    if (!$rootScope.UI.isMobile) {
                        
                        $('#workOrdersDetailsReveal').foundation('open');

                        $scope.initWorkOrder(workOrderId);
                    } else {
                        $location.path(`/work-orders/work-order/${workOrderId}`);
                        $scope.$apply(); // Ensure AngularJS updates the view
                    }
                },
                dropEl: function (el, target, source) {
                    const targetStatusId = $scope.kanbanBoard.getParentBoardID(el);
                    const workOrderId = el.getAttribute("data-eid");
                    const targetBoard = $scope.workOrderStatuses.find(status => status.id.toString() === targetStatusId);
                    const workOrder = $scope.workOrders.find(order => order.id.toString() === workOrderId);
                    if (!workOrder.assignUserId) {
                        // return the item to its original position
                        $scope.UI.errMessage = 'You must assign a user to the work order before changing its status.';
                        $scope.initWorkOrders();
                        return;
                    };
                    workOrder.statusId = targetBoard.id;

                    $workOrder.updateWorkOrderStatus(workOrder)
                    .then(
                        function (response) {
                            if (!response.err) {
                                $scope.initFormSaved(response.msg);
                                $scope.initWorkOrders();
                            } else {
                                $scope.UI.errMessage = response.msg || 'Failed to Update the Work Order Status.';
                            }
                        }
                    ).catch(
                        function (err) {
                            $scope.UI.errMessage = `Error Updating the Work Order Status: ${err.message}`;
                        }
                    );
                }
                
            });

            // Add mobile-specific classes after kanban initialization
            $timeout(function () {
                const kanbanContainer = document.querySelector('#workOrderBoard .kanban-container');
                if (kanbanContainer && $rootScope.UI.isMobile) {
                    kanbanContainer.classList.add('mobile-kanban-container');
                }
            }, 50);
        
            // Wait for AngularJS to render, then compile elements
            $timeout(
                function () {
                const kanbanItems = document.querySelectorAll("#workOrderBoard .kanban-item");
                kanbanItems.forEach(item => {
                    const angularElement = angular.element(item);
                    $compile(angularElement)($scope); // Compile AngularJS bindings
                });
                $scope.UI.workOrderBoardLoaded = true;
                $scope.$apply(); // Refresh AngularJS scope
            }, 100);
        };         
        $scope.initWorkOrderActivity = function () {
            $scope.UI.workOrderActivitiesLoaded = false;

            $activity.getWorkOrderActivities($scope.workOrder)
            .then(
                function (response) {
                    $scope.UI.workOrderActivitiesLoaded = true;
                    if (!response.err) {
                        $scope.activities = response.activities;
                    }
                }
            );

        };
        $scope.initPurchaseOrder = function (purchaseOrder) {
            $scope.UI.purchaseOrderLoaded = false;
            $scope.UI.purchaseOrderStatusesLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;
            
            $scope.purchaseOrder = {};
            $scope.purchaseOrderStatuses = [];

            if (!purchaseOrder) {
                purchaseOrder = {
                    id: $routeParams.purchaseOrderId
                }
    
            }
            $q.all(
                [
                    $workOrder.getPurchaseOrder(purchaseOrder),
                    $workOrder.getPurchaseOrderStatuses()
                ]
            )
            .then(
                function (responses) {
                    $scope.UI.purchaseOrderLoaded = true;
                    $scope.purchaseOrderStatusesLoaded = true;

                    if (
                        !responses[0].err &&
                        !responses[1].err

                    ) {
                        $scope.purchaseOrder = responses[0].purchaseOrder;
                        $scope.purchaseOrderStatuses = responses[1].purchaseOrderStatuses;

                        $scope.initWorkOrder($scope.purchaseOrder.workOrderId);
                    }

                }
            )
        };
        $scope.initPurchaseOrders = function () {
            $scope.UI.purchaseOrdersLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $scope.purchaseOrders = [];
            $scope.purchaseOrderStatuses = [];
            $scope.stopperStatuses = ['rejected', 'returned', 'archived', 'disputed', 'backordered'];
        
            $q.all([
                $workOrder.getPurchaseOrders({ id: $scope.workOrder.id }), // Get all purchase orders for the work order
                $workOrder.getPurchaseOrderStatuses() // Get all statuses
            ]).then(
                function (responses) {
                    $scope.UI.purchaseOrdersLoaded = true;
        
                    if (!responses[0].err && !responses[1].err) {
                        $scope.purchaseOrders = responses[0].purchaseOrders;
                        $scope.purchaseOrderStatuses = responses[1].purchaseOrderStatuses;
        
                        // Add filtered statuses for each purchase order
                        $scope.purchaseOrders = $scope.purchaseOrders.map((purchaseOrder) => {
                            // Determine the current status index for this purchase order
                            const currentStatusIndex = $scope.purchaseOrderStatuses.findIndex(
                                (status) => status.id === purchaseOrder.statusId
                            );
        
                            // Generate filtered statuses with fencing and completion logic
                            const filteredStatuses = $scope.purchaseOrderStatuses.map((status, index) => {
                                const isStopper = $scope.stopperStatuses.includes(status.name.toLowerCase());
                                return {
                                    ...status,
                                    completed: index <= currentStatusIndex, // Mark as complete if before the current index
                                    fenced: isStopper && index === currentStatusIndex // Mark as fenced if a stopper at the current index
                                };
                            }).filter((status) => {
                                const isStopper = $scope.stopperStatuses.includes(status.name.toLowerCase());
                                return !isStopper || status.fenced; // Include only non-stoppers or fenced stoppers
                            });
        
                            // Attach filtered statuses and current index to the purchase order
                            return {
                                ...purchaseOrder,
                                filteredStatuses,
                                currentStatusIndex
                            };
                        });
                    } else {
                        $scope.UI.errMessage = responses[0]?.msg || responses[1]?.msg || 'Failed to retrieve the Purchase Orders.';
                    }
                },
                function (error) {
                    $scope.UI.purchaseOrdersLoaded = true;
                    $scope.UI.errMessage = error?.msg || 'An error occurred while fetching the Purchase Orders.';
                }
            );
        };  
        $scope.initLineItems = function () {
            $scope.UI.lineItemsLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $scope.lineItems = [];

            $estimate.getLineItems()
            .then(
                function (response) {
                    $scope.UI.lineItemsLoaded = true;
                    if (!response.err) {
                        $scope.lineItems = response.lineItems;
                    };
                }
            );
        };  
        $scope.initVendors = function () {
            $scope.UI.vendorsLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $scope.vendors = [];

            $inventory.getVendors()
            .then(
                function (response) {
                    $scope.UI.vendorsLoaded = true;
                    
                    if (!response.err) {
                        $scope.vendors = response.vendors;
                        $log.log($scope.vendors);

                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve Vendors.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Retrieving the Vendors: ${err.message}`;
                }
            );
        };
        $scope.initVendorItems = function () {
            $scope.UI.itemsLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $scope.searchVendorItems();

            $scope.$watch(
                'search.items.value', 
                function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $scope.search.page = 1;
                        $scope.searchItems();
                    }
                }
            );
            angular.element($document)
            .bind(
                'scroll', 
                function() {
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
                }   
            );
        };    
        $scope.initWorkOrderForm = function () {
            $scope.UI.workOrderLoaded = false;
            $scope.UI.workOrderView = false;
            $scope.UI.workOrderStatusesLoaded = false;
            $scope.UI.usersLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $scope.workOrder = {};
            $scope.workOrderStatuses = [];
            $scope.users = [];

            $q.all([
                $workOrder.getWorkOrder({id: $routeParams.workOrderId}),
                $workOrder.getWorkOrderStatuses(),
                $user.getUsers(),
            ]).then(function (responses) {
                $scope.UI.workOrderLoaded = true;
                $scope.UI.workOrderStatusesLoaded = true;
                $scope.UI.usersLoaded = true;

                if (
                    !responses[0].err && 
                    !responses[1].err &&
                    !responses[2].err
                ) {
                    $scope.workOrder = responses[0].workOrder;
                    $scope.workOrderStatuses = responses[1].workOrderStatuses;
                    $scope.users = responses[2].users;

                    $timeout(
                        function () {
                            $(document).foundation();
                        }, 1000
                    )
                }
            });
        };
        $scope.initPurchaseOrderForm = function () {
            if ($scope.workOrder) {
                $scope.purchaseOrder.workOrderId = $scope.workOrder.id;
            };
            $scope.UI.vendorsLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;
            
            $inventory.getVendors()
            .then(
                function (response) {
                    $scope.UI.vendorsLoaded = true;

                    if (!response.error) {
                        $scope.vendors = response.vendors;
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve the Vendors.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Retrieving the Vendors: ${err.message}`;
                }
            );
        };
        $scope.initPurchaseOrderConvertForm = function (purchaseOrder) {
            $scope.UI.purchaseOrderStatusesLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $scope.purchaseOrderStatuses = [];
            $scope.purchaseOrder = purchaseOrder;

            $workOrder.getPurchaseOrderStatuses()
            .then(
                function (response) {
                    $scope.UI.purchaseOrderStatusesLoaded = true;

                    if (!response.err) {
                        $scope.purchaseOrderStatuses = response.purchaseOrderStatuses;

                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve the Purchase Order.';
                    }
                }
            )


        };   
        $scope.initAssignWorkOrderToUserForm = function (workOrder) {
            $scope.UI.usersLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $scope.workOrder = workOrder;

            $user.getUsers()
            .then(
                function (response) {
                    $scope.UI.usersLoaded = true;

                    if (!response.err) {
                        $scope.users = response.user;

                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to retrieve the Purchase Order.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Retrieving the Users: ${err.message}`;
                }
            );
        };   
        $scope.initEditWorkOrderLineItem = function (lineItem) {
            $scope.UI.newLineItem = !lineItem;
            $scope.UI.lineItemLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;
            

            if ($scope.UI.newLineItem) {
                $scope.lineItem = {
                    name: null,
                    description: null,
                    quantity: 0,
                    rate: 0.00,
                    unit: 'each',
                    subTotal: 0.00,
                    total: 0.00,
                    taxable: false,
                    markup: 0.00,
                    userId: $scope.user.id,
                    salesTaxRate: 0.00,
                    salesTaxTotal: 0.00,
                    moduleDescription: null,
                    instructions: null
                };
                $scope.UI.lineItemLoaded = true;
                return;
            };

            $workOrder.getLineItem(lineItem)
            .then(
                function (response) {
                    $scope.UI.lineItemLoaded = true;

                    $log.log(response);

                    if (!response.err) {
                        $scope.lineItem = response.workOrderLineItem;
                        _.each(
                            $scope.lineItem.Items,
                            function(item) {
                                item.newQuantity = item.LineItemItem.quantity;
                            }
                        );
                    }
                }
            );
        };       
        $scope.initFormSaved = function (msg) {
            $scope.UI.formSaved = true;
            $scope.UI.message = msg;
            
            $timeout(
                function () {
                    $scope.UI.errMessage = null;
                    $scope.UI.message = null;
                    $scope.UI.formSaved = false;
                }, 3000
            );
        };
        $scope.initErrorMessage = function (msg) {
            $scope.UI.errMessage = msg;

            $timeout(
                function () {
                    $scope.UI.errMessage = null;
                }, 3000
            );
        };
        $scope.initModalFormSaved = function (msg) {
            $scope.UI.modalFormSaved = true;
            $scope.UI.message = msg;
            $scope.UI.errMessage = null;
            
            $timeout(
                function () {
                    $scope.UI.errMessage = null;
                    $scope.UI.message = null;
                    $scope.UI.modalFormSaved = false;
                }, 3000
            );
        };
        $scope.searchWorkOrderKanbanBoard = function (searchTerm) {
            if (!$scope.kanbanBoard) return;
        
            $log.log($scope.kanbanBoard)
            // Convert search term to lowercase for case-insensitive search
            const lowerSearchTerm = searchTerm.toLowerCase();
        
            // Loop through all boards and filter items
            $scope.kanbanBoard.options.boards.forEach(board => {
                board.item.forEach(item => {
                    const element = document.querySelector(`[data-eid="${item.id}"]`);
        
                    if (element) {
                        const title = item.title.toLowerCase();
                        const workOrderNumber = item.workOrderNumber.toLowerCase();
        
                        // Show only if title or workOrderNumber matches search
                        if (title.includes(lowerSearchTerm) || workOrderNumber.includes(lowerSearchTerm)) {
                            element.style.display = "block"; // Show the matching item
                        } else {
                            element.style.display = "none"; // Hide non-matching items
                        }
                    }
                });
            });
        };
        $scope.searchVendorItems = function () {
            $scope.UI.message = null;
            $scope.UI.errMessage = null;
            
            var data = {
                id: $scope.purchaseOrder.vendorId,
                query: $scope.search.value,
                page: $scope.search.page,
            };
            $inventory.searchVendorItems(data)
            .then(
                function (response) {
                    $scope.UI.itemsLoaded = true;
                    if (!response.err) {
                        $scope.total = response.total;
                        $scope.items = response.items
                    };

                }
            )
        };
        $scope.createWorkOrder = function (e, workOrder) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $workOrder.createWorkOrder(workOrder)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $location.url('/work-orders/work-order/' + response.workOrder.id);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Create the Work Order.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Creating the Work Order: ${err.message}`;
                }
            );
        }; 
        $scope.createPurchaseOrder = function (e, purchaseOrder) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            $scope.UI.purchaseOrderLoaded = false;

            $workOrder.createPurchaseOrder(purchaseOrder)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    $scope.UI.purchaseOrderLoaded = true;

                    if (response.workOrder) {
                        $scope.workOrder = response.workOrder;
                    }

                    if (!response.err) {
                        $('#createPurchaseOrderReveal').foundation('close');
                        $location.url('/work-orders/work-order/purchase-orders/purchase-order/' + response.purchaseOrder.id);
                    }
                }
            );
        };
        $scope.updateWorkOrder = function (e, workOrder) {
            if (e) {
                e.preventDefault();
            };

            $scope.UI.formSaving = true;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $workOrder.updateWorkOrder(workOrder)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    
                    if (!response.err) {
                        $scope.initWorkOrder();
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Update the Work Order.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Updating the Work Order: ${err.message}`;
                }
            );
        };
        $scope.updateWorkOrdersPriorities = function () {
            $scope.UI.workOrdersLoaded = false;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $workOrder.updateWorkOrdersPriorities()
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Update the Work Order Priorities.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Updating the Work Order Priorities: ${err.message}`;
                }
            );
        };
        $scope.updateWorkOrderLineItem = function (item) {
            $scope.UI.formSaving = true;
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $workOrder.updateWorkOrderLineItem(item)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    
                    if (!response.err) {
                        $scope.initWorkOrder();
                        $('#workOrderLineItemFormReveal').foundation('close');
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Update the Work Line Item.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Updating the Work Order Line Item: ${err.message}`;
                }
            );
        };
        $scope.deleteWorkOrder = function (workOrderId) {
            if (confirm('Are you sure you want to delete this work order?')) {
                $workOrder.deleteWorkOrder({ id: workOrderId })
                .then(
                    function (response) {
                        if (!response.err) {
                            $scope.initWorkOrders();
                        }
                    }
                );
            }
        };  
        $scope.addLineItemToWorkOrder = function (lineItem) {
            var index = $scope.lineItems.findIndex(i => i.id === lineItem.id);

            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            if (index !== -1) {
                $scope.lineItems[index].adding = true;
                lineItem.workOrderId = $scope.workOrder.id;
                lineItem.quantity = 1;
        
                $workOrder.addWorkOrderLineItem(lineItem)
                .then(
                    function (response) {
                        $scope.lineItems[index].adding = false;
                        if (!response.err) {
                            $scope.initWorkOrderForm();
                            $scope.initModalFormSaved(response.msg);
                        } else {
                            $scope.UI.errMessage = response.msg || 'Failed to Add Line Item to the Work Order.';
                        }
                    }
                ).catch(
                    function (err) {
                        $scope.UI.errMessage = `Error Adding Line Item to the Work Order: ${err.message}`;
                    }
                );
            };
        };
        $scope.addItemToPurchaseOrder = function (item) {
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            item.purchaseOrderId = $scope.purchaseOrder.id;

            $workOrder.addItemToPurchaseOrder(item)
                .then(function (response) {
                    if (!response.err) {
                        $scope.initPurchaseOrder($scope.purchaseOrder);
                        $scope.initModalFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to add the item to the purchase order.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.errMessage = `Error adding item to purchase order: ${err.message}`;
                });
        };
        $scope.removeItemFromPurchaseOrder = function (item) {
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            item.purchaseOrderId = $scope.purchaseOrder.id;
            
            $workOrder.removeItemFromPurchaseOrder(item)
                .then(function (response) {
                    if (!response.err) {
                        $scope.initPurchaseOrder($scope.purchaseOrder);
                        $scope.UI.successMessage = 'Item successfully removed from the purchase order.';
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to remove the item from the purchase order.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.errMessage = `Error removing item from purchase order: ${err.message}`;
                });
        };
        $scope.removeWorkOrderLineItem = function (item) {
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            $workOrder.removeWorkOrderLineItem(item)
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.initWorkOrderForm();
                        
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to removed Line Item to the Work Order.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error removing Line Item to the Work Order: ${err.message}`;
                }
            );
        };
        $scope.assignedUserToWorkOrder = function (e, workOrder) {
            if (e) {
                e.preventDefault();
            }
            
            $scope.UI.message = null;
            $scope.UI.errMessage = null;

            if (!workOrder.assignedUserId) {
                $scope.UI.errMessage = 'You must select a user to assign to the work order.';
                return;
            }
            $scope.UI.formSaving = true;

            $workOrder.assignUserToWorkOrder(workOrder)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    
                    if (!response.err) {
                        $scope.initWorkOrder({ id: workOrder.id });
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Assign User to the Work Order.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = `Error Assigning User to the Work Order: ${err.message}`;
                }
            );
        }
        $scope.toggleWorkOrderBoardEdit = function () {
            $scope.UI.editBoard = !$scope.UI.editBoard;
            $timeout(
                function () {
                    $scope.initWorkOrderBoard();
                }
            );
        }
        $scope.cloneWorkOrder = function (workOrderId) {
            $workOrder.cloneWorkOrder({ id: workOrderId })
            .then(
                function (response) {
                    if (!response.err) {
                        $location.url('/work-orders/work-order/' + response.workOrder.id);
                    }
                }
            );
        };
        $scope.$on('clientWorkOrdersUpdated', function (event, data) {
            $scope.initWorkOrders();
        });

    });
});
