define(['app-controller', 'stripe-js', 'lodash'], function (app, loadStripe, _) {
    app.register.controller('PaymentsController',
    function (
        $scope,
        $location,
        $document,
        $window,
        $log,
        $q,
        $estimate,
        $invoice,
        $payment,
        $client,
        $timeout
    ) {
        // Utility function to parse query parameters
        const urlParams = new URLSearchParams(window.location.search);

        $scope.payment = {};
        $scope.estimate = {};
        $scope.invoice = {};
        $scope.achPayment = {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            accountType: '',
            routingNumber: '',
            accountNumber: '',
            termsAccepted: false,
            verifyAmount1: null,
            verifyAmount2: null,
            setupIntentClientSecret: null
        };

        $scope.UI = {
            paymentMethodsLoaded: false,
            formSaved: false,
            payProcessed: false,
            isFormValid: false,
            isACHFormValid: false,
            achVerificationRequired: false,
            achPaymentProcessing: false,
            autoVerifying: false, // New flag for auto-verification status
            currentStep: 1, // 1: Bank Details, 2: Verification, 3: Success
            errMessage: null,
            message: null,
            formSaving: false
        };

        $scope.initPayment = function () {
            $scope.UI.paymentMethodsLoaded = false;
            $scope.payment = {
                clientId: urlParams.get('clientId'),
                estimateId: urlParams.get('estimateId'),
                invoiceId: urlParams.get('invoiceId'),
                currency: 'usd',
                paymentMethodId: urlParams.get('paymentMethodId'),
                amount: urlParams.get('amount') // Get amount from URL parameter
            };
            if (
                $scope.payment.clientId &&
                ($scope.payment.estimateId || $scope.payment.invoiceId) &&
                $scope.payment.paymentMethodId
            ) {
                const promises = [];
                const paymentMethodsPromise = $payment.getPaymentMethods();
                const clientPromise = $client.getClient({id: $scope.payment.clientId});
                
                promises.push(paymentMethodsPromise, clientPromise);
                
                // Add estimate or invoice promise based on what's provided
                if ($scope.payment.estimateId) {
                    const estimatePromise = $estimate.getEstimate({ id: $scope.payment.estimateId });
                    promises.unshift(estimatePromise);
                } else if ($scope.payment.invoiceId) {
                    const invoicePromise = $invoice.getInvoice({ id: $scope.payment.invoiceId });
                    promises.unshift(invoicePromise);
                }
    
                $q.all(promises)
                .then(function (responses) {
                    const documentResponse = responses[0]; // estimate or invoice
                    const paymentMethodsResponse = responses[1];
                    const clientResponse = responses[2];
    
                    if (!documentResponse.err && !paymentMethodsResponse.err) {
                        $scope.UI.paymentMethodsLoaded = true;
                        $scope.paymentMethods = paymentMethodsResponse.paymentMethods;
                        
                        if ($scope.payment.estimateId) {
                            $scope.estimate = documentResponse.estimate;
                        } else if ($scope.payment.invoiceId) {
                            $scope.invoice = documentResponse.invoice;
                        }
                        
                        $scope.client = clientResponse.client;
                        $scope.initPaymentForm();
                        $(document).foundation();
                    }
                })
                .catch(function (error) {
                    $scope.UI.errMessage = 'Error loading payment methods or document.';
                });
            }
        };
        $scope.initACHPayment = function () {
            $scope.UI.paymentMethodsLoaded = false;
            $scope.UI.currentStep = 1;
            $scope.achPayment = {
                clientId: urlParams.get('clientId'),
                estimateId: urlParams.get('estimateId'),
                invoiceId: urlParams.get('invoiceId'),
                currency: 'usd',
                paymentMethodId: urlParams.get('paymentMethodId'),
                amount: urlParams.get('amount'), // Get amount from URL parameter
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                accountType: '',
                routingNumber: '',
                accountNumber: '',
                termsAccepted: false,
                verifyAmount1: null,
                verifyAmount2: null,
                setupIntentClientSecret: null
            };
            
            // Initialize form validation
            $scope.checkACHFormValidity();
            
            // Add watchers for form validation
            $scope.$watchGroup([
                'achPayment.firstName',
                'achPayment.lastName', 
                'achPayment.email',
                'achPayment.accountType',
                'achPayment.routingNumber',
                'achPayment.accountNumber',
                'achPayment.termsAccepted'
            ], function() {
                $scope.checkACHFormValidity();
            });
            
            if (
                $scope.achPayment.clientId &&
                ($scope.achPayment.estimateId || $scope.achPayment.invoiceId) &&
                $scope.achPayment.paymentMethodId
            ) {
                const promises = [];
                const paymentMethodsPromise = $payment.getPaymentMethods();
                const clientPromise = $client.getClient({id: $scope.achPayment.clientId});
                
                promises.push(paymentMethodsPromise, clientPromise);
                
                // Add estimate or invoice promise based on what's provided
                if ($scope.achPayment.estimateId) {
                    const estimatePromise = $estimate.getEstimate({ id: $scope.achPayment.estimateId });
                    promises.unshift(estimatePromise);
                } else if ($scope.achPayment.invoiceId) {
                    const invoicePromise = $invoice.getInvoice({ id: $scope.achPayment.invoiceId });
                    promises.unshift(invoicePromise);
                }
    
                $q.all(promises)
                .then(function (responses) {
                    const documentResponse = responses[0]; // estimate or invoice
                    const paymentMethodsResponse = responses[1];
                    const clientResponse = responses[2];
                    
                    if (!documentResponse.err) {
                        if ($scope.achPayment.estimateId) {
                            $scope.estimate = documentResponse.estimate;
                        } else if ($scope.achPayment.invoiceId) {
                            $scope.invoice = documentResponse.invoice;
                        }
                    }
                    if (!paymentMethodsResponse.err) {
                        $scope.paymentMethods = paymentMethodsResponse.paymentMethods;
                        $scope.UI.paymentMethodsLoaded = true;
                    }
                    if (!clientResponse.err) {
                        $scope.client = clientResponse.client;
                        // Pre-fill customer data if available
                        if ($scope.client) {
                            $scope.achPayment.firstName = $scope.client.firstName || '';
                            $scope.achPayment.lastName = $scope.client.lastName || '';
                            $scope.achPayment.email = $scope.client.primaryEmail || '';
                            $scope.achPayment.phoneNumber = $scope.client.primaryPhoneNumber || '';
                        }
                    }
                })
                .catch(function (error) {
                    $scope.UI.errMessage = 'Failed to load payment information';
                });
            }
        };
        $scope.initStripe = async function () {
            const stripe = await loadStripe(
                'pk_test_51PfKnvFau514rFkMHJwtI5RxtcjO41grJtmtlJBebZhvg427T1RNOOFbQJkoC5c6icH0gnMYfM4ggn6KXWz4plHn008BWJTQDm'
            );
            const elements = stripe.elements();
        
            const cardNumberElement = elements.create('cardNumber', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#32325d',
                        '::placeholder': {
                            color: '#a5b1b7',
                            fontFamily: '"Montserrat", "Helvetica Neue", Helvetica, sans-serif',
                            fontStyle: 'italic',
                            fontSize: '1rem',
                            fontWeight: '400' // Thin font weight
                        },
                        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                        fontSmoothing: 'antialiased',
                        ':-webkit-autofill': {
                            color: '#fce883',
                        },
                        ':focus': {
                            color: '#424770',
                        },
                        ':hover': {
                            color: '#1d1d1d',
                        }
                    },
                    invalid: {
                        color: '#fa755a',
                        iconColor: '#fa755a'
                    }
                }
            });
            cardNumberElement.mount('#card-number-element');
        
            const cardExpiryElement = elements.create('cardExpiry', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#32325d',
                        '::placeholder': {
                            color: '#a5b1b7',
                            fontFamily: '"Montserrat", "Helvetica Neue", Helvetica, sans-serif',
                            fontStyle: 'italic',
                            fontSize: '1rem',
                            fontWeight: '400' // Thin font weight
                        },
                        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                        fontSmoothing: 'antialiased',
                        ':-webkit-autofill': {
                            color: '#fce883',
                        },
                        ':focus': {
                            color: '#424770',
                        },
                        ':hover': {
                            color: '#1d1d1d',
                        }
                    },
                    invalid: {
                        color: '#fa755a',
                        iconColor: '#fa755a'
                    }
                }
            });
            cardExpiryElement.mount('#card-expiry-element');
        
            const cardCvcElement = elements.create('cardCvc', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#32325d',
                        '::placeholder': {
                            color: '#a5b1b7',
                            fontFamily: '"Montserrat", "Helvetica Neue", Helvetica, sans-serif',
                            fontStyle: 'italic',
                            fontSize: '1rem',
                            fontWeight: '400' // Thin font weight
                        },
                        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                        fontSmoothing: 'antialiased',
                        ':-webkit-autofill': {
                            color: '#fce883',
                        },
                        ':focus': {
                            color: '#424770',
                        },
                        ':hover': {
                            color: '#1d1d1d',
                        }
                    },
                    invalid: {
                        color: '#fa755a',
                        iconColor: '#fa755a'
                    }
                }
            });
            cardCvcElement.mount('#card-cvc-element');
        
            // Use the 'change' event to detect any updates to the state of the fields
            const elementsArray = [cardNumberElement, cardExpiryElement, cardCvcElement];
            elementsArray.forEach(element => {
                element.on('change', function (event) {
                    $scope.$apply(function() {
                        if ($scope.checkFormValidity()) {
                            $scope.UI.isFormValid = true;
                        } else {
                            $timeout(function() {
                                $scope.$apply(function() {
                                    $scope.UI.isFormValid = $scope.checkFormValidity();
                                });
                            }, 1000);
                        }
                    });
                });
            });
        
            $scope.stripe = stripe;
            $scope.cardNumberElement = cardNumberElement;
            $scope.cardExpiryElement = cardExpiryElement;
            $scope.cardCvcElement = cardCvcElement;
        
            // Watch for changes in other required fields
            $scope.$watchGroup(['payment.firstName', 'payment.lastName'], function() {
                $scope.UI.isFormValid = $scope.checkFormValidity();
            });
        
            // Call checkFormValidity to set initial state after a brief delay to ensure all elements are mounted
            $timeout(function() {
                $scope.UI.isFormValid = $scope.checkFormValidity();
            }, 500);
        };
        $scope.initStripeACH = async function () {
            try {
                const stripe = await loadStripe(
                    'pk_test_51PfKnvFau514rFkMHJwtI5RxtcjO41grJtmtlJBebZhvg427T1RNOOFbQJkoC5c6icH0gnMYfM4ggn6KXWz4plHn008BWJTQDm'
                );
                
                // Store stripe instance
                $scope.stripe = stripe;
                
                // For ACH, we'll use manual form fields and create payment method programmatically
                // No need to mount elements since US Bank Account uses manual input
                
            } catch (error) {
                $scope.UI.errMessage = 'Failed to initialize payment system';
            }
        };
        $scope.initPaymentForm = function () {
            const methodId = urlParams.get('paymentMethodId');
            const selectedMethod = _.find($scope.paymentMethods, function (paymentMethod) {
                return paymentMethod.id === parseInt(methodId);
            });
            if (selectedMethod && selectedMethod.name === 'Credit Card') {
                $scope.createStripePaymentIntent();
            } else if (selectedMethod && selectedMethod.name === 'Bank Transfer') {
                $scope.initACHPayment();
            }
        };
        $scope.initFormSaved = function (msg) {
            $scope.UI.formSaved = true;
            $scope.UI.message = msg;
            
            $timeout(
                function () {
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
        $scope.createStripePaymentIntent = function () {
            const paymentData = {
                clientId: $scope.payment.clientId,
                estimateId: $scope.payment.estimateId,
                invoiceId: $scope.payment.invoiceId,
                amount: $scope.payment.amount,
                currency: $scope.payment.currency,
                paymentMethodId: $scope.payment.paymentMethodId
            };
            $payment.createStripePaymentIntent(paymentData)
                .then(function (response) {
                    if (response.err) {
                        $scope.initErrorMessage(response.msg || 'Error creating Stripe payment intent.');
                        return;
                    }
                    $scope.clientSecret = response.clientSecret;
                    $scope.initStripe();
                })
                .catch(function (error) {
                    $scope.initErrorMessage(error.data?.msg || 'Error creating Stripe payment intent.');
                });
        };
        $scope.checkFormValidity = function () {
            const cardNumberComplete = $scope.cardNumberElement && $scope.cardNumberElement._complete;
            const cardExpiryComplete = $scope.cardExpiryElement && $scope.cardExpiryElement._complete;
            const cardCvcComplete = $scope.cardCvcElement && $scope.cardCvcElement._complete;
            const firstNameComplete = !!$scope.payment.firstName;
            const lastNameComplete = !!$scope.payment.lastName;
        
            return cardNumberComplete && cardExpiryComplete && cardCvcComplete && firstNameComplete && lastNameComplete;
        };
        $scope.checkACHFormValidity = function () {
            const firstNameComplete = !!$scope.achPayment.firstName;
            const lastNameComplete = !!$scope.achPayment.lastName;
            const emailComplete = !!$scope.achPayment.email;
            const accountTypeComplete = !!$scope.achPayment.accountType;
            const routingNumberComplete = !!$scope.achPayment.routingNumber && $scope.achPayment.routingNumber.length === 9;
            const accountNumberComplete = !!$scope.achPayment.accountNumber && $scope.achPayment.accountNumber.length >= 4;
            const termsAccepted = !!$scope.achPayment.termsAccepted;
            
            const isValid = firstNameComplete && lastNameComplete && emailComplete && 
                   accountTypeComplete && routingNumberComplete && accountNumberComplete && termsAccepted;
            
            $scope.UI.isACHFormValid = isValid;
            return isValid;
        };
        $scope.submitPayment = function (event) {
            event.preventDefault();
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.formSaving = true;

            if (!$scope.stripe || !$scope.cardNumberElement) {
                $scope.UI.formSaving = false;
                $scope.initErrorMessage('Payment system not initialized.');
                return;
            }

            $scope.stripe.confirmCardPayment($scope.clientSecret, {
                payment_method: {
                    card: $scope.cardNumberElement,
                    billing_details: {
                        name: $scope.payment.firstName + ' ' + $scope.payment.lastName,
                        email: $scope.payment.email,
                        phone: $scope.payment.number
                    }
                }
            })
            .then(function (result) {
                if (result.error) {
                    $scope.UI.formSaving = false;
                    $scope.initErrorMessage(result.error.message);
                } else {
                    // Payment succeeded
                    const saveData = {
                        amount: $scope.payment.amount,
                        currency: $scope.payment.currency,
                        paymentIntentId: result.paymentIntent.id,
                        paymentMethodId: $scope.payment.paymentMethodId,
                        status: result.paymentIntent.status,
                        clientId: $scope.payment.clientId,
                        estimateId: $scope.payment.estimateId,
                        invoiceId: $scope.payment.invoiceId,
                        firstName: $scope.payment.firstName,
                        lastName: $scope.payment.lastName,
                        email: $scope.payment.email,
                        phoneNumber: $scope.payment.number
                    };

                    $payment.savePayment(saveData)
                        .then(function (response) {
                            if (response.err) {
                                $scope.UI.formSaving = false;
                                $scope.initErrorMessage(response.msg || 'Error saving payment.');
                            } else {
                                $scope.UI.formSaving = false;
                                $scope.UI.payProcessed = true;
                                $scope.UI.message = 'Payment successful!';
                            }
                        })
                        .catch(function (error) {
                            $scope.UI.formSaving = false;
                            $scope.initErrorMessage(error.data?.msg || 'Error saving payment.');
                        });
                }
            })
            .catch(function (error) {
                $scope.UI.formSaving = false;
                $scope.initErrorMessage('Payment failed. Please try again.');
            });
        };
        $scope.submitACHPayment = function (event) {
            event.preventDefault();
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.formSaving = true;
            
            // Create customer data for SetupIntent
            const customerData = {
                firstName: $scope.achPayment.firstName,
                lastName: $scope.achPayment.lastName,
                email: $scope.achPayment.email,
                phoneNumber: $scope.achPayment.phoneNumber,
                clientId: $scope.achPayment.clientId,
                estimateId: $scope.achPayment.estimateId,
                invoiceId: $scope.achPayment.invoiceId
            };
            
            // Create bank details for payment method creation
            const bankDetails = {
                routingNumber: $scope.achPayment.routingNumber,
                accountNumber: $scope.achPayment.accountNumber,
                accountType: $scope.achPayment.accountType
            };
            
            $scope.UI.autoVerifying = true; // Set auto-verification flag
            
            // Create SetupIntent for ACH payment
            $payment.createACHSetupIntent({
                customerData: customerData,
                bankDetails: bankDetails
            })
            .then(function (response) {
                $scope.UI.formSaving = false;
                $scope.UI.autoVerifying = false; // Clear auto-verification flag
                
                if (response.err) {
                    throw new Error(response.msg);
                }
                
                // Store customer and setup intent IDs
                $scope.achPayment.customerId = response.customerId;
                $scope.achPayment.setupIntentId = response.setupIntentId;
                $scope.achPayment.paymentMethodId = response.paymentMethodId;
                $scope.achPayment.clientSecret = response.clientSecret;
                
                if (response.autoVerified && response.status === 'succeeded') {
                    // Auto-verification successful - skip step 2 and go directly to payment processing
                    $scope.UI.achVerificationRequired = false;
                    $scope.UI.currentStep = 3;
                    $scope.UI.message = 'Bank account verified automatically! Processing payment...';
                    
                    // Add a small delay to show the success message before processing
                    $timeout(function() {
                        $scope.processACHPayment();
                    }, 1500);
                } else if (response.requiresVerification) {
                    // Manual verification required
                    $scope.UI.achVerificationRequired = true;
                    $scope.UI.currentStep = 2;
                    $scope.UI.message = 'Bank account added successfully. We will send micro-deposits within 1-2 business days for verification.';
                } else {
                    $scope.UI.achVerificationRequired = false;
                    $scope.UI.currentStep = 3;
                    $scope.processACHPayment();
                }
                
                // Use $timeout to safely trigger digest cycle
                $timeout(function() {
                    // This will trigger a digest cycle safely
                }, 0);
            })
            .catch(function (error) {
                $scope.UI.formSaving = false;
                $scope.UI.autoVerifying = false; // Clear auto-verification flag
                $scope.UI.errMessage = error.data?.msg || error.message || 'Failed to set up bank account';
                // Use $timeout to safely trigger digest cycle
                $timeout(function() {
                    // This will trigger a digest cycle safely
                }, 0);
            });
        };
        $scope.verifyBankAccount = function () {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            
            const verificationData = {
                setupIntentId: $scope.achPayment.setupIntentId,
                amounts: [
                    parseInt($scope.achPayment.verifyAmount1),
                    parseInt($scope.achPayment.verifyAmount2)
                ]
            };
            
            $payment.verifyACHBankAccount(verificationData)
                .then(function (response) {
                    
                    if (response.err) {
                        throw new Error(response.msg);
                    }
                    
                    // Verification successful - get the payment method from the verified setup intent
                    $scope.achPayment.paymentMethodId = response.verification.payment_method;
                    
                    // Payment method is now verified and attached - proceed with payment
                    $scope.UI.achVerificationRequired = false;
                    $scope.UI.currentStep = 3;
                    return $scope.processACHPayment();
                })
                .catch(function (error) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = error.data?.msg || error.message || 'Failed to verify bank account. Please check the amounts and try again.';
                    // Use $timeout to safely trigger digest cycle
                    $timeout(function() {
                        // This will trigger a digest cycle safely
                    }, 0);
                });
        };
        $scope.processACHPayment = function () {
            
            $scope.UI.achPaymentProcessing = true;
            
            const paymentData = {
                amount: Math.round($scope.achPayment.amount * 100), // Convert to cents
                currency: $scope.achPayment.currency,
                customerId: $scope.achPayment.customerId,
                paymentMethodId: $scope.achPayment.paymentMethodId,
                clientId: $scope.achPayment.clientId,
                estimateId: $scope.achPayment.estimateId,
                invoiceId: $scope.achPayment.invoiceId
            };
            
            
            return $payment.createACHPaymentIntent(paymentData)
                .then(function (response) {
                    
                    if (response.err) {
                        throw new Error(response.msg);
                    }
                    
                    // Save payment record
                    const saveData = {
                        amount: $scope.achPayment.amount,
                        currency: $scope.achPayment.currency,
                        paymentIntentId: response.paymentIntent.id,
                        paymentMethodId: $scope.achPayment.paymentMethodId,
                        status: response.paymentIntent.status,
                        clientId: $scope.achPayment.clientId,
                        estimateId: $scope.achPayment.estimateId,
                        invoiceId: $scope.achPayment.invoiceId,
                        firstName: $scope.achPayment.firstName,
                        lastName: $scope.achPayment.lastName,
                        email: $scope.achPayment.email,
                        phoneNumber: $scope.achPayment.phoneNumber
                    };
                    
                    return $payment.saveACHPayment(saveData);
                })
                .then(function (response) {
                    
                    if (response.err) {
                        throw new Error(response.msg);
                    }
                    
                    // Payment successful - Move to final step
                    $scope.UI.formSaving = false;
                    $scope.UI.achPaymentProcessing = false;
                    $scope.UI.payProcessed = true;
                    $scope.UI.currentStep = 3;
                    $scope.UI.achVerificationRequired = false;
                    $scope.UI.message = 'ACH payment initiated successfully! Your payment is now pending and will be processed within 3-5 business days.';
                    
                    // Use $timeout to safely trigger digest cycle
                    $timeout(function() {
                        // This will trigger a digest cycle safely
                    }, 0);
                })
                .catch(function (error) {
                    $scope.UI.formSaving = false;
                    $scope.UI.achPaymentProcessing = false;
                    $scope.UI.errMessage = error.data?.msg || error.message || 'Failed to process payment';
                    
                    // Use $timeout to safely trigger digest cycle
                    $timeout(function() {
                        // This will trigger a digest cycle safely
                    }, 0);
                });
        };
        $scope.simulateVerification = function() {
            // For development/testing: Use amounts 32 and 45 (common Stripe test amounts)
            $scope.achPayment.verifyAmount1 = 32;
            $scope.achPayment.verifyAmount2 = 45;
            $scope.verifyBankAccount();
        };
        $scope.skipVerificationForTesting = function() {
            if (window.location.hostname === 'localhost' || window.location.hostname.includes('test')) {
                $scope.UI.achVerificationRequired = false;
                $scope.UI.currentStep = 3;
                $scope.processACHPayment();
            }
        };
    });
});
