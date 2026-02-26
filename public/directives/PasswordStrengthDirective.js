angular.module('ngPasswordStrength', [])
.directive('passwordStrength', function() {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            password: '=ngModel',
            required: '@?',
            strength: '=' // Expose the strength
        },
        template: `
            <div class="grid-x grid-margin-x align-middle">
                <div class="cell small-12 medium-auto large-auto">
                    <input 
                        class="form-input password-strength-input" 
                        type="password" 
                        placeholder="Enter password" 
                        ng-model="password"
                        ng-required="required"
                        ng-change="checkStrength()"
                    />
                </div>
                <div class="cell small-12 medium-4 large-4">
                    <div class="password-strength">
                        <div 
                            class="progress {{strengthClass}}" 
                            role="progressbar" 
                            aria-valuenow="{{strengthPercentage}}" 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                        >
                            <div 
                                class="progress-meter" 
                                style="width: {{strengthPercentage}}%"
                            ></div>
                            <div class="strength-message">
                                {{strengthMessage}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        link: function(scope, element, attrs, ngModelController) {
            scope.strengthClass = '';
            scope.strengthMessage = '';
            scope.strengthPercentage = 0;

            scope.checkStrength = function() {
                const password = scope.password || '';
                let strength = 0;

                // Check the length of the password
                if (password.length >= 8) {
                    strength += 1;
                }

                // Check for uppercase letters
                if (/[A-Z]/.test(password)) {
                    strength += 1;
                }

                // Check for lowercase letters
                if (/[a-z]/.test(password)) {
                    strength += 1;
                }

                // Check for numbers
                if (/\d/.test(password)) {
                    strength += 1;
                }

                // Check for special characters
                if (/[\W_]/.test(password)) {
                    strength += 1;
                }

                // Determine the strength class, message, and percentage
                if (strength === 0) {
                    scope.strengthClass = 'secondary';
                    scope.strengthMessage = '';
                    scope.strengthPercentage = 0;
                    scope.strength = '';
                } else if (strength <= 2) {
                    scope.strengthClass = 'alert';
                    scope.strengthMessage = 'Weak';
                    scope.strengthPercentage = 25;
                    scope.strength = 'Weak';
                } else if (strength === 3) {
                    scope.strengthClass = 'warning';
                    scope.strengthMessage = 'Medium';
                    scope.strengthPercentage = 65;
                    scope.strength = 'Medium';
                } else if (strength >= 5) {
                    scope.strengthClass = 'success';
                    scope.strengthMessage = 'Strong';
                    scope.strengthPercentage = 100;
                    scope.strength = 'Strong';
                }

                // Set model validity
                ngModelController.$setValidity('strength', strength >= 3);
            };

            // Initialize the strength check
            scope.checkStrength();
        }
    };
});
