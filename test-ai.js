// test-ai.js
const { Ollama } = require('ollama');

// Route out of the Docker network container to your laptop's Ollama instance
const ollama = new Ollama({ host: 'http://host.docker.internal:11434' });

async function testConnection() {
  console.log("⏳ Attempting to connect to Ollama on host machine...");
  try {
    const response = await ollama.chat({
      model: 'llama3.1:8b', // Using the exact tag from your 'ollama list'
      messages: [{ role: 'user', content: 'Say "System operational" if you can read this.' }],
    });

    console.log("\n✅ SUCCESS! Ollama responded:");
    console.log(`🤖 AI: ${response.message.content}\n`);
  } catch (error) {
    console.error("\n❌ CONNECTION FAILED!");
    console.error("Error Details:", error.message);
  }
}

testConnection();