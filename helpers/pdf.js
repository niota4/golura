const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Convert HTML to PDF using Puppeteer
 * @param {string} html - The HTML content to convert
 * @param {string} filename - The filename for the PDF (optional)
 * @returns {Promise<string>} - Path to the generated PDF file
 */
const htmlToPdf = async (html, filename = 'document.pdf') => {
    let browser;
    
    try {
        // Launch puppeteer browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set the content
        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });
        
        // Generate PDF path
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const pdfPath = path.join(uploadsDir, filename);
        
        // Generate PDF with proper formatting
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in'
            }
        });
        
        return pdfPath;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

/**
 * Generate paystub PDF from HTML template and data
 * @param {string} template - The HTML template content
 * @param {Object} payStubData - The paystub data
 * @param {Object} company - The company data
 * @param {string} filename - The filename for the PDF
 * @returns {Promise<string>} - Path to the generated PDF file
 */
const generatePaystubPdf = async (template, payStubData, company, filename) => {
    try {

        
        // Set company theme colors as CSS variables in the template
        var primaryColor = (company && company.primaryColor) ? company.primaryColor : '#3f3faa';
        var secondaryColor = (company && company.secondaryColor) ? company.secondaryColor : '#495057';
        var cssVars = `<style data-company-theme>:root {\n  --primary-color: ${primaryColor};\n  --secondary-color: ${secondaryColor};\n}</style>`;
        
        // Add the CSS variables to the head of the template
        var htmlContent = template.replace('</head>', cssVars + '\n</head>');

        // Format dates for display
        var formatDate = function(dateStr) {
            if (!dateStr) return 'N/A';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        };
        // Format phone as (123) 456-7890
        var formatPhoneNumber = function(phone) {
            if (!phone) return '';
            var cleaned = ('' + phone).replace(/\D/g, '');
            if (cleaned.length === 10) {
                return '(' + cleaned.slice(0,3) + ') ' + cleaned.slice(3,6) + '-' + cleaned.slice(6);
            }
            return phone;
        };

        // Build complete deduction section HTML programmatically
        var deductionSectionHtml = '';
        
        if (payStubData.PayrollDeductions && payStubData.PayrollDeductions.length > 0) {
            // Calculate totals first
            var totalDeductionsAmount = 0;
            var totalDeductionsYTDAmount = 0;
            
            payStubData.PayrollDeductions.forEach(function(deduction) {
                var currentValue = parseFloat(deduction.value || 0);
                var ytdValue = parseFloat(deduction.ytdAmount || deduction.value * 2);
                totalDeductionsAmount += currentValue;
                totalDeductionsYTDAmount += ytdValue;
            });
            
            // Build the complete section HTML
            deductionSectionHtml = '\n                                            <div class="section-title" style="font-family: \'Poppins\', Arial, sans-serif;">\n' +
                                  '                                                Deductions\n' +
                                  '                                            </div>\n' +
                                  '                                            <table class="paystub-table" style="font-family: \'Poppins\', Arial, sans-serif; font-size: 14px;">\n' +
                                  '                                                <thead>\n' +
                                  '                                                    <tr>\n' +
                                  '                                                        <th>Description</th>\n' +
                                  '                                                        <th class="text-right">Type</th>\n' +
                                  '                                                        <th class="text-right">Current</th>\n' +
                                  '                                                        <th class="text-right">YTD</th>\n' +
                                  '                                                    </tr>\n' +
                                  '                                                </thead>\n' +
                                  '                                                <tbody>\n';
            
            // Add each deduction row
            payStubData.PayrollDeductions.forEach(function(deduction, index) {
                
                var name = deduction.name || '';
                var type = deduction.type || '';
                var currentValue = parseFloat(deduction.value || 0).toFixed(2);
                var ytdValue = parseFloat(deduction.ytdAmount || deduction.value * 2).toFixed(2);
                
                deductionSectionHtml += '                                                    <tr>\n' +
                                       '                                                        <td>' + name + '</td>\n' +
                                       '                                                        <td class="text-right">' + type + '</td>\n' +
                                       '                                                        <td class="text-right">$' + currentValue + '</td>\n' +
                                       '                                                        <td class="text-right">$' + ytdValue + '</td>\n' +
                                       '                                                    </tr>\n';
            });
            
            // Add the totals row
            deductionSectionHtml += '                                                    <tr class="paystub-total">\n' +
                                   '                                                        <td colspan="2"><strong>Total Deductions</strong></td>\n' +
                                   '                                                        <td class="text-right"><strong>$' + totalDeductionsAmount.toFixed(2) + '</strong></td>\n' +
                                   '                                                        <td class="text-right"><strong>$' + totalDeductionsYTDAmount.toFixed(2) + '</strong></td>\n' +
                                   '                                                    </tr>\n' +
                                   '                                                </tbody>\n' +
                                   '                                            </table>\n';
            
        }
        
        // Replace the entire {{#if PayrollDeductions}} block with our complete HTML section
        htmlContent = htmlContent.replace(/\{\{#if\s+PayrollDeductions\}\}[\s\S]*?\{\{\/if\}\}/g, deductionSectionHtml);

        // Clean up any remaining template variables
        htmlContent = htmlContent.replace(/\{\{this\\.name\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{this\\.type\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{this\\.value\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{this\\.ytdAmount[^}]*\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{totalDeductions[^}]*\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{totalDeductionsYTD[^}]*\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{employee\.firstName\}\}/g, payStubData.Employee.firstName || '');
        htmlContent = htmlContent.replace(/\{\{employee\.lastName\}\}/g, payStubData.Employee.lastName || '');
        htmlContent = htmlContent.replace(/\{\{employee\.email\}\}/g, payStubData.Employee.email || '');
        htmlContent = htmlContent.replace(/\{\{employee\.phoneNumber\}\}/g, formatPhoneNumber(payStubData.Employee.phoneNumber || ''));
        htmlContent = htmlContent.replace(/\{\{payroll\.startDate\}\}/g, formatDate(payStubData.Payroll.startDate));
        htmlContent = htmlContent.replace(/\{\{payroll\.endDate\}\}/g, formatDate(payStubData.Payroll.endDate));
        htmlContent = htmlContent.replace(/\{\{payroll\.payDate\}\}/g, formatDate(payStubData.Payroll.processDate || payStubData.Payroll.processedDate || payStubData.Payroll.approvedAt));
        htmlContent = htmlContent.replace(/\{\{payroll\.processDate\}\}/g, formatDate(payStubData.Payroll.processDate || payStubData.Payroll.processedDate || payStubData.Payroll.approvedAt));
        htmlContent = htmlContent.replace(/\{\{payroll\.payrollNumber\}\}/g, payStubData.Payroll.payrollNumber || 'N/A');
        htmlContent = htmlContent.replace(/\{\{payrollItem\.payrollNumber(\s*\|\|\s*'[^']*')?\}\}/g, payStubData.Payroll.payrollNumber || 'N/A');
        htmlContent = htmlContent.replace(/\{\{payrollItem\.regularHours(\s*\|\|\s*'[^']*')?\}\}/g, payStubData.regularHours || '0.00');
        htmlContent = htmlContent.replace(/\{\{payrollItem\.overtimeHours(\s*\|\|\s*'[^']*')?\}\}/g, payStubData.overtimeHours || '0.00');
        htmlContent = htmlContent.replace(/\{\{payrollItem\.totalHours(\s*\|\|\s*'[^']*')?\}\}/g, payStubData.totalHours || '0.00');
        htmlContent = htmlContent.replace(/\{\{payrollItem\.hourlyRate(\s*\|\|\s*'[^']*')?\}\}/g, payStubData.rate || '0.00');
        htmlContent = htmlContent.replace(/\{\{payrollItem\.rate(\s*\|\|\s*'[^']*')?\}\}/g, payStubData.rate || '0.00');
        htmlContent = htmlContent.replace(/\{\{payrollItem\.overtimeRate(\s*\|\|\s*'[^']*')?\}\}/g, payStubData.overtimeRate || '0.00');
        htmlContent = htmlContent.replace(/\{\{payrollItem\.grossPay(\s*\|\|\s*'[^']*')?\}\}/g, payStubData.grossPay || '0.00');
        htmlContent = htmlContent.replace(/\{\{payrollItem\.netPay(\s*\|\|\s*'[^']*')?\}\}/g, payStubData.netPay || '0.00');
        htmlContent = htmlContent.replace(/\{\{payrollItem\.checkNumber(\s*\|\|\s*'[^']*')?\}\}/g, payStubData.checkNumber || 'N/A');
        
        // Calculate pay values using root level data
        const regularHours = parseFloat(payStubData.regularHours || 0);
        const overtimeHours = parseFloat(payStubData.overtimeHours || 0);
        const rate = parseFloat(payStubData.rate || 0);
        const overtimeRate = parseFloat(payStubData.overtimeRate || 0);
        const regularPay = (regularHours * rate).toFixed(2);
        const overtimePay = (overtimeHours * overtimeRate).toFixed(2);
        
        htmlContent = htmlContent.replace(/\{\{payrollItem\.regularPay(\s*\|\|\s*'[^']*')?\}\}/g, regularPay);
        htmlContent = htmlContent.replace(/\{\{payrollItem\.overtimePay(\s*\|\|\s*'[^']*')?\}\}/g, overtimePay);
        
        // YTD fields (using same values for demo) - calculate using root level data
        const regularPayYTD = (regularHours * rate * 2).toFixed(2);
        const overtimePayYTD = (overtimeHours * overtimeRate * 2).toFixed(2);
        const grossPayYTD = (parseFloat(payStubData.grossPay || 0) * 2).toFixed(2);
        const netPayYTD = (parseFloat(payStubData.netPay || 0) * 2).toFixed(2);
        
        htmlContent = htmlContent.replace(/\{\{payrollItem\.regularPayYTD(\s*\|\|\s*'[^']*')?\}\}/g, regularPayYTD);
        htmlContent = htmlContent.replace(/\{\{payrollItem\.overtimePayYTD(\s*\|\|\s*'[^']*')?\}\}/g, overtimePayYTD);
        htmlContent = htmlContent.replace(/\{\{payrollItem\.grossPayYTD(\s*\|\|\s*'[^']*')?\}\}/g, grossPayYTD);
        htmlContent = htmlContent.replace(/\{\{payrollItem\.netPayYTD(\s*\|\|\s*'[^']*')?\}\}/g, netPayYTD);
        htmlContent = htmlContent.replace(/\{\{payrollItem\.bonusPayYTD(\s*\|\|\s*'[^']*')?\}\}/g, '0.00');
        htmlContent = htmlContent.replace(/\{\{payrollItem\.commissionPayYTD(\s*\|\|\s*'[^']*')?\}\}/g, '0.00');

        // Tax information (using calculated values from root level data)
        const grossPay = parseFloat(payStubData.grossPay || 0);
        var calculatedTaxes = {
            federal: (grossPay * 0.12).toFixed(2),
            state: (grossPay * 0.05).toFixed(2),
            socialSecurity: (grossPay * 0.062).toFixed(2),
            medicare: (grossPay * 0.0145).toFixed(2)
        };
        
        htmlContent = htmlContent.replace(/\{\{payrollItem\.federalTax(\s*\|\|\s*'[^']*')?\}\}/g, calculatedTaxes.federal);
        htmlContent = htmlContent.replace(/\{\{payrollItem\.stateTax(\s*\|\|\s*'[^']*')?\}\}/g, calculatedTaxes.state);
        htmlContent = htmlContent.replace(/\{\{payrollItem\.socialSecurityTax(\s*\|\|\s*'[^']*')?\}\}/g, calculatedTaxes.socialSecurity);
        htmlContent = htmlContent.replace(/\{\{payrollItem\.medicareTax(\s*\|\|\s*'[^']*')?\}\}/g, calculatedTaxes.medicare);
        
        // YTD tax calculations
        htmlContent = htmlContent.replace(/\{\{payrollItem\.federalTaxYTD(\s*\|\|\s*'[^']*')?\}\}/g, (parseFloat(calculatedTaxes.federal) * 2).toFixed(2));
        htmlContent = htmlContent.replace(/\{\{payrollItem\.stateTaxYTD(\s*\|\|\s*'[^']*')?\}\}/g, (parseFloat(calculatedTaxes.state) * 2).toFixed(2));
        htmlContent = htmlContent.replace(/\{\{payrollItem\.socialSecurityTaxYTD(\s*\|\|\s*'[^']*')?\}\}/g, (parseFloat(calculatedTaxes.socialSecurity) * 2).toFixed(2));
        htmlContent = htmlContent.replace(/\{\{payrollItem\.medicareTaxYTD(\s*\|\|\s*'[^']*')?\}\}/g, (parseFloat(calculatedTaxes.medicare) * 2).toFixed(2));

        // Calculate total taxes
        var totalTaxes = (parseFloat(calculatedTaxes.federal) + parseFloat(calculatedTaxes.state) + parseFloat(calculatedTaxes.socialSecurity) + parseFloat(calculatedTaxes.medicare)).toFixed(2);
        htmlContent = htmlContent.replace(/\{\{totalTaxes(\s*\|\|\s*'[^']*')?\}\}/g, totalTaxes);
        htmlContent = htmlContent.replace(/\{\{totalTaxesYTD(\s*\|\|\s*'[^']*')?\}\}/g, (parseFloat(totalTaxes) * 2).toFixed(2));

        // Employee credentials (if available)
        if (payStubData.Employee && payStubData.Employee.Credentials) {
            var creds = payStubData.Employee.Credentials;
            htmlContent = htmlContent.replace(/\{\{employee\.Credentials\.ssnLastFour\}\}/g, creds.ssn ? creds.ssn.slice(-4) : '');
            htmlContent = htmlContent.replace(/\{\{employee\.Credentials\.dateOfBirth\}\}/g, formatDate(creds.birthDate));
            htmlContent = htmlContent.replace(/\{\{employee\.Credentials\.address\}\}/g, creds.street1 || '');
            htmlContent = htmlContent.replace(/\{\{employee\.Credentials\.city\}\}/g, creds.city || '');
            htmlContent = htmlContent.replace(/\{\{employee\.Credentials\.zipCode\}\}/g, creds.zipCode || '');
            htmlContent = htmlContent.replace(/\{\{employee\.Credentials\.State\.abbreviation\}\}/g, 'SC');
        }

        // Company information
        if (company) {
            htmlContent = htmlContent.replace(/\{\{companyLogo\}\}/g, company.logoUrl || '');
            htmlContent = htmlContent.replace(/\{\{companyName\}\}/g, company.name || '');
        }

        // Current date and other placeholders
        htmlContent = htmlContent.replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
        htmlContent = htmlContent.replace(/\{\{department\}\}/g, 'General');

        // Generate PDF
        return await htmlToPdf(htmlContent, filename);
        
    } catch (error) {
        console.error('Error generating paystub PDF:', error);
        throw error;
    }
};
const generateEstimatePdf = async (template, estimateData, company, filename) => {
    try {
        // Set company theme colors as CSS variables in the template
        var primaryColor = (company && company.primaryColor) ? company.primaryColor : '#3f3faa';
        var secondaryColor = (company && company.secondaryColor) ? company.secondaryColor : '#495057';
        var cssVars = `<style data-company-theme>:root {\n  --primary-color: ${primaryColor};\n  --secondary-color: ${secondaryColor};\n}</style>`;
        
        // Add the CSS variables to the head of the template
        var htmlContent = template.replace('</head>', cssVars + '\n</head>');

        var formatCurrency = function(amount) {
            if (!amount) return '0.00';
            return parseFloat(amount).toFixed(2);
        };

        // Format phone as (123) 456-7890
        var formatPhoneNumber = function(phone) {
            if (!phone) return '';
            var cleaned = ('' + phone).replace(/\D/g, '');
            if (cleaned.length === 10) {
                return '(' + cleaned.slice(0,3) + ') ' + cleaned.slice(3,6) + '-' + cleaned.slice(6);
            }
            return phone;
        };

        // Determine if we should show price column
        var showPrice = estimateData.lineItemPrice !== false && estimateData.lineItemPrice !== 0 && estimateData.lineItemPrice !== 'false';

        // Handle lineItemPrice conditional in template
        if (showPrice) {
            // Replace {{#if estimate.lineItemPrice}} with empty string (keep content)
            htmlContent = htmlContent.replace(/\{\{#if estimate\.lineItemPrice\}\}/g, '');
            htmlContent = htmlContent.replace(/\{\{#if \.\.\/lineItemPrice\}\}/g, '');
            htmlContent = htmlContent.replace(/\{\{\/if\}\}/g, '');
        } else {
            // Remove entire sections wrapped in {{#if estimate.lineItemPrice}} or {{#if ../lineItemPrice}}
            htmlContent = htmlContent.replace(/\{\{#if estimate\.lineItemPrice\}\}[\s\S]*?\{\{\/if\}\}/g, '');
            htmlContent = htmlContent.replace(/\{\{#if \.\.\/lineItemPrice\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        // Build line items section HTML programmatically
        var lineItemsHtml = '';
        
        if (estimateData.EstimateLineItems && estimateData.EstimateLineItems.length > 0) {
            estimateData.EstimateLineItems.forEach(function(lineItem) {
                var name = lineItem.name || 'N/A';
                var description = lineItem.description || '';
                var totalPrice = formatCurrency(lineItem.totalPrice || 0);
                
                lineItemsHtml += '                                                    <tr>\n' +
                               '                                                        <td>' + name + '</td>\n' +
                               '                                                        <td>' + description + '</td>\n';
                if (showPrice) {
                    lineItemsHtml += '                                                        <td class="text-right">$' + totalPrice + '</td>\n';
                }
                lineItemsHtml += '                                                    </tr>\n';
            });
        } else {
            var colspan = showPrice ? 3 : 2;
            lineItemsHtml = '                                                    <tr><td colspan="' + colspan + '" class="text-center">No line items</td></tr>\n';
        }

        // Replace line items section
        htmlContent = htmlContent.replace(/\{\{#each estimate\.EstimateLineItems\}\}[\s\S]*?\{\{\/each\}\}/g, lineItemsHtml);

        // Build discounts section HTML programmatically
        var discountsHtml = '';
        var hasDiscounts = estimateData.discounts && estimateData.discounts.length > 0;
        
        if (hasDiscounts) {
            estimateData.discounts.forEach(function(discount) {
                var name = discount.name || 'Discount';
                var total = formatCurrency(discount.total || 0);
                
                discountsHtml += '                                                        <tr>\n' +
                               '                                                            <td>' + name + '</td>\n' +
                               '                                                            <td class="text-right">-$' + total + '</td>\n' +
                               '                                                        </tr>\n';
            });
        }

        // Replace discounts section - only if there are discounts
        if (hasDiscounts) {
            htmlContent = htmlContent.replace(/\{\{#if estimate\.discounts\.length\}\}[\s\S]*?\{\{\/if\}\}/g, discountsHtml);
        } else {
            // Remove the entire discounts section if no discounts
            htmlContent = htmlContent.replace(/\{\{#if estimate\.discounts\.length\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        // Replace estimate basic information
        htmlContent = htmlContent.replace(/\{\{estimate\.estimateNumber\}\}/g, estimateData.estimateNumber || 'N/A');
        htmlContent = htmlContent.replace(/\{\{estimate\.dueNow(\s*\|\|\s*'[^']*')?\}\}/g, formatCurrency(estimateData.dueNow || 0));
        htmlContent = htmlContent.replace(/\{\{estimate\.subTotal(\s*\|\|\s*'[^']*')?\}\}/g, formatCurrency(estimateData.subTotal || 0));
        htmlContent = htmlContent.replace(/\{\{estimate\.discountTotal(\s*\|\|\s*'[^']*')?\}\}/g, formatCurrency(estimateData.discountTotal || 0));
        htmlContent = htmlContent.replace(/\{\{estimate\.total(\s*\|\|\s*'[^']*')?\}\}/g, formatCurrency(estimateData.total || 0));

        // Handle memo section conditionally
        if (estimateData.memo && estimateData.memo.trim() !== '') {
            var memoSectionHtml = '\n                                            <div class="section-title">Memo</div>\n' +
                                '                                            <div class="estimate-info">' + estimateData.memo + '</div>\n';
            htmlContent = htmlContent.replace(/\{\{#if estimate\.memo\}\}[\s\S]*?\{\{\/if\}\}/g, memoSectionHtml);
        } else {
            htmlContent = htmlContent.replace(/\{\{#if estimate\.memo\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        // Handle terms and conditions section conditionally
        if (estimateData.estimateTermsAndConditions && estimateData.estimateTermsAndConditions.trim() !== '') {
            var termsSectionHtml = '\n                                            <div class="section-title">Terms and Conditions</div>\n' +
                                 '                                            <div class="terms-section">' + estimateData.estimateTermsAndConditions + '</div>\n';
            htmlContent = htmlContent.replace(/\{\{#if estimate\.estimateTermsAndConditions\}\}[\s\S]*?\{\{\/if\}\}/g, termsSectionHtml);
        } else {
            htmlContent = htmlContent.replace(/\{\{#if estimate\.estimateTermsAndConditions\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }

        // Replace client information
        if (estimateData.Client) {
            var clientFullName = estimateData.Client.fullName || 
                                (estimateData.Client.firstName + ' ' + estimateData.Client.lastName) || 'N/A';
            htmlContent = htmlContent.replace(/\{\{estimate\.Client\.fullName\}\}/g, clientFullName);
        } else {
            htmlContent = htmlContent.replace(/\{\{estimate\.Client\.fullName\}\}/g, 'N/A');
        }

        // Replace client email - get primary or first email
        if (estimateData.Client && estimateData.Client.ClientEmails && estimateData.Client.ClientEmails.length > 0) {
            var primaryEmail = estimateData.Client.ClientEmails.find(e => e.isPrimary) || estimateData.Client.ClientEmails[0];
            htmlContent = htmlContent.replace(/\{\{estimate\.clientEmail\.email\}\}/g, primaryEmail.email || 'N/A');
        } else {
            htmlContent = htmlContent.replace(/\{\{estimate\.clientEmail\.email\}\}/g, 'N/A');
        }

        // Replace client phone number - get primary or first phone
        if (estimateData.Client && estimateData.Client.ClientPhoneNumbers && estimateData.Client.ClientPhoneNumbers.length > 0) {
            var primaryPhone = estimateData.Client.ClientPhoneNumbers.find(p => p.isPrimary) || estimateData.Client.ClientPhoneNumbers[0];
            var formattedPhone = formatPhoneNumber(primaryPhone.phoneNumber || primaryPhone.number || '');
            htmlContent = htmlContent.replace(/\{\{estimate\.clientPhoneNumber\.formattedNumber\}\}/g, formattedPhone);
        } else {
            htmlContent = htmlContent.replace(/\{\{estimate\.clientPhoneNumber\.formattedNumber\}\}/g, 'N/A');
        }

        // Replace client address - get primary or first address
        if (estimateData.Client && estimateData.Client.ClientAddresses && estimateData.Client.ClientAddresses.length > 0) {
            var primaryAddress = estimateData.Client.ClientAddresses.find(a => a.isPrimary) || estimateData.Client.ClientAddresses[0];
            var fullAddress = [primaryAddress.street1, primaryAddress.street2, primaryAddress.city, 
                             primaryAddress.state, primaryAddress.zipCode].filter(Boolean).join(', ');
            htmlContent = htmlContent.replace(/\{\{estimate\.clientAddress\.fullAddress\}\}/g, fullAddress || 'N/A');
            // Use same address for billing if no specific billing address
            htmlContent = htmlContent.replace(/\{\{estimate\.billingAddress\.fullAddress\}\}/g, fullAddress || 'N/A');
        } else {
            htmlContent = htmlContent.replace(/\{\{estimate\.clientAddress\.fullAddress\}\}/g, 'N/A');
            htmlContent = htmlContent.replace(/\{\{estimate\.billingAddress\.fullAddress\}\}/g, 'N/A');
        }

        // Clean up any remaining template variables
        htmlContent = htmlContent.replace(/\{\{this\.name\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{this\.description\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{this\.totalPrice\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{this\.total\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{estimate\.memo\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{estimate\.estimateTermsAndConditions\}\}/g, '');

        // Company information
        if (company) {
            htmlContent = htmlContent.replace(/\{\{companyLogo\}\}/g, company.logoUrl || '');
            htmlContent = htmlContent.replace(/\{\{companyName\}\}/g, company.name || '');
        }

        // Generate PDF
        return await htmlToPdf(htmlContent, filename);
        
    } catch (error) {
        console.error('Error generating estimate PDF:', error);
        throw error;
    }
};

const generateInvoicePdf = async (template, invoiceData, company, filename) => {
    try {
        // Set company theme colors as CSS variables in the template
        var primaryColor = (company && company.primaryColor) ? company.primaryColor : '#3f3faa';
        var secondaryColor = (company && company.secondaryColor) ? company.secondaryColor : '#495057';
        var cssVars = `<style data-company-theme>:root {\n  --primary-color: ${primaryColor};\n  --secondary-color: ${secondaryColor};\n}</style>`;
        
        // Add the CSS variables to the head of the template
        var htmlContent = template.replace('</head>', cssVars + '\n</head>');

        var formatCurrency = function(amount) {
            if (!amount) return '0.00';
            return parseFloat(amount).toFixed(2);
        };

        // Format phone as (123) 456-7890
        var formatPhoneNumber = function(phone) {
            if (!phone) return '';
            var cleaned = ('' + phone).replace(/\D/g, '');
            if (cleaned.length === 10) {
                return '(' + cleaned.slice(0,3) + ') ' + cleaned.slice(3,6) + '-' + cleaned.slice(6);
            }
            return phone;
        };

        // Determine if we should show price column
        var showPrice = invoiceData.lineItemPrice !== false && invoiceData.lineItemPrice !== 0 && invoiceData.lineItemPrice !== 'false';

        // Handle lineItemPrice conditional in template
        if (showPrice) {
            // Replace {{#if invoice.lineItemPrice}} with empty string (keep content)
            htmlContent = htmlContent.replace(/\{\{#if invoice\.lineItemPrice\}\}/g, '');
            htmlContent = htmlContent.replace(/\{\{#if \.\.\/lineItemPrice\}\}/g, '');
            htmlContent = htmlContent.replace(/\{\{\/if\}\}/g, '');
        } else {
            // Remove content between {{#if invoice.lineItemPrice}} and {{/if}}
            htmlContent = htmlContent.replace(/\{\{#if invoice\.lineItemPrice\}\}.*?\{\{\/if\}\}/gs, '');
            htmlContent = htmlContent.replace(/\{\{#if \.\.\/lineItemPrice\}\}.*?\{\{\/if\}\}/gs, '');
        }

        // Replace invoice data placeholders
        htmlContent = htmlContent.replace(/\{\{invoice\.invoiceNumber\}\}/g, invoiceData.invoiceNumber || '');
        htmlContent = htmlContent.replace(/\{\{invoice\.subTotal\}\}/g, formatCurrency(invoiceData.subTotal));
        htmlContent = htmlContent.replace(/\{\{invoice\.discountTotal\}\}/g, formatCurrency(invoiceData.discountTotal));
        htmlContent = htmlContent.replace(/\{\{invoice\.total\}\}/g, formatCurrency(invoiceData.total));
        htmlContent = htmlContent.replace(/\{\{invoice\.memo\}\}/g, invoiceData.memo || '');

        // Replace client data placeholders  
        if (invoiceData.Client) {
            htmlContent = htmlContent.replace(/\{\{invoice\.Client\.fullName\}\}/g, invoiceData.Client.fullName || '');
        }

        // Handle client address
        if (invoiceData.clientAddress && invoiceData.clientAddress.fullAddress) {
            htmlContent = htmlContent.replace(/\{\{invoice\.clientAddress\.fullAddress\}\}/g, invoiceData.clientAddress.fullAddress);
        }

        // Handle billing address
        if (invoiceData.billingAddress && invoiceData.billingAddress.fullAddress) {
            htmlContent = htmlContent.replace(/\{\{invoice\.billingAddress\.fullAddress\}\}/g, invoiceData.billingAddress.fullAddress);
        }

        // Handle client email
        if (invoiceData.clientEmail && invoiceData.clientEmail.email) {
            htmlContent = htmlContent.replace(/\{\{invoice\.clientEmail\.email\}\}/g, invoiceData.clientEmail.email);
        }

        // Handle client phone number
        if (invoiceData.clientPhoneNumber && invoiceData.clientPhoneNumber.formattedNumber) {
            htmlContent = htmlContent.replace(/\{\{invoice\.clientPhoneNumber\.formattedNumber\}\}/g, formatPhoneNumber(invoiceData.clientPhoneNumber.formattedNumber));
        }

        // Handle terms and conditions
        htmlContent = htmlContent.replace(/\{\{invoice\.invoiceTermsAndConditions\}\}/g, invoiceData.invoiceTermsAndConditions || '');

        // Handle line items loop
        if (invoiceData.InvoiceLineItems && Array.isArray(invoiceData.InvoiceLineItems)) {
            let lineItemsHtml = '';
            invoiceData.InvoiceLineItems.forEach(function(item) {
                let itemHtml = `
                    <tr>
                        <td>${item.name || ''}</td>
                        <td>${item.description || ''}</td>`;
                
                if (showPrice) {
                    itemHtml += `<td class="text-right nowrap">$${formatCurrency(item.totalPrice)}</td>`;
                }
                
                itemHtml += `</tr>`;
                lineItemsHtml += itemHtml;
            });
            
            // Replace the handlebars loop with generated HTML
            htmlContent = htmlContent.replace(/\{\{#each invoice\.InvoiceLineItems\}\}.*?\{\{\/each\}\}/gs, lineItemsHtml);
        }

        // Handle discounts loop  
        if (invoiceData.discounts && Array.isArray(invoiceData.discounts) && invoiceData.discounts.length > 0) {
            let discountsHtml = '';
            invoiceData.discounts.forEach(function(discount) {
                discountsHtml += `
                    <tr>
                        <td>${discount.name || ''}</td>
                        <td class="text-right nowrap">-$${formatCurrency(discount.total)}</td>
                    </tr>`;
            });
            
            // Replace the handlebars discounts loop
            htmlContent = htmlContent.replace(/\{\{#each invoice\.discounts\}\}.*?\{\{\/each\}\}/gs, discountsHtml);
            
            // Keep the discounts section
            htmlContent = htmlContent.replace(/\{\{#if invoice\.discounts\.length\}\}/g, '');
            htmlContent = htmlContent.replace(/\{\{\/if\}\}/g, '');
        } else {
            // Remove discounts section if no discounts
            htmlContent = htmlContent.replace(/\{\{#if invoice\.discounts\.length\}\}.*?\{\{\/if\}\}/gs, '');
        }

        // Handle memo conditional
        if (invoiceData.memo) {
            htmlContent = htmlContent.replace(/\{\{#if invoice\.memo\}\}/g, '');
        } else {
            htmlContent = htmlContent.replace(/\{\{#if invoice\.memo\}\}.*?\{\{\/if\}\}/gs, '');
        }

        // Handle terms conditional
        if (invoiceData.invoiceTermsAndConditions) {
            htmlContent = htmlContent.replace(/\{\{#if invoice\.invoiceTermsAndConditions\}\}/g, '');
        } else {
            htmlContent = htmlContent.replace(/\{\{#if invoice\.invoiceTermsAndConditions\}\}.*?\{\{\/if\}\}/gs, '');
        }

        // Generate the PDF
        const pdfPath = await htmlToPdf(htmlContent, filename);
        return pdfPath;
        
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        throw error;
    }
};

module.exports = {
    htmlToPdf,
    generatePaystubPdf,
    generateEstimatePdf,
    generateInvoicePdf
};
