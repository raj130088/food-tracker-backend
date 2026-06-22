// src/ai/providers/groq.provider.js
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cloudAIProvider = {
  async chat(systemPrompt, userMessage = '', options = {}) {
    // If userMessage is an object (options), shift parameters
    if (typeof userMessage === 'object' && userMessage !== null) {
      options = userMessage;
      userMessage = '';
    }

    const messages = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    
    // Add user message if provided
    if (userMessage) {
      messages.push({ role: "user", content: userMessage });
    }

    // If no separate user message, treat systemPrompt as the user message
    if (!userMessage && !systemPrompt) {
      throw new Error('No message content provided');
    }

    try {
      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: messages,
        temperature: options.temperature || 0.2,
        max_tokens: options.num_predict || 200,
      });

      return {
        content: completion.choices[0].message.content
      };
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error('Failed to get response from Groq API');
    }
  }
};

module.exports = cloudAIProvider;