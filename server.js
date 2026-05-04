import express from 'express';
import { exec } from 'child_process';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Initialize Gemini API
let ai = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } else {
    console.warn("⚠️ WARNING: GEMINI_API_KEY is missing! AI features will not work.");
  }
} catch (err) {
  console.warn("⚠️ Failed to initialize Gemini API:", err.message);
}

const authenticate = (req, res, next) => {
  const reqApiKey = req.headers['x-api-key'];
  if (!reqApiKey || reqApiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next(); // Key সঠিক হলে পরের function এ যাবে
};

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is up and running!', status: 'OK' });
});

// ==========================================
// AI Command Generation API (Powered by Gemini)
// ==========================================
app.post('/ai-command', authenticate, async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Please provide a prompt.' });
  }

  if (!ai) {
    return res.status(500).json({ error: 'Gemini AI API Key is missing. Set GEMINI_API_KEY environment variable.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert Linux system administrator. Convert the following user request into a single, valid execution-ready Ubuntu Linux bash command. Output ONLY the raw command. No markdown, no explanations, no backticks.
      
      User Request: ${prompt}
      Command:`
    });

    const output = response.text || '';
    // Extracting the generated command only (cleaning up possible markdown codeblocks)
    let command = output.replace(/```bash/gi, '').replace(/```/g, '').trim();
    command = command.split('\n')[0].trim(); // Take just the first line to be safe

    res.json({ command });
  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(500).json({ error: 'Gemini AI Error: ' + error.message });
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

// ==========================================
// Serve React Frontend (Website UI)
// ==========================================
import fs from 'fs';

const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  // If dist exists (production build), serve it directly
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If dist doesn't exist, use Vite's development middleware
  console.log('⚡ Loading Vite Development Middleware...');
  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } catch (err) {
    console.error('Failed to start Vite middleware:', err);
    app.get('*', (req, res) => {
      res.status(404).send('<h2>Frontend build not found and Vite failed to load. Please run <code>npm run build</code> first.</h2>');
    });
  }
}

// Start Server with Auto-Port Fallback
const startServer = (currentPort) => {
  const server = app.listen(currentPort, '0.0.0.0', async () => {
    console.log(`Server is successfully running on port ${currentPort}`);

    // Cloud Run sets K_SERVICE. If it's undefined, we are running locally (like Cloud Shell)
    if (!process.env.K_SERVICE) {
      console.log(`\\n=============================================================`);
      console.log(`⏳ Starting Cloudflare Tunnel on port ${currentPort}... Please wait.`);
      import('child_process').then(({ spawn }) => {
        // Using Cloudflare Quick Tunnels instead of localtunnel
        const cloudflared = spawn('npx', ['--yes', 'cloudflared', 'tunnel', '--url', `http://localhost:${currentPort}`]);
        
        let urlFound = false;
        cloudflared.stderr.on('data', (data) => {
          const str = data.toString();
          const match = str.match(/(https:\\/\\/[a-zA-Z0-9-]+\\.trycloudflare\\.com)/);
          if(match && !urlFound) {
            urlFound = true;
            console.log(`✅ CLOUDFLARE PUBLIC URL: ${match[1]}`);
            console.log(`=============================================================\\n`);
            console.log(`আপনি এখন এই Cloudflare লিংকটি ব্যবহার করে যেকোনো ব্রাউজার থেকে অথবা ওয়েবসাইট থেকে API কল করতে পারবেন! এটি 100% কাজ করবে।\\n`);
          }
        });
        
        cloudflared.on('close', (code) => {
          console.log(`Cloudflare tunnel closed with code ${code}`);
        });
      }).catch(err => {
        console.error('⚠️ Failed to create Cloudflare tunnel:', err.message);
      });
    }
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${currentPort} is busy. Trying ${currentPort + 1}...`);
      startServer(currentPort + 1);
    } else {
      console.error('Server error:', e);
    }
  });
};

let initialPort = PORT;
if (typeof initialPort === 'string') initialPort = parseInt(initialPort, 10);
startServer(initialPort);
