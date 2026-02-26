angular.module('goluraApp').service('FormValidationService', ['$log', function($log) {
    
    // Service to help controllers work with the form validation directive
    const service = this;
    
    // Store validation handlers for forms
    service.validationHandlers = {};
    
    /**
     * Register a form's validation functions
     * @param {string} formName - The name of the form
     * @param {object} handlers - Object containing validateForm and sanitizeFormData functions
     */
    service.registerForm = function(formName, handlers) {
        service.validationHandlers[formName] = handlers;
        $log.debug('Form validation handlers registered for:', formName);
    };
    
    /**
     * Validate a specific form
     * @param {string} formName - The name of the form to validate
     * @returns {boolean} - True if form is valid
     */
    service.validateForm = function(formName) {
        const handlers = service.validationHandlers[formName];
        if (handlers && handlers.validateForm) {
            return handlers.validateForm();
        }
        $log.warn('No validation handler found for form:', formName);
        return false;
    };
    
    /**
     * Sanitize form data before sending to backend
     * @param {string} formName - The name of the form
     * @param {object} data - The form data to sanitize
     * @returns {object} - Sanitized form data
     */
    service.sanitizeFormData = function(formName, data) {
        const handlers = service.validationHandlers[formName];
        if (handlers && handlers.sanitizeFormData) {
            return handlers.sanitizeFormData(data);
        }
        $log.warn('No sanitization handler found for form:', formName);
        return data;
    };
    
    /**
     * Validate and sanitize form data in one step
     * @param {string} formName - The name of the form
     * @param {object} data - The form data
     * @returns {object} - Object with {isValid: boolean, data: object}
     */
    service.validateAndSanitize = function(formName, data) {
        const isValid = service.validateForm(formName);
        const sanitizedData = service.sanitizeFormData(formName, data);
        
        return {
            isValid: isValid,
            data: sanitizedData
        };
    };
    
    /**
     * Enhanced form submission helper
     * @param {string} formName - The name of the form
     * @param {object} data - The form data
     * @param {function} submitFunction - Function to call if validation passes
     * @param {object} options - Additional options
     */
    service.handleFormSubmission = function(formName, data, submitFunction, options = {}) {
        const validation = service.validateAndSanitize(formName, data);
        
        if (!validation.isValid) {
            $log.warn('Form validation failed for:', formName);
            if (options.onValidationError) {
                options.onValidationError();
            }
            return false;
        }
        
        // Add security headers if needed
        if (options.addCSRFToken) {
            validation.data._csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        }
        
        // Call the submit function with sanitized data
        if (typeof submitFunction === 'function') {
            return submitFunction(validation.data);
        }
        
        return validation.data;
    };
    
    /**
     * Clear validation handlers for a form (useful for cleanup)
     * @param {string} formName - The name of the form
     */
    service.unregisterForm = function(formName) {
        delete service.validationHandlers[formName];
        $log.debug('Form validation handlers cleared for:', formName);
    };
    
    /**
     * Get all registered forms
     * @returns {array} - Array of form names
     */
    service.getRegisteredForms = function() {
        return Object.keys(service.validationHandlers);
    };
    
    return service;
}]);
