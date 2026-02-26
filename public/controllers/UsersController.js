define([
    'app-controller', 
    'dhtmlx-suite',
    'random-color', 
    'moment'
], function (
        app, 
        dhtmlx, 
        randomColor,
        moment
) {
    app.register.controller('UsersController',
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
        $user,
        $estimate,
        $admin,
        $setup,
        $media,
        $uploader
    ) {

        const urlParams = new URLSearchParams(window.location.search);

        $scope.search = {
            users: {
                value: '',
                params: {}
            },
            calls: '',
            tasks: ''
        }
        $scope.sort = {
            users: {
                id: 1,
                value: 'first_name'
            }
        };
        $scope.activationCode = ['', '', '', '', '', ''];
        $scope.usersOptions = [
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
                name: 'Role'
            },
            {
                id: 4,
                name: 'Most Recent'
            },
            {
                id: 5,
                name: 'Least Recent'
            },
            {
                id: 6,
                name: 'Created'
            }
        ];
        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        $scope.pendingUser = angular.fromJson($window.localStorage.getItem('goluraPendingUser')) || null;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];
        $scope.page = $setup.getCurrentPage() || {};
        $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null) || [];
        $scope.subPermissions = $setup.updateScopes($scope, $setup.getSubPages('users'));
        $scope.payRateTypes = $setup.getPayRateTypes();
        $scope.bankAccountTypes = $setup.getBankAccountTypes();
        $scope.taxFilingStatuses = $setup.getTaxFilingStatuses();
        $scope.employmentStatuses = $setup.getEmploymentStatuses();

        $scope.worker = null;
        $scope.estimate = null;
        $scope.foldersTree = null;
        $scope.foldersDataView = null;
        $scope.userEstimateChart = null;
        $scope.userEventChart = null;

        $scope.userFolder = {};
        $scope.folder = {};
        $scope.newFolder = {};
        $scope.userDocument = {};
        $scope.userStatistics = {};
        $scope.image = {};
        $scope.video = {};
        $scope.document = {};
        $scope.client = {};
        $scope.payStub = {};


        $scope.users = [];
        $scope.estimates = [];
        $scope.events = [];
        $scope.groups = [];
        $scope.rolePermissions = [];
        $scope.reminderTypes = [];
        $scope.devices = [];
        $scope.roles = [];
        $scope.groups = [];
        $scope.rolePermissions = [];
        $scope.devices = [];
        $scope.folders = [];
        $scope.userDocuments = [];
        $scope.folders = [];
        $scope.payStubs = [];
        $scope.nestedFolders = [];
        $scope.filteredFolders = [];

        $scope.paymentMethods = [
            { id: 'direct_deposit', name: 'Direct Deposit' },
            { id: 'check', name: 'Check' },
            { id: 'cash', name: 'Cash' },
            { id: 'other', name: 'Other' }
        ];


        $scope.UI = {
            tab: urlParams.get('tab'),
            isMobile: $media.getMedia(),
            currentUrl: window.location.pathname.split( '/' ),
            startDate: null,
            endDate: null,
            subPage: null,
            errMessage: null,
            message: null,
            rolesLoaded: false,
            usersLoaded: false,
            groupsLoaded: false,
            devicesLoaded: false,
            foldersLoaded: false,
            userDocumentsLoaded: false,
            userFolderLoaded: false,
            userDocumentLoaded: false,
            folderLoaded: false,
            userLoaded: false,
            statisticsLoaded: false,
            userDocumentsLoaded: false,
            foldersLoaded: false,
            userFolderLoaded: false,
            userDocumentLoaded: false,
            userReminderLoaded: false,
            userReminderTypesLoaded: false,
            userReminderLoaded: false,
            userCreating: false,
            userDeleteConfirmation: false,
            userFolderDeleteConfirmation: false,
            formSaved: false,
            newUser: false,
            newFolder: false,
            newDocument: false,
            newPayRate: false,
            usersDisplayed: 30,
            eventsDisplayed: 10,
            formSaving: false,
            passwordCopied: false,
            currentStep: 1,
        };
        $setup.updateScopes($scope, $scope.page.id || null);

        $scope.initUser = function () {
            $scope.userLoaded = false;
            $scope.UI.subPage = $scope.UI.currentUrl[4];
            $scope.UI.startDate = moment().subtract(7, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss');
            $scope.UI.endDate = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
            $scope.UI.userEstimates = true;

            const initCalls = [
                $admin.getRoles(),
                $admin.getGroups(),
                $admin.getPermissions(),
                $setup.getPages(),
                $admin.getRolePermissions(),
                $scope.initUserTabs(),
                $setup.getReminderTypes(),
            ];
            if ($routeParams.userId) {
                initCalls.unshift($user.getUser({ id: $routeParams.userId }));
            };
            // if
            $q.all(initCalls)
                .then(function (responses) {
                    $scope.userLoaded = true;
                    let offset = 0;

                    if ($routeParams.userId) {
                        // If editing, the first response is user data
                        if (!responses[0].err) {
                            $scope.worker = responses[0].user;
                        }
                        offset = 1; // Adjust index for subsequent responses
                    }

                    if (
                        !responses[offset].err &&
                        !responses[offset + 1].err &&
                        !responses[offset + 2].err &&
                        !responses[offset + 3].err &&
                        !responses[offset + 4].err &&
                        !responses[offset + 6].err
                    ) {
                        $scope.roles = responses[offset].roles;
                        $scope.groups = responses[offset + 1].groups;
                        $scope.workerPermissions = responses[offset + 2].permissions;
                        $scope.workerPages = responses[offset + 3].pages;
                        $scope.rolePermissions = responses[offset + 4].roles;
                        $scope.reminderTypes = responses[offset + 6].reminderTypes;

                        if ($scope.UI.currentUrl[4]) {
                            switch ($scope.UI.currentUrl[4]) {
                                case 'drive':
                                    $scope.initFolders();
                                    break;
                                case 'documents':
                                    $scope.initDocuments();
                                    break;
                                case 'events':
                                    $scope.initEvents();
                                    break;
                                case 'estimates':
                                    $scope.initEstimates();
                                    break;
                                default:
                                    $scope.initStatistics(null, $scope.UI.startDate, $scope.UI.endDate);
                                    break;
                            }
                        }
                    }
                }
            );
        };
        $scope.initFolder = function (folder) {
            $scope.UI.userFolderLoaded = false;
            $scope.userFolder = null;

            $user.getFolder({ id: folder.id })
                .then(function (response) {
                    $scope.UI.userFolderLoaded = true;

                    if (!response.err) {
                        $scope.userFolder = response.folder;
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while retrieving the user folder.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while retrieving the user folder.';
                });
        }; 
        $scope.initEstimate = function (estimate) {
            if (!estimate) {
                return;
            }
            $scope.UI.estimateLoaded = false;
            $scope.UI.estimateView = false;
            $scope.estimate = {};

            $estimate.getEstimate({id: estimate.id})
            .then(
                function (response) {
                    $scope.UI.estimateLoaded = true;
                    $scope.UI.signatureLoaded = true;
                    $scope.estimate = response.estimate;
                    $scope.client = $scope.estimate.Client;
                }
            );
        };
        $scope.initDocument = function (document) {
            const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
            const documentFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'];

            $scope.UI.userDocumentLoaded = false;
            $scope.userDocument = {};
            $scope.image = {};
            $scope.video = {};
            $scope.document = {};

            $user.getDocument({ id: document.id })
            .then(function (response) {
                $scope.UI.userDocumentLoaded = true;

                if (!response.err) {
                    $scope.userDocument = response.document;

                    if ($scope.userDocument.format) {
                        $scope.userDocument.isImage = imageFormats.includes($scope.userDocument.format);
                        $scope.userDocument.isDocument = documentFormats.includes($scope.userDocument.format);
                        $scope.userDocument.isVideo = $scope.userDocument.format === 'mp4';
                    };
                    if ($scope.userDocument.isImage) {
                        $scope.image = $scope.userDocument;
                    };
                    if ($scope.userDocument.isVideo) {
                        $scope.video = $scope.userDocument;
                    };
                    if ($scope.userDocument.isDocument) {
                        $scope.document = $scope.userDocument;

                        // Open document in new tab
                        if ($scope.document.url) {
                            window.open($scope.document.url, '_blank');
                        }

                    };
                } else {
                    $scope.UI.errMessage = response.msg || 'An error occurred while retrieving the user document.';
                }
            })
            .catch(function (err) {
                $scope.UI.errMessage = err || 'An error occurred while retrieving the user document.';
            });
        }
        $scope.initFolders = function (id) {
            $scope.UI.foldersLoaded = false;
            $scope.folder = {
                id: id
            };

            $scope.image = {};
            $scope.video = {};
            $scope.document = {};

            $scope.folders = [];
            $scope.nestedFolders = [];
            $scope.userDocuments = []; // Store user documents data

            var data = {
                id: $scope.user.id
            }
            // Destroy existing Tree and Dataview instances if they exist
            if ($scope.foldersTree && !$rootScope.UI.isMobile) {
                $scope.foldersTree.destructor();
            }
            if ($scope.foldersDataView) {
                $scope.foldersDataView.destructor();
            }
            if ($scope.permissions.canEdit) {
                data.id = $routeParams.userId;
            };
            // Fetch folders and documents data
            $q.all([
                $user.getFolders(data),
                $user.getDocuments()
            ])
            .then(function (responses) {
                $scope.UI.foldersLoaded = true;

                if (!responses[0].err && !responses[1].err) {
                    $scope.folders = responses[0].folders; // Flat folder structure
                    $scope.nestedFolders = responses[0].nestedFolders; // Nested folder structure
                    $scope.userDocuments = responses[1].documents; // User documents data
                    
                    // Map documents into the corresponding folders
                    function mapDocumentsToFolders(folders, id, openedIds = new Set()) {
                        // Add the current folder ID and its parent IDs to the opened set
                        function collectOpenedIds(folderId, folders) {
                            const folder = findFolderById(folders, folderId);
                            if (folder) {
                                openedIds.add(folder.id.toString());
                                if (folder.parentFolderId) {
                                    collectOpenedIds(folder.parentFolderId.toString(), folders);
                                }
                            }
                        }

                        // Find a folder by ID in a nested structure
                        function findFolderById(folders, folderId) {
                            for (const folder of folders) {
                                if (folder.id.toString() === folderId.toString()) {
                                    return folder;
                                }
                                if (folder.ChildFolders && folder.ChildFolders.length > 0) {
                                    const found = findFolderById(folder.ChildFolders, folderId);
                                    if (found) {
                                        return found;
                                    }
                                }
                            }
                            return null;
                        }

                        if (id) {
                            // Collect all IDs that need to be opened
                            collectOpenedIds(id, folders);
                        }

                        // Map folders and set the `opened` property
                        let mappedFolders = folders.map(folder => ({
                            value: folder.name,
                            description: folder.description || '',
                            id: folder.id.toString(),
                            parentFolderId: folder.parentFolderId,
                            opened: openedIds.has(folder.id.toString()), // Check if this folder's ID is in the opened set
                            isFolder: true,
                            items: [
                                // Map documents belonging to this folder
                                ...$scope.userDocuments
                                    .filter(document => document.folderId === folder.id)
                                    .map(document => ({
                                        value: document.title || 'No Title Assigned',
                                        id: `document-${document.id}`,
                                        description: document.description || '',
                                        isFolder: false,
                                        format: document.format
                                    })),
                                // Recursively map child folders
                                ...mapDocumentsToFolders(folder.ChildFolders || [], id, openedIds)
                            ]
                        }));

                        return mappedFolders;
                    }
                    const treeData = mapDocumentsToFolders($scope.nestedFolders, id) || [];

                    if (!$rootScope.UI.isMobile) {
                        $scope.foldersTree = new dhtmlx.Tree("userDriveFoldersList", {
                            data: treeData,
                            icon: {
                                folder: "",
                                openFolder: "",
                                file: "",
                            }, 
                            template: function (item) {
                                item.iconClass = item.isFolder ? "fal fa-folder" : "fal fa-file";
                                item.iconClass = item.opened ? 'fal fa-folder-open' : item.iconClass;
                                if (item.items) {
                                    item.iconClass = !item.items.length ? 'fal fa-folder-xmark' : item.iconClass;
                                }
                                item = $scope.validateDocumentFormat(item);

                                return `<div 
                                            class="tree-item"
                                            title="${item.description || ''}"
                                        >
                                            <div class="grid-x grid-margin-x align-middle">
                                                <div class="cell small-1 medium-1 large-1">
                                                    <span class="tree-item-icon">
                                                        <i class="${item.iconClass}"></i>
                                                    </span>
                                                </div>
                                                <div class="cell auto">
                                                    <h6>
                                                        ${item.value}
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>`;
                            },
                            isFolder: function (item) {
                                return item.isFolder;
                            },
                        });

                    }
                    const itemsInRow = $rootScope.UI.isMobile ? 2 : 6;
                    // Initialize DHTMLX Dataview
                    $timeout(function () {
                        $scope.foldersDataView = new dhtmlx.DataView("userDriveFormsDataViewContainer", {
                            data: treeData,
                            template: function (item) {
                                item.iconClass = item.isFolder ? "fal fa-folder" : "fal fa-file";
                                item.iconClass = item.opened ? 'fal fa-folder-open' : item.iconClass;
                                if (item.items) {
                                    item.iconClass = !item.items.length ? 'fal fa-folder-xmark' : item.iconClass;
                                }
                                item = $scope.validateDocumentFormat(item);

                                if (!item.template) {
                                    const backgroundColor = item.backgroundColor || 'var(--light-gray)';
                                    item.template = `<div 
                                            class="dataview-item"
                                            title="${item.description || ''}"
                                            style="${backgroundColor}"
                                        >
                                            <span class="dataview-item-icon">
                                                <i class="${item.iconClass}"></i>
                                            </span>
                                            <h6>
                                                ${item.value}
                                            </h6>
                                        </div>`;
                                };
                                return item.template;
                            },
                            itemsInRow: itemsInRow,
                            gap: 12,
                        });
                        // DataView event: Item Click
                        $scope.foldersDataView.events.on("click", function (id) {
                            // Find the folder by ID
                            $scope.folder = $scope.folders.find(f => f.id.toString() === id.toString());

                            $scope.userDocument = null;
                            $scope.UI.documentView = false;

                            // check id is integer

                            const isInteger = /^\d+$/.test(id);

                            if (!isInteger) {
                                const documentId = parseInt(id.replace('document-', ''), 10);
                                if (!isNaN(documentId)) {
                                    id = documentId; // Return the parsed document ID as an integer
                                }
                                $scope.initDocument({id: id});
                                $('#userDriveDocumentViewReveal').foundation('open');
                            } else {

                                // Map child folders to DataView items
                                const folderDataItems = ($scope.folder.ChildFolders || []).map(child => ({
                                    id: child.id,
                                    value: child.name,
                                    description: child.description,
                                    isFolder: true,
                                }));
                                // Filter documents matching the folder ID and map them to DataView items
                                const documentDataItems = $scope.userDocuments
                                    .filter(document => document.folderId === $scope.folder.id)
                                    .map(document => ({
                                        id: `document-${document.id}`,
                                        value: document.title,
                                        format: document.format,
                                        url: document.url,
                                        description: document.description || '',
                                        isFolder: false,
                                    }));
                                // Combine folder and document items
                                const dataViewItems = [...folderDataItems, ...documentDataItems];

                                if ($scope.foldersTree && !$rootScope.UI.isMobile) {                                   
                                    // open folder while keeping the tree open
                                    $scope.foldersTree.open(id);
                                };
                                // Update the DataView with the combined items
                                $scope.foldersDataView.data.parse(dataViewItems);
                            }
                            $timeout(function () {
                                $scope.$apply();
                            });
                        });
                        if ($scope.foldersTree && !$rootScope.UI.isMobile) {
                            // Tree event: Folder Click
                            $scope.foldersTree.events.on("itemClick", function (id) {
                                $scope.userDocument = null;
                                $scope.UI.documentView = false;
                                const folder = $scope.folders.find(f => f.id.toString() === id);
        
                                $timeout(function () {
                                    $scope.$apply();
                                });
        
                                if (id.startsWith('document-')) {
                                    const documentId = parseInt(id.replace('document-', ''), 10);
                                    if (!isNaN(documentId)) {
                                        id = documentId; // Return the parsed document ID as an integer
                                        const document = $scope.userDocuments.find(doc => doc.id === id);
                                        
                                        if (document) {
                                            $scope.userDocument = document;
                                        }
                                    }
                                    $scope.initDocument({id: id});
                                    $('#userDriveDocumentViewReveal').foundation('open');
                                } else {
                                    // Map child folders to DataView items
                                    const folderItems = (folder.ChildFolders || []).map(child => ({
                                        id: child.id,
                                        value: child.name,
                                        description: child.description,
                                        isFolder: true,
                                    }));
        
                                    // Filter documents matching the folder ID and map them to DataView items
                                    const documentItems = $scope.userDocuments
                                    .filter(document => document.folderId === folder.id)
                                    .map(document => ({
                                        id: `document-${document.id}`,
                                        value: document.title,
                                        description: document.description || '',
                                        isFolder: false,
                                    }));
        
                                    // Combine folder and document items
                                    var dataViewItems = [...folderItems, ...documentItems];
        
                                    $scope.folder = folder;
                                    
                                    // Update the DataView with the combined items
                                    $scope.foldersDataView.data.parse(dataViewItems);
        
                                    $timeout(function () {
                                        $scope.$apply();
                                    });
                                } 
                            });
                            // Tree event: After Expand
                            $scope.foldersTree.events.on("afterExpand", function (id) {
                                $scope.folder = $scope.folders.find(f => f.id === parseInt(id));
                                $scope.userDocument = null;
                                $scope.UI.documentView = false;
        
                                if ($scope.folder) {
                                    var dataViewItems = ($scope.folder.ChildFolders || []).map(child => ({
                                        id: child.id,
                                        value: child.name,
                                        description: child.description,
                                        isFolder: true,
                                    }));
        
                                    var documentItems = $scope.userDocuments
                                        .filter(document => document.folderId === $scope.folder.id)
                                        .map(document => ({
                                            id: `document-${document.id}`,
                                            value: document.title || 'No Title Assigned',
                                            description: document.description || '',
                                            format: document.format,
                                            url: document.url,
                                            isFolder: false,
                                        }));
        
                                    dataViewItems = [...dataViewItems, ...documentItems];
                                    dataViewItems = dataViewItems.map(item => {                             
                                        item.iconClass = item.isFolder ? "fal fa-folder" : "fal fa-file";
                                        item.iconClass = item.opened ? 'fal fa-folder-open' : item.iconClass;
                                        if (item.items) {
                                            item.iconClass = !item.items.length ? 'fal fa-folder-xmark' : item.iconClass;
                                        }
                                        item = $scope.validateDocumentFormat(item);
        
                                        if (!item.template) {
                                            const backgroundColor = item.backgroundColor || 'var(--light-gray)';
                                            item.template = `<div 
                                                    class="dataview-item"
                                                    title="${item.description || ''}"
                                                    style="${backgroundColor}"
                                                >
                                                    <span class="dataview-item-icon">
                                                        <i class="${item.iconClass}"></i>
                                                    </span>
                                                    <h6>
                                                        ${item.value}
                                                    </h6>
                                                </div>`;
                                        };
        
                                        return item;
                                    });
                                    
                                    $scope.foldersDataView.data.parse(dataViewItems);
        
                                    $timeout(function () {
                                        $scope.$apply();
                                    });
                                }
                            });
                            // Tree event: After Collapse
                            $scope.foldersTree.events.on("afterCollapse", function (id) {
                                $scope.folder = $scope.folders.find(f => f.ChildFolders.some(child => child.id === parseInt(id)));
                                $scope.userDocument = null;
        
                                if ($scope.folder) {
                                    const dataViewItems = ($scope.folder.ChildFolders || []).map(child => ({
                                        id: child.id,
                                        value: child.name,
                                        description: child.description,
                                        isFolder: true,
                                    }));
        
                                    const documentItems = $scope.userDocuments
                                        .filter(document => document.folderId === $scope.folder.id)
                                        .map(document => ({
                                            id: `document-${document.id}`,
                                            value: document.title,
                                            description: document.description || '',
                                            isFolder: false,
                                        }));
        
                                    $scope.foldersDataView.data.parse([...dataViewItems, ...documentItems]);
        
                                } else {
                                    $scope.foldersDataView.data.parse([]);
                                }
                                // check to see if all folders are closed
                                const foldersSate = $scope.foldersTree.getState();

                                // check to see if any objects in have opened true
                                const hasOpened = Object.values(foldersSate).some(item => item.open === true);

                                if (!hasOpened) {
                                    $scope.foldersDataView.data.parse(treeData);
                                    
                                }
        
                                $timeout(function () {
                                    $scope.$apply();
                                });
                            });
                        };
                        if (id) {
                            $timeout(function () {
                                const element = $(`li [data-dhx-id="${id}"]`);
                                if (element.length) {
                                    element.trigger('click');
                                    $scope.folder = $scope.folders.find(f => f.id === parseInt(id));
                                    $scope.userDocument = null;
                                    $scope.UI.documentView = false;
            
                                    if ($scope.folder) {
                                        var dataViewItems = ($scope.folder.ChildFolders || []).map(child => ({
                                            id: child.id,
                                            value: child.name,
                                            description: child.description,
                                            isFolder: true,
                                        }));
            
                                        var documentItems = $scope.userDocuments
                                            .filter(document => document.folderId === $scope.folder.id)
                                            .map(document => ({
                                                id: `document-${document.id}`,
                                                value: document.title || 'No Title Assigned',
                                                description: document.description || '',
                                                format: document.format,
                                                url: document.url,
                                                isFolder: false,
                                            }));
            
                                        dataViewItems = [...dataViewItems, ...documentItems];
                                        dataViewItems = dataViewItems.map(item => {                             
                                            item.iconClass = item.isFolder ? "fal fa-folder" : "fal fa-file";
                                            item.iconClass = item.opened ? 'fal fa-folder-open' : item.iconClass;
                                            if (item.items) {
                                                item.iconClass = !item.items.length ? 'fal fa-folder-xmark' : item.iconClass;
                                            }
                                            item = $scope.validateDocumentFormat(item);
            
                                            if (!item.template) {
                                                const backgroundColor = item.backgroundColor || 'var(--light-gray)';
                                                item.template = `<div 
                                                        class="dataview-item"
                                                        title="${item.description || ''}"
                                                        style="${backgroundColor}"
                                                    >
                                                        <span class="dataview-item-icon">
                                                            <i class="${item.iconClass}"></i>
                                                        </span>
                                                        <h6>
                                                            ${item.value}
                                                        </h6>
                                                    </div>`;
                                            };
            
                                            return item;
                                        });
                                        
                                        $scope.foldersDataView.data.parse(dataViewItems);
                                    }
                                }
                            }, 0);
                        }
                    });
                } else {
                    $scope.UI.errMessage = responses[0].msg || responses[1].msg || 'An error occurred while loading folders or documents.';
                }
            })
            .catch(function (err) {
                $scope.UI.foldersLoaded = true;
                $scope.UI.errMessage = "An error occurred while loading folders or documents.";
                console.error(err);
            });
        };
        $scope.initPayStub = function () {
            $scope.UI.paystubLoaded = false;
            $scope.payStub = {};

            $user.getPayStub(
                {
                    id: $routeParams.paystubId,
                    userId: $routeParams.userId
                }
            )
            .then(
                function (response) {
                    $scope.UI.paystubLoaded = true;
                    if (!response.err) {
                        $scope.payStub = response.payStub;
                        $scope.payStub.PaymentMethod = $scope.paymentMethods.find(method => method.id === $scope.payStub.paymentMethod);

                        $log.log('Pay Stub Data:', $scope.payStub);
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while retrieving the pay stub.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while retrieving the pay stub.';
                }
            );
        };
        $scope.initUsers = function () {
            $scope.UI.usersLoaded = false;
            $scope.UI.groupsLoaded = false;

            $scope.user = $rootScope.user;
            
            $user.getUsers()
            .then(
                function (response) {
                    $scope.UI.usersLoaded = true;

                    if (!response.err) {
                        $scope.users = response.users;
                    }
                }
            );
        };   
        $scope.initDevices = function () {
            $scope.UI.devicesLoaded = false;

            $user.getDevices()
            .then(
                function (response) {
                    $scope.UI.devicesLoaded = true;

                    if (!response.err) {
                        $scope.devices = response.devices;
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while fetching user devices.';
                }
            );
        };
        $scope.initEstimates = function () {
            $scope.UI.estimatesLoaded = false;
            $scope.UI.estimates = [];

            $user.getEstimates({
                id: $routeParams.userId
            })
            .then(function (response) {
                $scope.UI.estimatesLoaded = true;

                if (!response.err) {
                    $scope.UI.estimates = response.estimates;
                    $scope.estimates = response.estimates;
                } else {
                    $scope.UI.errMessage = response.msg || 'An error occurred while retrieving user estimates.';
                }
            })
            .catch(function (err) {
                $scope.UI.errMessage = err || 'An error occurred while retrieving user estimates.';
            });
        };
        $scope.initEvents = function (archived, offset = 0, limit = 10, append = false) {
            $scope.UI.eventsLoaded = false;
            $scope.UI.archiveEvents = archived;
            $scope.UI.eventsOffset = offset;
            $scope.UI.eventsLimit = limit;
            $scope.UI.eventsEndReached = false;

            const MAX_RECURRENCES = 20;
            var data = {
                id: $routeParams.userId,
                offset: offset,
                limit: limit
            };
            var eventService = archived ? $user.getArchivedEvents : $user.getEvents;
            eventService(data)
                .then(function (response) {
                    $scope.UI.eventsLoaded = true;
                    if (!response.err) {
                        let newEvents = response.events || [];
                        if (append) {
                            $scope.events = $scope.events.concat(newEvents);
                        } else {
                            $scope.events = newEvents;
                        }
                        if (newEvents.length < limit) {
                            $scope.UI.eventsEndReached = true;
                        }
                        // Process events
                        $scope.events.forEach(event => {
                            event.originalId = event.originalEventId;
                            
                            if (event.recurring && event.RecurrencePattern) {
                                const recurrencePattern = event.RecurrencePattern;
                                const frequency = recurrencePattern.frequency;
                                const interval = recurrencePattern.interval || 1;
                                const startDate = moment(event.startDate);
                                const endDate = moment(event.endDate);
                                const recurrenceEndDate = recurrencePattern.endDate
                                    ? moment(recurrencePattern.endDate)
                                    : null;
        
                                let nextDate = startDate.clone();
                                let count = 0;
        
                                // Expand recurring events and update dates dynamically
                                while ((!recurrenceEndDate || count < MAX_RECURRENCES) && count < MAX_RECURRENCES) {
                                    const eventInstance = _.cloneDeep(event); // Use lodash for deep cloning
                                    eventInstance.startDate = nextDate.toISOString();
                                    eventInstance.endDate = nextDate.clone().add(endDate.diff(startDate)).toISOString();
                                    eventInstance.id = `recurring-${event.id}-${nextDate.format('YYYYMMDD')}`;
                                    eventInstance.originalId = event.originalEventId;
        
                                    // Drop the recurring property to prevent calendar issues
                                    delete eventInstance.recurring;
        
                                    
        
                                    // Increment date based on recurrence frequency
                                    switch (frequency) {
                                        case 'daily':
                                            nextDate.add(interval, 'days');
                                            break;
                                        case 'weekly':
                                            nextDate.add(interval, 'weeks');
                                            break;
                                        case 'monthly':
                                            nextDate.add(interval, 'months');
                                            break;
                                        case 'yearly':
                                            nextDate.add(interval, 'years');
                                            break;
                                        default:
                                            console.warn('Unsupported frequency:', frequency);
                                            return;
                                    }
        
                                    count++;
                                }
                            };
                            $scope.events.push(event);
                        });
                    } else {
                        $scope.UI.errMessage = response.msg || 'Failed to Retrieving Events.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.eventsLoaded = true;
                    console.error('Error fetching events:', err);
                });
        };   
        $scope.initDocuments = function () {
            $scope.UI.userDocumentsLoaded = false;
            $scope.userDocuments = [];

            $user.getDocuments()
                .then(function (response) {
                    $scope.UI.userDocumentsLoaded = true;

                    if (!response.err) {
                        $scope.userDocuments = response.documents;
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while retrieving user documents.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while retrieving user documents.';
                });
        };
        $scope.initPayRates = function () {
            $scope.UI.payRatesLoaded = false;
            $scope.payRates = [];

            $user.getPayRates({
                id: $routeParams.userId
            })
            .then(
                function (response) {
                    $scope.UI.payRatesLoaded = true;

                    if (!response.err) {
                        $scope.payRates = response.payRates;
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while retrieving user pay rates.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while retrieving user pay rates.';
                }
            );
        };
        $scope.initStatistics = function (e, startDate, endDate) {
            if (e) {
                e.preventDefault();
            };
            if (!startDate) {
                startDate = $scope.UI.startDate;
            }
            if (!endDate) {
                endDate = $scope.UI.endDate;
            };
            $scope.UI.statisticsLoaded = false;
            $scope.UI.startDate = startDate;
            $scope.UI.endDate = endDate;
            
            $scope.userStatistics = {
                events: [],
                estimates: [],
                tasks: [],
                totalEvents: 0,
                completedEvents: 0,
                eventsPercentage: 0,
                startDate: startDate,
                endDate: endDate,
            };

            $user.getStatistics({
                startDate: startDate,
                endDate: endDate,
                id: $routeParams.userId
            }).then(
                function (response) {
                    $scope.UI.statisticsLoaded = true;
                    if (!response.err) {
                        $scope.userStatistics = response.statistics;

                        // Calculate eventsPercentage
                        if ($scope.userStatistics.totalEvents > 0) {
                            $scope.userStatistics.eventsPercentage = 
                                ($scope.userStatistics.completedEvents / $scope.userStatistics.totalEvents) * 100;
                        } else {
                            $scope.userStatistics.eventsPercentage = 0;
                        }

                        if (
                            $scope.userStatistics.totalEstimates &&
                            $scope.userStatistics.convertedEstimates !== undefined
                        ) {
                            $timeout(function () {
                                const totalEstimates = $scope.userStatistics.totalEstimates;
                                const convertedEstimates = $scope.userStatistics.convertedEstimates;
                                const signedButNotConvertedEstimates = $scope.userStatistics.signedButNotConvertedEstimates || 0;
                                const convertedPercentage = totalEstimates > 0 ? (convertedEstimates / totalEstimates) * 100 : 0;
                                const signedButNotConvertedPercentage = totalEstimates > 0 ? (signedButNotConvertedEstimates / totalEstimates) * 100 : 0;
                                const remainingPercentage = 100 - (convertedPercentage + signedButNotConvertedPercentage);
                                const unsignedAndUncovertedEstimates = totalEstimates - (convertedEstimates + signedButNotConvertedEstimates);

                                $scope.userEstimateChart = new dhtmlx.Chart('userStatisticsEstimatesChart', {
                                    type: 'donut',
                                    series: [
                                        {
                                            value: 'value',
                                            color: 'color',
                                            text: 'text',
                                        }
                                    ],
                                    legend: {
                                        values: {
                                            text: "id",
                                            color: "color"
                                        },
                                    },
                                    data: [
                                        { 
                                            id: 'Converted', 
                                            value: convertedPercentage, 
                                            text: '', 
                                            color: '#ff0000' 
                                        },
                                        { 
                                            id: 'Signed But Not Converted', 
                                            value: signedButNotConvertedPercentage, 
                                            text: '', 
                                            color: '#ff957d' 
                                        },
                                        { 
                                            id: 'Unsigned and Unconverted', 
                                            value: remainingPercentage, 
                                            text: '', 
                                            color: '#3f3faa' 
                                        },
                                    ]
                                });
                                $timeout(function () {
                                    const gElements = document.querySelectorAll('g');
                                    gElements.forEach(g => {
                                        if (g.classList.contains('chart') && g.classList.contains('donut')) {
                                            g.remove();
                                        }
                                    })
                                }, 500);
                            }, 1000);
                        };
                        
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while retrieving user statistics.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.statisticsLoaded = true;
                    $scope.UI.errMessage = err || 'An error occurred while retrieving user statistics.';
                }
            )
        };
        $scope.initPaystubs = function () {
            $scope.UI.paystubsLoaded = false;
            $scope.payStubs = [];

            $user.getPayStubs(
                {
                    id: $routeParams.userId
                }
            ).then(
                function (response) {
                    $scope.UI.paystubsLoaded = true;

                    if (!response.err) {
                        $scope.payStubs = response.paystubs;
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while retrieving user pay stubs.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while retrieving user pay stubs.';
                }
            );
        };
        $scope.initUserForm = function () {
            $scope.userLoaded = false;
            $scope.worker = {};
            $scope.UI.newUser = true;
        
            const initCalls = [
                $admin.getRoles(),
                $admin.getGroups(),
                $admin.getPermissions(),
                $setup.getPages(),
                $admin.getRolePermissions(),
                $scope.initUserTabs()
            ];
        
            if ($routeParams.userId) {
                // If editing, fetch the user's existing data
                initCalls.unshift($user.getUser({ id: $routeParams.userId }));
                $scope.UI.newUser = false;
            } else {
                $scope.worker = {
                    email: '',
                    phoneNumber: null,
                    firstName: '',
                    lastName: '',
                    roleId: null
                };
            }
        
            $q.all(initCalls)
                .then(function (responses) {
                    $scope.userLoaded = true;
                    let offset = 0;
        
                    if ($routeParams.userId) {
                        // If editing, the first response is user data
                        if (!responses[0].err) {
                            $scope.worker = responses[0].user;
                            // Check if the logged-in user matches the user being edited
                            if ($scope.user.id === $scope.worker.id) {
                                $scope.initDevices();
                            }
                        }
                        offset = 1; // Adjust index for subsequent responses

                    }
        
                    if (
                        !responses[offset].err &&
                        !responses[offset + 1].err &&
                        !responses[offset + 2].err &&
                        !responses[offset + 3].err &&
                        !responses[offset + 4].err
                    ) {
                        $scope.roles = responses[offset].roles;
                        $scope.groups = responses[offset + 1].groups;
                        $scope.workerPermissions = responses[offset + 2].permissions;
                        $scope.workerPages = responses[offset + 3].pages;
                        $scope.rolePermissions = responses[offset + 4].roles;

        
                        // Data manipulation for pages and permissions
                        const userPermissionIds = $scope.worker?.Permissions?.map(p => p.id) || [];
                        const pagePermissions = _.groupBy($scope.workerPermissions, 'pageId');
        
                        _.forEach($scope.workerPages, page => {
                            page.permissions = pagePermissions[page.id] || [];
                            _.forEach(page.permissions, permission => {
                                permission.selected = userPermissionIds.includes(permission.id);
                            });
                        });
        
                        // Data manipulation for widgets
                        const userWidgetIds = $scope.worker?.Widgets?.map(w => w.id) || [];
                        _.forEach($scope.widgets, widget => {
                            widget.selected = userWidgetIds.includes(widget.id);
                        });
                    }
                }
            );
        };   
        $scope.initUserSetupForm = function () {
            $rootScope.preferences = {};

            $scope.UI.newUser = true;
            $scope.UI.formSaving = false;
            $scope.UI.formSaved = false;

            const id = parseInt(urlParams.get('id')) || null;
            const token = urlParams.get('token') || null;
            const string = urlParams.get('string') || null;
            $scope.activationCode = ['', '', '', '', '', ''];
            
            if ($scope.user) {
                $scope.initFormSaved('An Account is already logged in.');

                $timeout(function() {
                    $location.url('/dashboard');
                }
                , 2000);
                return;
            }
            if ($scope.pendingUser) {
                $scope.user = $scope.pendingUser;
                $scope.updateStep(2);
                return;
            }
            if (
                id &&
                token
            ) {
                $window.localStorage.setItem('goluraToken', $location.search().token);
                $scope.user = {
                    id: id,
                    token: token,
                };

                if (string) {
                    $scope.activationCode = string.split('');
                    $scope.validateActivationCode();
                }
            } else {
                $scope.UI.errMessage = 'User ID is required for setup.';
            }
        };  
        $scope.initUserReminderForm = function () {
            const id = parseInt(urlParams.get('id')) || $scope.worker.id || null;

            if (id) {
                $scope.reminder = {
                    userId: id
                };

                $setup.getReminderTypes()
                .then(
                    function (response) {
                        if (!response.err) {
                            $scope.reminderTypes = response.reminderTypes;
                        }
                    }
                );
            } else {
                $scope.UI.errMessage = 'User ID is required for password reminder.';
            };
        };
        $scope.initUserPasswordResetForm = function () {

            const id = parseInt(urlParams.get('id')) || null;
            const token = urlParams.get('token') || null;

            if (
                id &&
                token
            ) {
                $window.localStorage.setItem('goluraToken', $location.search().token);
                $scope.user = {
                    id: id,
                    token: token,
                };
            } else {
                $scope.UI.errMessage = 'User ID is required for password reset.';
            };
        };
        $scope.initFolderForm = function (folder) {
            $scope.UI.formSaving = false;
            $scope.UI.newFolder = false;
            $scope.UI.folderLoaded = false;

            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $scope.filteredFolders = [];

            if (!folder) {
                folder = {
                    name: '',
                    description: '',
                    userId: $scope.user.id,
                };
                if ($scope.folder) {
                    folder.parentFolderId = $scope.folder.id;
                }
                $scope.UI.newFolder = true;
            };
            $scope.newFolder = folder;

            $scope.filteredFolders = $scope.folders;

            $scope.UI.folderLoaded = true;
        };
        $scope.initDocumentForm = function () {
            $scope.UI.formSaving = false;
            $scope.UI.formSaved = false;
            $scope.userDocument = {};

            const documentId = parseInt(urlParams.get('documentId')) || null;

            if (documentId) {
                $user.getDocument({ id: documentId })
                    .then(function (response) {
                        if (!response.err) {
                            $scope.userDocument = response.document;
                        } else {
                            $scope.UI.errMessage = response.msg || 'An error occurred while retrieving the user document.';
                        }
                    })
                    .catch(function (err) {
                        $scope.UI.errMessage = err || 'An error occurred while retrieving the user document.';
                    });
            } else {
                $scope.userDocument = {
                    url: '',
                    title: '',
                    description: '',
                    folderId: null,
                    size: null,
                    format: '',
                    width: null,
                    height: null,
                    duration: null,
                    resolution: '',
                    frameRate: null,
                    pageCount: null,
                    author: '',
                    textPreview: ''
                };
            }
        };
        $scope.initUserPayRateForm = function (payRate) {
            $log.log(payRate);
            $scope.UI.userPayRateLoaded = false;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.newPayRate = false;
            
            if (!payRate) {
                $scope.UI.newPayRate = true;
                $scope.payRate = {
                    userId: $scope.worker.id,
                    rate: '',
                    overtimeRate: '',
                    rateType: 'hourly',
                    effectiveDate: new Date(),
                    endDate: null,
                    isActive: true,
                    isPrimary: false,
                    notes: ''
                };
            } else {
                $scope.payRate = angular.copy(payRate);
                
                // Convert rate values to strings with proper decimal formatting for text inputs
                if ($scope.payRate.rate) {
                    $scope.payRate.rate = parseFloat($scope.payRate.rate).toFixed(2);
                }
                if ($scope.payRate.overtimeRate) {
                    $scope.payRate.overtimeRate = parseFloat($scope.payRate.overtimeRate).toFixed(2);
                }
                
                // Convert ISO date strings to MySQL date format for FlatPickr
                if ($scope.payRate.effectiveDate) {
                    const effectiveDate = new Date($scope.payRate.effectiveDate);
                    $scope.payRate.effectiveDate = effectiveDate.getFullYear() + '-' + 
                        String(effectiveDate.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(effectiveDate.getDate()).padStart(2, '0');
                }
                if ($scope.payRate.endDate) {
                    const endDate = new Date($scope.payRate.endDate);
                    $scope.payRate.endDate = endDate.getFullYear() + '-' + 
                        String(endDate.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(endDate.getDate()).padStart(2, '0');
                }
                
                $scope.UI.userPayRateLoaded = true;
            }
        };
        $scope.initUserCredentialsForm = function () {
            $scope.UI.statesLoaded = false;
            $scope.UI.userCredentialsLoaded = false;

            var data = {
                id: $scope.user.id
            }
            if ($routeParams.userId) {
                data = {
                    id: $routeParams.userId
                };
            };
            $q.all(
                [
                    $user.getCredentials(data),
                    $setup.getStates()
                ]
            ).then(
                function (responses) {
                    $scope.UI.userCredentialsLoaded = true;
                    $scope.UI.statesLoaded = true;

                    if (
                        responses[0].err &&
                        responses[1].err
                    ) {
                        $scope.UI.errMessage = responses[0].msg || 'An error occurred while updating user credentials.';
                        return;
                    }   

                    $scope.userCredentials = responses[0].credentials;
                    $scope.states = responses[1].states;

                },
                function (error) {
                    $scope.UI.userCredentialsLoaded = true;
                    $scope.UI.statesLoaded = true;
                    $scope.UI.errMessage = error.msg || 'An error occurred while initializing the form.';
                }
            );
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
            $scope.UI.errorMessage = msg;
            $timeout(function () {
                $scope.UI.errorMessage = null;
            }, 5000);
        };
        $scope.initUserTabs = function () {
            var i = 0;
            $scope.initTabs = $interval(
                function() {
                    i++;
                    if ($('#' + $scope.UI.tab + '-label').length) {
                        $('.tabs-title').removeClass('is-active');
                        $('.tabs-title a').attr('aria-selected', false);
                        $('.tabs-panel').removeClass('is-active');
                        $('#' + $scope.UI.tab + '-label').parent().addClass('is-active');
                        $('#' + $scope.UI.tab + '-label').attr('aria-selected', true)
                        $('#' + $scope.UI.tab).addClass('is-active');
                        angular.element('#' + $scope.UI.tab + '-label').triggerHandler('click');
                        $interval.cancel($scope.initTabs);
                        $(document).foundation();
                    } else {
                        $(document).foundation();
                        $interval.cancel($scope.initTabs);
                    }
                }, 100
            );
        };
        $scope.createUser = function (e, user) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;

            // Collect selected permissions from the form
            const selectedPermissions = [];
            _.forEach($scope.workerPages, (page) => {
                _.forEach(page.permissions, (permission) => {
                    if (permission.selected) {
                        selectedPermissions.push({
                            id: permission.id,
                            action: permission.action,
                            pageId: permission.pageId,
                        });
                    }
                });
            });

            // Add selected permissions to the user object
            user.permissions = selectedPermissions;

            $user.createUser(user)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    
                    if (!response.err) {
                        $location.url('/users/user/' + response.user.id);
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while creating the user.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while creating the user.';
                }
            );  
        };
        $scope.createUserReminder = function (e, reminder) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.formSaving = true;

            // Map the selected reminder type IDs
            reminder.reminderTypes = $scope.reminderTypes
                .filter(rt => rt.selected)
                .map(rt => rt.id);

            $user.createReminder(reminder)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (!response.err) {

                        // Reset the reminder types to unselect all
                        $scope.reminderTypes.forEach(rt => rt.selected = false);
    
                        $scope.initUser();
                        $scope.initFormSaved(response.msg || 'Reminder created successfully');

                        $('#userReminderFormModal').foundation('close');
                    } else {
                        $rootScope.UI.errMessage = response.msg || 'An error occurred creating reminder';
                        return;
                    }
                }
            ).catch(
                function (error) {
                    $scope.UI.formSaving = false;
                    $rootScope.UI.errMessage = error || 'An error occurred creating reminder';
                }
            );
        };
        $scope.createFolder = function (e, folder) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            if ($scope.folder) {
                folder.parentFolderId = $scope.folder.id;
            } else {
                folder.parentFolderId = null;
            };

            $user.createFolder(folder)
            .then(function (response) {
                $scope.UI.formSaving = false;
                if (!response.err) {
                    $scope.initFormSaved(response.msg || 'User folder created successfully.');

                    const newFolder = response.folder;
                    $scope.initFolders(newFolder.id);
                    $('#folderCreateFormReveal').foundation('close');
                } else {
                    $scope.UI.errMessage = response.msg || 'An error occurred while creating the user folder.';
                }
            }).catch(function (err) {
                $scope.UI.formSaving = false;
                $scope.UI.errMessage = err || 'An error occurred while creating the user folder.';
            });
        };
        $scope.createDocument = function (e, document) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $user.createDocument(document)
            .then(function (response) {
                $scope.UI.formSaving = false;
                if (!response.err) {
                    $scope.initFormSaved(response.msg || 'User document created successfully.');
                    $scope.initDocuments();
                    $('#userDocumentFormModal').foundation('close');
                } else {
                    $scope.UI.errMessage = response.msg || 'An error occurred while creating the user document.';
                }
            }).catch(function (err) {
                $scope.UI.formSaving = false;
                $scope.UI.errMessage = err || 'An error occurred while creating the user document.';
            });
        };
        $scope.updateFolder = function (folder) {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $user.updateFolder(folder)
                .then(function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initFormSaved('User folder updated successfully.');
                        if (!$rootScope.UI.isMobile) {
                            $scope.foldersTree.data.update(
                                folder.id.toString(),
                                {
                                    value: folder.name,
                                    description: folder.description,
                                }
                            );
                        };
                        $('#folderCreateFormReveal').foundation('close');
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while updating the user folder.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err || 'An error occurred while updating the user folder.';
                });
        };
        $scope.updateDocument = function (document) {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $user.updateDocument(document)
                .then(function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initFormSaved('User document updated successfully.');
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while updating the user document.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err || 'An error occurred while updating the user document.';
                });
        };
        $scope.updatePreferences = function (preferences) {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            
            $user.updatePreferences(preferences)
            .then(
                function (response) {
                    if (!response.err) {
                        $scope.initFormSaved(response.msg || 'Preferences updated successfully.');
                        $rootScope.preferences = response.preferences;
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while updating preferences.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while updating preferences.';
                }
            );
        };
        $scope.updateUserRolePermissions = function (id) {
            // Find the role by ID in roles
            const role = _.find($scope.roles, { id });
        
            if (!role) {
                return;
            }
        
            // Find the role's permissions in rolePermissions
            const roleData = _.find($scope.rolePermissions, { id });
        
            if (!roleData || !roleData.Permissions) {
                return;
            }
        
            // Get permissions from the role and the user
            const rolePermissionIds = _.map(roleData.Permissions, 'id');
            const userPermissionIds = _.map($scope.workerPermissions, 'id') || [];
        
            // Combine permissions while ensuring no duplicates
            const combinedPermissionIds = _.uniq([...rolePermissionIds]);
        
            // Group permissions by page for efficient mapping
            const pagePermissions = _.groupBy($scope.workerPermissions, 'pageId');
        
            // Update the permissions in $scope.workerPages
            _.forEach($scope.workerPages, (page) => {
                page.permissions = pagePermissions[page.id] || [];
                _.forEach(page.permissions, (permission) => {
                    permission.selected = combinedPermissionIds.includes(permission.id);
                });
            });
        };
        $scope.updateUserPermisions = function (e, workerPages) {
            if (e) {
                e.preventDefault();
            };
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            // Collect selected permissions from workerPages itd be like workerPages[0]permissions
            const permissions = [];
            _.forEach(workerPages, (page) => {
                _.forEach(page.permissions, (permission) => {
                    if (permission.selected) {
                        permissions.push({
                            id: permission.id,
                            action: permission.action,
                            pageId: permission.pageId,
                        });
                    }
                });
            });
            $user.updateUserPermissions(
                {
                id: $scope.worker.id,
                permissions: permissions,
                }
            ).then(function (response) {
                $scope.UI.formSaving = false;

                if (response.err) {
                    $scope.UI.errMessage = response.msg || 'An error occurred while updating user permissions.';
                    return;
                };
                $scope.initFormSaved(response.msg);
                $scope.initUserForm();
                $('#userPermissionsReveal').foundation('close');
            }).catch(function (err) {
                $scope.UI.formSaving = false;
                $scope.UI.errMessage = err || 'An error occurred while updating user permissions.';
            });
        };
        $scope.updateUsersDisplayed = function () {
            if ($scope.UI.usersDisplayed <= $scope.users.length) {
                $scope.UI.usersDisplayed += 5;
            }
        };
        $scope.updateUserEventsDisplayed = function () {
            if ($scope.UI.eventsDisplayed <= $scope.events.length) {
                $scope.UI.eventsDisplayed += 5;
            }
        };
        $scope.updateStep = function(step) {
            $scope.UI.currentStep = step;
        };       
        $scope.updateUser = function (worker) {
            $scope.UI.formSaving = true;
        
            // Collect updated permissions from the form
            const updatedPermissions = [];
            _.forEach($scope.pages, (page) => {
                _.forEach(page.permissions, (permission) => {
                    if (permission.selected) {
                        updatedPermissions.push({
                            id: permission.id,
                            action: permission.action,
                            pageId: permission.pageId,
                        });
                    }
                });
            });
            
            // Prepare data for update
            const updatedWorkerData = {
                ...worker,
                Permissions: updatedPermissions,
                Groups: _.filter(worker.groups, (group) => group.selected), // Include selected groups if applicable
            };
        
            // Call the update API
            $user.updateUser(updatedWorkerData)
                .then((response) => {
                    $scope.UI.formSaving = false;
                    if (!response.err) {
                        $scope.initFormSaved(response.msg);
                    } else {
                        $scope.UI.errMessage = response.msg;
                    }
                })
                .catch((err) => {
                    $scope.UI.formSaving = false;
                });
        };
        $scope.updateUserPayRate = function (payRate) {
            $scope.UI.formSaving = true;

            const data = {
                id: payRate.id,
                userId: $scope.worker.id,
                rate: parseFloat(payRate.rate) || 0,
                overtimeRate: payRate.overtimeRate ? parseFloat(payRate.overtimeRate) : null,
                rateType: payRate.rateType,
                effectiveDate: payRate.effectiveDate,
                endDate: payRate.endDate,
                isPrimary: payRate.isPrimary,
                notes: payRate.notes
            };

            $user.updateUserPayRate(data)
                .then(function (response) {
                    if (response.err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(response.msg);
                    } else {
                        $scope.initUser();
                        $scope.initFormSaved(response.msg || 'Pay rate updated successfully');
                        $('#userPayRateFormReveal').foundation('close');
                        $scope.UI.formSaving = false;
                    }
                })
                .catch(function (error) {
                    $scope.UI.formSaving = false;
                    $scope.initErrorMessage('Failed to update pay rate');
                });
        };
        $scope.updateUserCredentials = function (credentials) {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $user.updateUserCredentials(credentials)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    if (response.err) {
                        $scope.UI.errMessage = response.msg || 'An error occurred while updating user credentials.';
                        return;
                    }
                    $scope.initFormSaved(response.msg || 'User credentials updated successfully.');
                    $scope.initUserCredentialsForm();
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err || 'An error occurred while updating user credentials.';
                }
            );
        };
        $scope.updateUserDocumentFolderView = function () {

            // Find the parent of a given folder
            const findParentFolder = (folders, targetId, parent = null) => {
                for (const folder of folders) {
                    if (folder.id === targetId) {
                        return parent;
                    }
                    if (folder.ChildFolders && folder.ChildFolders.length > 0) {
                        const result = findParentFolder(folder.ChildFolders, targetId, folder);
                        if (result) {
                            return result;
                        }
                    }
                }
                return null;
            };
        
            // Find the parent folder of the current folder
            const parentFolder = findParentFolder($scope.nestedFolders, $scope.folder.id);
            
            if (parentFolder) {
                $scope.initFolders(parentFolder.id);
            } else {
                $scope.initFolders();
            }
        };
        $scope.updateDarkModeToggle = function () {
            $rootScope.preferences.darkMode = !$rootScope.preferences.darkMode;
            $scope.user.darkMode = $rootScope.preferences.darkMode;
            document.documentElement.setAttribute('data-theme', 'light');
            if ($rootScope.preferences.darkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            };
            $user.updatePreferences($rootScope.preferences)
            .then(
                function (response) {
                    if (!response.err) {
                        $rootScope.preferences = response.preferences;
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while updating preferences.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while updating preferences.';
                }
            );
        };
        $scope.deleteUser = function (user) {
            $scope.UI.formSaving = true;
            $user.deleteUser(user)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initUsers();
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while deleting the user.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while deleting the user.';
                }
            );
        };
        $scope.deleteFolder = function (folder) {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $user.deleteFolder({ id: folder.id })
                .then(function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initFormSaved('User folder deleted successfully.');
                        $scope.document = null;
                        $scope.folder = null;
                        $scope.initFolders();
                        $scope.UI.userFolderDeleteConfirmation = false;
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while deleting the user folder.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err || 'An error occurred while deleting the user folder.';
                });
        };
        $scope.deleteDocument = function (document) {
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $user.deleteDocument({ id: document.id })
                .then(function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initFormSaved('User document deleted successfully.');
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while deleting the user document.';
                    }
                })
                .catch(function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err || 'An error occurred while deleting the user document.';
                });
        };
        $scope.addUserPayRate = function (e, payRate) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;

            const payRateData = {
                id: $scope.worker.id,
                rate: parseFloat(payRate.rate) || 0,
                overtimeRate: payRate.overtimeRate ? parseFloat(payRate.overtimeRate) : null,
                rateType: payRate.rateType,
                effectiveDate: payRate.effectiveDate,
                endDate: payRate.endDate,
                isPrimary: payRate.isPrimary,
                notes: payRate.notes
            };

            $user.addUserPayRate(payRateData)
                .then(function (response) {
                    if (response.err) {
                        $scope.UI.formSaving = false;
                        $scope.initErrorMessage(response.msg);
                    } else {
                        $scope.initUser();
                        $scope.initFormSaved(response.msg || 'Pay rate created successfully');
                        $('#userPayRateFormReveal').foundation('close');
                        $scope.UI.formSaving = false;
                    }
                })
                .catch(function (error) {
                    $scope.UI.formSaving = false;
                    $scope.initErrorMessage('Failed to create pay rate');
                });
        };
        $scope.removeDevice = function (device) {
            $scope.UI.formSaving = true;
            $user.removeDevice(device)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initUserForm();
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while removing the device.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while removing the device.';
                }
            );
        };
        $scope.removeProfilePicture = function () {
            $scope.UI.formSaving = true;
            $user.removeProfilePicture()
            .then( 
                function (response) {
                    $scope.UI.formSaving = false;
                    
                    if (!response.err) {
                        $scope.worker.profilePictureUrl = null;
                        $scope.initFormSaved('Profile picture removed successfully!');

                        if ($rootScope.user) {
                            $scope.initUserForm();
                        } else {
                            $scope.initUserSetupForm();
                        }
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while removing the profile picture.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while removing the profile picture.';
                }
            );
        };
        $scope.removeUserPayRate = function (payRate) { 
            $user.removeUserPayRate({ id: payRate.id })
            .then(function (response) {
                if (response.err) {
                    $scope.initErrorMessage(response.msg);
                } else {
                    $scope.initUser();
                    $scope.initFormSaved(response.msg || 'Pay rate removed successfully');
                }
            })
            .catch(function (error) {
                $scope.initErrorMessage('Failed to remove pay rate');
            });
        };
        $scope.copyPassword = function (e) {
            if (e) {
                e.preventDefault();
            }
            const passwordField = document.createElement('textarea');
            passwordField.value = $scope.worker.password;
            document.body.appendChild(passwordField);
            passwordField.select();
            document.execCommand('copy');
            document.body.removeChild(passwordField);
            $scope.UI.passwordCopied = true;

            $timeout(function () {
                $scope.UI.passwordCopied = false;
            }, 3000);
        };
        $scope.orderBy = function (order) {
            var type = parseInt(order);
            $scope.sort.users = {
                id: type,
                value: null
            };
            switch (type) {
                case 1 :
                    $scope.sort.users.value = 'firstName';
                break;
                case 2 :
                    $scope.sort.users.value = '-firstName';
                break;
                case 3 :
                    $scope.sort.users.value = 'roleId';
                break;
                case 4 :
                    $scope.sort.users.value = 'lastSeen';
                break;
                case 5 :
                    $scope.sort.users.value = '-lastSeen';
                break;
                case 6 :
                    $scope.sort.users.value = 'createdAt';
                break;
            };
        };
        $scope.initInfiniteScroll = function () {
            var observer = new IntersectionObserver(function(entries) {
                if(entries[0].isIntersecting === true) {
                    angular.element('#usersListInfiniteScroll').triggerHandler('click');
                }
            }, { threshold: [0] });
            observer.observe(document.getElementById('usersListInfiniteScroll'));
        };
        $scope.initEventsInfiniteScroll = function () {
            var observer = new IntersectionObserver(function(entries) {
                if(entries[0].isIntersecting === true) {
                    angular.element('#userEventsListInfiniteScroll').triggerHandler('click');
                }
            }, { threshold: [0] });
            observer.observe(document.getElementById('userEventsListInfiniteScroll'));
        };
        $scope.sendValidationCode = function (e) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $user.sendValidateEmail($scope.user)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.initFormSaved(response.msg)
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while sending the verification code.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while sending the verification code.';
                }
            );
        };
        $scope.setupUser = function(e, user) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.formSaved = false;
            $scope.UI.userCreating = true;

            $user.setupUser(user)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;
                    $scope.UI.userCreating = false;
                    
                    if (!response.err) {
                        $scope.UI.message = 'User setup completed successfully!';
                        response.user.token = response.token;
                        $window.localStorage.removeItem('goluraPendingUser');
                        $window.localStorage.removeItem('goluraToken');
                        
                        $timeout(function() {
                            $user.setUser(response.user);
                            $window.location.href = '/dashboard';
                        }, 2000);
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while setting up the user.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.errMessage = err || 'An error occurred while setting up the user.';
                }
            );
        };
        $scope.resetPassword = function(e, user) {
            if (e) {
                e.preventDefault();
            }
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;

            $user.resetPassword(user)
            .then(
                function (response) {
                    $scope.UI.formSaving = false;

                    if (!response.err) {
                        $scope.UI.message = response.msg;
                        
                        $timeout(
                            function() {
                                $user.removeUser();
                                $location.url('/');
                            }, 3000
                        );
                    } else {
                        $scope.UI.errMessage = response.msg || 'An error occurred while resetting the password.';
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err || 'An error occurred while resetting the password.';
                }
            );
        };
        $scope.moveToNextInput = function(index, event) {
            if (event && event.key === 'Backspace' && index > 0 && !$scope.activationCode[index]) {
                document.querySelectorAll('.user-setup-form-activation-code')[index - 1].focus();
            } else if ($scope.activationCode[index] && index < 5) {
                document.querySelectorAll('.user-setup-form-activation-code')[index + 1].focus();
            }
        };
        $scope.handlePaste = function(event) {
            const pasteData = event.originalEvent.clipboardData.getData('text');
            const numericData = pasteData.replace(/\D/g, ''); // Remove non-numeric characters

            for (let i = 0; i < 6; i++) {
                $scope.activationCode[i] = numericData[i] || ''; // Fill with numbers or empty string if not enough numbers
            }

            document.querySelectorAll('.user-setup-form-activation-code')[5].focus();
        };
        $scope.anyReminderTypeSelected = function() {
            return $scope.reminderTypes.some(rt => rt.selected);
        }; 
        $scope.validateActivationCode = function() {
            var user = {};
            const securityToken = parseInt($scope.activationCode.join('')) || null;
            $scope.UI.formSaving = true;
            $scope.UI.errMessage = null;
            $scope.UI.message = null;
            $scope.UI.formSaved = false;

            $user.validateUser({
                id: parseInt($location.search().id) || null,
                securityToken,
            }).then(
                function (response) {
                    $scope.UI.formSaving = false;


                    if (!response.err) {
                        $scope.user = response.user;
                        
                        user = response.user;
                        user.token = response.token;

                        $window
                        .localStorage
                        .setItem('goluraPendingUser',
                            angular.toJson(user)
                        );
                        $scope.updateStep(2);
                    } else {
                        $scope.UI.errMessage = response.msg || 'Invalid activation code.';
                        $scope.activationCode = ['', '', '', '', '', ''];
                    }
                }
            ).catch(
                function (err) {
                    $scope.UI.formSaving = false;
                    $scope.UI.errMessage = err || 'An error occurred while validating the activation code.';
                }
            );
        };
        $scope.validateDocumentFormat = function(document) {
            const backgroundColor = document.isFolder ? "" : "background: var(--light-gray);"

            if (!document.format) {
                return document; // No format specified
            };


            document.isImage = false;
            document.isVideo = false;
            document.isDocument = false;

            document.backgroundColor = backgroundColor;

            document.iconClass = 'fal fa-file';

            switch (document.format) {
                case 'jpeg':
                    document.isImage = true;
                    document.iconClass = 'fal fa-file-image';
                case 'jpg':
                    document.isImage = true;
                    document.iconClass = 'fal fa-file-image';
                case 'png':
                    document.isImage = true;
                    document.iconClass = 'fal fa-file-image';
                case 'gif':
                    document.isImage = true;
                    document.iconClass = 'fal fa-file-image';
                case 'webp':
                    document.isImage = true;
                    document.iconClass = 'fal fa-file-image';
                case 'mp4':
                    document.iconClass = 'fal fa-file-video';
                    break;
                case 'pdf':
                    document.iconClass = 'fal fa-file-pdf';
                    break;
                case 'doc':
                case 'docx':
                    document.iconClass = 'fal fa-file-word';
                    break;
                case 'xls':
                case 'xlsx':
                    document.iconClass = 'fal fa-file-excel';
                    break;
                case 'ppt':
                case 'pptx':
                    document.iconClass = 'fal fa-file-powerpoint';
                    break;
                case 'txt':
                case 'rtf':
                    document.iconClass = 'fal fa-file-alt';
                    break;
                default:
                    document.iconClass = 'fal fa-file';
            }
            if (document.isImage) {
                document.template =  `<div
                    class="dataview-item"
                    title="${document.description || ''}"
                    style="${document.backgroundColor} || 'var(--light-gray)'"
                >
                    <div 
                        class="dataview-item-image"
                        style="background-image: url('${document.url}');"
                    >
                    </div>
                </div>`;
            };
            return document;
        };
        $scope.uploadProfilePicture = function (user) {
            // Create an input element for file selection
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.click();
        
            // Add an event listener to handle file selection
            input.addEventListener('change', function (event) {
                const files = event.target.files;
                if (files && files.length > 0) {
                    // Prepare files for upload
                    const fileArray = Array.from(files);
        
                    const fileObjects = fileArray.map((blob, index) => {
                        const file = new File([blob], fileArray[index].name, { type: 'image/jpeg' });
                        file.preview = URL.createObjectURL(blob);
                        return file;
                    });
        
                    // Call the uploadFile function from the uploader service
                    $uploader.uploadFile(
                        fileObjects, 
                        null,  // No clientId
                        null,  // No eventId
                        null,  // No marketingId
                        null,  // No estimateId
                        'user',  // Specify 'user' as the folder
                        function (progress, fileName) {
                            // Update progress UI
                            $timeout(() => {
                                if (!$scope.uploadProgress) {
                                    $scope.uploadProgress = {};
                                }
                                $scope.uploadProgress[fileName] = Math.round(progress);
                            });
                        },
                        null,
                        user.id // Pass the user ID
                    ).then((responses) => {
                        $timeout(() => {
                            responses.forEach(response => {
                                if (response.err) {
                                    $scope.errMessages.push(`File: ${response.fileName}, Error: ${response.msg}`);
                                } else {
                                    // On success, update the user's profilePictureUrl
                                    if ($scope.worker) {
                                        $scope.worker.profilePictureUrl = response.url;
                                    } else {
                                        $scope.user.profilePictureUrl = response.url;
                                        $window
                                        .localStorage
                                        .setItem('goluraPendingUser',
                                            angular.toJson($scope.user)
                                        );
                                        $scope.initUserSetupForm();
                                    };
                                    $scope.initFormSaved('Profile picture updated successfully!');
                                    $scope.UI.formSaving = false;
                                }
                            });
                        });
                    }).catch((error) => {
                        $timeout(() => {
                            $scope.errMessages.push(`File: ${error.fileName}, Error: ${error.msg}`);
                        });
                    });
                }
            });
        };
        $scope.getFileName = function(url) {
            if (!url) return 'Unknown File';
            const pathParts = url.split('/');
            return pathParts[pathParts.length - 1]; // Return the last part of the URL (file name with extension)
        };
        $scope.isSupported = function(document) {
            if (document) {
                const supportedExtensions = [
                    'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', // Image formats
                    'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', // Document formats
                ];
                const extension = document.format;
                return supportedExtensions.includes(extension);
            }
        };
        $rootScope.$on('$locationChangeStart', 
            function (e, next, current) {
                $interval.cancel($scope.realTimeUpdate);
            }
        );
        $rootScope.$on('documentsUploaded',
            function (e, data) {
                $scope.initFolders($scope.folder.id || null);
            }
        );
    });
});
