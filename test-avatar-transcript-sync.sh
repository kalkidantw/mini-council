#!/bin/bash

# Test script to verify avatar animation and transcript sync
# Make sure your backend is running on localhost:3001

echo "🎭 Testing Avatar Animation + Transcript Sync..."

# Test 1: Create a dilemma
echo "📝 Step 1: Creating a test dilemma..."
DILEMMA_RESPONSE=$(curl -s -X POST http://localhost:3001/api/dilemma \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Should I move to a new city for a fresh start?"}')

echo "Dilemma response: $DILEMMA_RESPONSE"

# Extract the dilemma ID
DILEMMA_ID=$(echo $DILEMMA_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DILEMMA_ID" ]; then
  echo "❌ Failed to get dilemma ID"
  exit 1
fi

echo "✅ Created dilemma with ID: $DILEMMA_ID"

# Test 2: Generate debate with timing data
echo "🎬 Step 2: Generating debate with timing data..."
DEBATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Debate response received (length: ${#DEBATE_RESPONSE} characters)"

# Check if debate was successful
if echo "$DEBATE_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Debate generation successful"
  
  # Extract and display timing information
  echo ""
  echo "📊 Debate Timing Analysis:"
  
  # Count messages
  MESSAGE_COUNT=$(echo "$DEBATE_RESPONSE" | grep -o '"persona"' | wc -l)
  echo "   Messages: $MESSAGE_COUNT"
  
  # Check for timestamps
  TIMESTAMP_COUNT=$(echo "$DEBATE_RESPONSE" | grep -o '"timestamp"' | wc -l)
  echo "   Timestamps: $TIMESTAMP_COUNT"
  
  # Check for conclusions
  CONCLUSION_COUNT=$(echo "$DEBATE_RESPONSE" | grep -o '"finalOpinion"' | wc -l)
  echo "   Conclusions: $CONCLUSION_COUNT"
  
  # Extract total duration
  TOTAL_DURATION=$(echo "$DEBATE_RESPONSE" | grep -o '"totalDuration":[0-9]*' | cut -d':' -f2)
  if [ -n "$TOTAL_DURATION" ]; then
    echo "   Total Duration: ${TOTAL_DURATION}s"
  else
    echo "   Total Duration: Not found"
  fi
  
  # Show sample messages with timestamps
  echo ""
  echo "💬 Sample Messages with Timestamps:"
  echo "$DEBATE_RESPONSE" | grep -o '"persona":"[^"]*","message":"[^"]*","timestamp":[0-9]*' | head -3 | while read line; do
    PERSONA=$(echo "$line" | grep -o '"persona":"[^"]*"' | cut -d'"' -f4)
    MESSAGE=$(echo "$line" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    TIMESTAMP=$(echo "$line" | grep -o '"timestamp":[0-9]*' | cut -d':' -f2)
    echo "   ${TIMESTAMP}s: $PERSONA - ${MESSAGE:0:50}..."
  done
  
else
  echo "❌ Debate generation failed"
  echo "Response: $DEBATE_RESPONSE"
  exit 1
fi

echo ""
echo "🎯 Frontend Testing Instructions:"
echo "1. Make sure your backend is running: node server.js"
echo "2. Make sure your frontend is running: npm run dev"
echo "3. Go to http://localhost:3000"
echo "4. Enter a dilemma and click 'Let Them Talk'"
echo "5. Should redirect to /debate?id=$DILEMMA_ID"
echo "6. Watch for:"
echo "   - Avatar animations synced with speaking"
echo "   - Transcript appearing in real-time"
echo "   - Only one avatar speaking at a time"
echo "   - Clean handoffs between speakers"
echo "   - Conclusions appearing after debate ends"

echo ""
echo "🔍 Expected Behavior:"
echo "- Heart ❤️, Logic 🧠, and Shadow 😈 avatars animate when speaking"
echo "- Transcript shows messages with emoji prefixes"
echo "- Speaking duration calculated from message length (~15 chars/sec)"
echo "- Total debate lasts ~60-70 seconds"
echo "- All avatars stop animating when debate ends"

echo ""
echo "📱 Console Logs to Watch For:"
echo "- '🎭 Fetching debate data...'"
echo "- '✅ Debate data received:'"
echo "- '🎬 Starting debate with X messages'"
echo "- '💬 [Persona] starts speaking at Xs'"
echo "- '🔇 [Persona] stops speaking'"
echo "- '🏁 Debate ended'"

echo ""
echo "🎨 UI Elements to Verify:"
echo "- Avatar cards show correct animations"
echo "- Transcript box scrolls as messages appear"
echo "- No UI design changes (colors, layout, positioning)"
echo "- Smooth transitions between speaking states" 