angular.module('ngAiFormat', [])
.directive('formatAi', ['$sce', '$timeout', function($sce, $timeout) {
    return {
        restrict: 'A',
        scope: {
            aiText: '=',        // The AI analysis text to format
            aiData: '=',        // The complete AI analysis object
            processingTime: '=' // Processing time in nanoseconds
        },
        link: function(scope, element) {
            // Function to format AI analysis text
            function formatAiText(text) {
                if (!text) return '';

                let formattedText = text;

                // Convert **bold** to <strong>
                formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '$1');

                // Convert section headers with emojis and styling
                formattedText = formattedText
                    .replace(/Clarity Review:?/g, '<h2 class="ai-section-header clarity-review"><b><i class="fal fa-search"></i> Summary</b></h2>')
                    .replace(/Completeness Check:?/g, '<h3 class="ai-section-header completeness-check success-text"><b><i class="fal fa-check-circle"></i> Completeness Check</b></h3>')
                    .replace(/Red Flags or Missing Info:?/g, '<h3 class="ai-section-header alert-text"><b><i class="fal fa-exclamation-triangle"></i> Red Flags or Missing Info</b></h3>')
                    .replace(/Suggestions for Feedback to Owner:?/g, '<h3 class="ai-section-header suggestions warning-text"><b><i class="fal fa-lightbulb"></i> Suggestions</b></h3>');

                // Convert bullet points to proper list items
                formattedText = formattedText.replace(/^\* (.+)$/gm, '<li>$1</li>');
                
                // Wrap consecutive list items in <ul>
                formattedText = formattedText.replace(/(<li>.*?<\/li>)\s*(?=<li>)/gs, '$1');
                formattedText = formattedText.replace(/(<li>.*?<\/li>\s*)+/gs, function(match) {
                    return '<ul class="ai-list">' + match + '</ul>';
                });

                // Convert double line breaks to paragraph breaks
                formattedText = formattedText.replace(/\n\n+/g, '</p><p class="ai-paragraph">');

                // Wrap in paragraph tags if not already wrapped
                if (!formattedText.includes('<p') && !formattedText.includes('<h3')) {
                    formattedText = '<p class="ai-paragraph">' + formattedText + '</p>';
                } else if (!formattedText.startsWith('<')) {
                    formattedText = '<p class="ai-paragraph">' + formattedText;
                }

                // Ensure proper closing tags
                if (!formattedText.endsWith('</p>') && !formattedText.endsWith('</ul>') && !formattedText.endsWith('</h3>')) {
                    formattedText += '</p>';
                }

                // Add special styling for key terms
                formattedText = formattedText
                    .replace(/\b(markup|tax|client|scope|timeline|deliverables|assumptions|dependencies|risks)\b/gi, '<span class="ai-keyword">$1</span>')
                    .replace(/\b(missing|blank|unclear|incomplete)\b/gi, '<span class="ai-warning">$1</span>')
                    .replace(/\b(well-structured|clear|complete|good|excellent)\b/gi, '<span class="ai-positive">$1</span>');

                return formattedText;
            }

            // Function to format processing time
            function formatProcessingTime(timeInNs) {
                if (!timeInNs || isNaN(timeInNs)) return '0.00';
                
                // Convert nanoseconds to seconds
                const seconds = timeInNs / 1000000000;
                return seconds.toFixed(2);
            }

            // Function to get AI model display name
            function getAiModelDisplay(model) {
                if (!model) return 'Unknown Model';
                
                // Extract readable name from model string
                if (model.includes('golura/estimator')) {
                    return 'GoLura Estimator AI';
                } else if (model.includes('llama')) {
                    return 'Llama AI Model';
                } else if (model.includes('mistral')) {
                    return 'Mistral AI Model';
                } else {
                    return model.replace(/[:/]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                }
            }

            // Function to create the complete formatted HTML
            function createFormattedHtml() {
                if (!scope.aiText && !scope.aiData) {
                    element.html('<div class="ai-no-content"><i class="fal fa-robot"></i> No AI analysis available</div>');
                    return;
                }

                const text = scope.aiText || (scope.aiData && scope.aiData.text) || '';
                const model = scope.aiData && scope.aiData.model || '';
                const processingTime = scope.processingTime || (scope.aiData && scope.aiData.processingTime) || 0;

                const formattedText = formatAiText(text);
                const formattedTime = formatProcessingTime(processingTime);
                const modelDisplay = getAiModelDisplay(model);

                const html = `
                    <div class="ai-analysis-content">
                        <div class="ai-text-content">
                            ${formattedText}
                        </div>
                    </div>
                `;

                element.html(html);
            }

            // Watch for changes in AI text
            scope.$watch('aiText', function(newText) {
                if (newText !== undefined) {
                    $timeout(createFormattedHtml, 0);
                }
            });

            // Watch for changes in AI data object
            scope.$watch('aiData', function(newData) {
                if (newData !== undefined) {
                    $timeout(createFormattedHtml, 0);
                }
            }, true);

            // Watch for changes in processing time
            scope.$watch('processingTime', function(newTime) {
                if (newTime !== undefined) {
                    $timeout(createFormattedHtml, 0);
                }
            });

            // Initial render
            $timeout(createFormattedHtml, 0);
        }
    };
}]);
