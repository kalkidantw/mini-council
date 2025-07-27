# Split Yourself Into Stems — Backend

## Overview
This is the backend for the Split Yourself Into Stems project. It provides API endpoints for debate generation, persona logic, and OpenAI-powered text-to-speech (TTS).

## Folder Structure

```
backend/
├── server.js            # Main Express server entrypoint
├── package.json         # Backend dependencies
├── package-lock.json    # Dependency lockfile
├── .env                 # Environment variables (NOT committed)
├── auth.js              # Authentication routes and logic
├── personas.js          # Persona prompt logic
├── token-tracker.js     # Tracks OpenAI token usage
├── routes/              # API route handlers
│   ├── debate.js        # /api/debate endpoints
│   └── dilemma.js       # /api/dilemma endpoints
├── services/            # Core business logic/services
│   ├── debateEngine.js  # Debate message generation logic
│   └── ttsService.js    # OpenAI TTS integration
└── node_modules/        # Installed dependencies
```

## Environment Variables
- All secrets (like your OpenAI API key) must be stored in a `.env` file in the backend root:
  ```
  OPENAI_API_KEY=sk-...your_key_here...
  ```
- `.env` is ignored by git and should NEVER be committed.

## Running the Backend
1. Install dependencies:
   ```sh
   cd backend
   npm install
   ```
2. Create your `.env` file with your OpenAI API key.
3. Start the server:
   ```sh
   npm start
   ```
4. The backend will run on `http://localhost:3001` by default.

## API Endpoints
- `POST /api/dilemma` — Create a new dilemma
- `POST /api/debate/:id/respond` — Generate a debate for a dilemma
- `GET /api/debate/test-openai` — Test OpenAI API connectivity

## Security
- Never commit your `.env` file or any API keys to git.
- All OpenAI usage is via `process.env.OPENAI_API_KEY`.

## Contact
Maintained by Kalkidan Wubshett 