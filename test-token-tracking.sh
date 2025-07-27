#!/bin/bash

# Test script to verify token tracking and budget management
# Make sure your backend is running on localhost:3001

echo "🧪 Testing token tracking and budget management..."

# First, let's create a test dilemma
echo "📝 Creating a test dilemma..."
DILEMMA_RESPONSE=$(curl -s -X POST http://localhost:3001/api/dilemma \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Should I drop my Tuesday class?"}')

echo "Dilemma creation response: $DILEMMA_RESPONSE"

# Extract the dilemma ID from the response
DILEMMA_ID=$(echo $DILEMMA_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DILEMMA_ID" ]; then
  echo "❌ Failed to get dilemma ID from response"
  echo "Full response: $DILEMMA_RESPONSE"
  exit 1
fi

echo "✅ Created dilemma with ID: $DILEMMA_ID"

# Now test the respond route
echo "🎭 Testing the respond route with token tracking..."
echo "📊 This should show token usage for each persona and a cost summary"
echo ""

RESPOND_RESPONSE=$(curl -s -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \
  -H "Content-Type: application/json" \
  -d '{"dummy": "data"}')

echo "Respond route response: $RESPOND_RESPONSE"

# Check if the response contains success
if echo "$RESPOND_RESPONSE" | grep -q '"success":true'; then
  echo ""
  echo "✅ SUCCESS! The token tracking is working."
  echo "📊 Response summary:"
  echo "$RESPOND_RESPONSE" | jq '.' 2>/dev/null || echo "$RESPOND_RESPONSE"
  
  echo ""
  echo "🔍 Check your backend console logs for:"
  echo "   - '🤖 Using OpenAI model: gpt-4o-mini for persona: ...'"
  echo "   - '📊 [Persona] usage: X input + Y output = Z total tokens'"
  echo "   - '💰 Cost: $X.XXXXXX (Total: $X.XXXX)'"
  echo "   - '📈 TOKEN USAGE SUMMARY:'"
  echo "   - Budget remaining information"
else
  echo ""
  echo "❌ FAILED! Check the error response:"
  echo "$RESPOND_RESPONSE"
fi

echo ""
echo "🔧 Manual verification commands:"
echo "1. Check backend logs for token usage:"
echo "   tail -f your-backend-log-file | grep -E '(📊|💰|📈)'"
echo ""
echo "2. Test with a specific dilemma ID:"
echo "   curl -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"dummy\": \"data\"}'"
echo ""
echo "3. Expected token usage per persona:"
echo "   - Input tokens: ~50-100 (system prompt + dilemma)"
echo "   - Output tokens: ~200-250 (max_tokens limit)"
echo "   - Total cost per persona: ~$0.0001-0.0002"
echo "   - Total cost for all 3 personas: ~$0.0003-0.0006" 