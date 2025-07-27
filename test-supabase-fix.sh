#!/bin/bash

# Test script to verify the Supabase query fix
# Make sure your backend is running on localhost:3001

echo "🧪 Testing Supabase query fix..."

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
echo "🎭 Testing the respond route with fixed Supabase query..."
echo "📊 This should now use .limit(1) instead of .single()"
echo ""

RESPOND_RESPONSE=$(curl -s -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \
  -H "Content-Type: application/json" \
  -d '{"dummy": "data"}')

echo "Respond route response: $RESPOND_RESPONSE"

# Check if the response contains success
if echo "$RESPOND_RESPONSE" | grep -q '"success":true'; then
  echo ""
  echo "✅ SUCCESS! The Supabase query fix is working."
  echo "📊 Response summary:"
  echo "$RESPOND_RESPONSE" | jq '.' 2>/dev/null || echo "$RESPOND_RESPONSE"
  
  echo ""
  echo "🔍 Check your backend console logs for:"
  echo "   - 'Looking for dilemma with ID: $DILEMMA_ID'"
  echo "   - 'Found dilemma: {...}'"
  echo "   - No PGRST116 errors"
else
  echo ""
  echo "❌ FAILED! Check the error response:"
  echo "$RESPOND_RESPONSE"
  
  # Check for specific Supabase errors
  if echo "$RESPOND_RESPONSE" | grep -q "PGRST116"; then
    echo ""
    echo "🚨 This looks like the old .single() error. The fix might not be applied."
  fi
fi

echo ""
echo "🔧 Manual verification commands:"
echo "1. Check backend logs for query success:"
echo "   tail -f your-backend-log-file | grep 'Found dilemma'"
echo ""
echo "2. Test with a specific dilemma ID:"
echo "   curl -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"dummy\": \"data\"}'"
echo ""
echo "3. Test with the exact ID from your error:"
echo "   curl -X POST http://localhost:3001/api/debate/6da7d635-1e26-4df3-be60-240809cfe036/respond \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"dummy\": \"data\"}'" 