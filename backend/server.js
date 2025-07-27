// server.js

// Add fetch polyfill for Node.js < 18 - MUST be first!
const fetch = require('node-fetch');
const { Headers, Request, Response } = require('node-fetch');

globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;

global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Routes
app.use("/api/debate", require("./routes/debate"));
app.use("/api/dilemma", require("./routes/dilemma"));

// Import and use auth routes
const authRoutes = require("./auth");
app.use("/api", authRoutes);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Secure key — do NOT expose on frontend
);

app.get("/", (req, res) => {
  res.send("API is running!");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
