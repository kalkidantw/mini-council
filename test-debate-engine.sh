#!/bin/bash

# Test script to verify the new debate engine
# Make sure your backend is running on localhost:3001

echo "🧪 Testing the new multi-turn debate engine..."

# First, let's create a test dilemma
echo "📝 Creating a test dilemma..."
DILEMMA_RESPONSE=$(curl -s -X POST http://localhost:3001/api/dilemma \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Should I quit my job and move to a new city?"}')

echo "Dilemma creation response: $DILEMMA_RESPONSE"

# Extract the dilemma ID from the response
DILEMMA_ID=$(echo $DILEMMA_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DILEMMA_ID" ]; then
  echo "❌ Failed to get dilemma ID from response"
  echo "Full response: $DILEMMA_RESPONSE"
  exit 1
fi

echo "✅ Created dilemma with ID: $DILEMMA_ID"

# Now test the new debate route
echo "🎭 Testing the new multi-turn debate route..."
echo "📊 This should generate a natural conversation between Heart, Logic, and Shadow"
echo ""

RESPOND_RESPONSE=$(curl -s -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \
  -H "Content-Type: application/json" \
  -d '{"dummy": "data"}')

echo "Respond route response: $RESPOND_RESPONSE"

# Check if the response contains success
if echo "$RESPOND_RESPONSE" | grep -q '"success":true'; then
  echo ""
  echo "✅ SUCCESS! The debate engine is working."
  echo "📊 Response summary:"
  echo "$RESPOND_RESPONSE" | jq '.' 2>/dev/null || echo "$RESPOND_RESPONSE"
  
  echo ""
  echo "🔍 Check your backend console logs for:"
  echo "   - '🎭 Starting debate for dilemma: ...'"
  echo "   - '🤖 Generating initial debate...'"
  echo "   - '🤖 Generating persona conclusions...'"
  echo "   - '✅ Generated debate with X messages'"
  echo "   - '📊 Total debate duration: X seconds'"
  echo "   - Token usage tracking"
else
  echo ""
  echo "❌ FAILED! Check the error response:"
  echo "$RESPOND_RESPONSE"
fi

echo ""
echo "🔧 Manual verification commands:"
echo "1. Check backend logs for debate generation:"
echo "   tail -f your-backend-log-file | grep -E '(🎭|🤖|✅|📊)'"
echo ""
echo "2. Test with a specific dilemma ID:"
echo "   curl -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"dummy\": \"data\"}'"
echo ""
echo "3. Expected debate features:"
echo "   - Natural conversation flow (not rigid turn-taking)"
echo "   - 60-70 seconds total reading time"
echo "   - Distinct persona voices (Heart ❤️, Logic 🧠, Shadow 😈)"
echo "   - Timestamps for each message"
echo "   - Final conclusions from each persona" 