const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors({
  origin: ['https://chatgpt.com', 'https://grok.com', 'http://localhost:3000', 'https://promptpilot-app.herokuapp.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.post('/usage', async (req, res) => {
  const { sessionId, inputLength, suggestionUsed, timestamp, userAction } = req.body;
  console.log("Received /usage request:", req.body);
  try {
    const existing = await pool.query('SELECT 1 FROM usage_data WHERE session_id = $1', [sessionId]);
    if (existing.rowCount > 0) {
      console.log(`Session ID ${sessionId} already exists, skipping insert`);
      return res.sendStatus(200);
    }
    await pool.query(
      'INSERT INTO usage_data (session_id, input_length, suggestion_used, timestamp, user_action) VALUES ($1, $2, $3, $4, $5)',
      [sessionId, inputLength, suggestionUsed, timestamp, userAction]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("Database error:", err.stack);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.post('/proxy', async (req, res) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  console.log("Received /proxy request:", req.body);
  if (!OPENAI_API_KEY) {
    console.error("No OpenAI API key found!");
    return res.status(500).json({ error: "Server configuration error: Missing OPENAI_API_KEY" });
  }
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });
    console.log("OpenAI API response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error response:", errorText);
      return res.status(response.status).json({ error: "OpenAI API error", details: errorText });
    }
    const data = await response.json();
    console.log("OpenAI API response:", data);
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port", process.env.PORT || 3000);
});

pool.connect((err, client, done) => {
  if (err) {
    console.error("Connection error:", err.stack);
    return;
  }
  client.query(`
    CREATE TABLE IF NOT EXISTS usage_data (
      session_id UUID PRIMARY KEY,
      input_length INT,
      suggestion_used TEXT,
      timestamp TIMESTAMP,
      user_action TEXT
    )
  `, (err, result) => {
    done();
    if (err) console.error("Table creation failed:", err.stack);
    else console.log("Table creation successful or already exists");
  });
});