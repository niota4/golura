define(['dhtmlx-rich-text'], function (dhx) {
    angular.module('ngRichTextEditor', [])
    .directive('richTextEditor', ['$timeout', '$sce', '$compile', '$admin', '$media', function($timeout, $sce, $compile, $admin, $media) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                id: '@',
                update: '=?',
                onSubmit: '&?',
                estimate: '<?',
                workOrder: '<?',
                event: '<?',
                addShortCodes: '=?',
            },
            link: function(scope, element, attrs, ngModel) {
                let isMobile = $media.getMedia();
                let editorId = scope.id;
                let offCanvasId = scope.id + '_offCanvas';
                let editorElement = document.getElementById(editorId);

                // Define toolbar blocks based on device
                let toolbarBlocks = isMobile
                    ? ["decoration", "link", "clear"]
                    : ["undo", "decoration", "colors", "align", "link", "clear", "fullscreen"];
                
                if (!editorElement) {
                    console.error('Element with ID ' + editorId + ' not found.');
                    return;
                }
                
                // Append Off-Canvas next to the editor
                let offCanvasElement = document.createElement('div');
                offCanvasElement.id = offCanvasId;
                offCanvasElement.className = 'rich-text-off-canvas off-canvas-absolute position-right';
                offCanvasElement.setAttribute('data-off-canvas', '');
                offCanvasElement.setAttribute('data-transition', 'overlap');
                offCanvasElement.setAttribute('data-close-on-click', 'true');
                offCanvasElement.innerHTML = `
                    <div class="rich-text-short-codes-container">
                        <div class="golura-block grid-y">
                            <div class="cell shrink">
                                <h3><b>ShortCodes</b></h3>
                            </div>
                            <div class="cell shrink">
                                <div class="list-search-container">
                                    <div class="list-search">
                                        <div class="search-input-container">
                                            <div class="grid-x align-middle">
                                                <div class="cell auto align-self-bottom">
                                                    <input class="search-input" type="text" placeholder="Search Shortcodes..." ng-model="search" />
                                                </div>
                                                <div class="cell shrink align-self-bottom">
                                                    <span class="search-icon"><i class="fal fa-search"></i></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="cell auto">
                                <div class="rich-text-short-codes-list-container">
                                    <ul class="rich-text-short-codes-list">
                                        <li class="rich-text-short-codes-list-item" ng-repeat="shortCode in shortCodes | filter:search track by $index">
                                            <button class="add-short-code-button button clear white-text expanded text-left" type="button" ng-click="insertShortCode(shortCode)">
                                                {{shortCode.name}}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                editorElement.parentNode.insertBefore(offCanvasElement, editorElement.nextSibling);
                $compile(offCanvasElement)(scope);
                
                // Initialize Richtext Editor
                $timeout(function() {
                    var Richtext = (dhx && dhx.Richtext) ? dhx.Richtext : (window.dhx && window.dhx.Richtext);

                    if (Richtext) {
                        var editor = new Richtext(editorElement, {
                            toolbarBlocks: toolbarBlocks,
                            defaultStyles: {
                                "font-family": "Montserrat, san-serif"
                            }
                        });
                        if (scope.onSubmit) {

                            editor.toolbar.data.add([
                                {
                                    type: 'button',
                                    id: scope.id + 'Button',
                                    value: 'Submit',
                                }
                            ], 100);
                        };
                        editor.toolbar.events.on('click', function(id) {
                            if (id === scope.id + 'Button') {
                                var content = editor.getValue();
                                if (scope.onSubmit) {
                                    $timeout(function() {
                                        scope.onSubmit({
                                            content,
                                            event: scope.event || {},
                                            estimate: scope.estimate || {}
                                        });
                                    });
                                }
                            } else if (id === scope.id + 'ShortcodeButton') {
                                let offCanvasEl = document.getElementById(offCanvasId);
                                $(offCanvasEl).foundation('open');
                            }
                        });

                        // Add keyup event listener to handle spaces
                        editorElement.addEventListener('keyup', function(event) {
                            if (event.key === ' ') {
                                $timeout(function() {
                                    let content = editor.getValue().trim();
                                    if (content === "") {
                                        editor.setValue("<p></p>");
                                        content = "<p></p>";
                                    } else {
                                        // Force re-render to ensure spaces are displayed
                                        editor.setValue("<span> </span>");
                                        editor.setValue(content);
                                    }
                                });
                            }
                            ngModel.$setViewValue(editor.getValue());
                        });

                        // Add paste event listener to strip font-family inline CSS and sanitize text
                        editorElement.addEventListener('paste', function(event) {
                            event.preventDefault();
                            var clipboardData = event.clipboardData || window.clipboardData;
                            var pastedData = clipboardData.getData('text/html') || clipboardData.getData('text/plain');

                            // Create a temporary div to hold the pasted content
                            var tempDiv = document.createElement('div');
                            tempDiv.innerHTML = pastedData;

                            // Remove font-family inline styles
                            var elementsWithFontFamily = tempDiv.querySelectorAll('[style*="font-family"]');
                            elementsWithFontFamily.forEach(function(element) {
                                element.style.fontFamily = '';
                            });

                            // Sanitize text to remove characters that a MySQL database cannot have
                            var sanitizedContent = tempDiv.innerHTML.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
                                switch (char) {
                                    case "\0":
                                        return "\\0";
                                    case "\x08":
                                        return "\\b";
                                    case "\x09":
                                        return "\\t";
                                    case "\x1a":
                                        return "\\z";
                                    case "\n":
                                        return "\\n";
                                    case "\r":
                                        return "\\r";
                                    case "\"":
                                    case "'":
                                    case "\\":
                                    case "%":
                                        return "\\" + char; // Prepends a backslash to backslash, percent,
                                                            // and double/single quotes
                                }
                            });

                            // Insert the cleaned content into the editor
                            editor.setValue(sanitizedContent);
                        });

                        ngModel.$render = function() {
                            if (ngModel.$viewValue) {
                                editor.setValue(ngModel.$viewValue);
                            }
                        };

                        scope.$watch(function() {
                            return ngModel.$modelValue;
                        }, function(newValue) {
                            if (newValue) {
                                editor.setValue(newValue);
                            }
                        });

                        if (scope.addShortCodes) {
                            scope.shortCodes = [];
                            editor.toolbar.data.add([
                                {
                                    type: 'button',
                                    id: scope.id + 'ShortcodeButton',
                                    value: 'ShortCode',
                                }
                            ], 100);
                            
                            $admin.getShortCodes().then(function(response) {
                                scope.shortCodes = response.shortCodes;
                            });
                        }
                        scope.insertShortCode = function(shortCode) {
                            console.log("Inserting ShortCode:", shortCode.code);
                        
                            // Get the editor's current value
                            let currentValue = editor.getValue().trim();
                        
                            // If the editor is empty or contains only a blank paragraph, replace it with the shortcode
                            if (currentValue === "<p></p>" || currentValue === "") {
                                editor.setValue("<p>" + shortCode.code + "</p>");
                            } else {
                                // Get the current selection/cursor position
                                let selection = window.getSelection();
                                let range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                        
                                if (range) {
                                    let span = document.createElement("span");
                                    span.textContent = " " + shortCode.code + " ";
                                    
                                    range.deleteContents(); // Remove any selected text
                                    range.insertNode(span); // Insert the ShortCode at cursor position
                        
                                    // Move cursor after inserted text
                                    range.setStartAfter(span);
                                    range.setEndAfter(span);
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                } else {
                                    // Fallback: Append to the end if no selection is active
                                    editor.setValue(currentValue.replace("</p>", " " + shortCode.code + "</p>"));
                                }
                            }
                        
                            // Close the Off-Canvas panel
                            $('#' + offCanvasId).foundation('close');
                        };


                        $(document).foundation();
                    } else {
                        console.error('Richtext could not be initialized.');
                    }
                }, 500);
            }
        };
    }]);
});
