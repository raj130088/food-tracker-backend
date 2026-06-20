// src/ai/providers/ollama.provider.js
const { Ollama } = require('ollama');

// Use the exact Docker network routing syntax verified in your test script
const ollama = new Ollama({ host: 'http://host.docker.internal:11434' });

const ollamaProvider = {
  async chat(prompt, options = {}) {
    try {
      const response = await ollama.chat({
        model: 'llama3.1:8b', // Exact tag verification matches your system
        messages: [{ role: 'user', content: prompt }],
        ...options
      });

      return {
        content: response.message.content,
        raw: response
      };
    } catch (error) {
      console.error('Ollama Service Error:', error);
      throw new Error('Failed to get response from local Ollama engine');
    }
  }
};

module.exports = ollamaProvider;