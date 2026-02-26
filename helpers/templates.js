const fs = require('fs');
const path = require('path');

/**
 * Template management helper
 * Centralizes template reading logic while keeping templates as static files
 */
class TemplateManager {
    constructor() {
        this.templateCache = new Map();
        this.templatesPath = path.join(__dirname, '../public/partials/templates');
    }

    /**
     * Read a template file
     * @param {string} templatePath - Relative path from templates directory
     * @param {boolean} useCache - Whether to cache the template content
     * @returns {string} Template content
     */
    readTemplate(templatePath, useCache = false) {
        if (useCache && this.templateCache.has(templatePath)) {
            return this.templateCache.get(templatePath);
        }

        const fullPath = path.join(this.templatesPath, templatePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        if (useCache) {
            this.templateCache.set(templatePath, content);
        }

        return content;
    }

    /**
     * Get paystub template for PDF generation
     * @returns {string} Paystub template content
     */
    getPaystubTemplate() {
        return this.readTemplate('payroll/paystub.html');
    }

    /**
     * Get email template
     * @param {string} templateName - Email template name
     * @returns {string} Email template content
     */
    getEmailTemplate(templateName) {
        return this.readTemplate(`emails/${templateName}.html`);
    }

    /**
     * Clear template cache
     */
    clearCache() {
        this.templateCache.clear();
    }
}

module.exports = new TemplateManager();
