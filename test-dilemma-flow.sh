#!/bin/bash

# Test script to verify the complete dilemma submission and debate flow
# Make sure your backend is running on localhost:3001

echo "🧪 Testing complete dilemma submission and debate flow..."

# Test 1: Submit a dilemma
echo "📝 Step 1: Submitting a dilemma..."
DILEMMA_RESPONSE=$(curl -s -X POST http://localhost:3001/api/dilemma \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Should I move to a new city for a fresh start?"}')

echo "Dilemma submission response: $DILEMMA_RESPONSE"

# Extract the dilemma ID from the response
DILEMMA_ID=$(echo $DILEMMA_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DILEMMA_ID" ]; then
  echo "❌ Failed to get dilemma ID from response"
  echo "Full response: $DILEMMA_RESPONSE"
  exit 1
fi

echo "✅ Created dilemma with ID: $DILEMMA_ID"

# Test 2: Fetch the dilemma by ID
echo "📖 Step 2: Fetching dilemma by ID..."
FETCH_RESPONSE=$(curl -s -X GET http://localhost:3001/api/dilemma/$DILEMMA_ID)

echo "Fetch response: $FETCH_RESPONSE"

if echo "$FETCH_RESPONSE" | grep -q '"prompt"'; then
  echo "✅ Successfully fetched dilemma"
else
  echo "❌ Failed to fetch dilemma"
  echo "Response: $FETCH_RESPONSE"
fi

# Test 3: Start the debate
echo "🎭 Step 3: Starting the debate..."
DEBATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \
  -H "Content-Type: application/json" \
  -d '{"dummy": "data"}')

echo "Debate response: $DEBATE_RESPONSE"

# Check if the debate was successful
if echo "$DEBATE_RESPONSE" | grep -q '"success":true'; then
  echo ""
  echo "✅ SUCCESS! Complete flow is working:"
  echo "   1. Dilemma submission ✅"
  echo "   2. Dilemma fetching ✅"
  echo "   3. Debate generation ✅"
  
  echo ""
  echo "📊 Response summary:"
  echo "$DEBATE_RESPONSE" | jq '.' 2>/dev/null || echo "$DEBATE_RESPONSE"
  
  echo ""
  echo "🔍 Check your backend console logs for:"
  echo "   - Dilemma creation logs"
  echo "   - Debate generation logs"
  echo "   - Token usage tracking"
else
  echo ""
  echo "❌ FAILED! Check the error response:"
  echo "$DEBATE_RESPONSE"
fi

echo ""
echo "🔧 Manual testing commands:"
echo "1. Test dilemma submission:"
echo "   curl -X POST http://localhost:3001/api/dilemma \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"prompt\": \"Should I move to a new city for a fresh start?\"}'"
echo ""
echo "2. Test dilemma fetching:"
echo "   curl -X GET http://localhost:3001/api/dilemma/$DILEMMA_ID"
echo ""
echo "3. Test debate generation:"
echo "   curl -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"dummy\": \"data\"}'"
echo ""
echo "4. Frontend flow:"
echo "   - Go to homepage"
echo "   - Enter dilemma in textarea"
echo "   - Click 'Let Them Talk'"
echo "   - Should redirect to /debate?id=$DILEMMA_ID" 