#!/bin/bash

# Test script for the fixed debate route
# Make sure your backend is running on localhost:3001

echo "🧪 Testing the fixed debate route..."

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
echo "🎭 Testing the respond route..."
RESPOND_RESPONSE=$(curl -s -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \
  -H "Content-Type: application/json" \
  -d '{"dummy": "data"}')

echo "Respond route response: $RESPOND_RESPONSE"

# Check if the response contains success
if echo "$RESPOND_RESPONSE" | grep -q '"success":true'; then
  echo "✅ SUCCESS! The route is working properly."
  echo "📊 Response summary:"
  echo "$RESPOND_RESPONSE" | jq '.' 2>/dev/null || echo "$RESPOND_RESPONSE"
else
  echo "❌ FAILED! The route is still not working."
  echo "Error response: $RESPOND_RESPONSE"
fi

echo ""
echo "🔧 Manual test commands:"
echo "1. Create dilemma:"
echo "   curl -X POST http://localhost:3001/api/dilemma \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"prompt\": \"Should I drop my Tuesday class?\"}'"
echo ""
echo "2. Test respond route (replace <DILEMMA_ID> with actual ID):"
echo "   curl -X POST http://localhost:3001/api/debate/<DILEMMA_ID>/respond \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"dummy\": \"data\"}'" 