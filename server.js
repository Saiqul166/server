import express from 'express';
import { exec } from 'child_process';
import cors from 'cors';
import 'dotenv/config';

const app = express();
// Cloud Run injects PORT automatically. Using 3000 as local fallback.
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// 12. Security System (API Key Middleware)
// ==========================================
// শুধুমাত্র যাদের কাছে সঠিক API_KEY আছে, তারাই request করতে পারবে।
const API_KEY = process.env.API_KEY || 'my-super-secret-key-2024';

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is successfully running on port ${PORT}`);
});
