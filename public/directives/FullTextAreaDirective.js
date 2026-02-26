define([
    'tagify',
    'services/get-uploader',
    'services/get-communication'
], function (
    Tagify,
) {
    angular
        .module('ngFullTextArea', ['ngUploaders', 'ngCommunications'])
        .directive('fullTextArea', [
            '$comment', 
            '$chat', 
            '$communication',
            '$rootScope', 
            '$compile',
            '$timeout',
            '$uploader',
            '$setup',
            '$media',
            function (
                $comment, 
                $chat, 
                $communication,
                $rootScope,
                $compile,
                $timeout,
                $uploader,
                $setup,
                $media
            ) {
            return {
                restrict: 'E',
                require: 'ngModel',
                template: `
                    <div class="textarea-container">
                        <div 
                            class="callout alert alert-text"
                            ng-if="errMessage.length"
                        >
                            <div class="grid-x grid-margin-x align-middle">
                                <div class="cell shrink">
                                    <span class="callout-icon">
                                        <i class="fal fa-exclamation-circle"></i>
                                    </span>
                                </div>
                                <div class="cell auto">
                                    <p ng-bind-html="errMessage"></p>
                                </div>
                            </div>
                        </div>      
                        <div class="parent-chat-reply-container" ng-if="parentChatId">
                            <div class="grid-x grid-margin-x align-middle">
                                <div class="cell auto">
                                    <p>
                                        Replying to: 
                                        "<span 
                                            class="parent-chat-reply"
                                            ng-bind-html="parentChatText"
                                        > 
                                        </span>"
                                    </p>
                                </div>
                                <div class="cell shrink">
                                    <button
                                        class="button alert white-text"
                                        type="button"
                                        ng-click="closeReply()"
                                    >
                                        <i class="fal fa-times-circle"></i> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>  
                        <div 
                            class="textarea-links-container" 
                            ng-if="links.length"
                        >
                            <div class="grid-x grid-margin-x align-middle">
                                <div 
                                    class="cell small-12 medium-4 large-3"
                                    ng-repeat="link in links track by $index" 
                                >
                                    <div class="link-container">
                                        <div class="link-preview">
                                            <a 
                                                ng-href="{{ link.url }}" 
                                                target="_blank"
                                            >
                                                <img 
                                                    ng-if="link.favicon" 
                                                    ng-src="{{ link.favicon }}" 
                                                    alt="favicon" 
                                                />
                                                <strong>
                                                    {{ link.title }}
                                                </strong>
                                                <p ng-if="link.description">
                                                    {{ link.description }}
                                                </p>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>             
                        <div 
                            class="image-previews grid-x grid-margin-x align-middle"
                            ng-if="images.length && isAnyImageSelected()"
                        >
                            <div 
                                class="cell small-4 medium-1 large-1"
                                ng-repeat="image in images track by $index" 
                                ng-if="image.selected"
                            >
                                <div class="image-preview-container">
                                    <button
                                        class="image-remove-button comment-button button clear alert"
                                        type="button"
                                        ng-click="removePreview($index)"
                                    >
                                        <i class="fal fa-times-circle"></i>
                                    </button>
                                    <div class="image-preview">
                                        <div
                                            class="image-preview-background"
                                            ng-style="{'background-image': 'url(' + image.url + ')'}"
                                            ng-click="openModal($index)"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="grid-x align-middle">
                            <div class="cell shrink">
                                <button
                                    class="add-image-button textarea-button button clear"
                                    type="button"
                                    ng-click="toggleImagePicker()"
                                >
                                    <i class="fal fa-images"></i>
                                </button>
                                <button 
                                    class="emoji-button textarea-button button clear" 
                                    type="button" 
                                    ng-click="toggleEmojiPicker()"
                                >
                                    <i class="fal fa-face-smile"></i>
                                </button>
                            </div>
                            <div class="cell auto">
                                <textarea 
                                    class="textarea" 
                                    ng-model="model"
                                ></textarea>
                            </div>
                            <div class="cell small-12 medium-12 large-12 text-right">
                                <button 
                                    class="submit-button button"
                                    ng-click="submitComment()" 
                                    ng-disabled="!isInputValid && !isAnyImageSelected()" 
                                >
                                    <i 
                                        class="far"
                                        ng-class="{'fa-paper-plane': !comment,
                                        'fa-check-circle': comment}"
                                    ></i> 
                                        {{ comment ? 'Update' : 'Submit' }}
                                </button>
                            </div>
                        </div>
                        <div class="emoji-picker-dropdown" ng-show="showEmojiPicker">
                            <div id="emoji-picker"></div>
                        </div>
                    </div>
                `,
                scope: {
                    eventId: '@?',
                    clientId: '@?',
                    phoneNumberId: '@?',
                    estimateId: '@?',
                    workOrderId: '@?',
                    invoiceId: '@?',
                    placeholder: '@',
                    parentCommentId: '@?',
                    parentChatId: '@?',
                    parentChatText: '@?',
                    message: '@?',
                    comment: '@?', // Pass comment ID if updating
                    textMessage: '@?', // Pass text message ID if updating
                    chatRoomId: '@?',
                    user: '@?',
                    users: '=', // Array of users to be tagged
                    eventImages: '=',
                },
                link: function (scope, element, attrs, ngModelCtrl) {
                    let debounceTimers = {};
                    const textarea = element[0].querySelector('.textarea');
                    scope.showEmojiPicker = false;
                    scope.errMessage = null;
                    scope.links = [];
                    scope.urls = [];
                    scope.images = scope.eventImages || [];
                    scope.isMobile = $media.getMedia();
                    
                    // Initialize Tagify
                    const tagify = new Tagify(textarea, {
                        mode: 'mix',
                        whitelist: [],
                        enforceWhitelist: false,
                        tagTextProp: 'display',
                        delimiters: "\n",
                        dropdown: {
                            enabled: 1,
                            position: 'text',
                            highlightFirst: true,
                        },
                        pattern: /@|#/ ,
                        placeholder: scope.placeholder,
                    });

                    tagify.on('change', function (e) {
                        scope.$apply(() => {
                            var value = e.detail.value;
                            scope.model = value;

                            ngModelCtrl.$setViewValue(value);
                        });
                    });
                    
                    tagify.on('input', function (e) {
                        scope.errMessage = null;
                        scope.$apply(() => {
                            
                            // Check if the input is empty
                            if (e.detail.textContent.length === 0) {
                                scope.isInputValid = false;
                                return;
                            }

                            // Check to see if the text contains links anywhere
                            const value = e.detail.textContent;
                            const regex = /https?:\/\/[^\s]+/g;
                            const matches = value.match(regex);

                            if (matches) {
                                
                                if (scope.urls.length < 5) {
                                    // Filter out the links that are already in the urls array from the matches
                                    const newLinks = matches.filter(link => !scope.urls.includes(link));
                                    scope.urls = [...scope.urls, ...newLinks];

                                    //make sure to remove duplicates
                                    scope.urls = _.uniq(scope.urls);
                                    

                                    $timeout(
                                        function () {
                                            if (newLinks.length > 0) {

                                                newLinks.forEach(link => {
                                                    $setup.getLinkPreview({url: link})
                                                    .then(
                                                        function (response) {
                                                            if (response.err) {
                                                                return;
                                                            } else {
                                                                scope.links.push(response.metadata);
                                                            }
                                                        }
                                                    );
                                                });
                                            }
                                        }, 500
                                    )
                                };

                            }

                            scope.isInputValid = e.detail.textContent.length > 0
                        });
                    });
                    // Watch for user list updates and refresh whitelist
                    scope.$watch('users', function (newUsers) {
                        if (newUsers) {
                            const tagifyUsers = newUsers.map(user => ({
                                id: user.id,
                                value: `${user.firstName} ${user.lastName}`,
                                display: `@${user.firstName} ${user.lastName}`,
                            }));
                            tagify.settings.whitelist = tagifyUsers;
                            scope.model = ngModelCtrl.$viewValue || '';
                            tagify.loadOriginalValues(scope.model);
                        }
                    }, true);
                    scope.$watch('parentChatText', function (newText) {
                        if (newText) {
                            //limit text to 100 characters and add ellipsis
                            scope.parentChatText = newText.length > 100 ? newText.substring(0, 100) + '...' : newText;
                        }
                    });
                    scope.$watch('chatRoomId', function(newVal, oldVal) {
                        if (newVal && newVal !== oldVal) {
                            scope.currentChatRoomId = newVal;
                        }
                    });

                    let typingTimeout = null;
                    tagify.on('input', function (e) {
                        scope.errMessage = null;
                        scope.$apply(() => {
                            
                            // Check if the input is empty
                            if (e.detail.textContent.length === 0) {
                                scope.isInputValid = false;
                                return;
                            }

                            // Check to see if the text contains links anywhere
                            const value = e.detail.textContent;
                            const regex = /https?:\/\/[^\s]+/g;
                            const matches = value.match(regex);

                            if (matches) {
                                
                                if (scope.urls.length < 5) {
                                    // Filter out the links that are already in the urls array from the matches
                                    const newLinks = matches.filter(link => !scope.urls.includes(link));
                                    scope.urls = [...scope.urls, ...newLinks];

                                    //make sure to remove duplicates
                                    scope.urls = _.uniq(scope.urls);
                                    

                                    $timeout(
                                        function () {
                                            if (newLinks.length > 0) {

                                                newLinks.forEach(link => {
                                                    $setup.getLinkPreview({url: link})
                                                    .then(
                                                        function (response) {
                                                            if (response.err) {
                                                                return;
                                                            } else {
                                                                scope.links.push(response.metadata);
                                                            }
                                                        }
                                                    );
                                                });
                                            }
                                        }, 500
                                    )
                                };

                            }

                            scope.isInputValid = e.detail.textContent.length > 0
                        });

                        if (scope.chatRoomId && scope.user) {
                            $rootScope.$broadcast('userChatTyping', {
                                chatRoomId: scope.chatRoomId
                            });
                            if (typingTimeout) clearTimeout(typingTimeout);
                            typingTimeout = setTimeout(function () {
                                $rootScope.$broadcast('userChatStopTyping', {
                                    chatRoomId: scope.chatRoomId,
                                });
                            }, 1500);
                        }
                    });
                    // Function to check if any image is selected
                    scope.isAnyImageSelected = function () {
                        if (!scope.images) {
                            return;
                        }
                        return scope.images.some(image => image.selected);
                    };

                    // Toggle Emoji Picker visibility
                    scope.toggleEmojiPicker = function () {
                        scope.showEmojiPicker = !scope.showEmojiPicker;
                        if (scope.showEmojiPicker) {
                            initializeEmojiPicker();
                        }
                    };

                    // Toggle Image Picker visibility
                    scope.toggleImagePicker = function () {
                        scope.showImagePicker = !scope.showImagePicker;
                        if (scope.showImagePicker) {
                            initializeImagePicker();
                        }
                    }
                    scope.closeReply = function () {
                        scope.parentChatId = null;
                        scope.parentChatText = null;
                    }
                    // Function to close the emoji picker when clicking outside
                    function closeEmojiPickerOnClickOutside(event) {
                        if (!element[0].contains(event.target)) {
                            $timeout(() => {
                                scope.$apply(() => {
                                    scope.showEmojiPicker = false;
                                });
                            }
                            , 0);
                        }
                    }

                    // Add event listener to the document
                    document.addEventListener('click', closeEmojiPickerOnClickOutside);

                    // Remove event listener when the directive is destroyed
                    scope.$on('$destroy', function () {
                        document.removeEventListener('click', closeEmojiPickerOnClickOutside);
                    });
                    // Initialize Image Picker
                    function initializeImagePicker() {
                        var modalHtml = `<div class="image-picker-reveal reveal large" id="imagePickerModal" data-reveal data-close-on-click="false">
                            <button class="close-button" aria-label="Close modal" type="button" data-close>
                                <span aria-hidden="true">
                                    <i class="fal fa-times-circle"></i>
                                </span>
                            </button>
                            <div class="grid-x grid-margin-x align-top">
                                <div class="cell small-12 medium-6 large-6">
                                    <h3>
                                        <b>
                                            Select or Upload Images
                                        </b>
                                    </h3>
                                </div>
                                <div class="cell small-12 medium-6 large-6">
                                    <div class="button-group align-right">
                                        <button 
                                            class="button success white-text" 
                                            type="button" 
                                            ng-click="prepareImages()"
                                        >
                                            <i class="fal fa-plus-circle"></i> Add Images
                                        </button>
                                        <button 
                                            class="button warning white-text" 
                                            type="button"
                                            data-close
                                            ng-if="isAnyImageSelected()"
                                        >
                                            <i class="fal fa-check-circle"></i> Continue
                                        </button>
                                        <input id="imageUploaderInput" type="file" accept="image/*" multiple style="display: none" />
                                    </div>
                                </div>
                                <div 
                                    class="cell small-12 medium-4 large-3 position-relative" 
                                    style="height: 15rem; margin-bottom: 1rem; cursor: pointer;" 
                                    ng-repeat="image in images track by $index" 
                                >
                                    <div 
                                        class="image-select-button-container select-container"
                                        style="position: absolute; left: 1rem; top: 1rem;"
                                    >
                                        <button 
                                            class="image-select-button select-button success-button button"
                                            type="button"
                                            ng-click="image.selected = !image.selected"
                                            ng-class="{'selected': image.selected}"
                                        >
                                            <div 
                                                class="check-icon"
                                                ng-if="image.selected"
                                            >
                                                <i class="fal fa-check"></i>
                                            </div>
                                        </button>
                                    </div>
                                    <div 
                                        class="background" 
                                        ng-style="{'background-image': 'url(' + image.url + ')'}" 
                                        style="background-repeat: no-repeat; 
                                        background-position: center; 
                                        background-size: cover; 
                                        height: 100%; 
                                        width: 100%; 
                                        border-radius: 0.25rem;"
                                        ng-click="openModal($index)"
                                    ></div>
                                </div>
                            </div>
                        </div>`;
                        const modalElement = $compile(modalHtml)(scope);
                        angular.element(document.body).append(modalElement);
                        $(document).foundation(); // Initialize Foundation
        
                        $timeout(function() {
                            $('#imagePickerModal').foundation('open');

                            $('#imagePickerModal').on('closed.zf.reveal', function() {
                                $('#imagePickerModal').parent().remove();
                            });
                        });
                    };
                    // Initialize Emoji Mart Picker
                    function initializeEmojiPicker() {
                        const pickerContainer = element[0].querySelector('#emoji-picker');
                    
                        if (pickerContainer.childElementCount === 0) {
                            const picker = new window.EmojiMart.Picker({
                                previewPosition: top,
                                set: 'apple',
                                showSkinTones: false,
                                onEmojiSelect: function (emoji) {
                                    scope.$apply(function () {
                                        // Close the emoji picker
                                        scope.toggleEmojiPicker();
                                        // Add the emoji to the Tagify field
                                        tagify.addTags([emoji.native]);
                    
                                        // Focus the input field and move the caret to the end
                                        const inputElement = tagify.DOM.input;
                                        inputElement.focus();
                    
                                        // Move caret to the end
                                        const textLength = inputElement.textContent.length;
                                        const range = document.createRange();
                                        const selection = window.getSelection();
                                        range.setStart(inputElement.childNodes[0] || inputElement, textLength);
                                        range.collapse(true);
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                        
                                    });
                                },
                            });
                    
                            pickerContainer.appendChild(picker);
                        }
                    }
                    function debounceBroadcast(eventName, data, delay = 1000) {
                        if (debounceTimers[eventName]) {
                            clearTimeout(debounceTimers[eventName]);
                        }
                        debounceTimers[eventName] = setTimeout(() => {
                            $rootScope.$broadcast(eventName, data);
                        }, delay);
                    }                    
                    scope.prepareImages = function () {
                        const input = document.getElementById('imageUploaderInput');
                        input.click();
                        input.onchange = function (event) {
                            const files = event.target.files;
                            const images = [];
                            for (let i = 0; i < files.length; i++) {
                                const file = files[i];
                                const reader = new FileReader();
                                reader.onload = function (e) {
                                    scope.$apply(() => {
                                        scope.images.push({
                                            url: e.target.result,
                                            selected: true,
                                        });
                                    });
                                };
                                reader.readAsDataURL(file);
                            }
                        };
                        scope.images = _.uniqBy(scope.images, 'url');
                    }
                    scope.removePreview = function (index) {
                        scope.images[index].selected = false;
                    }
                    scope.submitComment = function () {
                        const comment = ngModelCtrl.$viewValue || ' ';
                        const message = ngModelCtrl.$viewValue || ' ';

                        const params = {
                            comment: comment.replace(/\n/g, '<br/>') || ' ',
                            eventId: scope.eventId || null,
                            clientId: scope.clientId || null,
                            parentCommentId: scope.parentCommentId || null,
                        };


                        const uploadImages = function() {
                            var selectedImages = [];
                            if (scope.images) {
                                var selectedImages = scope.images.filter(image => image.selected);
                            }
                            const files = selectedImages.filter(image => image.url.startsWith('data:')).map(image => {
                                const blob = dataURLtoBlob(image.url);
                                return new File([blob], 'image.png', { type: 'image/png' });
                            });
                            if (!files.length) {
                                return Promise.resolve([]);
                            }
                            const uploadType = scope.phoneNumberId ? 'textMessages' : 'images';
                            return $uploader.uploadFile(files, scope.clientId, scope.eventId, null, scope.estimateId, uploadType, function(progress, fileName) {
                            }, scope.user, null, null, null, null, null, scope.chatRoomId).then(responses => {
                                // Extract only `id` and `url` from the upload response
                                return responses.map(response => ({
                                    id: response.media.id,
                                    url: response.media.url
                                }));
                            });
                        };

                        const dataURLtoBlob = function(dataURL) {
                            const arr = dataURL.split(',');
                            const mime = arr[0].match(/:(.*?);/)[1];
                            const u8arr = Uint8Array.from(atob(arr[1]), c => c.charCodeAt(0));
                            return new Blob([u8arr], { type: mime });
                        };

                        const submit = function(images) {
                            const allImages = [...images];

                            if (scope.chatRoomId) {
                                const messageParams = {
                                    chatRoomId: scope.chatRoomId,
                                    message: message.replace(/\n/g, '<br/>') || ' ',
                                    parentMessageId: scope.parentChatId || null,
                                    imageUrls: allImages || []
                                };
                                if (scope.message) {
                                    $chat.updateChatMessage(messageParams).then(response => {
                                        if (response.err) {
                                            scope.errMessage = response.msg;
                                        } else {
                                            scope.errMessage = null;
                                            debounceBroadcast('chatMessageUpdated', response.chatMessage);
                                            resetForm();
                                        }
                                    });
                                } else {
                                    $chat.createChatMessage(messageParams).then(response => {
                                        if (response.err) {
                                            scope.errMessage = response.msg;
                                        } else {
                                            scope.errMessage = null;
                                            scope.parentChatId = null;
                                            scope.parentChatText = null;

                                            debounceBroadcast('chatMessageCreated', response.chatMessage);
                                            resetForm();
                                        }
                                    });
                                }
                            } else if (scope.phoneNumberId) {
                                // Handle text messages
                                const textMessageParams = {
                                    clientId: scope.clientId || null,
                                    phoneNumberId: scope.phoneNumberId,
                                    message: message.replace(/\n/g, '<br/>') || ' ',
                                    estimateId: scope.estimateId || null,
                                    eventId: scope.eventId || null,
                                    workOrderId: scope.workOrderId || null,
                                    invoiceId: scope.invoiceId || null,
                                    mediaUrls: allImages.map(img => img.url) || []
                                };
                                
                                $communication.createTextMessage(textMessageParams).then(response => {
                                    if (response.err) {
                                        scope.errMessage = response.msg;
                                    } else {
                                        scope.errMessage = null;
                                        debounceBroadcast('textMessageCreated', response.textMessage);
                                        resetForm();
                                    }
                                });
                            } else {
                                if (scope.comment) {
                                    params.id = scope.comment;
                                    params.imageUrls = allImages || [];
                                    $comment.updateEventComment(params).then(response => {
                                        if (response.err) {
                                            scope.errMessage = response.msg;
                                        } else {
                                            scope.errMessage = null;
                                            debounceBroadcast('commentUpdated', response.comment);
                                            resetForm();
                                        }
                                    });
                                } else {
                                    params.imageUrls = allImages || [];
                                    $comment.createEventComment(params).then(response => {
                                        if (response.err) {
                                            scope.errMessage = response.msg;
                                        } else {
                                            scope.errMessage = null;
                                            debounceBroadcast('commentCreated', response.comment); 
                                            resetForm();
                                        }
                                    });
                                }
                            }
                        };

                        if (scope.images) {
                            uploadImages().then(responses => {
                                const images = responses.map(response => response);
                                submit(images);
                            }).catch(err => {
                                console.log('Error uploading images:', err);
                                scope.errMessage = err || 'Error uploading images';
                            });
                        } else {
                            submit([]);
                        }
                    };

                    function resetForm() {
                        scope.model = '';
                        scope.errMessage = null;
                        scope.showEmojiPicker = false;
                        scope.showImagePicker = false;
                        if (scope.images) {
                            scope.images.forEach(image => {
                                image.selected = false;
                            });
                        }
                        ngModelCtrl.$setViewValue('');
                        tagify.removeAllTags();

                        $timeout(() => {
                            scope.$apply();
                        });
                    }
                },
            };
        }]);
});
