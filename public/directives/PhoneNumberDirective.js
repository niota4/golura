angular.module('ngPhoneNumber', ['ngCommunications'])
  .filter('phoneFormat', function() {
    return function(input) {
      if (!input) return input;
      
      var numericValue = input.toString().replace(/\D/g, '');
      
      if (numericValue.startsWith('1') && numericValue.length > 10) {
        numericValue = numericValue.substring(1);
      }
      
      var formattedValue = numericValue.slice(0, 10);
      
      if (formattedValue.length === 10) {
        formattedValue = formattedValue.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');
      }
      
      return formattedValue;
    };
  })
  .directive('phoneNumber', function($interpolate, $communication, $cookies, $rootScope) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function formatPhoneNumber(value) {
          if (!value) {
            return value;
          }

          // Strip out all non-numeric characters
          var numericValue = value.replace(/\D/g, '');

          // Remove +1 if it exists at the beginning
          if (numericValue.startsWith('1') && numericValue.length > 10) {
            numericValue = numericValue.substring(1);
          }

          // Keep the first 10 digits
          var formattedValue = numericValue.slice(0, 10);

          // Format the number as (xxx) xxx-xxxx
          if (formattedValue.length === 10) {
            formattedValue = formattedValue.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');
          }
          return formattedValue;
        }

        function applyFormatting() {
            var interpolatedText = $interpolate(element.text())(scope);
            var formattedText = formatPhoneNumber(interpolatedText);
            element.text(formattedText);
        }

        function initiateCall() {
          // Check if this is a button element that should not have its content replaced
          var isButton = attrs.button === 'true' || element[0].tagName.toLowerCase() === 'button';
          
          // Get the phone number from the element or ng-model attribute
          var phoneNumber;
          if (isButton && attrs.ngModel) {
            // For buttons, get phone number from ng-model attribute value
            phoneNumber = scope.$eval(attrs.ngModel);
            if (phoneNumber) {
              phoneNumber = phoneNumber.toString().replace(/\D/g, '');
            }
          } else {
            // For regular elements, get from text content
            phoneNumber = element.text().replace(/\D/g, '');
          }
          
          if (!phoneNumber || phoneNumber.length !== 10) {
            alert('Invalid phone number format');
            return;
          }

          // Get client and phone number IDs from attributes (kebab-case to camelCase conversion)
          var clientId = attrs.clientId || attrs['client-id'] || scope.clientId;
          var phoneNumberId = attrs.phoneNumberId || attrs['phone-number-id'] || scope.phoneNumberId;
          var estimateId = attrs.estimateId || attrs['estimate-id'] || scope.estimateId;
          var eventId = attrs.eventId || attrs['event-id'] || scope.eventId;
          var workOrderId = attrs.workOrderId || attrs['work-order-id'] || scope.workOrderId;
          var invoiceId = attrs.invoiceId || attrs['invoice-id'] || scope.invoiceId;

          console.log('Debug - clientId:', clientId, 'phoneNumberId:', phoneNumberId);

          if (!clientId || !phoneNumberId) {
            alert('Client ID and Phone Number ID are required to initiate a call');
            return;
          }

          var originalText = element.text();
          
          // Only show loading state if not a button
          if (!isButton) {
            element.text('Calling...');
            element.css('pointer-events', 'none');
          } else {
            // For buttons, just disable pointer events but keep the content
            element.css('pointer-events', 'none');
          }

          var callData = {
            clientId: parseInt(clientId),
            phoneNumberId: parseInt(phoneNumberId)
          };


          // Add optional IDs if provided
          if (estimateId) callData.estimateId = parseInt(estimateId);
          if (eventId) callData.eventId = parseInt(eventId);
          if (workOrderId) callData.workOrderId = parseInt(workOrderId);
          if (invoiceId) callData.invoiceId = parseInt(invoiceId);

          $communication.createCall(callData)
            .then(function(response) {
              if (response.err) {
                $rootScope.$broadcast('callError', response.msg);
              } else {
                $rootScope.$broadcast('callInitiated', response.msg);
              }
            })
            .catch(function(error) {
              console.error('Call error:', error);
              $rootScope.$broadcast('callError', 'Error initiating call. Please try again.');
            })
            .finally(function() {
              // Restore original state
              if (!isButton) {
                element.text(originalText);
              }
              element.css('pointer-events', 'auto');
            });
        }

        // Initial formatting - but not for buttons
        var isButton = attrs.button === 'true' || element[0].tagName.toLowerCase() === 'button';
        if (!isButton) {
          applyFormatting();
        } else if (isButton && attrs.ngModel) {
          // For buttons with ng-model, format the phone number in the content
          var initialValue = scope.$eval(attrs.ngModel);
          if (initialValue) {
            var formattedNumber = formatPhoneNumber(initialValue.toString());
            // Check if button content is just the phone number
            var currentText = element.text().replace(/\s+/g, '').replace(/\D/g, '');
            var modelValue = initialValue.toString().replace(/\D/g, '');
            
            if (currentText === modelValue) {
              // Button content is just the phone number, replace it with formatted version
              element.text(formattedNumber);
            }
          }
        }

        // Add click event listener
        element.on('click', function() {
          initiateCall();
        });

        // Add cursor pointer style to indicate clickability
        element.css({
          'cursor': 'pointer',
        });
      }
    };
  });