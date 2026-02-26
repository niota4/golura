angular.module('goluraApp').directive('goluraFormValidation', ['$compile', '$log', 'FormValidationService', function($compile, $log, FormValidationService) {
    return {
        restrict: 'A',
        require: '^form',
        scope: {
            validationRules: '=?goluraFormValidation',
            showErrors: '=?showValidationErrors',
            onValidationChange: '&?'
        },
        link: function(scope, element, attrs, formCtrl) {
            
            // Default validation rules
            const defaultRules = {
                email: {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    maxLength: 254,
                    message: 'Please enter a valid email address'
                },
                password: {
                    minLength: 8,
                    maxLength: 128,
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                    message: 'Password must be 8-128 characters with uppercase, lowercase, number, and special character'
                },
                phone: {
                    pattern: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                    message: 'Please enter a valid phone number'
                },
                text: {
                    maxLength: 255,
                    pattern: /^[^<>]*$/, // Prevent HTML injection
                    message: 'Text cannot contain < or > characters'
                },
                name: {
                    maxLength: 100,
                    pattern: /^[a-zA-Z\s'-]+$/,
                    message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
                },
                url: {
                    pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
                    message: 'Please enter a valid URL'
                },
                zipCode: {
                    pattern: /^\d{5}(-\d{4})?$/,
                    message: 'Please enter a valid ZIP code'
                },
                required: {
                    message: 'This field is required'
                }
            };

            // Merge custom rules with defaults
            scope.rules = angular.merge({}, defaultRules, scope.validationRules || {});
            
            // Sanitization functions
            const sanitize = {
                text: function(value) {
                    if (!value || typeof value !== 'string') return value;
                    
                    return value
                        .replace(/[<>]/g, '') // Remove HTML brackets
                        .replace(/javascript:/gi, '') // Remove javascript: protocol
                        .replace(/on\w+=/gi, '') // Remove event handlers
                        .trim()
                        .substring(0, 1000); // Limit length
                },
                
                email: function(value) {
                    if (!value || typeof value !== 'string') return value;
                    
                    return value
                        .toLowerCase()
                        .replace(/[<>"']/g, '') // Remove dangerous characters
                        .trim()
                        .substring(0, 254);
                },
                
                name: function(value) {
                    if (!value || typeof value !== 'string') return value;
                    
                    return value
                        .replace(/[^a-zA-Z\s'-]/g, '') // Only allow letters, spaces, hyphens, apostrophes
                        .replace(/\s+/g, ' ') // Normalize spaces
                        .trim()
                        .substring(0, 100);
                },
                
                phone: function(value) {
                    if (!value || typeof value !== 'string') return value;
                    
                    return value
                        .replace(/[^\d\s().-]/g, '') // Only allow digits and phone formatting chars
                        .trim()
                        .substring(0, 20);
                },
                
                url: function(value) {
                    if (!value || typeof value !== 'string') return value;
                    
                    return value
                        .trim()
                        .toLowerCase()
                        .replace(/[<>"']/g, '')
                        .substring(0, 2048);
                }
            };

            // Find all inputs in the form
            const inputs = element.find('input, textarea, select');
            
            inputs.each(function() {
                const input = angular.element(this);
                const inputName = input.attr('name');
                const inputType = input.attr('type') || 'text';
                
                if (!inputName) return; // Skip inputs without names
                
                // Create error display element
                const errorElement = angular.element(`
                    <span 
                        class="alert-text validation-error" 
                        ng-show="showFieldError('${inputName}')"
                    >
                        <span ng-repeat="error in getFieldErrors('${inputName}')">
                            {{error}}
                        </span>
                    </span>
                `);
                
                // Insert error element after input container
                const inputContainer = input.closest('.input-container');
                if (inputContainer.length) {
                    inputContainer.after(errorElement);
                } else {
                    input.after(errorElement);
                }
                
                // Compile the error element
                $compile(errorElement)(scope);
                
                // Add input container alert class when there are errors
                input.on('blur keyup', function() {
                    scope.$apply(function() {
                        const hasErrors = scope.getFieldErrors(inputName).length > 0;
                        if (inputContainer.length) {
                            inputContainer.toggleClass('alert', hasErrors);
                        }
                    });
                });
                
                // Auto-sanitize input on blur
                input.on('blur', function() {
                    const currentValue = input.val();
                    if (currentValue) {
                        let sanitizedValue = currentValue;
                        
                        // Apply appropriate sanitization based on input type
                        if (inputType === 'email') {
                            sanitizedValue = sanitize.email(currentValue);
                        } else if (inputType === 'tel' || input.hasClass('phone-form-input')) {
                            sanitizedValue = sanitize.phone(currentValue);
                        } else if (input.hasClass('name-form-input') || inputName.includes('Name')) {
                            sanitizedValue = sanitize.name(currentValue);
                        } else if (inputType === 'url') {
                            sanitizedValue = sanitize.url(currentValue);
                        } else {
                            sanitizedValue = sanitize.text(currentValue);
                        }
                        
                        if (sanitizedValue !== currentValue) {
                            input.val(sanitizedValue);
                            input.trigger('input'); // Trigger model update
                        }
                    }
                });
            });

            // Validation functions
            scope.showFieldError = function(fieldName) {
                const field = formCtrl[fieldName];
                if (!field) return false;
                
                return (field.$dirty || formCtrl.$submitted) && field.$invalid;
            };

            scope.getFieldErrors = function(fieldName) {
                const field = formCtrl[fieldName];
                const errors = [];
                
                if (!field || (!field.$dirty && !formCtrl.$submitted) || field.$valid) {
                    return errors;
                }

                // Check for required field
                if (field.$error.required) {
                    errors.push(scope.rules.required.message);
                }

                // Check for email validation
                if (field.$error.email) {
                    errors.push(scope.rules.email.message);
                }

                // Check for pattern validation
                if (field.$error.pattern) {
                    const inputType = element.find(`[name="${fieldName}"]`).attr('type') || 'text';
                    const rule = scope.rules[inputType] || scope.rules.text;
                    errors.push(rule.message);
                }

                // Check for minlength validation
                if (field.$error.minlength) {
                    const inputType = element.find(`[name="${fieldName}"]`).attr('type') || 'text';
                    const rule = scope.rules[inputType];
                    if (rule && rule.minLength) {
                        errors.push(`Minimum ${rule.minLength} characters required`);
                    }
                }

                // Check for maxlength validation
                if (field.$error.maxlength) {
                    const inputType = element.find(`[name="${fieldName}"]`).attr('type') || 'text';
                    const rule = scope.rules[inputType];
                    if (rule && rule.maxLength) {
                        errors.push(`Maximum ${rule.maxLength} characters allowed`);
                    }
                }

                return errors;
            };

            // Form validation function that can be called from controller
            scope.validateForm = function() {
                formCtrl.$setSubmitted();
                
                // Trigger validation on all fields
                angular.forEach(formCtrl, function(field, fieldName) {
                    if (fieldName.charAt(0) !== '$' && field.$setTouched) {
                        field.$setTouched();
                    }
                });
                
                return formCtrl.$valid;
            };

            // Sanitize entire form data
            scope.sanitizeFormData = function(data) {
                const sanitizedData = angular.copy(data);
                
                angular.forEach(sanitizedData, function(value, key) {
                    if (typeof value === 'string' && value.length > 0) {
                        const input = element.find(`[name="${key}"]`);
                        const inputType = input.attr('type') || 'text';
                        
                        if (inputType === 'email') {
                            sanitizedData[key] = sanitize.email(value);
                        } else if (inputType === 'tel' || input.hasClass('phone-form-input')) {
                            sanitizedData[key] = sanitize.phone(value);
                        } else if (input.hasClass('name-form-input') || key.includes('Name')) {
                            sanitizedData[key] = sanitize.name(value);
                        } else if (inputType === 'url') {
                            sanitizedData[key] = sanitize.url(value);
                        } else {
                            sanitizedData[key] = sanitize.text(value);
                        }
                    }
                });
                
                return sanitizedData;
            };

            // Make functions available to parent scope and register with service
            FormValidationService.registerForm(formCtrl.$name, {
                validateForm: scope.validateForm,
                sanitizeFormData: scope.sanitizeFormData
            });
            
            if (scope.onValidationChange) {
                scope.$watch(function() {
                    return formCtrl.$valid;
                }, function(isValid) {
                    scope.onValidationChange({
                        isValid: isValid,
                        validateForm: scope.validateForm,
                        sanitizeFormData: scope.sanitizeFormData
                    });
                });
            }

            // Cleanup on scope destroy
            scope.$on('$destroy', function() {
                FormValidationService.unregisterForm(formCtrl.$name);
            });

            // Add CSS classes for styling
            element.addClass('golura-validated-form');
            
            // Log directive initialization
            $log.debug('Golura Form Validation initialized for form:', formCtrl.$name);
        }
    };
}]);
