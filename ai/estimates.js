const OllamaHelper = require('../helpers/ollama');

const analyzeEstimate = async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'id is required'
            });
        }

        // Get the estimate data (using your existing function)
        const { Estimate, EstimateLineItem, Client, EstimateStatus, Event, Item, Labor, ClientAddress, State, ClientEmail, ClientNote, ClientPhoneNumber, EstimateSignature, Image, Video, LineItem } = require('../models');
        const estimate = await Estimate.findByPk(id, {
            include: [
                {
                    model: EstimateStatus,
                    as: 'EstimateStatus'
                },
                {
                    model: Client,
                    as: 'Client',
                    include: [
                        {
                            model: ClientAddress,
                            as: 'ClientAddresses',
                            include: [
                                {
                                    model: State,
                                    as: 'State'
                                }
                            ]
                        },
                        {
                            model: ClientEmail,
                            as: 'ClientEmails'
                        },
                        {
                            model: ClientNote,
                            as: 'ClientNotes'
                        },
                        {
                            model: ClientPhoneNumber,
                            as: 'ClientPhoneNumbers'
                        }
                    ]
                },
                {
                    model: Event,
                    as: 'Event'
                },
                {
                    model: EstimateLineItem,
                    as: 'EstimateLineItems',
                    include: [
                        {
                            model: LineItem,
                            as: 'LineItem',
                        },
                        {
                            model: Item,
                            as: 'Item',
                        },
                        {
                            model: Labor,
                            as: 'Labor',
                        }
                    ]
                },
                {
                    model: EstimateSignature,
                    as: 'EstimateSignature'
                },
                {
                    model: Image,
                    as: 'Images'
                },
                {
                    model: Video,
                    as: 'Videos'
                }
            ]
        });

        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found'
            });
        }

        // Extract primary client details
        const client = estimate.Client;
        const primaryAddress = client.ClientAddresses?.find(addr => addr.isPrimary) || null;
        const primaryPhoneNumber = client.ClientPhoneNumbers?.find(phone => phone.isPrimary) || null;
        const primaryEmail = client.ClientEmails?.find(email => email.isPrimary) || null;

        // Initialize Ollama
        const ollama = new OllamaHelper();

        // Analyze the estimate with AI
        const analysis = await ollama.analyzeEstimate({
            estimateNumber: estimate.estimateNumber,
            subTotal: estimate.subTotal,
            total: estimate.total,
            markUp: estimate.markUp,
            salesTaxRate: estimate.salesTaxRate,
            lineItems: estimate.EstimateLineItems.map(item => ({
                name: item.name || item.description,
                category: item.category,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
            })),
            clientDetails: {
                primaryAddress,
                primaryPhoneNumber,
                primaryEmail
            }
        }, {
            model: 'golura/estimator:latest', // Use your custom model
            max_tokens: 500
        });

        if (!analysis.success) {
            return res.status(500).json({
                err: true,
                msg: 'AI analysis failed',
                details: analysis.error
            });
        }

        res.status(200).json({
            err: false,
            msg: 'Estimate analysis completed',
            analysis: {
                text: analysis.text,
                model: analysis.model,
                processingTime: analysis.totalDuration
            }
        });

    } catch (error) {
        console.error('Error in AI estimate analysis:', error);
        res.status(500).json({
            err: true,
            msg: 'Internal server error',
            details: error.message
        });
    }
};
const getEstimateOptimizationSuggestions = async (req, res) => {
    try {
        const { id } = req.body;
        
        // Get estimate data...
        const { Estimate, EstimateLineItem } = require('../models');
        const estimate = await Estimate.findByPk(id, {
            include: [{ model: EstimateLineItem, as: 'EstimateLineItems' }]
        });

        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found'
            });
        }

        const ollama = new OllamaHelper();

        const prompt = `Analyze this construction estimate and provide 3-5 specific optimization suggestions:

Estimate Details:
- Total: $${estimate.total}
- Subtotal: $${estimate.subTotal}
- Markup: ${estimate.markUp}%
- Line Items Count: ${estimate.EstimateLineItems.length}

Line Items:
${estimate.EstimateLineItems.map(item => 
    `- ${item.name}: $${item.totalPrice} (Qty: ${item.quantity} @ $${item.unitPrice})`
).join('\n')}

Please provide specific, actionable suggestions for:
1. Cost optimization
2. Missing items to consider
3. Markup adjustments
4. Value engineering opportunities
5. Risk mitigation

Format the response as a numbered list with brief explanations.`;

        const suggestions = await ollama.generate(prompt, {
            model: 'llama3.2:latest',
            max_tokens: 400,
            temperature: 0.7
        });

        if (!suggestions.success) {
            return res.status(500).json({
                err: true,
                msg: 'Failed to generate suggestions',
                details: suggestions.error
            });
        }

        res.status(200).json({
            err: false,
            msg: 'Optimization suggestions generated',
            suggestions: {
                text: suggestions.text,
                model: suggestions.model,
                processingTime: suggestions.totalDuration
            }
        });

    } catch (error) {
        console.error('Error generating optimization suggestions:', error);
        res.status(500).json({
            err: true,
            msg: 'Internal server error',
            details: error.message
        });
    }
};
const generateEstimate = async (req, res) => {
    try {
        const { 
            prompt, 
            clientId, 
            eventId, 
            projectType = 'general construction', 
            markupPercentage = 15,
            salesTaxRate = 8.5,
            includeLabor = true,
            includeMaterials = true,
            includeEquipment = true 
        } = req.body;

        if (!prompt) {
            return res.status(400).json({
                err: true,
                msg: 'prompt is required'
            });
        }

        // Get required models
        const { 
            Estimate, 
            EstimateLineItem, 
            EstimateStatus, 
            EstimatePreference, 
            EstimateHistory, 
            Client, 
            Event, 
            Company 
        } = require('../models');

        // Get default status and company settings
        const defaultStatus = await EstimateStatus.findOne({ where: { name: 'active' } });
        
        if (!defaultStatus) {
            return res.status(500).json({
                err: true,
                msg: 'Default estimate status not found'
            });
        }

        // Initialize Ollama
        const ollama = new OllamaHelper();

        // Create comprehensive prompt for estimate generation
        const systemPrompt = `You are an expert construction estimator with 20+ years of experience. Generate a highly detailed, accurate estimate based on the following project requirements.

Project Type: ${projectType}
Client Requirements: ${prompt}

IMPORTANT PRICING GUIDELINES:
- Use current 2024-2025 market rates for the Southeast/South Carolina region
- Include realistic quantities based on industry standards
- Account for material waste factors (typically 10-15% extra)
- Use prevailing wage rates for skilled trades
- Consider regional cost variations

DETAILED BREAKDOWN REQUIREMENTS:
${includeMaterials ? `
MATERIALS - Break down by specific components:
- Lumber: Specify grades, dimensions, board feet
- Hardware: Fasteners, connectors, brackets (by quantity)
- Concrete: Bags, mix ratios, cubic yards
- Specialty items: Flashing, waterproofing, sealers
- Delivery charges for materials
` : ''}
${includeLabor ? `
LABOR - Break down by trade and task:
- Site preparation and layout (hours)
- Foundation/footing work (hours)
- Framing and structural work (hours)
- Finish carpentry and installation (hours)
- Cleanup and final inspection (hours)
Use rates: $45-65/hr for general construction, $65-85/hr for specialized trades
` : ''}
${includeEquipment ? `
EQUIPMENT - Include all necessary tools and machinery:
- Tool rental (daily/weekly rates)
- Heavy equipment if needed (excavators, lifts)
- Delivery and pickup fees
` : ''}

ADDITIONAL CONSIDERATIONS:
- Permits and inspections (typical local rates)
- Waste disposal and dumpster rental
- Site access challenges
- Weather delays contingency

Generate 12-20 detailed line items covering every aspect of the project. Each line item should be specific and measurable.

FORMAT REQUIREMENTS:
- Names must be specific (e.g., "Pressure-Treated 2x10x12 Joists" not "Lumber")
- Descriptions must include specs, dimensions, grades
- Quantities must be realistic and industry-standard
- Unit prices must reflect current market rates
- Categories: Material, Labor, Equipment, or Miscellaneous

EXAMPLE FOR CONTEXT:
For a 14x16 deck (224 sq ft):
- Pressure-treated lumber: ~$8-12 per sq ft
- Labor: ~$15-25 per sq ft  
- Total typical range: $28-39 per sq ft

Format your response as a JSON object with this structure:
{
  "projectTitle": "Specific project title with dimensions/scope",
  "projectDescription": "Detailed 3-4 sentence overview including key specifications",
  "estimateNotes": "Important assumptions, exclusions, or special considerations",
  "totalSquareFootage": number,
  "pricePerSquareFoot": number,
  "lineItems": [
    {
      "name": "Specific item name with specifications",
      "description": "Detailed description including dimensions, grades, specifications",
      "category": "Material|Labor|Equipment|Miscellaneous",
      "quantity": number,
      "unit": "hour|foot|each|portion|gallon",
      "unitPrice": number,
      "totalPrice": number,
      "notes": "Additional specifications or assumptions"
    }
  ]
}`;

        const response = await ollama.generate(systemPrompt, {
            model: 'llama3.2:latest',
            max_tokens: 2000,
            temperature: 0.7
        });

        if (!response.success) {
            return res.status(500).json({
                err: true,
                msg: 'Failed to generate estimate',
                details: response.error
            });
        }

        // Parse AI response
        let estimateData;
        try {
            // Try to extract JSON from response
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                estimateData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
        }

        // Valid unit values from database ENUM
        const validUnits = ['hour', 'foot', 'each', 'portion', 'gallon'];
        
        // Function to map common units to valid enum values
        const mapToValidUnit = (unit) => {
            if (!unit) return 'each';
            const lowerUnit = unit.toLowerCase();
            
            // Direct matches
            if (validUnits.includes(lowerUnit)) {
                return lowerUnit;
            }
            
            // Common mappings
            const unitMappings = {
                'lot': 'each',
                'sqft': 'foot',
                'sq ft': 'foot',
                'square foot': 'foot',
                'square feet': 'foot',
                'linear_ft': 'foot',
                'linear ft': 'foot',
                'linear foot': 'foot',
                'linear feet': 'foot',
                'ft': 'foot',
                'feet': 'foot',
                'hrs': 'hour',
                'hours': 'hour',
                'hr': 'hour',
                'gal': 'gallon',
                'gallons': 'gallon',
                'item': 'each',
                'piece': 'each',
                'pieces': 'each',
                'unit': 'each',
                'units': 'each'
            };
            
            return unitMappings[lowerUnit] || 'each';
        };

        // Validate and clean line items
        const cleanedLineItems = estimateData.lineItems
            .filter(item => item.name && item.category && item.quantity > 0 && item.unitPrice > 0)
            .map(item => ({
                name: item.name.substring(0, 255), // Ensure name fits database limit
                description: item.description || item.name,
                category: ['Material', 'Labor', 'Equipment', 'Miscellaneous'].includes(item.category) 
                    ? item.category 
                    : 'Miscellaneous',
                quantity: Math.max(1, parseFloat(item.quantity) || 1),
                unit: mapToValidUnit(item.unit),
                unitPrice: Math.max(0.01, parseFloat(item.unitPrice) || 1),
                totalPrice: parseFloat(item.totalPrice) || (parseFloat(item.quantity) * parseFloat(item.unitPrice)),
                notes: item.notes || null
            }));

        // Calculate totals
        const subTotal = cleanedLineItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const markupAmount = subTotal * (markupPercentage / 100);
        const salesTaxAmount = (subTotal + markupAmount) * (salesTaxRate / 100);
        const total = subTotal + markupAmount + salesTaxAmount;

        // Create estimate preferences
        const estimatePreferences = await EstimatePreference.create({
            email: false,
            call: false
        });

        // Create estimate
        const estimate = await Estimate.create({
            clientId: clientId || null,
            eventId: eventId || null,
            estimateNumber: `EST-${Date.now()}`,
            statusId: defaultStatus.id,
            estimatePreferenceId: estimatePreferences.id,
            assignedUserId: req.userId || null,
            userId: req.userId || null,
            markUp: markupPercentage,
            salesTaxRate: salesTaxRate,
            salesTaxTotal: salesTaxAmount,
            subTotal: subTotal,
            total: total,
            memo: `${estimateData.projectTitle}\n\n${estimateData.projectDescription}\n\nEstimate Notes: ${estimateData.estimateNotes || 'AI generated estimate based on current market rates.'}`,
            adHocReason: `AI generated from prompt: ${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}`,
            itemize: true,
            lineItemPrice: true,
            creatorId: req.userId || null,
            companyId: req.companyId
        });

        // Create estimate history
        await EstimateHistory.create({
            estimateId: estimate.id,
            statusId: defaultStatus.id,
            amount: total,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Create line items
        const createdLineItems = [];
        for (let i = 0; i < cleanedLineItems.length; i++) {
            const item = cleanedLineItems[i];
            
            const estimateLineItem = await EstimateLineItem.create({
                estimateId: estimate.id,
                name: item.name,
                description: item.description,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                rate: item.unitPrice,
                unitPrice: item.unitPrice,
                subTotal: item.totalPrice,
                totalPrice: item.totalPrice,
                markup: 0, // Markup applied at estimate level
                taxable: true,
                salesTaxRate: 0, // Tax applied at estimate level
                salesTaxTotal: 0,
                pricedBy: 'custom',
                adHoc: true,
                isActive: true,
                userId: req.userId || null
            });

            createdLineItems.push(estimateLineItem);
        }

        // Generate PDF if possible
        try {
            const { generateAndUploadEstimatePdf } = require('../functions/estimates');
            await generateAndUploadEstimatePdf(estimate.id);
        } catch (pdfError) {
            console.error('Error generating estimate PDF:', pdfError.message);
            // Don't fail the request for PDF generation issues
        }

        res.status(201).json({
            err: false,
            msg: 'AI estimate generated successfully',
            estimate: {
                id: estimate.id,
                estimateNumber: estimate.estimateNumber,
                projectTitle: estimateData.projectTitle,
                projectDescription: estimateData.projectDescription,
                estimateNotes: estimateData.estimateNotes || null,
                totalSquareFootage: estimateData.totalSquareFootage || null,
                pricePerSquareFoot: estimateData.pricePerSquareFoot || (total / (estimateData.totalSquareFootage || 1)),
                subTotal: subTotal,
                markupAmount: markupAmount,
                markupPercentage: markupPercentage,
                salesTaxAmount: salesTaxAmount,
                salesTaxRate: salesTaxRate,
                total: total,
                lineItemsCount: createdLineItems.length
            },
            lineItems: createdLineItems.map(item => ({
                id: item.id,
                name: item.name,
                description: item.description,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
            })),
            projectSummary: {
                materialsCost: createdLineItems.filter(item => item.category === 'Material').reduce((sum, item) => sum + item.totalPrice, 0),
                laborCost: createdLineItems.filter(item => item.category === 'Labor').reduce((sum, item) => sum + item.totalPrice, 0),
                equipmentCost: createdLineItems.filter(item => item.category === 'Equipment').reduce((sum, item) => sum + item.totalPrice, 0),
                miscellaneousCost: createdLineItems.filter(item => item.category === 'Miscellaneous').reduce((sum, item) => sum + item.totalPrice, 0)
            },
            aiResponse: {
                model: response.model || 'llama3.2:latest',
                processingTime: response.totalDuration || null,
                originalPrompt: prompt
            }
        });

    } catch (error) {
        console.error('Error generating AI estimate:', error);
        res.status(500).json({
            err: true,
            msg: 'Internal server error',
            details: error.message
        });
    }
};
const estimateChatbot = async (req, res) => {
    try {
        const { id, userMessage, conversationHistory = [] } = req.body;
        
        if (!id || !userMessage) {
            return res.status(400).json({
                err: true,
                msg: 'id and userMessage are required'
            });
        }

        // Get estimate context
        const { Estimate, EstimateLineItem } = require('../models');
        const estimate = await Estimate.findByPk(id, {
            include: [{ model: EstimateLineItem, as: 'EstimateLineItems' }]
        });

        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found'
            });
        }

        const ollama = new OllamaHelper();

        // Create system prompt with estimate context
        const systemPrompt = `You are a helpful construction estimate assistant. You have access to the following estimate data:

Estimate #${estimate.estimateNumber}
Total: $${estimate.total}
Subtotal: $${estimate.subTotal}
Markup: ${estimate.markUp}%
Tax Rate: ${estimate.salesTaxRate}%

Line Items:
${estimate.EstimateLineItems.map(item => 
    `- ${item.name}: $${item.totalPrice} (${item.quantity} units @ $${item.unitPrice})`
).join('\n')}

Answer questions about this estimate clearly and professionally. If asked about specific costs or items, reference the data above.`;

        // Build conversation with history
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: userMessage }
        ];

        const response = await ollama.chat(messages, {
            model: 'llama3.2:latest',
            max_tokens: 300,
            temperature: 0.7
        });

        if (!response.success) {
            return res.status(500).json({
                err: true,
                msg: 'Chat response failed',
                details: response.error
            });
        }

        res.status(200).json({
            err: false,
            msg: 'Chat response generated',
            response: {
                message: response.message.content,
                model: response.model,
                processingTime: response.totalDuration
            }
        });

    } catch (error) {
        console.error('Error in estimate chatbot:', error);
        res.status(500).json({
            err: true,
            msg: 'Internal server error',
            details: error.message
        });
    }
};

module.exports = {
    analyzeEstimate,
    getEstimateOptimizationSuggestions,
    generateEstimate,
    estimateChatbot
};
