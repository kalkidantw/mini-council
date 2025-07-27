# OpenAI Setup Guide

## 🔧 Environment Variables

Add this to your `.env` file in the backend directory:

```ini
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

## 📦 Dependencies

Make sure you have the OpenAI package installed:

```bash
cd backend
npm install openai
```

## 🧪 Testing

Run the test script to verify everything is working:

```bash
./test-openai-fix.sh
```

## 🔍 Expected Console Logs

When working correctly, you should see:

```
🤖 Using OpenAI model: gpt-4o-mini for persona: Heart
📝 Generating response for Heart with 2 messages
✅ Successfully generated Heart response (156 characters)
```

## 🚨 Common Issues

1. **401/403 Error**: Check your OPENAI_API_KEY
2. **Module not found**: Run `npm install openai`
3. **Environment not loaded**: Make sure your .env file is in the backend directory

## 🎯 API Endpoint

Your endpoint should now work:

```bash
curl -X POST http://localhost:3001/api/debate/{DILEMMA_ID}/respond \
  -H "Content-Type: application/json" \
  -d '{"dummy": "data"}'
```

This will return responses from Heart ❤️, Logic 🧠, and Shadow 😈 using OpenAI's gpt-4o-mini model! 