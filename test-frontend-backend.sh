#!/bin/bash

# Test script to verify frontend-backend connection
# Make sure your backend is running on localhost:3001

echo "🧪 Testing frontend-backend connection..."

# Test 1: Backend endpoint directly
echo "📝 Step 1: Testing backend endpoint directly..."
BACKEND_RESPONSE=$(curl -s -X POST http://localhost:3001/api/dilemma \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Should I move to a new city for a fresh start?"}')

echo "Backend response: $BACKEND_RESPONSE"

# Extract the dilemma ID
DILEMMA_ID=$(echo $BACKEND_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DILEMMA_ID" ]; then
  echo "❌ Failed to get dilemma ID from backend"
  exit 1
fi

echo "✅ Backend working - Dilemma ID: $DILEMMA_ID"

# Test 2: Test GET endpoint
echo "📖 Step 2: Testing GET endpoint..."
GET_RESPONSE=$(curl -s -X GET http://localhost:3001/api/dilemma/$DILEMMA_ID)

if echo "$GET_RESPONSE" | grep -q '"prompt"'; then
  echo "✅ GET endpoint working"
else
  echo "❌ GET endpoint failed"
  echo "Response: $GET_RESPONSE"
fi

# Test 3: Test debate endpoint
echo "🎭 Step 3: Testing debate endpoint..."
DEBATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \
  -H "Content-Type: application/json" \
  -d '{"dummy": "data"}')

if echo "$DEBATE_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Debate endpoint working"
else
  echo "❌ Debate endpoint failed"
  echo "Response: $DEBATE_RESPONSE"
fi

echo ""
echo "🔧 Frontend Testing Instructions:"
echo "1. Make sure your backend is running: node server.js"
echo "2. Make sure your frontend is running: npm run dev"
echo "3. Go to http://localhost:3000"
echo "4. Enter a dilemma in the textarea"
echo "5. Click 'Let Them Talk'"
echo "6. Check browser console for logs"
echo "7. Should redirect to /debate?id=$DILEMMA_ID"

echo ""
echo "🔍 Debugging Tips:"
echo "- Check browser console for CORS errors"
echo "- Check backend console for request logs"
echo "- Verify both servers are running on correct ports"
echo "- Check network tab in browser dev tools" 