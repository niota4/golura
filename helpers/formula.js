const math = require('mathjs');

// Validate and sanitize numeric values
const sanitizeNumber = (value, fieldName = 'formula result') => {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    
    const num = parseFloat(value);
    
    // Check if it's a valid number
    if (isNaN(num) || !isFinite(num)) {
        console.warn(`Invalid number detected for ${fieldName}: ${value}, defaulting to 0`);
        return 0;
    }
    
    // Check for extreme values that could cause database issues
    const MAX_SAFE_VALUE = 999999999999.99; // 12 digits before decimal, 2 after
    const MIN_SAFE_VALUE = -999999999999.99;
    
    if (num > MAX_SAFE_VALUE) {
        console.warn(`Number too large for ${fieldName}: ${num}, capping at ${MAX_SAFE_VALUE}`);
        return MAX_SAFE_VALUE;
    }
    
    if (num < MIN_SAFE_VALUE) {
        console.warn(`Number too small for ${fieldName}: ${num}, capping at ${MIN_SAFE_VALUE}`);
        return MIN_SAFE_VALUE;
    }
    
    // Round to 2 decimal places to prevent precision issues
    return Math.round(num * 100) / 100;
};

const evaluateFormula = (formula, variables) => {
    try {
        // Process handlebars-style variables {{variable}} to regular variable names
        let processedFormula = formula;
        
        // Find all {{variable}} patterns and replace them with the variable names
        const variableMatches = formula.match(/\{\{\s*([^}]+)\s*\}\}/g);
        
        if (variableMatches) {
            variableMatches.forEach(match => {
                // Extract the variable name (remove {{ and }} and trim spaces)
                const variableName = match.replace(/[\{\}\s]/g, '');
                
                // Replace the handlebars syntax with the plain variable name
                processedFormula = processedFormula.replace(match, variableName);
            });
        }
        
        console.log(`Original formula: ${formula}`);
        console.log(`Processed formula: ${processedFormula}`);
        console.log(`Variables available:`, Object.keys(variables));
        
        const compiledFormula = math.compile(processedFormula);
        const result = compiledFormula.evaluate(variables);
        
        console.log(`Formula result: ${result}`);
        
        // Sanitize the result to prevent overflow issues
        return sanitizeNumber(result, `formula "${formula}"`);
    } catch (error) {
        console.error(`Error evaluating formula: ${formula}`, error);
        console.error(`Variables provided:`, variables);
        throw error;
    }
};

module.exports = evaluateFormula;