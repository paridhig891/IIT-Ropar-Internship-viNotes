const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory array to store sessions
const sessions = [];

// POST /save-session API
app.post('/save-session', (req, res) => {
  const { sessionData } = req.body;
  if (!sessionData) {
    return res.status(400).json({ error: 'Session data is required' });
  }

  const newSession = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...sessionData
  };

  sessions.push(newSession);

  // Log saved sessions in console
  console.log('\n--- New Session Saved ---');
  console.log(JSON.stringify(newSession, null, 2));
  console.log(`Total sessions saved: ${sessions.length}`);
  console.log('-------------------------\n');

  res.status(200).json({ message: 'Session saved successfully' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
