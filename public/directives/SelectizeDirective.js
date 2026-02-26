angular.module('ngSelectize', [])
.value('selectizeConfig', {})
.directive("selectize", ['selectizeConfig', '$timeout', function(selectizeConfig, $timeout) {
    return {
        restrict: 'EA',
        require: '^ngModel',
        scope: { 
            ngModel: '=', 
            config: '@', 
            options: '=?', 
            ngDisabled: '=', 
            ngRequired: '&' 
        },
        link: function(
            scope, 
            element,
            attrs, 
            modelCtrl
        ) {
            var el; // Declare el at the beginning to ensure it's scoped correctly.

            var selectizeConfigs = {
                answerOptions: {
                    searchField: ['name'],
                    sortField: 'name',
                    create: false,
                    placeholder: 'Select an Answer...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1
                },
                answerMultiOptions: {
                    searchField: ['name'],
                    sortField: 'name',
                    create: false,
                    placeholder: 'Select Answers...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: null // Allow multiple selections
                },
                stateOptions: {
                    searchField: ['name'],
                    sortField: 'name',
                    create: false,
                    placeholder: 'Select A State...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1
                },
                rolesOptions: {
                    searchField: ['name'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a role...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                clientOptions: {
                    sortField: 'id',
                    searchField: 'id',
                    create: false,
                    placeholder: 'Select a client...',
                    valueField: 'sid',
                    labelField: 'fullName',
                    maxItems: 1,
                },
                limitOptions: {
                    searchField: ['value'],
                    sortField: 'value',
                    create: false,
                    placeholder: 'Select a Limit...',
                    valueField: 'value',
                    labelField: 'name',
                    maxItems: 1,
                },
                payRateOptions: {
                    searchField: ['value'],
                    sortField: 'value',
                    create: false,
                    placeholder: 'Select a Pay Rate...',
                    valueField: 'value',
                    labelField: 'name',
                    maxItems: 1,
                },
                minuteOptions: {
                    searchField: ['value'],
                    sortField: 'value',
                    create: false,
                    placeholder: 'Select a Time...',
                    valueField: 'value',
                    labelField: 'name',
                    maxItems: 1,
                },
                typeOptions: {
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a type...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                detailTypeOptions: {
                    sortField: 'value',
                    create: false,
                    placeholder: 'Selete a type...',
                    valueField: 'value',
                    labelField: 'value',
                    maxItems: 1,
                },
                templateOptions: {
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a template...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                userOptions: {
                    sortField: 'id',
                    searchField: 'fullName',
                    create: false,
                    placeholder: 'Select a user...',
                    valueField: 'id',
                    labelField: 'fullName',
                    maxItems: 1,
                },
                groupOptions: {
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a group...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                priorityOptions: {
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select A Priority...',
                    valueField: 'id',
                    labelField: 'level',
                    maxItems: 1
                },
                contactOptions: {
                    sortField: 'id',
                    searchField: 'fullName',
                    create: false,
                    placeholder: 'Select A Contact...',
                    valueField: 'id',
                    labelField: 'fullName',
                    maxItems: 1
                },
                phoneNumberOptions: {
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select A Phone Number...',
                    valueField: 'id',
                    labelField: 'formattedNumber',
                    maxItems: 1
                },
                emailOptions: {
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select A Email...',
                    valueField: 'id',
                    labelField: 'email',
                    maxItems: 1
                },
                addressOptions: {
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select A Address...',
                    valueField: 'id',
                    labelField: 'fullAddress',
                    maxItems: 1
                },
                groupsOptions: {
                    searchField: ['name'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a Group...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                statusOptions: {
                    searchField: ['name'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a Status...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                sortOptions: {
                    searchField: ['name', 'text'],
                    sortField: 'text',
                    create: false,
                    placeholder: 'Sort By...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                eventsOptions: {
                    searchField: ['id', 'title'],
                    sortField: 'title',
                    create: false,
                    placeholder: 'Select a event...',
                    valueField: 'id',
                    labelField: 'title',
                    maxItems: 1,
                },
                estimatesOptions: {
                    searchField: ['id', 'estimateId'],
                    sortField: 'estimateId',
                    create: false,
                    placeholder: 'Select a estimate...',
                    valueField: 'id',
                    labelField: 'estimateNumber',
                    maxItems: 1,
                },
                marketingOptions: {
                    searchField: ['id', 'marketingId'],
                    sortField: 'marketingId',
                    create: false,
                    placeholder: 'Select a Marketing Campaign...',
                    valueField: 'id',
                    labelField: 'marketingNumber',
                    maxItems: 1,
                },
                inputOptions: {
                    searchField: ['value'],
                    sortField: 'value',
                    create: false,
                    placeholder: 'Select a Input...',
                    valueField: 'value',
                    labelField: 'value',
                    maxItems: 1,
                },
                unitOptions: {
                    searchField: ['value'],
                    sortField: 'value',
                    create: false,
                    placeholder: 'Select a Unit...',
                    valueField: 'value',
                    labelField: 'value',
                    maxItems: 1,
                },
                recurrenceOptions: {
                    valueField: 'id',
                    labelField: 'name',
                    searchField: 'name',
                    placeholder: 'Select a Recurrence...',
                    maxItems: 1
                },
                eventSchedulerModeOptions: {
                    valueField: 'id',
                    labelField: 'name',
                    searchField: 'name',
                    placeholder: 'Select a Mode...',
                    maxItems: 1
                },
                operatorOptions: {
                    searchField: ['value'],
                    sortField: 'name',
                    create: false,
                    placeholder: 'Select a Operator...',
                    valueField: 'value',
                    labelField: 'name',
                    maxItems: 1,
                },
                actionOptions: {
                    searchField: ['value'],
                    sortField: 'value',
                    create: false,
                    placeholder: 'Select a Action...',
                    valueField: 'value',
                    labelField: 'value',
                    maxItems: 1,
                },
                paymentMethodOptions: {
                    searchField: ['name'],
                    sortField: 'name',
                    create: false,
                    placeholder: 'Select a Payment Option...',
                    valueField: 'name',
                    labelField: 'name',
                    maxItems: 1,
                },
                estimatorOptions: {
                    searchField: ['value'],
                    sortField: 'value',
                    create: false,
                    placeholder: 'Select a Option...',
                    valueField: 'value',
                    labelField: 'value',
                    maxItems: 1,
                },
                timeTypeOptions: {
                    searchField: ['value'],
                    sortField: 'value',
                    create: false,
                    placeholder: 'Select a Time Type...',
                    valueField: 'value',
                    labelField: 'value',
                    maxItems: 1,
                },
                questionOptions: {
                    searchField: ['questionText', 'options'],
                    sortField: 'step',
                    create: false,
                    placeholder: 'Select a Question...',
                    valueField: 'id',
                    labelField: 'questionText',
                    maxItems: 1,
                },
                complexityOptions: {
                    searchField: ['name'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a Complexity...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                budgetRangeOptions: {
                    searchField: ['name'],
                    create: false,
                    placeholder: 'Select a Budget...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                marketOptions: {
                    searchField: ['name'],
                    create: false,
                    placeholder: 'Select a Market...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                lineItemOptions: {
                    searchField: ['name', 'moduleDescription'],
                    create: false,
                    placeholder: 'Select a Line Item...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                itemOptions: {
                    searchField: ['name'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a Item...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                inventoryOptions: {
                    searchField: ['name','id'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a location...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                categoryOptions: {
                    searchField: ['name','id'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a Category...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                laborOptions: {
                    searchField: ['role','id'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a Labor Role...',
                    valueField: 'id',
                    labelField: 'role',
                    maxItems: 1,
                },
                pricedByOptions: {
                    searchField: ['name'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a Pricing Method...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                treeGridOptions: {
                    searchField: ['name','id'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select where to search...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                folderOptions: {
                    searchField: ['name','id'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a folder...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                vendorOptions: {
                    searchField: ['name','id'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a vendor...',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                roleOptions: {
                    searchField: ['name'],
                    delimiter: ',',
                    sortField: 'id',
                    create: false,
                    placeholder: 'Add Roles...',
                    valueField: 'id',
                    labelField: 'name',
                    persist: true,
                    maxItems: null
                },
                usersOptions: {
                    delimiter: ',',
                    searchField: ['fullName'],
                    sortField: 'id',
                    create: false,
                    placeholder: 'Add Users...',
                    valueField: 'id',
                    labelField: 'fullName',
                    persist: true,
                    maxItems: null
                },
                eventTypeTagOptions: {
                    delimiter: ',',
                    placeholder: 'Add Tags...',
                    persist: true,
                    maxItems: 25,
                    create: function (input) {
                        return {
                            value: input,
                            text: input,
                        };
                    },
                },
                validationTypeOptions: {
                    valueField: 'value',
                    labelField: 'name',
                    searchField: 'name',
                    create: false,
                    maxItems: 1
                },
                keyAreasOptions: {
                    delimiter: ',',
                    placeholder: 'Add Key Areas...',
                    persist: true,
                    maxItems: 50,
                    create: function (input) {
                        return {
                            value: input,
                            text: input,
                        };
                    },
                },
                eventTypeGroupOptions: {
                    delimiter: ',',
                    sortField: 'id',
                    create: false,
                    placeholder: 'Add Roles',
                    valueField: 'id',
                    labelField: 'name',
                    persist: false,
                },
                eventAssociationOptions: {
                    searchField: ['value'],
                    sortField: 'name',
                    create: false,
                    placeholder: 'Select a Association',
                    valueField: 'value',
                    labelField: 'name',
                    maxItems: 1,
                },
                widgetTimeRangeOptions: {
                    searchField: ['name'],
                    create: false,
                    placeholder: 'Select a Time...',
                    valueField: 'value',
                    labelField: 'name',
                    maxItems: 1,
                },
            }
            scope.options = scope.options || [];
            scope.config = selectizeConfigs[scope.config] || {};
            var selectize, settings = angular.extend({}, selectizeConfig, scope.config);
            var isEmpty = function(val) {
                return val === undefined || val === null || !val.length; //support checking empty arrays
            };

            var toggle = function(disabled) {
                disabled ? selectize.disable() : selectize.enable();
            }
            var require = function(required) {
                el = element[0].closest('.form-input');
                if (el) {
                    el.setAttribute('id', element[0].id + '-selectize');
                } else {
                    required ? element[0].setAttribute('required', false) : element[0].setAttribute('required', false);
                }
            }

            var validate = function() {
                var isInvalid = (scope.ngRequired() || attrs.required || settings.required) && isEmpty(scope.ngModel);
                modelCtrl.$setValidity('required', !isInvalid);
            };

            var setSelectizeOptions = function(curr = [], prev = []) {
                if (!Array.isArray(curr)) {
                    curr = [];
                }
                if (!Array.isArray(prev)) {
                    prev = [];
                }

                angular.forEach(prev, function(opt){
                    if(curr.indexOf(opt) === -1){
                        var value = opt[settings.valueField];
                        selectize.removeOption(value, true);
                    }
                });
                selectize.addOption(curr, true);

                selectize.refreshOptions(false); 
            }

            // Update the setSelectizeValue function to handle synchronization correctly
            var setSelectizeValue = function() {
                validate();

                // Update Selectize's CSS classes based on Angular's validation state
                selectize.$control.toggleClass('ng-valid', modelCtrl.$valid);
                selectize.$control.toggleClass('ng-invalid', modelCtrl.$invalid);
                selectize.$control.toggleClass('ng-dirty', modelCtrl.$dirty);
                selectize.$control.toggleClass('ng-pristine', modelCtrl.$pristine);

                // Synchronize Selectize items with ngModel
                if (!angular.equals(selectize.items, scope.ngModel)) {
                    if (Array.isArray(scope.ngModel)) {
                        // For multi-select: Set values directly from ngModel
                        selectize.setValue(scope.ngModel, true);
                    } else {
                        // For single-select
                        selectize.setValue(scope.ngModel, true);
                    }
                }
            };
            
            // Ensure the onChange function updates the ngModel correctly
            settings.onChange = function(value) {
                // Copy the value from selectize items
                let processedValue = angular.copy(selectize.items);

                // If only one item is allowed, take the first
                if (settings.maxItems === 1) {
                    processedValue = processedValue[0];
                }
                // Check if the value is a string representation of a number
                if (typeof processedValue === 'string' && !isNaN(processedValue)) {
                    processedValue = Number(processedValue);
                } else if (Array.isArray(processedValue)) {
                    // If multiple items, convert any string number to integers
                    processedValue = processedValue.map(item =>
                        typeof item === 'string' && !isNaN(item) ? Number(item) : item
                    );
                }

                $timeout(
                    function () {
                        // Use $applyAsync to ensure AngularJS updates the scope without causing a new digest cycle
                        scope.$applyAsync(() => {
                            modelCtrl.$setViewValue(processedValue);
                        });
                    },
                    0,
                    false
                );
                // Trigger the custom onChange handler if configured
                if (scope.config.onChange) {
                    scope.config.onChange.apply(this, arguments);
                }
            };
            
            
            

            settings.onOptionAdd = function(value, data) {
                if( scope.options.indexOf(data) === -1 ) {
                    scope.options.push(data);

                    if (scope.config.onOptionAdd) {
                        scope.config.onOptionAdd.apply(this, arguments);
                    }
                }
            };

            settings.onInitialize = function() {
                selectize = element[0].selectize;
                el = element[0].closest('.form-input');
                if (el) {
                    el.setAttribute('id', element[0].id + '-selectize');
                } else {
                    element[0].setAttribute('id', element[0].id + '-selectize');
                }                

                setSelectizeOptions(scope.options);

                //provides a way to access the selectize element from an
                //angular controller
                if (scope.config.onInitialize) {
                    scope.config.onInitialize(selectize);
                }
                scope.$watchCollection('options', function(newOptions, oldOptions) {
                    if (newOptions && selectize) {
                        selectize.clearOptions();
                        if (newOptions.length > 0) {
                            selectize.addOption(newOptions);
                        }
                        selectize.refreshOptions(false); // false to prevent auto-selecting the first item
                        
                        // Update placeholder based on options availability
                        if (newOptions.length === 0) {
                            selectize.settings.placeholder = 'No options available';
                            selectize.$control_input.attr('placeholder', 'No options available');
                        } else {
                            // Restore original placeholder from settings
                            var originalPlaceholder = scope.config.placeholder || settings.placeholder;
                            selectize.settings.placeholder = originalPlaceholder;
                            selectize.$control_input.attr('placeholder', originalPlaceholder);
                        }
                        
                        // Force refresh of the control
                        selectize.refreshState();
                    }
                });
                scope.$watch('ngModel', function(newVal) {
                    if (newVal) {
                        // Use `setSelectizeValue` to update Selectize instance
                        setSelectizeValue();
                    }
                }, true); // Deep watch for array changes
    
                scope.$watch('ngDisabled', toggle);
                scope.$watch('ngRequired', require);
                
            };

            element.selectize(settings);

            element.on('$destroy', function() {
                if (selectize) {
                    selectize.destroy();
                    element = null;
                }
            });
            
        }
    };
}]);
