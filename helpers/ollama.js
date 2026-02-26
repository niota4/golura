const { Ollama } = require('ollama');

class OllamaHelper {
    constructor() {
        this.client = new Ollama({
            host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
        });
        this.defaultModel = process.env.OLLAMA_DEFAULT_MODEL || 'llama3.2';
    }

    /**
     * Check if Ollama server is running and accessible
     */
    async isServerRunning() {
        try {
            const response = await this.client.list();
            return true;
        } catch (error) {
            console.error('Ollama server is not running:', error.message);
            return false;
        }
    }

    /**
     * List all available models
     */
    async listModels() {
        try {
            const response = await this.client.list();
            return response.models;
        } catch (error) {
            console.error('Error listing models:', error.message);
            throw error;
        }
    }

    /**
     * Pull/download a model
     */
    async pullModel(modelName) {
        try {
            console.log(`Pulling model: ${modelName}...`);
            const stream = await this.client.pull({ 
                model: modelName,
                stream: true 
            });
            
            for await (const chunk of stream) {
                if (chunk.status) {
                    console.log(`${chunk.status}: ${chunk.completed || 0}/${chunk.total || 0}`);
                }
            }
            console.log(`Model ${modelName} pulled successfully`);
            return true;
        } catch (error) {
            console.error(`Error pulling model ${modelName}:`, error.message);
            throw error;
        }
    }

    /**
     * Generate a completion using the specified model
     */
    async generate(prompt, options = {}) {
        try {
            const model = options.model || this.defaultModel;
            
            // Check if model exists, if not try to pull it
            const models = await this.listModels();
            const modelExists = models.some(m => m.name.includes(model));
            
            if (!modelExists) {
                console.log(`Model ${model} not found, attempting to pull...`);
                await this.pullModel(model);
            }

            const response = await this.client.generate({
                model: model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: options.temperature || 0.7,
                    top_p: options.top_p || 0.9,
                    top_k: options.top_k || 40,
                    num_predict: options.max_tokens || 1000,
                    ...options.modelOptions
                }
            });

            return {
                success: true,
                text: response.response,
                model: model,
                totalDuration: response.total_duration,
                loadDuration: response.load_duration,
                promptEvalCount: response.prompt_eval_count,
                evalCount: response.eval_count,
                evalDuration: response.eval_duration
            };
        } catch (error) {
            console.error('Error generating completion:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate a streaming completion
     */
    async generateStream(prompt, options = {}) {
        try {
            const model = options.model || this.defaultModel;
            
            const stream = await this.client.generate({
                model: model,
                prompt: prompt,
                stream: true,
                options: {
                    temperature: options.temperature || 0.7,
                    top_p: options.top_p || 0.9,
                    top_k: options.top_k || 40,
                    num_predict: options.max_tokens || 1000,
                    ...options.modelOptions
                }
            });

            return stream;
        } catch (error) {
            console.error('Error generating streaming completion:', error.message);
            throw error;
        }
    }

    /**
     * Chat completion with conversation history
     */
    async chat(messages, options = {}) {
        try {
            const model = options.model || this.defaultModel;
            
            const response = await this.client.chat({
                model: model,
                messages: messages,
                stream: false,
                options: {
                    temperature: options.temperature || 0.7,
                    top_p: options.top_p || 0.9,
                    top_k: options.top_k || 40,
                    num_predict: options.max_tokens || 1000,
                    ...options.modelOptions
                }
            });

            return {
                success: true,
                message: response.message,
                model: model,
                totalDuration: response.total_duration,
                loadDuration: response.load_duration,
                promptEvalCount: response.prompt_eval_count,
                evalCount: response.eval_count,
                evalDuration: response.eval_duration
            };
        } catch (error) {
            console.error('Error in chat completion:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Chat completion with streaming
     */
    async chatStream(messages, options = {}) {
        try {
            const model = options.model || this.defaultModel;
            
            const stream = await this.client.chat({
                model: model,
                messages: messages,
                stream: true,
                options: {
                    temperature: options.temperature || 0.7,
                    top_p: options.top_p || 0.9,
                    top_k: options.top_k || 40,
                    num_predict: options.max_tokens || 1000,
                    ...options.modelOptions
                }
            });

            return stream;
        } catch (error) {
            console.error('Error in streaming chat completion:', error.message);
            throw error;
        }
    }

    /**
     * Create embeddings for text
     */
    async createEmbeddings(text, options = {}) {
        try {
            const model = options.model || 'nomic-embed-text';
            
            const response = await this.client.embeddings({
                model: model,
                prompt: text
            });

            return {
                success: true,
                embeddings: response.embedding,
                model: model
            };
        } catch (error) {
            console.error('Error creating embeddings:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete a model
     */
    async deleteModel(modelName) {
        try {
            await this.client.delete({ model: modelName });
            console.log(`Model ${modelName} deleted successfully`);
            return true;
        } catch (error) {
            console.error(`Error deleting model ${modelName}:`, error.message);
            throw error;
        }
    }

    /**
     * Show model information
     */
    async showModel(modelName) {
        try {
            const response = await this.client.show({ model: modelName });
            return response;
        } catch (error) {
            console.error(`Error showing model ${modelName}:`, error.message);
            throw error;
        }
    }

    /**
     * Format conversation messages for the chat endpoint
     */
    formatConversation(userMessage, systemPrompt = null) {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }
        
        messages.push({
            role: 'user',
            content: userMessage
        });
        
        return messages;
    }

    /**
     * Run text analysis (sentiment, summary, keywords)
     */
    async analyzeText(text, analysisType = 'general', options = {}) {
        const prompts = {
            sentiment: `Analyze the sentiment of the following text and provide a score from -1 (very negative) to 1 (very positive), along with a brief explanation:\n\n"${text}"`,
            summary: `Provide a concise summary of the following text:\n\n"${text}"`,
            keywords: `Extract the key topics and keywords from the following text:\n\n"${text}"`,
            general: `Analyze the following text and provide insights:\n\n"${text}"`
        };

        const prompt = prompts[analysisType] || prompts.general;
        return await this.generate(prompt, options);
    }

    /**
     * Analyze estimate data and generate feedback
     */
    async analyzeEstimate(estimateData, options = {}) {
        const prompt = `You're reviewing an estimate created by someone else. You don't have control over pricing or the ability to edit the estimate directly.
        The Client information, is always supplied, so you can assume it is complete and no need to bring it up.
        Analyze the following estimate data and provide feedback for someone reviewing it from the outside (e.g., a supervisor, project coordinator, or support role). Focus on completeness, clarity, and helpful observations.Estimate Data: ${JSON.stringify(estimateData, null, 2)}
        Please provide:
        1. Clarity Review – Is the estimate clear and understandable?
        2. Completeness Check – Are all major details present (scope, items, totals, discounts, wording, images, and videos)?
        3. Red Flags or Missing Info – Are any fields left blank, inconsistent, or confusing?
        4. Suggestions for Feedback to Owner – What could the creator improve (e.g., descriptions, itemization, scope coverage)?
        Do not assume pricing can be changed — instead, focus on guidance and review. and please use words like "consider", "suggest", "recommend" instead of "change" or "edit", and in
        a way where people who are computer literate can understand the feedback, these suggestions should be clear and actionable for a salesman. Also make it as you are talking diretly to the person who created the estimate.`;

        return await this.generate(prompt, options);
    }
}

module.exports = OllamaHelper;
