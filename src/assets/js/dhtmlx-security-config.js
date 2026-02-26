/**
 * DHTMLX Third-Party Cookie Prevention Configuration
 * 
 * This file prevents dhtmlx components from making external requests
 * to dhtmlx.com domains that could set third-party cookies.
 */

// Prevent external export services for DHTMLX components
(function() {
    'use strict';
    
    // Configuration to disable external exports
    const disableExternalExports = function() {
        
        // Disable scheduler export to external service
        if (typeof scheduler !== 'undefined' && scheduler.config) {
            scheduler.config.export_url = null;
            scheduler.config.export_server = null;
            
            // Override export methods to prevent external requests
            if (scheduler.exportToPNG) {
                scheduler.exportToPNG = function() {
                    console.warn('External PNG export disabled for security. Use local export solution.');
                    return false;
                };
            }
            
            if (scheduler.exportToPDF) {
                scheduler.exportToPDF = function() {
                    console.warn('External PDF export disabled for security. Use local export solution.');
                    return false;
                };
            }
        }
        
        // Disable diagram export to external service
        if (typeof dhtmlx !== 'undefined' && dhtmlx.diagram) {
            // Override diagram export methods
            const originalDiagramExport = dhtmlx.diagram.prototype.export;
            if (originalDiagramExport) {
                dhtmlx.diagram.prototype.export = function() {
                    console.warn('External diagram export disabled for security. Use local export solution.');
                    return false;
                };
            }
        }
        
        // Disable any dhtmlx global export configurations
        if (typeof dhtmlx !== 'undefined' && dhtmlx.config) {
            dhtmlx.config.exportUrl = null;
            dhtmlx.config.export_url = null;
        }
        
        // Block any attempts to load external dhtmlx resources
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            if (typeof url === 'string' && 
                (url.includes('dhtmlx.com') || 
                 url.includes('snippet.dhtmlx.com') || 
                 url.includes('export.dhtmlx.com'))) {
                console.warn('Blocked external request to dhtmlx domain:', url);
                return Promise.reject(new Error('External dhtmlx requests blocked for security'));
            }
            return originalFetch.apply(this, arguments);
        };
        
        // Block XMLHttpRequest to dhtmlx domains
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (typeof url === 'string' && 
                (url.includes('dhtmlx.com') || 
                 url.includes('snippet.dhtmlx.com') || 
                 url.includes('export.dhtmlx.com'))) {
                console.warn('Blocked XMLHttpRequest to dhtmlx domain:', url);
                throw new Error('External dhtmlx requests blocked for security');
            }
            return originalXHROpen.apply(this, arguments);
        };
    };
    
    // Apply configuration when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', disableExternalExports);
    } else {
        disableExternalExports();
    }
    
    // Also apply when dhtmlx libraries are loaded
    const checkAndDisable = function() {
        disableExternalExports();
    };
    
    // Check periodically for dhtmlx objects
    const interval = setInterval(function() {
        if (typeof scheduler !== 'undefined' || typeof dhtmlx !== 'undefined') {
            checkAndDisable();
            clearInterval(interval);
        }
    }, 100);
    
    // Clear interval after 10 seconds to prevent indefinite checking
    setTimeout(function() {
        clearInterval(interval);
    }, 10000);
    
})();
