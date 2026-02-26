define(['app-controller'], function (app) {
    app.register.controller('InvoiceController',
    function (
        $scope,
        $rootScope,
        $routeParams,
        $location,
        $window,
        $log,
        $q,
        $interval,
        $timeout,
        $user,
        $admin,
        $setup,
        $invoice,
        $payment,
        $client,
        $media,
    ) {
        const urlParams = new URLSearchParams(window.location.search);

        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];
        $scope.page = $setup.getCurrentPage() || {};
        $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null);
        $scope.subPermissions = $setup.updateScopes($scope, $setup.getSubPages('invoices'));
        $scope.units = $setup.getUnits();

        $scope.sort = {
            lineItems: {
                id: 1,
                value: '-createdAt'
            }
        };
        $scope.search = {
            value: null,
            page: null,
            limit: null,
            count: null,
            total: null
        };
        $scope.paymentData = {
            amount: 0,
            paymentMethod: null
        };

        $scope.selectedPaymentMethod = null;
        $scope.selectedUser = $scope.user.id;
        $scope.selectedLabor = null;
        $scope.useOvertimeRate = false;

        $scope.invoice = {};
        $scope.client = {};
        $scope.invoices = [];
        $scope.invoiceLineItem = {};
        $scope.lineItem = {};
        $scope.labor = [];
        $scope.selectedLabor = null;
        $scope.useOvertimeRate = false;
        $scope.users = [];
        $scope.addresses = [];
        $scope.emails = [];
        $scope.phoneNumbers = [];
        $scope.states = [];
        $scope.priorities = [];
        $scope.phoneNumberTypes = [];
        $scope.emailTypes = [];
        $scope.paymentMethods = [];

        $scope.laborAssignmentOptions = [
            {id: 'Material', name: 'Material'},
            {id: 'Labor', name: 'Labor'},
            {id: 'Equipment', name: 'Equipment'},
            {id: 'Miscellaneous', name: 'Miscellaneous'}
        ];

        $scope.UI = {
            currentUrl: window.location.pathname.split('/'),
            currentStep: 1,
            newLineItem: false,
            invoiceView: false,
            invoiceLoaded: false,
            invoicesLoaded: false,
            invoiceActivitiesLoaded: false,
            clientLoaded: false,
            usersLoaded: false,
            addressesLoaded: false,
            emailsLoaded: false,
            phoneNumbersLoaded: false,
            statesLoaded: false,
            prioritiesLoaded: false,
            phoneNumberTypesLoaded: false,
            emailTypesLoaded: false,
            invoiceLineItemLoaded: false,
            invoiceLineItemsLoaded: false,
            lineItemFormLoaded: false,
            lineItemsDisplayed: 50,
            formSaving: false,
            formSaved: false,
            modalFormSaved: false,
            errMessage: null,
            message: null,
            showMemo: false
        };

        $setup.updateScopes($scope, $scope.page.id || null);

        $scope.initInvoice = function () {
            $scope.UI.invoiceLoaded = false;
            $scope.UI.invoiceActivitiesLoaded = false;
            $scope.UI.invoiceView = false;
            $scope.invoice = {};
            if (!$scope.UI.currentUrl[4]) {
                $scope.UI.invoiceView = true;
            }

            if ($routeParams.invoiceId) {
                $q.all([
                    $invoice.getInvoice({id: $routeParams.invoiceId}),
                ]).then(function (responses) {
                    $scope.UI.invoiceLoaded = true;
                    $scope.UI.invoiceActivitiesLoaded = true;

                    if (!responses[0].err) {
                        $scope.invoice = responses[0].invoice;
                        $scope.client = $scope.invoice.Client;
                        $(document).foundation();
                    }
                });
            }
        };
        $scope.initLabor = function () {
            $admin.getLabors()
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.labor = response.labor || [];
                        $scope.laborRoles = $scope.labor; // Make available for modal
                    } else {
                        console.log('Error loading available labor:', response.msg);
                    }
                }
            ).catch(
                function (err) {
                    console.log('Error loading available labor:', err);
                }
            );
        };
        $scope.initInvoices = function () {
            $scope.UI.invoicesLoaded = false;
            $scope.invoices = [];
            
            $invoice.listInvoices({})
            .then(function (response) {
                $scope.UI.invoicesLoaded = true;
                if (!response.err) {
                    $scope.invoices = response.invoices;
                    $scope.search.total = response.total;
                    $scope.search.pages = response.pages;
                }
            });
        };
        $scope.initInvoiceForm = function () {
            $scope.UI.invoiceLoaded = false;
            $scope.invoice = {};

            if ($routeParams.invoiceId) {
                $invoice.getInvoice({id: $routeParams.invoiceId})
                .then(function (response) {
                    $scope.UI.invoiceLoaded = true;
                    if (!response.err) {
                        $scope.invoice = response.invoice;
                        $scope.client = $scope.invoice.Client;
                    }
                });
            } else {
                // New invoice form
                $scope.UI.invoiceLoaded = true;
                $scope.invoice = {
                    clientId: null,
                    estimateId: null,
                    workOrderId: null,
                    invoiceNumber: null,
                    total: 0,
                    subTotal: 0,
                    salesTaxTotal: 0,
                    salesTaxRate: 0,
                    markUp: 0,
                    memo: '',
                    adHocReason: '',
                    itemize: true,
                    InvoiceLineItems: []
                };
            }
        };
        $scope.initPaymentForm = function () {
            $scope.UI.paymentMethodsLoaded = false;
            $scope.paymentMethods = [];
            $scope.selectedPaymentMethod = null;

            $scope.paymentData = {
                amount: $scope.invoice ? $scope.invoice.total : 0,
                paymentMethod: null
            };
            
            $payment.getPaymentMethods()
            .then(function (response) {
                $scope.UI.paymentMethodsLoaded = true;
                if (!response.err) {
                    $scope.paymentMethods = response.paymentMethods;
                };
            });
        };
        $scope.initInvoiceLineItemForm = function (lineItem) {
            $scope.UI.invoiceLineItemLoaded = false;
            $scope.invoiceLineItem = lineItem;

            // Load available labor roles
            $scope.initLabor();

            if (!lineItem) {
                $scope.UI.newInvoiceLineItem = true;
                $scope.invoiceLineItem = {
                    name: null,
                    description: null,
                    rate: 0.00,
                    unit: 'each',
                    subTotal: 0.00,
                    totalPrice: 0.00,
                    taxable: true,
                    markup: 0.00,
                    userId: $scope.user.id,
                    salesTaxRate: 0.00,
                    salesTaxTotal: 0.00,
                    moduleDescription: null,
                    instructions: null,
                    category: 'Material',
                    laborId: null,
                    quantity: 1,
                    invoiceId: $routeParams.invoiceId || $scope.invoice.id,
                    pricedBy: 'custom',
                    formulaId: null,
                    questionId: null,
                    hours: null,
                    useOvertimeRate: false,
                    standardHours: null,
                    overtimeHours: null
                };
            } else {
                $scope.UI.newInvoiceLineItem = false;
                
                // If this has a nested LineItem structure, flatten it
                if (lineItem.LineItem && !lineItem.name) {
                    // Copy relevant fields from LineItem to the main object
                    $scope.invoiceLineItem = {
                        ...lineItem,
                        name: lineItem.LineItem.name || lineItem.name,
                        description: lineItem.LineItem.description || lineItem.description,
                        rate: lineItem.LineItem.rate || lineItem.rate,
                        totalPrice: lineItem.LineItem.total || lineItem.totalPrice,
                        pricedBy: lineItem.LineItem.pricedBy || lineItem.pricedBy,
                        formulaId: lineItem.LineItem.formulaId || lineItem.formulaId,
                        questionId: lineItem.LineItem.questionId || lineItem.questionId
                    };
                }
                
                // Set up useOvertimeRate based on existing data
                $scope.invoiceLineItem.useOvertimeRate = $scope.invoiceLineItem.useOvertimeRate || false;
                
                // Set selectedLabor if laborId exists
                if ($scope.invoiceLineItem.laborId && $scope.labor) {
                    $scope.selectedLabor = _.find($scope.labor, function(labor) {
                        return labor.id == $scope.invoiceLineItem.laborId;
                    });
                }
            }
            $scope.UI.invoiceLineItemLoaded = true;
        };
        $scope.initFormSaved = function (msg) {
            $scope.UI.formSaved = true;
            $scope.UI.message = msg;
            
            $timeout(function () {
                $scope.UI.message = null;
                $scope.UI.formSaved = false;
            }, 3000);
        };
        $scope.initModalFormSaved = function (msg) {
            $scope.UI.modalFormSaved = true;
            $scope.UI.message = msg;
            
            $timeout(function () {
                $scope.UI.message = null;
                $scope.UI.modalFormSaved = false;
            }, 1000);
        };
        $scope.initErrorMessage = function (msg) {
            $scope.UI.errMessage = msg;

            $timeout(function () {
                $scope.UI.errMessage = null;
            }, 3000);
        };
        $scope.createInvoice = function (invoice) {
            $scope.UI.formSaving = true;
            
            $invoice.createInvoice(invoice)
            .then(function (response) {
                $scope.UI.formSaving = false;
                
                if (!response.err) {
                    $scope.initFormSaved('Invoice successfully created');
                    $location.path('/invoices/invoice/' + response.invoice.id + '/edit');
                } else {
                    $scope.initErrorMessage(response.msg);
                }
            });
        };
        $scope.createInvoiceLineItem = function (e, invoiceLineItem) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;

            $invoice.createInvoiceLineItem(invoiceLineItem)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initModalFormSaved(response.msg);
                        // Reload the invoice to get updated line items
                        if ($scope.invoice && $scope.invoice.id) {
                            $scope.initInvoice();
                            $('#invoiceLineItemFormReveal').foundation('close');
                        }
                    } else {
                        $scope.UI.errMessage = response.msg || 'Error creating invoice line item';
                    }
                }
            );
        };
        $scope.updateInvoice = function (event, invoice) {
            event.preventDefault();
            $scope.UI.formSaving = true;
            
            $invoice.updateInvoice(invoice)
            .then(function (response) {
                $scope.UI.formSaving = false;
                
                if (!response.err) {
                    $scope.initFormSaved('Invoice successfully updated');
                    $scope.invoice = response.invoice;
                } else {
                    $scope.initErrorMessage(response.msg);
                }
            });
        };
        $scope.updateInvoiceLineItem = function (lineItem) {
            $scope.UI.formSaving = true;
            
            $invoice.updateInvoiceLineItem(lineItem)
            .then(function (response) {
                $scope.UI.formSaving = false;
                
                if (!response.err) {
                    $scope.initModalFormSaved('Line item successfully updated');
                    $scope.initInvoice(); // Refresh invoice data
                    $('#invoiceLineItemFormReveal').foundation('close');
                } else {
                    $scope.initErrorMessage(response.msg);
                }
            });
        };
        $scope.addInvoiceLineItem = function (lineItem) {
            $scope.UI.formSaving = true;
            
            $invoice.addInvoiceLineItem(lineItem)
            .then(function (response) {
                $scope.UI.formSaving = false;
                
                if (!response.err) {
                    $scope.initModalFormSaved('Line item successfully added');
                    $scope.initInvoice(); // Refresh invoice data
                    $('#invoiceLineItemFormReveal').foundation('close');
                } else {
                    $scope.initErrorMessage(response.msg);
                }
            });
        };
        $scope.removeInvoiceLineItem = function (lineItem) {
            if (confirm('Are you sure you want to remove this line item?')) {
                $invoice.removeInvoiceLineItem({id: lineItem.id})
                .then(function (response) {
                    if (!response.err) {
                        $scope.initFormSaved('Line item successfully removed');
                        $scope.initInvoice(); // Refresh invoice data
                    } else {
                        $scope.initErrorMessage(response.msg);
                    }
                });
            }
        };
        $scope.printInvoice= function (invoice) {
            if (!invoice || !invoice.id) {
                $scope.initErrorMessage('Please select an invoice to print');
                return;
            }
            // Check if a PDF URL exists
            if (invoice.invoiceUrl) {
                // Open the PDF in a new window/tab for printing
                var printWindow = $window.open(invoice.invoiceUrl, '_blank');
                if (!printWindow || printWindow.closed || typeof printWindow.closed == 'undefined') { 
                    // Popup blocked
                    $scope.UI.errMessage = 'Popup blocked. Please allow popups for this website to print the invoice.';
                    return;
                }
                // Optional: Focus the new window and trigger print dialog
                if (printWindow) {
                    printWindow.focus();
                    // Some browsers block automatic print dialog, so this might not work
                    printWindow.onload = function() {
                        printWindow.print();
                    };
                }
            } else {
                $invoice.createInvoicePdf({invoiceId: invoice.id})
                .then(function (response) {
                    if (!response.err) {
                        // Update the invoice with the new PDF URL
                        invoice.invoiceUrl = response.invoiceUrl;
                        $scope.initFormSaved('Invoice PDF generated. Opening for print...');
                        
                        // Open the newly generated PDF
                        var printWindow = $window.open(response.invoiceUrl, '_blank');
                        if (!printWindow || printWindow.closed || typeof printWindow.closed == 'undefined') { 
                            // Popup blocked
                            $scope.UI.errMessage = 'Popup blocked. Please allow popups for this website to print the invoice.';
                            return;
                        }
                        if (printWindow) {
                            printWindow.focus();
                            printWindow.onload = function() {
                                printWindow.print();
                            };
                        }
                    } else {
                        $scope.initErrorMessage(response.msg || 'Error generating invoice PDF');
                    }
                });
            }
        }; 
        $scope.cloneInvoice = function (invoice) {
            if (confirm('Are you sure you want to clone this invoice?')) {
                $invoice.cloneInvoice({id: invoice.id})
                .then(function (response) {
                    if (!response.err) {
                        $scope.initFormSaved('Invoice successfully cloned');
                        $location.path('/invoices/invoice/' + response.newInvoice.id + '/edit');
                    } else {
                        $scope.initErrorMessage(response.msg);
                    }
                });
            }
        };
        $scope.searchInvoices = function (searchData) {
            $scope.UI.invoicesLoaded = false;
            
            $invoice.searchInvoices(searchData)
            .then(function (response) {
                $scope.UI.invoicesLoaded = true;
                if (!response.err) {
                    $scope.invoices = response.invoices;
                    $scope.search.total = response.total;
                    $scope.search.pages = response.pages;
                }
            });
        };
        $scope.onLaborChange = function () {
            if ($scope.invoiceLineItem.laborId) {
                $scope.selectedLabor = _.find($scope.labor, function(labor) {
                    return labor.id == $scope.invoiceLineItem.laborId;
                });
                $scope.calculateLaborTotal();
            } else {
                $scope.selectedLabor = null;
            }
        };
        $scope.calculateLaborTotal = function () {
            if ($scope.selectedLabor && ($scope.invoiceLineItem.quantity || $scope.invoiceLineItem.hours)) {
                const hours = parseFloat($scope.invoiceLineItem.hours || $scope.invoiceLineItem.quantity) || 0;
                const standardRate = parseFloat($scope.selectedLabor.rate) || 0;
                const overtimeRate = parseFloat($scope.selectedLabor.overtimeRate) || 0;
                const standardHoursPerDay = parseInt($scope.selectedLabor.standardHoursPerDay) || 8;
                
                let standardHours = hours;
                let overtimeHours = 0;
                let totalCost = 0;
                
                if ($scope.invoiceLineItem.useOvertimeRate && hours > standardHoursPerDay) {
                    standardHours = standardHoursPerDay;
                    overtimeHours = hours - standardHoursPerDay;
                }
                
                const standardCost = standardHours * standardRate;
                const overtimeCost = overtimeHours * overtimeRate;
                totalCost = standardCost + overtimeCost;
                
                // Calculate blended rate
                const blendedRate = hours > 0 ? (totalCost / hours) : standardRate;
                
                // Update the invoice line item with new fields
                $scope.invoiceLineItem.rate = blendedRate.toFixed(2);
                $scope.invoiceLineItem.unitPrice = blendedRate.toFixed(2);
                $scope.invoiceLineItem.subTotal = totalCost.toFixed(2);
                $scope.invoiceLineItem.totalPrice = totalCost.toFixed(2);
                $scope.invoiceLineItem.hours = hours;
                $scope.invoiceLineItem.quantity = hours; // Keep quantity synced with hours for labor
                $scope.invoiceLineItem.standardHours = standardHours;
                $scope.invoiceLineItem.overtimeHours = overtimeHours;
            }
        };
        $scope.selectInvoiceLineItem = function (lineItem) {
            $scope.invoiceLineItem = lineItem;
            $scope.lineItem = lineItem.LineItem || {};
        };
        $scope.submitPaymentMethod = function (e, payment) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            const paymentMethod = _.find(
                $scope.paymentMethods,
                function (paymentMethod) {
                    return paymentMethod.name == payment.paymentMethod;
                }
            );
            if (paymentMethod.name == 'Credit Card') {
                let url = '/payments/pay?clientId=' +
                $scope.invoice.clientId + 
                '&invoiceId=' +
                $scope.invoice.id + 
                '&paymentMethodId=' + 
                paymentMethod.id +
                '&amount=' +
                payment.amount;
                
                // If dueNow is 0 or 0.00, use the payment amount
                if ($scope.invoice.dueNow === 0 || $scope.invoice.dueNow === 0.00) {
                    url += '&amount=' + ($scope.paymentData.amount || 0);
                }
                
                $location.url(url);
            } else if (paymentMethod.name == 'Bank Transfer') {
                let url = '/payments/bank-transfer?clientId=' +
                $scope.invoice.clientId +
                '&invoiceId=' +
                $scope.invoice.id +
                '&paymentMethodId=' +
                paymentMethod.id +
                '&amount=' +
                payment.amount;
                
                // If dueNow is 0 or 0.00, use the payment amount
                if ($scope.invoice.dueNow === 0 || $scope.invoice.dueNow === 0.00) {
                    url += '&amount=' + ($scope.paymentData.amount || 0);
                }
                
                $location.url(url);
            }
        };
        $scope.calculateInvoiceTotal = function () {
            if (!$scope.invoice.InvoiceLineItems) return;
            
            let subTotal = 0;
            $scope.invoice.InvoiceLineItems.forEach(function(lineItem) {
                subTotal += parseFloat(lineItem.total || 0);
            });
            
            $scope.invoice.subTotal = subTotal;
            $scope.invoice.salesTaxTotal = subTotal * (parseFloat($scope.invoice.salesTaxRate || 0) / 100);
            $scope.invoice.total = subTotal + $scope.invoice.salesTaxTotal;
        };
        $scope.toggleMemo = function () {
            $scope.UI.showMemo = !$scope.UI.showMemo;
        };
        $scope.calculateLineItemTotal = function() {
            if (!$scope.invoiceLineItem) return;
            
            var rate = parseFloat($scope.invoiceLineItem.rate || 0);
            var unit = parseFloat($scope.invoiceLineItem.unit || 0);
            var markup = parseFloat($scope.invoiceLineItem.markup || 0);
            var salesTaxRate = parseFloat($scope.invoiceLineItem.salesTaxRate || 0);
            
            var subTotal = rate * unit;
            var markupAmount = subTotal * (markup / 100);
            var taxableAmount = subTotal + markupAmount;
            var taxAmount = $scope.invoiceLineItem.taxable ? taxableAmount * (salesTaxRate / 100) : 0;
            
            $scope.invoiceLineItem.subTotal = subTotal + markupAmount;
            $scope.invoiceLineItem.salesTaxTotal = taxAmount;
            $scope.invoiceLineItem.total = $scope.invoiceLineItem.subTotal + taxAmount;
        };
        $scope.$watch('paymentData.paymentMethod', function(newVal) {
            if (newVal && newVal.name === 'Credit Card' && $scope.invoice) {
                $scope.paymentData.amount = $scope.invoice.dueNow;
            }
        });
    });
});