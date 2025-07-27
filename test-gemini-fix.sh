#!/bin/bash

# Test script to verify the Gemini model fix
# Make sure your backend is running on localhost:3001

echo "🧪 Testing Gemini model fix..."

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
echo "🎭 Testing the respond route with Gemini model..."
echo "📊 This should now use 'models/gemini-1.5-pro' instead of 'gemini-pro'"
echo ""

RESPOND_RESPONSE=$(curl -s -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \
  -H "Content-Type: application/json" \
  -d '{"dummy": "data"}')

echo "Respond route response: $RESPOND_RESPONSE"

# Check if the response contains success
if echo "$RESPOND_RESPONSE" | grep -q '"success":true'; then
  echo ""
  echo "✅ SUCCESS! The Gemini model fix is working."
  echo "📊 Response summary:"
  echo "$RESPOND_RESPONSE" | jq '.' 2>/dev/null || echo "$RESPOND_RESPONSE"
  
  echo ""
  echo "🔍 Check your backend console logs for:"
  echo "   - '🤖 Using Google AI model: models/gemini-1.5-pro for persona: ...'"
  echo "   - '✅ Successfully generated ... response'"
else
  echo ""
  echo "❌ FAILED! Check the error response:"
  echo "$RESPOND_RESPONSE"
  
  # Check for specific Gemini errors
  if echo "$RESPOND_RESPONSE" | grep -q "404.*gemini-pro"; then
    echo ""
    echo "🚨 This looks like the old Gemini model error. The fix might not be applied."
  fi
fi

echo ""
echo "🔧 Manual verification commands:"
echo "1. Check backend logs for model usage:"
echo "   tail -f your-backend-log-file | grep 'Using Google AI model'"
echo ""
echo "2. Test with a specific dilemma ID:"
echo "   curl -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"dummy\": \"data\"}'" 