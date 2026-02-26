define([
    'app-controller',
    'moment',
    'dhtmlx-spreadsheet',
    'dhtmlx-suite',
], function (
    app,
    moment,
    dhxSpreadsheet,
    dhxSuite,
) {
    app.register.controller('ReportsController',
    function (
        $scope,
        $rootScope,
        $routeParams,
        $location,
        $window,
        $log,
        $q,
        $http,
        $cookies,
        $compile,
        $timeout,
        $interval,
        $user,
        $report,
        $media,
        $setup,
    ) {
        const urlParams = new URLSearchParams(window.location.search);
        // Ensure user is set in both scope and rootScope
        $scope.user = $user.getUserFromCookie();
        $rootScope.user = $scope.user;
        
        // Get pages from rootScope (fetched by NavigationController)
        $scope.pages = $rootScope.pages || [];
        $scope.page = $setup.getCurrentPage() || {};
        $scope.permissions = $setup.updateScopes($scope, $scope.page.id || null);

        $scope.report = {};
        $scope.reportType = {};
        $scope.spreadsheet = null;

        $scope.reports = [];
        $scope.reportTypes = [];
        $scope.types = ['summary', 'spreadsheet', 'dashboard'];

        $scope.UI = {
            type: null,
            tab: urlParams.get('tab'),
            currentUrl: window.location.pathname.split('/'),
            isMobile: $media.getMedia(),
            hasSpreadSheet: false,
            hasReport: false,
            hasDashboard: false,
            activeTabIndex: 0,
            errMessage: null,
            message: null,
            reportLoaded: false,
            reportsLoaded: false,
            formSaving: false,
        }

        $scope.initReport = function (report) {
            $scope.UI.reportLoaded = false;

            if (!report) {
                report = {
                    id: $routeParams.reportId
                };
            }
            $q.all([
                $report.getReport({
                    id: report.id
                }),
                $report.generateReport({
                    id: report.id
                })
            ])
            .then(
                function (responses) {
                    $scope.UI.reportLoaded = true;

                    if (responses[0].err || responses[1].err) {
                        $scope.initErrorMessage(responses[0].msg || 'Failed to load report');
                        return;
                    };
                    $scope.report = responses[0].report;
                    $scope.report.data = responses[1].data;

                    $rootScope.UI.titleName = $scope.report.name || 'Report';

                    // Set UI type from report options
                    if ($scope.report.options && $scope.report.options.length > 0) {
                        $scope.UI.type = $scope.report.options[0];
                    }
                    
                    // Initialize appropriate view
                    if ($scope.UI.type === 'spreadsheet') {
                        $timeout(function() {
                            $scope.initSpreadsheet();
                        }, 500);
                    } else if ($scope.UI.type === 'dashboard' && $scope.report.data) {
                        $timeout(function() {
                            $scope.initDashboard();
                        }, 500);
                    }
                }
            )
            .catch(
                function (err) {
                    $scope.UI.reportLoaded = false;
                    $scope.initErrorMessage(err || 'Error loading report');
                }
            );
        };
        $scope.initSpreadsheet = function() {
            try {
                if (!dhxSpreadsheet) {
                    $scope.initErrorMessage('Spreadsheet library not available');
                    return;
                }

                // Check if container exists
                const container = document.getElementById("reportSpreadsheet");
                if (!container) {
                    $scope.initErrorMessage('Spreadsheet container not found');
                    return;
                }

                // Destroy existing spreadsheet if it exists
                if ($scope.spreadsheet) {
                    try {
                        $scope.spreadsheet.destructor();
                    } catch (destroyError) {
                        $scope.initErrorMessage('Error destroying existing spreadsheet.');
                    }
                    $scope.spreadsheet = null;
                }
                // Initialize new spreadsheet with minimal configuration
                $scope.spreadsheet = new dhxSpreadsheet.Spreadsheet("reportSpreadsheet", {
                    menu: false,
                    editLine: false,
                    toolbar: false,
                    selection: false,
                    multiSheets: false,
                });

                // Now try with real data if available first, fallback to test data
                if ($scope.report && $scope.report.data && $scope.report.data.spreadsheetData && $scope.report.data.headers) {
                    const formattedData = $scope.initSpreadsheetData();
                    
                    // Load real data using parse method
                    $scope.spreadsheet.parse(formattedData);
                }

                
            } catch (error) {
                $scope.initErrorMessage('Failed to initialize spreadsheet: ' + error.message);
            }
        };
        $scope.initSpreadsheetData = function() {
            try {
                if (!$scope.report || !$scope.report.data || !$scope.report.data.spreadsheetData || !$scope.report.data.headers) {
                    return [{ cell: "A1", value: "No Data Available" }];
                }

                const headers = $scope.report.data.headers;
                const data = $scope.report.data.spreadsheetData;

                // Create a mapping from headers to actual object keys
                const headerToKeyMap = {};
                if (data.length > 0 && typeof data[0] === 'object') {
                    const sampleRow = data[0];
                    const objectKeys = Object.keys(sampleRow);
                    
                    headers.forEach((header, index) => {
                        // Try exact match first (case insensitive)
                        let matchedKey = objectKeys.find(key => 
                            key.toLowerCase() === header.toLowerCase()
                        );
                        
                        // Try partial match (removing spaces and special chars)
                        if (!matchedKey) {
                            const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
                            matchedKey = objectKeys.find(key => 
                                key.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedHeader
                            );
                        }
                        
                        // Fallback to position-based matching
                        if (!matchedKey && objectKeys[index]) {
                            matchedKey = objectKeys[index];
                        }
                        
                        headerToKeyMap[header] = matchedKey;
                    });
                }

                // Validate headers
                if (!Array.isArray(headers) || headers.length === 0) {
                    return [{ cell: "A1", value: "Invalid Headers" }];
                }

                // Validate data
                if (!Array.isArray(data) || data.length === 0) {
                    // Return only headers
                    return headers.map((header, index) => ({
                        cell: $scope.initColumnLetter(index) + "1",
                        value: String(header || 'Column')
                    }));
                }

                // Create formatted data as array of cell objects (dhtmlx format)
                const formattedData = [];

                // Add headers as first row
                headers.forEach((header, colIndex) => {
                    const cellRef = $scope.initColumnLetter(colIndex) + "1";
                    const cellValue = String(header || 'Column');
                    
                    formattedData.push({
                        cell: cellRef,
                        value: cellValue
                    });
                });

                // Add data rows
                data.forEach((row, rowIndex) => {
                    if (rowIndex >= 999) { // Limit rows to prevent performance issues
                        return;
                    }
                    
                    const actualRowIndex = rowIndex + 2; // Start from row 2 (after headers)
                    
                    headers.forEach((header, colIndex) => {
                        const cellRef = $scope.initColumnLetter(colIndex) + actualRowIndex;
                        let cellValue = '';
                        
                        try {
                            // Get value using the mapped key
                            if (typeof row === 'object' && row !== null && !Array.isArray(row)) {
                                const mappedKey = headerToKeyMap[header];
                                if (mappedKey && row.hasOwnProperty(mappedKey)) {
                                    cellValue = row[mappedKey];
                                } else {
                                    cellValue = '';
                                }
                            } else if (Array.isArray(row)) {
                                cellValue = row[colIndex] || '';
                            } else {
                                cellValue = colIndex === 0 ? row : '';
                            }

                            // Format the value
                            if (cellValue !== null && cellValue !== undefined) {
                                if (typeof cellValue === 'number') {
                                    // Keep numbers as numbers
                                    cellValue = isFinite(cellValue) ? cellValue : 0;
                                } else if (cellValue instanceof Date) {
                                    cellValue = moment(cellValue).format('YYYY-MM-DD');
                                } else if (typeof cellValue === 'boolean') {
                                    cellValue = cellValue ? 'Yes' : 'No';
                                } else {
                                    cellValue = String(cellValue);
                                }
                            } else {
                                cellValue = '';
                            }

                            formattedData.push({
                                cell: cellRef,
                                value: cellValue
                            });

                        } catch (cellError) {
                            formattedData.push({
                                cell: cellRef,
                                value: 'Error'
                            });
                        }
                    });
                });

                return formattedData;

            } catch (error) {
                return [{ cell: "A1", value: "Format Error" }];
            }
        };
        $scope.initColumnLetter = function(index) {
            let letter = '';
            while (index >= 0) {
                letter = String.fromCharCode(65 + (index % 26)) + letter;
                index = Math.floor(index / 26) - 1;
            }
            return letter;
        };
        $scope.initReports = function () {
            $scope.UI.reportsLoaded = false;

            $q.all(
                [
                    $report.getReports(),
                    $report.getReportsTypes()
                ]
            )
            .then(
                function (responses) {
                    $scope.UI.reportsLoaded = true;
                    if (responses[0].err) {
                        $scope.initErrorMessage(responses[0].msg || 'Failed to load reports');
                        return;
                    }
                    $scope.reports = responses[0].reports;
                    $scope.reportTypes = responses[1].reportTypes;
                    $scope.reportType = $scope.reportTypes[0];

                    $timeout(
                        function () {
                            $scope.UI.activeTabIndex = 0;
                            $(document).foundation();
                        }, 500
                    )
                }
            )
            .catch(
                function (err) {
                    $scope.UI.reportsLoaded = false;
                    $scope.initErrorMessage(err || 'Error loading reports');
                }
            );
        };
        $scope.initErrorMessage = function (msg) {
            $scope.UI.errMessage = msg;
            $timeout(function () {
                $scope.UI.errMessage = null;
            }, 5000);
        };
        $scope.initFormSaved = function (msg) {
            $scope.UI.message = msg;
            $timeout(function () {
                $scope.UI.message = null;
            }, 3000);
        };
        $scope.switchTab = function(index) {
            $scope.reportType = $scope.reportTypes[index];
            $scope.UI.activeTabIndex = index;
        };
        $scope.hasOptions = function (option) {
            return $scope.report.options && $scope.report.options.includes(option);
        };
        $scope.refreshSpreadsheet = function() {
            if ($scope.report && $scope.report.id) {
                $scope.UI.reportLoaded = false;
                $report.generateReport({ id: $scope.report.id })
                    .then(function(response) {
                        if (!response.err) {
                            $scope.report.data = response.data;
                            $timeout(function() {
                                $scope.initSpreadsheet();
                                $scope.UI.reportLoaded = true;
                            }, 100);
                        } else {
                            $scope.initErrorMessage('Failed to refresh report data');
                            $scope.UI.reportLoaded = true;
                        }
                    })
                    .catch(function(error) {
                        $scope.initErrorMessage('Error refreshing report data');
                        $scope.UI.reportLoaded = true;
                    });
            }
        };
        $scope.exportSpreadsheet = function() {
            if (!$scope.report || !$scope.report.data || !$scope.report.data.spreadsheetData) {
                $scope.initErrorMessage('No spreadsheet data available to export');
                return;
            }

            try {
                const headers = $scope.report.data.headers || [];
                const data = $scope.report.data.spreadsheetData || [];
                
                // Create CSV content
                let csvContent = headers.join(',') + '\n';
                
                data.forEach(row => {
                    const rowData = [];
                    headers.forEach((header, index) => {
                        let cellValue = '';
                        
                        if (typeof row === 'object' && row !== null) {
                            // Try to find the value by matching header with object keys
                            const key = Object.keys(row).find(k => 
                                k.toLowerCase().replace(/[^a-z0-9]/g, '') === 
                                header.toLowerCase().replace(/[^a-z0-9]/g, '')
                            ) || Object.keys(row)[index];
                            
                            cellValue = row[key];
                        } else if (Array.isArray(row)) {
                            cellValue = row[index];
                        } else {
                            cellValue = row;
                        }

                        // Format the value for CSV
                        if (cellValue !== null && cellValue !== undefined) {
                            if (typeof cellValue === 'string' && cellValue.includes(',')) {
                                cellValue = `"${cellValue.replace(/"/g, '""')}"`;
                            }
                        } else {
                            cellValue = '';
                        }
                        
                        rowData.push(cellValue);
                    });
                    csvContent += rowData.join(',') + '\n';
                });

                // Create and download file
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `${$scope.report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                $scope.initFormSaved('Report exported successfully');
            } catch (error) {
                $scope.initErrorMessage('Failed to export report data');
            }
        };
        $scope.$watch('UI.type', function(newValue, oldValue) {
            if (newValue !== oldValue && $scope.report && $scope.report.data) {

                // Clean up previous view
                if (oldValue === 'spreadsheet' && $scope.spreadsheet) {
                    $scope.spreadsheet.destructor();
                    $scope.spreadsheet = null;
                } else if (oldValue === 'dashboard') {
                    $scope.destroyDashboard();
                }

                // Initialize new view
                $timeout(function() {
                    if (newValue === 'spreadsheet') {
                        $scope.initSpreadsheet();
                    } else if (newValue === 'dashboard') {
                        $scope.initDashboard();
                    }
                }, 100);
            }
        });

        // Clean up on scope destroy
        $scope.$on('$destroy', function() {
            if ($scope.spreadsheet) {
                $scope.spreadsheet.destructor();
                $scope.spreadsheet = null;
            }
            $scope.destroyDashboard();
        });

        // Dashboard Methods
        $scope.shouldShowCharts = function() {
            if (!$scope.report || !$scope.report.data) return false;
            
            // Don't show charts for reports with only notes (unimplemented features)
            if ($scope.report.data.note && Object.keys($scope.report.data).length === 1) return false;
            
            // Show charts for reports with numeric data or time series data
            const hasNumericData = $scope.report.data.summary && 
                Object.values($scope.report.data.summary).some(val => 
                    typeof val === 'number' || (typeof val === 'string' && val.includes('%'))
                );
            
            const hasTimeSeriesData = $scope.report.data.monthlyRevenue || 
                $scope.report.data.monthlyBreakdown;
                
            const hasArrayData = $scope.report.data.spreadsheetData && $scope.report.data.spreadsheetData.length > 0;
            
            const hasOtherNumericFields = Object.values($scope.report.data).some(val => 
                typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)))
            );
            
            return hasNumericData || hasTimeSeriesData || hasArrayData || hasOtherNumericFields;
        };

        $scope.hasGridData = function() {
            if (!$scope.report || !$scope.report.data) return false;
            
            return $scope.report.data.spreadsheetData ||
                   $scope.report.data.clients ||
                   $scope.report.data.monthlyRevenue ||
                   $scope.report.data.monthlyBreakdown;
        };

        $scope.getPrimaryChartTitle = function() {
            if (!$scope.report) return 'Chart';
            
            switch($scope.report.name) {
                case 'MRR/ARR': return 'Monthly Revenue Trend';
                case 'Revenue by Period': return 'Revenue by Month';
                case 'Revenue by Client': return 'Top Clients by Revenue';
                case 'Invoice Aging': return 'Invoice Aging Distribution';
                case 'Active Users': return 'User Activity Trends';
                default: return 'Primary Metrics';
            }
        };

        $scope.getSecondaryChartTitle = function() {
            if (!$scope.report) return 'Chart';
            
            switch($scope.report.name) {
                case 'MRR/ARR': return 'Revenue Distribution';
                case 'Revenue by Client': return 'Client Distribution';
                case 'Invoice Aging': return 'Aging Categories';
                case 'Active Users': return 'User Status';
                default: return 'Secondary Metrics';
            }
        };

        $scope.initDashboard = function() {
            if (!$scope.report || !$scope.report.data) return;

            $timeout(function() {
                $scope.initDashboardCharts();
                $scope.initDashboardGrid();
                $scope.initDashboardList();
            }, 100);
        };

        $scope.initDashboardCharts = function() {
            try {
                // Initialize primary chart
                if (document.getElementById('primaryChart')) {
                    const primaryData = $scope.getPrimaryChartData();
                    const chartType = $scope.getPrimaryChartType();
                    let chartConfig = {
                        type: chartType,
                        css: 'dhx_widget--bordered'
                    };
                    if (chartType === 'line' || chartType === 'bar') {
                        chartConfig.series = [
                            {
                                value: "value",
                                color: "#394E79"
                            }
                        ];
                        if (primaryData.length > 0) {
                            const firstItem = primaryData[0];
                            // Determine x-axis field for locator
                            let xField;
                            if (firstItem.month) {
                                xField = "month";
                            } else if (firstItem.client) {
                                xField = "client";
                            } else if (firstItem.category) {
                                xField = "category";
                            } else {
                                xField = "text";
                            }
                            // Assign x locator to series
                            chartConfig.series[0].x = xField;
                            // Compute max value for left scale
                            let maxValue = Math.max(0, ...primaryData.map(item => isFinite(item.value) ? item.value : 0));
                            chartConfig.scales = {
                                bottom: { text: xField },
                                left: { max: maxValue * 1.1 }
                            };
                        }
                    } else if (chartType === 'pie' || chartType === 'donut') {
                        chartConfig.series = [
                            {
                                value: "value",
                                text: "text"
                            }
                        ];
                    }
                    $scope.primaryChart = new dhxSuite.Chart('primaryChart', chartConfig);
                    if (primaryData && primaryData.length > 0) {
                        $scope.primaryChart.data.parse(primaryData);
                    }
                }
                // Initialize secondary chart  
                if (document.getElementById('secondaryChart')) {
                    const secondaryData = $scope.getSecondaryChartData();
                    const chartType = $scope.getSecondaryChartType();
                    let chartConfig = {
                        type: chartType,
                        css: 'dhx_widget--bordered'
                    };
                    if (chartType === 'pie' || chartType === 'donut') {
                        chartConfig.series = [
                            {
                                value: "value",
                                text: "text"
                            }
                        ];
                    } else {
                        chartConfig.series = [
                            {
                                value: "value",
                                color: "#FF5722"
                            }
                        ];
                        if (secondaryData.length > 0) {
                            let maxValue = Math.max(0, ...secondaryData.map(item => isFinite(item.value) ? item.value : 0));
                            chartConfig.scales = {
                                left: {
                                    max: maxValue * 1.1
                                }
                            };
                        }
                    }
                    $scope.secondaryChart = new dhxSuite.Chart('secondaryChart', chartConfig);
                    if (secondaryData && secondaryData.length > 0) {
                        $scope.secondaryChart.data.parse(secondaryData);
                    }
                }
            } catch (error) {
                console.error('Error initializing dashboard charts:', error);
                console.error('Error stack:', error.stack);
            }
        };

        $scope.getPrimaryChartType = function() {
            switch($scope.report.name) {
                case 'MRR/ARR':
                case 'Revenue by Period':
                    return 'line';
                case 'Revenue by Client':
                    return 'bar';
                case 'Invoice Aging':
                    return 'bar';
                default:
                    return 'bar';
            }
        };

        $scope.getSecondaryChartType = function() {
            switch($scope.report.name) {
                case 'MRR/ARR':
                case 'Revenue by Client':
                case 'Invoice Aging':
                case 'Active Users':
                    return 'pie';
                default:
                    return 'donut';
            }
        };

        $scope.getPrimaryChartData = function() {
            if (!$scope.report || !$scope.report.data) {
                return [];
            }
            let result = [];
            switch($scope.report.name) {
                case 'MRR/ARR':
                    result = $scope.report.data.monthlyBreakdown ? 
                        $scope.report.data.monthlyBreakdown.map(item => ({
                            month: item.monthName,
                            revenue: Number(item.revenue) || 0,
                            value: Number(item.revenue) || 0,
                            text: item.monthName
                        })) : [];
                    break;
                case 'Revenue by Period':
                    result = $scope.report.data.monthlyRevenue ? 
                        $scope.report.data.monthlyRevenue.map(item => ({
                            month: item.monthName,
                            revenue: Number(item.revenue) || 0,
                            value: Number(item.revenue) || 0,
                            text: item.monthName
                        })) : [];
                    break;
                case 'Revenue by Client':
                    result = $scope.report.data.spreadsheetData ? 
                        $scope.report.data.spreadsheetData.slice(0, 10).map(item => ({
                            client: item.clientFullName || item.clientFirstName || item.firstName,
                            revenue: Number(item.totalRevenue) || 0,
                            value: Number(item.totalRevenue) || 0,
                            text: item.clientFullName || item.clientFirstName || item.firstName
                        })) : [];
                    break;
                case 'Invoice Aging':
                    if ($scope.report.data.summary) {
                        result = [
                            { category: 'Current', count: Number($scope.report.data.summary.current) || 0, value: Number($scope.report.data.summary.current) || 0, text: 'Current' },
                            { category: '30-60 Days', count: Number($scope.report.data.summary.thirtyDays) || 0, value: Number($scope.report.data.summary.thirtyDays) || 0, text: '30-60 Days' },
                            { category: '60-90 Days', count: Number($scope.report.data.summary.sixtyDays) || 0, value: Number($scope.report.data.summary.sixtyDays) || 0, text: '60-90 Days' },
                            { category: '90+ Days', count: Number($scope.report.data.summary.ninetyDaysPlus) || 0, value: Number($scope.report.data.summary.ninetyDaysPlus) || 0, text: '90+ Days' }
                        ];
                    } else {
                        result = [];
                    }
                    break;
                case 'Event/Job Schedule':
                    result = $scope.report.data.spreadsheetData ? 
                        $scope.report.data.spreadsheetData.slice(0, 10).map(item => ({
                            event: item.title || 'Event',
                            days: Number(item.daysUntilStart) || 0,
                            value: Number(item.daysUntilStart) || 0,
                            text: item.title || 'Event'
                        })) : [];
                    break;
                case 'New Clients':
                    result = $scope.report.data.clients ? 
                        $scope.report.data.clients.slice(0, 10).map((client, index) => ({
                            client: client.fullName || `${client.firstName} ${client.lastName}`,
                            order: index + 1,
                            value: index + 1,
                            text: client.fullName || `${client.firstName} ${client.lastName}`
                        })) : [];
                    break;
                case 'Client List with Activity':
                    result = $scope.report.data.spreadsheetData ? 
                        $scope.report.data.spreadsheetData.slice(0, 10).map(item => ({
                            client: item.clientFullName || item.fullName,
                            revenue: Number(item.totalRevenue) || 0,
                            value: Number(item.totalRevenue) || 0,
                            text: item.clientFullName || item.fullName
                        })) : [];
                    break;
                case 'Notification Log':
                    if ($scope.report.data.spreadsheetData) {
                        const notificationTypes = {};
                        $scope.report.data.spreadsheetData.forEach(item => {
                            notificationTypes[item.type] = (notificationTypes[item.type] || 0) + 1;
                        });
                        result = Object.entries(notificationTypes).map(([type, count]) => ({
                            type: type,
                            count: Number(count) || 0,
                            value: Number(count) || 0,
                            text: type
                        }));
                    } else {
                        result = [];
                    }
                    break;
                default:
                    if ($scope.report.data.summary) {
                        result = Object.entries($scope.report.data.summary)
                            .filter(([key, value]) => typeof value === 'number')
                            .map(([key, value]) => ({
                                metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                                value: Number(value) || 0,
                                text: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                            }));
                    } else {
                        result = [];
                    }
                    break;
            }
            return result;
        };

        $scope.getSecondaryChartData = function() {
            if (!$scope.report || !$scope.report.data) {
                return [];
            }
            let result = [];
            switch($scope.report.name) {
                case 'Active Users':
                    if ($scope.report.data.summary) {
                        result = [
                            { status: 'Inactive', count: Number($scope.report.data.summary.totalUsers - $scope.report.data.summary.activeUsers) || 0, value: Number($scope.report.data.summary.totalUsers - $scope.report.data.summary.activeUsers) || 0, text: 'Inactive' }
                        ];
                    } else {
                        result = [];
                    }
                    break;
                case 'Invoice Aging':
                    result = $scope.getPrimaryChartData();
                    break;
                case 'Revenue by Client':
                    result = $scope.report.data.spreadsheetData ? 
                        $scope.report.data.spreadsheetData.slice(0, 5).map(item => ({
                            client: item.clientFullName || item.clientFirstName || item.firstName,
                            revenue: Number(item.totalRevenue) || 0,
                            value: Number(item.totalRevenue) || 0,
                            text: item.clientFullName || item.clientFirstName || item.firstName
                        })) : [];
                    break;
                case 'Client Summary Report':
                    if ($scope.report.data) {
                        result = [
                            { status: 'Active', count: Number($scope.report.data.activeClients) || 0, value: Number($scope.report.data.activeClients) || 0, text: 'Active' },
                            { status: 'Inactive', count: Number($scope.report.data.inactiveClients) || 0, value: Number($scope.report.data.inactiveClients) || 0, text: 'Inactive' }
                        ];
                    } else {
                        result = [];
                    }
                    break;
                case 'Invoice Summary Report':
                    if ($scope.report.data) {
                        result = [
                            { status: 'Active', count: Number($scope.report.data.activeInvoices) || 0, value: Number($scope.report.data.activeInvoices) || 0, text: 'Active' },
                            { status: 'Inactive', count: Number($scope.report.data.inactiveInvoices) || 0, value: Number($scope.report.data.inactiveInvoices) || 0, text: 'Inactive' }
                        ];
                    } else {
                        result = [];
                    }
                    break;
                default:
                    if ($scope.report.data && $scope.report.data.summary) {
                        const summaryEntries = Object.entries($scope.report.data.summary)
                            .filter(([key, value]) => typeof value === 'number')
                            .slice(0, 5);
                        result = summaryEntries.map(([key, value]) => ({
                            metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                            value: Number(value) || 0,
                            text: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                        }));
                    } else {
                        result = [];
                    }
                    break;
            }
            return result;
        };

        $scope.initDashboardGrid = function() {
            try {
                if (!document.getElementById('dataGrid')) return;
                if ($scope.dataGrid) {
                    $scope.dataGrid.destructor();
                }
                let gridData = [];
                let columns = [];
                if ($scope.report.data.spreadsheetData && $scope.report.data.spreadsheetData.length > 0) {
                    columns = $scope.report.data.headers ? 
                        $scope.report.data.headers.map(header => ({
                            id: header.toLowerCase().replace(/[^a-z0-9]/g, ''),
                            header: header,
                            width: 150,
                            resizable: true,
                            sortable: true
                        })) : [];
                    gridData = $scope.report.data.spreadsheetData.slice(0, 100).map((row, index) => {
                        const gridRow = { id: index };
                        if ($scope.report.data.headers) {
                            $scope.report.data.headers.forEach((header, headerIndex) => {
                                const fieldId = header.toLowerCase().replace(/[^a-z0-9]/g, '');
                                if (typeof row === 'object' && row !== null) {
                                    const key = Object.keys(row).find(k => 
                                        k.toLowerCase().replace(/[^a-z0-9]/g, '') === 
                                        header.toLowerCase().replace(/[^a-z0-9]/g, '')
                                    ) || Object.keys(row)[headerIndex];
                                    gridRow[fieldId] = row[key] || '';
                                } else if (Array.isArray(row)) {
                                    gridRow[fieldId] = row[headerIndex] || '';
                                } else {
                                    gridRow[fieldId] = headerIndex === 0 ? row : '';
                                }
                            });
                        }
                        return gridRow;
                    });
                } else if ($scope.report.data.clients && Array.isArray($scope.report.data.clients)) {
                    columns = [
                        { id: 'id', header: 'ID', width: 80, resizable: true, sortable: true },
                        { id: 'firstName', header: 'First Name', width: 120, resizable: true, sortable: true },
                        { id: 'lastName', header: 'Last Name', width: 120, resizable: true, sortable: true },
                        { id: 'companyName', header: 'Company', width: 150, resizable: true, sortable: true },
                        { id: 'createdAt', header: 'Created', width: 150, resizable: true, sortable: true }
                    ];
                    gridData = $scope.report.data.clients.map((client, index) => ({
                        id: index,
                        ...client
                    }));
                } else if ($scope.report.data.monthlyRevenue && Array.isArray($scope.report.data.monthlyRevenue)) {
                    columns = [
                        { id: 'month', header: 'Month', width: 100, resizable: true, sortable: true },
                        { id: 'monthName', header: 'Month Name', width: 120, resizable: true, sortable: true },
                        { id: 'revenue', header: 'Revenue', width: 120, resizable: true, sortable: true }
                    ];
                    gridData = $scope.report.data.monthlyRevenue.map((item, index) => ({
                        id: index,
                        ...item
                    }));
                } else if ($scope.report.data.monthlyBreakdown && Array.isArray($scope.report.data.monthlyBreakdown)) {
                    columns = [
                        { id: 'month', header: 'Month', width: 100, resizable: true, sortable: true },
                        { id: 'monthName', header: 'Month Name', width: 120, resizable: true, sortable: true },
                        { id: 'year', header: 'Year', width: 80, resizable: true, sortable: true },
                        { id: 'revenue', header: 'Revenue', width: 120, resizable: true, sortable: true }
                    ];
                    gridData = $scope.report.data.monthlyBreakdown.map((item, index) => ({
                        id: index,
                        ...item
                    }));
                }
                if (gridData.length > 0 && columns.length > 0) {
                    $scope.dataGrid = new dhxSuite.Grid('dataGrid', {
                        columns: columns,
                        resizable: true,
                        sortable: true,
                        selection: 'row',
                        css: 'dhx_widget--bordered'
                    });
                    $scope.dataGrid.data.parse(gridData);
                }
            } catch (error) {
                console.error('Error initializing dashboard grid:', error);
            }
        };

        $scope.initDashboardList = function() {
            try {
                if (!document.getElementById('detailsList')) return;
                if ($scope.detailsList) {
                    $scope.detailsList.destructor();
                }
                const listData = $scope.getDetailsListData();
                $scope.detailsList = new dhxSuite.List('detailsList', {
                    css: 'dhx_widget--bordered',
                    template: $scope.getDetailsListTemplate()
                });
                if (listData && listData.length > 0) {
                    $scope.detailsList.data.parse(listData);
                }
            } catch (error) {
                console.error('Error initializing dashboard list:', error);
            }
        };

        // --- ADDED: Details List Data and Template Functions ---
        $scope.getDetailsListData = function() {
            if (!$scope.report || !$scope.report.data) return [];
            let data = [];
            // Try to use spreadsheetData, clients, or summary as fallback
            if (Array.isArray($scope.report.data.spreadsheetData) && $scope.report.data.spreadsheetData.length > 0) {
                data = $scope.report.data.spreadsheetData.slice(0, 20).map(item => {
                    // Try to extract a label and value
                    let label = item.clientFullName || item.clientFirstName || item.firstName || item.title || item.type || item.metric || item.status || item.category || item.monthName || item.month || 'Item';
                    let value = Number(item.totalRevenue) || Number(item.value) || Number(item.count) || Number(item.revenue) || 0;
                    if (!isFinite(value)) value = 0;
                    return {
                        label: label,
                        value: value
                    };
                });
            } else if (Array.isArray($scope.report.data.clients) && $scope.report.data.clients.length > 0) {
                data = $scope.report.data.clients.slice(0, 20).map(client => {
                    let label = client.fullName || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client';
                    return {
                        label: label,
                        value: 1 // Just a placeholder, as there's no numeric value
                    };
                });
            } else if ($scope.report.data.summary && typeof $scope.report.data.summary === 'object') {
                data = Object.entries($scope.report.data.summary).map(([key, value]) => ({
                    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                    value: Number(value) || 0
                })).filter(item => isFinite(item.value));
            }
            // Fallback: empty array
            return Array.isArray(data) ? data.filter(item => typeof item.value === 'number' && isFinite(item.value)) : [];
        };

        // Returns a template for the dashboard details list
        $scope.getDetailsListTemplate = function() {
            // Simple template: label left, value right
            return function(item) {
                return `<div style='display:flex;justify-content:space-between;align-items:center;width:100%'>
                    <span>${item.label || ''}</span>
                    <span style='font-weight:bold'>${typeof item.value === 'number' && isFinite(item.value) ? item.value : ''}</span>
                </div>`;
            };
        };

        // Cleans up dashboard resources (charts, grids, lists)
        $scope.destroyDashboard = function() {
            try {
                if ($scope.primaryChart) {
                    $scope.primaryChart.destructor();
                    $scope.primaryChart = null;
                }
                if ($scope.secondaryChart) {
                    $scope.secondaryChart.destructor();
                    $scope.secondaryChart = null;
                }
                if ($scope.dataGrid) {
                    $scope.dataGrid.destructor();
                    $scope.dataGrid = null;
                }
                if ($scope.detailsList) {
                    $scope.detailsList.destructor();
                    $scope.detailsList = null;
                }
            } catch (error) {
                console.error('Error destroying dashboard resources:', error);
            }
        };

        // Update sanitizeWidgetData to ensure compatibility with dhtmlx expectations
        const sanitizeWidgetData = arr => {
            if (!Array.isArray(arr)) return [];
            return arr
                .map(item => {
                    const { _xLocator, ...rest } = item;
                    return rest;
                })
                .filter(item => typeof item.value === 'number' && isFinite(item.value));
        };

        // Update ensureWidgetDataStructure to validate data structure
        const ensureWidgetDataStructure = arr => {
            if (!Array.isArray(arr)) return [];
            return arr.map(item => {
                const { _xLocator, ...rest } = item;
                return {
                    ...rest,
                    value: typeof rest.value === 'number' && isFinite(rest.value) ? rest.value : 0,
                    text: rest.text || ''
                };
            });
        };

        // Apply these functions to widget data
        const origGetPrimaryChartData = $scope.getPrimaryChartData;
        $scope.getPrimaryChartData = function() {
            const originalData = origGetPrimaryChartData.call($scope);
            return ensureWidgetDataStructure(sanitizeWidgetData(originalData));
        };

        const origGetSecondaryChartData = $scope.getSecondaryChartData;
        $scope.getSecondaryChartData = function() {
            const originalData = origGetSecondaryChartData.call($scope);
            return ensureWidgetDataStructure(sanitizeWidgetData(originalData));
        };
    })
});
