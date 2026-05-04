import express from 'express';
import { exec } from 'child_process';
import cors from 'cors';
import 'dotenv/config';
import localtunnel from 'localtunnel';
import { HfInference } from '@huggingface/inference';

const app = express();
// Cloud Run injects PORT automatically. Using 8080 as local fallback for Cloud Shell.
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ==========================================
// 12. Security System (API Key Middleware)
// ==========================================
// শুধুমাত্র যাদের কাছে সঠিক API_KEY আছে, তারাই request করতে পারবে।
const API_KEY = process.env.API_KEY || 'my-super-secret-key-2024';
// Hugging Face Token for AI capabilities
const hf = new HfInference(process.env.HF_TOKEN);

const authenticate = (req, res, next) => {
  const reqApiKey = req.headers['x-api-key'];
  if (!reqApiKey || reqApiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next(); // Key সঠিক হলে পরের function এ যাবে
};

// Healthcheck Route
app.get('/', (req, res) => {
  res.json({ message: 'Server is up and running!', status: 'OK' });
});

// ==========================================
// AI Command Generation API
// ==========================================
app.post('/ai-command', authenticate, async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Please provide a prompt.' });
  }

  try {
    // using a highly capable instruct model from Hugging Face
    // Model: google/gemma-7b-it (or similar supported via inference API)
    const result = await hf.textGeneration({
      model: 'google/gemma-7b-it',
      inputs: `You are an expert Linux system administrator. Convert the following user request into a single, valid execution-ready Ubuntu Linux bash command. Output ONLY the raw command. No markdown, no explanations.\n\nUser Request: ${prompt}\nCommand:`,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.1,
      }
    });

    const output = result.generated_text;
    // Extracting the generated command only
    const command = output.split('Command:').pop().trim().replace(/\`\`\`/g, '').split('\\n')[0].trim();

    res.json({ command });
  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(500).json({ error: 'HF Token needed or Model loading: ' + error.message });
  }
});

// ==========================================
// 2. /timer API (POST request)
// ==========================================
app.post('/timer', authenticate, (req, res) => {
  const { seconds } = req.body;

  if (!seconds || typeof seconds !== 'number') {
    return res.status(400).json({ error: 'Please provide valid seconds (number).' });
  }

  // Response সাথে সাথে পাঠিয়ে দেওয়া হলো
  res.json({ message: `Timer started for ${seconds} seconds.` });

  // Background-এ Timer চলবে
  setTimeout(() => {
    // এখানে Timer শেষ হলে Data save বা Notification পাঠানো যেতে পারে
    console.log(`[TIMER ALERT] ${seconds} seconds passed!`);
  }, seconds * 1000);
});

// ==========================================
// 3. /run API (POST request) -> Terminal Command 
// ==========================================
app.post('/run', authenticate, (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Please provide a terminal command.' });
  }

  console.log(`Executing command: ${command}`);

  // Child Process দিয়ে Securely command run করা
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message, stderr });
    }
    
    // Command result return করা হচ্ছে
    res.json({ output: stdout, warnings: stderr });
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server is successfully running on port ${PORT}`);

  // Cloud Run sets K_SERVICE. If it's undefined, we are running locally (like Cloud Shell)
  if (!process.env.K_SERVICE) {
    try {
      const tunnel = await localtunnel({ port: PORT });
      console.log(`\n=============================================================`);
      console.log(`✅ PUBLIC URL (Temporary): ${tunnel.url}`);
      console.log(`=============================================================\n`);
      console.log(`আপনি এখন এই লিংকটি কপি করে যেকোনো ব্রাউজারে পেস্ট করে API চেক করতে পারবেন! (e.g. ${tunnel.url}/ )\n`);
      
      tunnel.on('close', () => {
        console.log('Public tunnel closed.');
      });
    } catch (err) {
      console.error('⚠️ Failed to create public tunnel:', err.message);
    }
  }
});
