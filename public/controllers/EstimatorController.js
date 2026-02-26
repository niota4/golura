define(['app-controller', 'random-color'], function (app, randomColor) {
    app.register.controller('EstimatorController',
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
        $http,
        $estimator,
        $setup,
        $media,
        $uploader // Add the uploader service
    ) {

        const urlParams = new URLSearchParams(window.location.search);

        $scope.search = {
            estimators: {
                value: '',
                params: {}
            }
        };
        $scope.sort = {
            estimators: {
                id: 1,
                value: 'estimatorName'
            }
        };
        $scope.estimatorOptions = [
            {
                id: 1,
                name: 'A - Z'
            },
            {
                id: 2,
                name: 'Z - A'
            },
            {
                id: 3,
                name: 'Most Recent'
            },
            {
                id: 4,
                name: 'Least Recent'
            }
        ];
        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];
        $scope.page = $setup.getCurrentPage() || {};
        $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null) || [];
        $scope.estimate = {};
        $scope.estimator = {};
        $scope.question = {};

        $scope.estimators = [];
        $scope.lineItems = [];
        $scope.labor = [];
        $scope.questions = [];
        $scope.adjustments = [];
        $scope.users = [];
        $scope.questionContainer = [];
        
        // New properties for multi-container support
        $scope.currentContainerIndex = 0;
        $scope.currentContainer = {};
        $scope.questionAnswers = {}; // Store all answers here
        $scope.allAnswersValid = false;

        $scope.UI = {
            tab: urlParams.get('tab'),
            isMobile: $media.getMedia(),
            currentUrl: window.location.pathname.split('/'),
            errMessage: null,
            message: null,
            estimatorLoaded: false,
            formSaving: false,
        };
        
        $setup.updateScopes($scope, $scope.page.id || null);

        $scope.initEstimator = function () {
            $scope.UI.estimatorLoaded = false;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            // Load available labor roles for this estimator
            $scope.initLabor();

            $estimator.getEstimator({id: $routeParams.estimatorId})
            .then(
                function (response) {
                    $scope.UI.estimatorLoaded = true;

                    if (!response.err) {
                        $scope.estimator = response.estimator;
                        
                        // Initialize multi-container support
                        if ($scope.estimator.QuestionContainers && $scope.estimator.QuestionContainers.length > 0) {
                            $scope.currentContainerIndex = 0;
                            $scope.currentContainer = $scope.estimator.QuestionContainers[0];
                            $scope.initializeAnswers();
                        }
                        
                        // Test mode - uncomment the line below to use test data for development
                        setTimeout(function() {
                            console.log('Auto-loading test data after delay...');
                            $scope.loadTestData();
                        }, 2000);
                        
                        $scope.UI.estimatorLoaded = true;
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while loading the estimator.';
                    }
                }
            ).catch(
                function (error) {
                    $scope.UI.estimatorLoaded = true;
                    $scope.UI.errMessage = error.msg || 'An error occurred while loading the estimator.';
                }
            );
        };
        $scope.validateAnsweredQuestions = function () {
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            
            if ($scope.questionContainer.length === 0) {
                return false;
            }
            if ($scope.questionContainer.Questions.length === 0) {
                $scope.UI.errMessage = 'No questions found in the estimator.';
                return false;
            }
            // check for questions that are have isRequired = true and are not answered
            const unansweredQuestions = $scope.questionContainer.Questions.filter(question => {
                return question.isRequired && !question.answer;
            });
            if (unansweredQuestions.length > 0) {
                $scope.UI.errMessage = 'Please answer all required questions before saving.';
                return false;
            }
            return true;
        };
        $scope.processQuestionOptions = function(question) {
            if (!question.options) return;
            
            question.selectOptions = [];
            question.answerOptions = []; // For selectize directive
            
            let options = [];
            
            // Handle new JSON format
            if (Array.isArray(question.options)) {
                options = question.options;
            } else if (typeof question.options === 'string') {
                try {
                    // Try to parse as JSON first
                    const parsed = JSON.parse(question.options);
                    if (Array.isArray(parsed)) {
                        options = parsed;
                    } else {
                        // Fall back to old comma-separated format
                        options = question.options.split(',');
                    }
                } catch (e) {
                    // Fall back to old comma-separated format
                    options = question.options.split(',');
                }
            }
            
            options.forEach(function(option, index) {
                let label, value;
                
                if (typeof option === 'object' && option.label && option.value !== undefined) {
                    // New format: {label: "Basic", value: 1}
                    label = option.label;
                    value = option.value;
                } else if (typeof option === 'string') {
                    // Check if it's old format with ||
                    const parts = option.split('||');
                    if (parts.length === 2) {
                        label = parts[0].trim();
                        value = parts[1].trim();
                    } else {
                        // Simple string format: ["1", "2", "or more"]
                        label = option.trim();
                        value = option.trim();
                    }
                } else {
                    // Fallback for other types
                    label = String(option);
                    value = String(option);
                }
                
                // Format for radio/standard select
                question.selectOptions.push({
                    label: label,
                    value: value
                });
                
                // Format for selectize directive (expects {id, name})
                question.answerOptions.push({
                    id: value,
                    name: label
                });
            });
        };
        $scope.initQuestions = function() {
            if ($scope.questionContainer && $scope.questionContainer.Questions) {
                $scope.questionContainer.Questions.forEach(function(question) {
                    $scope.processQuestionOptions(question);
                    $scope.processQuestionValidationRules(question);
                    
                    // Set default values
                    if (question.defaultValue && !question.answer) {
                        question.answer = question.defaultValue;
                    }
                });
            }
        };
        $scope.processQuestionValidationRules = function(question) {
            if (!question.validationRules) return;
            
            try {
                // Try to parse as JSON first
                const parsedRules = JSON.parse(question.validationRules);
                question.validationRules = parsedRules;
            } catch (e) {
                // If it's not JSON, it might be a legacy string format
                // Keep it as is for now, but we could parse it if needed
                $log.warn('Could not parse validation rules as JSON for question:', question.id, question.validationRules);
            }
        };
        $scope.isRequired = function(question) {
            return question.isRequired === true || question.isRequired === 1;
        };
        $scope.toggleEstimatorOptions = function(question, index) {
            question.selectedIndex = index;
        };
        $scope.runEstimator = function() {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;

            // Safety check
            if (!$scope.estimator || !$scope.estimator.QuestionContainers) {
                $scope.UI.formSaving = false;
                $scope.UI.errMessage = 'Estimator data not loaded properly.';
                return;
            }

            // Validate all containers before proceeding
            var allValid = true;

            $log.log('Validating all containers before estimate generation...');
            $scope.estimator.QuestionContainers.forEach(function(container, index) {
                const tempContainer = $scope.currentContainer;
                const tempIndex = $scope.currentContainerIndex;
                
                $scope.currentContainer = container;
                $scope.currentContainerIndex = index;
                
                if (!$scope.isCurrentContainerValid()) {
                    allValid = false;
                }
                if (!allValid) {
                    const invalidQuestions = container.Questions.filter(function(q) {
                        if (!q.isRequired) return false;
                        const modelKey = $scope.getQuestionModelKey(q);
                        return !$scope.questionAnswers[modelKey];
                    });
                }
                $scope.currentContainer = tempContainer;
                $scope.currentContainerIndex = tempIndex;
            });
            if (!allValid) {
                $scope.UI.formSaving = false;
                $scope.UI.errMessage = 'Please complete all required questions in all sections.';
                return;
            }

            // Collect answers - separate formula-referenced from regular questions
            const formulaAnswers = {};
            const regularAnswers = {};
            
            // Go through all questions and categorize answers
            $scope.estimator.QuestionContainers.forEach(function(container) {
                if (container.Questions) {
                    container.Questions.forEach(function(question) {
                        const modelKey = $scope.getQuestionModelKey(question);
                        const answer = $scope.questionAnswers[modelKey];
                        
                        if (question.formulaReference && question.formulaReference.trim() !== '') {
                            // This is a formula-referenced question - use original formula reference as key
                            formulaAnswers[question.formulaReference] = answer;
                        } else {
                            // This is a regular question - store with model key
                            regularAnswers[modelKey] = answer;
                        }
                    });
                }
            });
            
            // For formula evaluation, use only formula-referenced answers
            const answersForFormulas = Object.assign({}, formulaAnswers);
            
            // Convert number strings to actual numbers for formula evaluation
            Object.keys(answersForFormulas).forEach(function(key) {
                const value = answersForFormulas[key];
                if (typeof value === 'string' && !isNaN(value) && value !== '') {
                    answersForFormulas[key] = parseFloat(value);
                }
            });

            $log.log('Formula answers for estimate generation:', answersForFormulas);
            $log.log('Regular answers:', regularAnswers);

            // Check if we have any formulas across all containers
            let hasFormulas = false;
            $scope.estimator.QuestionContainers.forEach(function(container) {
                if (container.Formulas && container.Formulas.length > 0) {
                    hasFormulas = true;
                }
            });

            // Pass both sets of answers to the estimation process
            const allAnswers = Object.assign({}, answersForFormulas, regularAnswers);

            if (hasFormulas) {
                $scope.evaluateFormulasAndCreateEstimate(answersForFormulas, allAnswers);
            } else {
                $scope.createEstimateFromAnswers(allAnswers);
            }
        };
        $scope.evaluateFormulasAndCreateEstimate = function(formulaAnswers, allAnswers) {
            const promises = [];
            const calculatedValues = {};

            // Collect all formulas from all containers
            $scope.estimator.QuestionContainers.forEach(function(container) {
                if (container.Formulas && container.Formulas.length > 0) {
                    container.Formulas.forEach(function(formula) {
                        const promise = $estimator.evaluateFormula({
                            id: formula.id,
                            inputValues: formulaAnswers  // Use only formula-referenced answers
                        }).then(function(response) {
                            if (!response.err) {
                                calculatedValues[formula.name] = response.result;
                            } else {
                                $log.error('Formula evaluation error:', response.msg);
                            }
                            return response;
                        });
                        promises.push(promise);
                    });
                }
            });

            if (promises.length === 0) {
                // No formulas to evaluate, proceed directly
                $scope.createEstimateFromAnswers(allAnswers);
                return;
            }

            Promise.all(promises).then(function(results) {
                // Merge all answers and calculated values
                const finalData = Object.assign({}, allAnswers, calculatedValues);
                $log.log('Final data after formula evaluation:', finalData);
                $scope.createEstimateFromAnswers(finalData);
            }).catch(function(error) {
                $scope.UI.formSaving = false;
                $scope.UI.errMessage = 'Error evaluating formulas: ' + (error.message || 'Unknown error');
                $scope.$apply();
            });
        };
        $scope.createEstimateFromAnswers = function(data) {
            const estimateData = {
                estimatorId: $scope.estimator.id,
                questionAnswers: data,
                clientId: $routeParams.clientId, // Assuming this comes from route params
                eventId: $routeParams.eventId,   // Assuming this comes from route params
                title: $scope.estimator.title + ' - ' + new Date().toLocaleDateString(),
                description: 'Estimate generated from ' + $scope.estimator.title + ' estimator'
            };

            // Call backend to create estimate from estimator
            $estimator.createEstimateFromEstimator(estimateData)
            .then(function(response) {
                $scope.UI.formSaving = false;
                
                if (!response.err) {
                    // Enhanced success messaging with line item details
                    let successMessage = 'Estimate created successfully!';
                    
                    if (response.totalLineItems > 0) {
                        successMessage += ` Generated ${response.totalLineItems} line item(s)`;
                        if (response.estimate.total > 0) {
                            successMessage += ` with a total of $${parseFloat(response.estimate.total).toFixed(2)}`;
                        }
                    } else {
                        successMessage += ' No line items were generated (all calculated values were $0.00)';
                    }
                    
                    $scope.UI.message = successMessage;
                    
                    // Log detailed response for debugging
                    $log.log('Estimate creation response:', response);
                    $log.log('Calculated totals:', response.calculatedTotals);
                    $log.log('Line items created:', response.totalLineItems);
                    
                    // Redirect to the created estimate
                    $timeout(function() {
                        $location.path('/estimates/estimate/' + response.estimate.id);
                    }, 3000); // Extended to 3 seconds to allow user to read the detailed message
                } else {
                    $scope.UI.errMessage = response.msg || 'Error creating estimate';
                }
            }).catch(function(error) {
                $scope.UI.formSaving = false;
                $scope.UI.errMessage = 'Error creating estimate: ' + (error.message || 'Unknown error');
                $log.error('Estimate creation error:', error);
            });
        };
        $scope.$watch('questionContainer', function(newVal, oldVal) {
            if (newVal && newVal.Questions) {
                $scope.initQuestions();
            }
        });
        $scope.getQuestionModelKey = function(question) {
            // If formulaReference exists and is not empty, use it
            if (question.formulaReference && question.formulaReference.trim() !== '') {
                return question.formulaReference;
            }
            // Otherwise, create a unique key based on question id or index
            return 'question_' + (question.id || question.$$hashKey || Math.random().toString(36).substr(2, 9));
        };

        $scope.initializeAnswers = function() {
            $scope.questionAnswers = {};
            
            if ($scope.estimator.QuestionContainers) {
                $scope.estimator.QuestionContainers.forEach(function(container) {
                    if (container.Questions) {
                        container.Questions.forEach(function(question) {
                            // Process question options first
                            $scope.processQuestionOptions(question);
                            
                            // Get the appropriate model key for this question
                            const modelKey = $scope.getQuestionModelKey(question);
                            
                            // Only initialize with explicit default values
                            if (question.defaultValue !== undefined && question.defaultValue !== null && question.defaultValue !== '') {
                                if (question.inputType === 'number' || question.inputType === 'slider') {
                                    $scope.questionAnswers[modelKey] = parseFloat(question.defaultValue);
                                } else {
                                    $scope.questionAnswers[modelKey] = question.defaultValue;
                                }
                            } else {
                                // Initialize arrays for multi-value inputs only
                                if (question.inputType === 'checkbox' || question.inputType === 'multi-select') {
                                    $scope.questionAnswers[modelKey] = [];
                                }
                                // For other types, leave undefined so they appear empty
                            }
                            
                            // Initialize checkbox options state
                            if (question.inputType === 'checkbox' && question.selectOptions) {
                                question.selectOptions.forEach(function(option) {
                                    option.selected = false;
                                });
                            }
                        });
                    }
                });
            }
        };
        $scope.nextContainer = function() {
            if (!$scope.estimator || !$scope.estimator.QuestionContainers) {
                return;
            }
            if ($scope.currentContainerIndex < $scope.estimator.QuestionContainers.length - 1) {
                $scope.currentContainerIndex++;
                $scope.currentContainer = $scope.estimator.QuestionContainers[$scope.currentContainerIndex];
            }
        };
        $scope.previousContainer = function() {
            if (!$scope.estimator || !$scope.estimator.QuestionContainers) {
                return;
            }
            if ($scope.currentContainerIndex > 0) {
                $scope.currentContainerIndex--;
                $scope.currentContainer = $scope.estimator.QuestionContainers[$scope.currentContainerIndex];
            }
        };
        $scope.isLastContainer = function() {
            if (!$scope.estimator || !$scope.estimator.QuestionContainers) {
                return false;
            }
            return $scope.currentContainerIndex === $scope.estimator.QuestionContainers.length - 1;
        };
        $scope.getProgressPercentage = function() {
            if (!$scope.estimator || !$scope.estimator.QuestionContainers || $scope.estimator.QuestionContainers.length === 0) {
                return 0;
            }
            return (($scope.currentContainerIndex + 1) / $scope.estimator.QuestionContainers.length) * 100;
        };
        $scope.isCurrentContainerValid = function() {
            if (!$scope.currentContainer || !$scope.currentContainer.Questions) {
                return true;
            }

            $scope.UI.errMessage = null;

            // Check if all required questions in current container are answered
            const unansweredRequired = $scope.currentContainer.Questions.filter(function(question) {
                if (!question.isRequired) return false;
                
                const modelKey = $scope.getQuestionModelKey(question);
                const answer = $scope.questionAnswers[modelKey];
                
                if (question.inputType === 'checkbox' || question.inputType === 'multi-select') {
                    // For checkboxes and multi-select, check if at least one is selected
                    return !answer || answer.length === 0;
                } else {
                    // For other types, check if value exists
                    return !answer && answer !== 0 && answer !== false;
                }
            });

            if (unansweredRequired.length > 0 && $scope.UI.formSaving) {
                $scope.UI.errMessage = `Please answer all required questions: ${unansweredRequired.map(q => q.questionText).join(', ')}`;
                return false;
            }

            return true;
        };
        $scope.updateCheckboxAnswer = function(question) {
            const selectedValues = [];
            if (question.selectOptions) {
                question.selectOptions.forEach(function(option) {
                    if (option.selected) {
                        selectedValues.push(option.value);
                    }
                });
            }
            const modelKey = $scope.getQuestionModelKey(question);
            $scope.questionAnswers[modelKey] = selectedValues;
        };
        $scope.toggleEstimatorCheckbox = function(question, index) {
            if (question.selectOptions && question.selectOptions[index]) {
                question.selectOptions[index].selected = !question.selectOptions[index].selected;
                $scope.updateCheckboxAnswer(question);
            }
        };
        $scope.handleFormSubmit = function(e) {
            if (e) {
                e.preventDefault();
            };

            if (!$scope.isCurrentContainerValid()) {
                $log.log('Current container is not valid. Cannot proceed.');
                return;
            }

            if ($scope.isLastContainer()) {
                $log.log('Last container - generating estimate');
                // Generate estimate
                $scope.runEstimator();
            } else {
                $log.log('Moving to next container');
                // Go to next container
                $scope.nextContainer();
            }
        };
        $scope.$watch('currentContainer', function(newContainer, oldContainer) {
            if (newContainer && newContainer !== oldContainer) {
                // Use timeout to ensure DOM is updated
                $timeout(function() {
                    // Initialize Foundation sliders
                    if (window.Foundation && Foundation.Slider) {
                        $('div[data-slider]').each(function() {
                            new Foundation.Slider($(this), {});
                        });
                    }
                }, 100);
            }
        });
        $scope.onSliderChange = function(question, event) {
            const value = parseFloat(event.target.value);
            const modelKey = $scope.getQuestionModelKey(question);
            $scope.questionAnswers[modelKey] = value;
            $scope.$apply();
        };
        
        // Development testing function - loads test answers using proper model keys
        $scope.loadTestData = function() {
            if (!$scope.estimator || !$scope.estimator.QuestionContainers) {
                $log.error('Cannot load test data: estimator not loaded');
                return;
            }

            $log.log('Loading test data...');

            // Load test data from JSON file
            $http.get('/test-estimate-answers.json').then(function(response) {
                const testData = response.data;
                $log.log('Test data loaded from file:', testData);

                // Clear existing answers first
                $scope.questionAnswers = {};

                // Go through all questions and set test values using proper model keys
                $scope.estimator.QuestionContainers.forEach(function(container, containerIndex) {
                    if (container.Questions) {
                        container.Questions.forEach(function(question, questionIndex) {
                            const modelKey = $scope.getQuestionModelKey(question);
                            
                            $log.log(`Setting test data for question ${question.id}: ${question.questionText}`);
                            $log.log(`Model key: ${modelKey}, Formula ref: ${question.formulaReference}`);
                            
                            // Try to find value in test data
                            let testValue = null;
                            
                            // First, try to find by formula reference
                            if (question.formulaReference && testData.questionAnswers[question.formulaReference]) {
                                testValue = testData.questionAnswers[question.formulaReference];
                            }
                            // Then try to find by question ID
                            else if (testData.questionAnswers[`question_${question.id}`]) {
                                testValue = testData.questionAnswers[`question_${question.id}`];
                            }
                            // Try other common patterns
                            else if (testData.questionAnswers[`question${question.id}`]) {
                                testValue = testData.questionAnswers[`question${question.id}`];
                            }
                            
                            // If we found a test value, use it
                            if (testValue !== null && testValue !== undefined) {
                                $scope.questionAnswers[modelKey] = testValue;
                                $log.log(`Found test value: ${testValue}`);
                            } else {
                                // Fall back to generating appropriate test values
                                if (question.formulaReference) {
                                    // Use formula reference for questions that have them
                                    switch(question.formulaReference) {
                                        case 'propertySquareFootage':
                                            $scope.questionAnswers[modelKey] = 5000;
                                            break;
                                        case 'foundationHeight':
                                            $scope.questionAnswers[modelKey] = 18;
                                            break;
                                        case 'includeExteriorFinishes':
                                            $scope.questionAnswers[modelKey] = "Yes";
                                            break;
                                        case 'roofMaterialType':
                                            $scope.questionAnswers[modelKey] = "Asphalt Shingle";
                                            break;
                                        case 'windowDoorHardwareType':
                                            $scope.questionAnswers[modelKey] = "Handle";
                                            break;
                                        case 'total_sqft':
                                            $scope.questionAnswers[modelKey] = 2500;
                                            break;
                                        case 'material_cost_per_sqft':
                                            $scope.questionAnswers[modelKey] = 85;
                                            break;
                                        case 'waste_percentage':
                                            $scope.questionAnswers[modelKey] = "10";
                                            break;
                                        case 'labor_hours_per_sqft':
                                            $scope.questionAnswers[modelKey] = 12;
                                            break;
                                        case 'hourly_rate':
                                            $scope.questionAnswers[modelKey] = 65;
                                            break;
                                        case 'land_area':
                                            $scope.questionAnswers[modelKey] = 0.25;
                                            break;
                                        case 'excavation_cost_per_acre':
                                            $scope.questionAnswers[modelKey] = 8000;
                                            break;
                                        case 'grading_cost_per_acre':
                                            $scope.questionAnswers[modelKey] = 5000;
                                            break;
                                        case 'foundation_type':
                                            $scope.questionAnswers[modelKey] = "Slab foundation - standard cost";
                                            break;
                                        case 'framing_hours_per_sqft':
                                            $scope.questionAnswers[modelKey] = 4;
                                            break;
                                        case 'roofing_material_cost_per_sqft':
                                            $scope.questionAnswers[modelKey] = 8.5;
                                            break;
                                        case 'electrical_hours_per_sqft':
                                            $scope.questionAnswers[modelKey] = 2.5;
                                            break;
                                        case 'plumbing_material_cost_per_lf':
                                            $scope.questionAnswers[modelKey] = 12;
                                            break;
                                        case 'drywall_material_cost_per_sqft':
                                            $scope.questionAnswers[modelKey] = 4.5;
                                            break;
                                        case 'flooring_material_cost_per_sqft':
                                            $scope.questionAnswers[modelKey] = 15;
                                            break;
                                        case 'cabinet_hours_per_sqft':
                                            $scope.questionAnswers[modelKey] = 1.5;
                                            break;
                                        case 'fixture_hours_per_sqft':
                                            $scope.questionAnswers[modelKey] = 0.8;
                                            break;
                                        case 'overhead_percentage':
                                            $scope.questionAnswers[modelKey] = "20";
                                            break;
                                        case 'total_cost':
                                            $scope.questionAnswers[modelKey] = 450000;
                                            break;
                                        case 'grading_factor':
                                            $scope.questionAnswers[modelKey] = 1.2;
                                            break;
                                        case 'material_cost_per_lf':
                                            $scope.questionAnswers[modelKey] = 8.5;
                                            break;
                                        case 'hvac_hours_per_sqft':
                                            $scope.questionAnswers[modelKey] = 1.8;
                                            break;
                                        case 'material_cost':
                                            $scope.questionAnswers[modelKey] = 212500;
                                            break;
                                        case 'labor_cost':
                                            $scope.questionAnswers[modelKey] = 195000;
                                            break;
                                        case 'waste_factor':
                                            $scope.questionAnswers[modelKey] = 1.1;
                                            break;
                                        default:
                                            // Generic test value for other formula references
                                            if (question.inputType === 'number') {
                                                $scope.questionAnswers[modelKey] = Math.floor(Math.random() * 100) + 1;
                                            } else if (question.inputType === 'select' || question.inputType === 'radio') {
                                                // Use first available option
                                                if (question.selectOptions && question.selectOptions.length > 0) {
                                                    $scope.questionAnswers[modelKey] = question.selectOptions[0].value;
                                                } else {
                                                    $scope.questionAnswers[modelKey] = "Option 1";
                                                }
                                            } else {
                                                $scope.questionAnswers[modelKey] = "Test value for " + question.formulaReference;
                                            }
                                    }
                                } else {
                                    // For questions without formula references, set generic test values
                                    switch(question.inputType) {
                                        case 'number':
                                            $scope.questionAnswers[modelKey] = Math.floor(Math.random() * 50) + 25;
                                            break;
                                        case 'select':
                                        case 'radio':
                                            // Try to use first option if available
                                            if (question.selectOptions && question.selectOptions.length > 0) {
                                                $scope.questionAnswers[modelKey] = question.selectOptions[0].value;
                                            } else if (question.options) {
                                                // Parse options if they exist
                                                try {
                                                    const parsed = JSON.parse(question.options);
                                                    if (Array.isArray(parsed) && parsed.length > 0) {
                                                        $scope.questionAnswers[modelKey] = parsed[0];
                                                    }
                                                } catch (e) {
                                                    $scope.questionAnswers[modelKey] = "Yes";
                                                }
                                            } else {
                                                $scope.questionAnswers[modelKey] = "Yes";
                                            }
                                            break;
                                        case 'checkbox':
                                        case 'multi-select':
                                            $scope.questionAnswers[modelKey] = ["Option 1"];
                                            break;
                                        case 'textarea':
                                            $scope.questionAnswers[modelKey] = `Test content for ${question.questionText.substring(0, 30)}...`;
                                            break;
                                        case 'date':
                                            $scope.questionAnswers[modelKey] = '2025-12-31';
                                            break;
                                        case 'email':
                                            $scope.questionAnswers[modelKey] = 'test@example.com';
                                            break;
                                        case 'tel':
                                            $scope.questionAnswers[modelKey] = '(555) 123-4567';
                                            break;
                                        default:
                                            $scope.questionAnswers[modelKey] = `Test answer for Q${question.id}`;
                                    }
                                }
                                $log.log(`Generated fallback value: ${$scope.questionAnswers[modelKey]}`);
                            }
                        });
                    }
                });

                $log.log('Test data loaded successfully:', $scope.questionAnswers);
                
                // Force Angular to update the UI safely
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }).catch(function(error) {
                $log.error('Failed to load test data:', error);
                // Still try to load with fallback values
                $scope.loadTestDataFallback();
            });
        };

        // Fallback method for when JSON file can't be loaded
        $scope.loadTestDataFallback = function() {
            $log.log('Loading fallback test data...');
            
            // Clear existing answers first
            $scope.questionAnswers = {};

            // Go through all questions and set test values using proper model keys
            $scope.estimator.QuestionContainers.forEach(function(container, containerIndex) {
                if (container.Questions) {
                    container.Questions.forEach(function(question, questionIndex) {
                        const modelKey = $scope.getQuestionModelKey(question);
                        
                        // For questions without formula references, set generic test values
                        switch(question.inputType) {
                            case 'number':
                                $scope.questionAnswers[modelKey] = Math.floor(Math.random() * 50) + 25;
                                break;
                            case 'select':
                            case 'radio':
                                // Try to use first option if available
                                if (question.selectOptions && question.selectOptions.length > 0) {
                                    $scope.questionAnswers[modelKey] = question.selectOptions[0].value;
                                } else if (question.options) {
                                    // Parse options if they exist
                                    try {
                                        const parsed = JSON.parse(question.options);
                                        if (Array.isArray(parsed) && parsed.length > 0) {
                                            $scope.questionAnswers[modelKey] = parsed[0];
                                        }
                                    } catch (e) {
                                        $scope.questionAnswers[modelKey] = "Yes";
                                    }
                                } else {
                                    $scope.questionAnswers[modelKey] = "Yes";
                                }
                                break;
                            case 'checkbox':
                            case 'multi-select':
                                $scope.questionAnswers[modelKey] = ["Option 1"];
                                break;
                            case 'textarea':
                                $scope.questionAnswers[modelKey] = `Test content for ${question.questionText.substring(0, 30)}...`;
                                break;
                            case 'date':
                                $scope.questionAnswers[modelKey] = '2025-12-31';
                                break;
                            case 'email':
                                $scope.questionAnswers[modelKey] = 'test@example.com';
                                break;
                            case 'tel':
                                $scope.questionAnswers[modelKey] = '(555) 123-4567';
                                break;
                            default:
                                $scope.questionAnswers[modelKey] = `Test answer for Q${question.id}`;
                        }
                    });
                }
            });

            $log.log('Fallback test data loaded successfully:', $scope.questionAnswers);
            
            // Force Angular to update the UI safely
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        // Clear form data method for debugging
        $scope.clearFormData = function() {
            $log.log('Clearing all form data...');
            $scope.questionAnswers = {};
            
            // Force Angular to update the UI safely
            if (!$scope.$$phase) {
                $scope.$apply();
            }
            $log.log('Form data cleared');
        };

        // Labor functionality for estimators
        $scope.initLabor = function () {
            $estimator.getAvailableLabor()
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.labor = response.labor || [];
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

        $scope.selectLaborForLineItem = function (laborRole, lineItem) {
            if (laborRole && lineItem) {
                lineItem.laborId = laborRole.id;
                lineItem.category = 'Labor';
                lineItem.unitPrice = laborRole.rate;
                lineItem.name = laborRole.role + ' - Labor';
                lineItem.description = 'Labor for ' + laborRole.role + ' at $' + laborRole.rate + '/hour';
                
                // Calculate total if quantity is set
                if (lineItem.quantity) {
                    lineItem.totalPrice = (parseFloat(lineItem.unitPrice) * parseInt(lineItem.quantity)).toFixed(2);
                }
            }
        };

        $scope.calculateLaborCost = function (lineItem) {
            if (lineItem.laborId && lineItem.quantity && lineItem.unitPrice) {
                lineItem.totalPrice = (parseFloat(lineItem.unitPrice) * parseInt(lineItem.quantity)).toFixed(2);
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

        // ...existing code...
    });
});
