#!/bin/bash

echo "🎭 Testing Randomized Debate Flow & Avatar Animations"
echo "=================================================="

# Test the randomized debate engine
echo "🧪 Testing randomized debate generation..."
curl -X POST http://localhost:3001/api/debate/1/respond \
  -H "Content-Type: application/json" \
  -d '{}' \
  -s | jq '.' > test_debate_response.json

echo "✅ Debate response saved to test_debate_response.json"

# Check if the response contains the expected structure
echo "🔍 Analyzing debate structure..."

# Check for messages array
if jq -e '.debate.messages' test_debate_response.json > /dev/null 2>&1; then
    echo "✅ Messages array found"
    
    # Count messages
    message_count=$(jq '.debate.messages | length' test_debate_response.json)
    echo "📊 Total messages: $message_count"
    
    # Check turn distribution
    echo "🎲 Turn distribution:"
    jq -r '.debate.messages[].persona' test_debate_response.json | sort | uniq -c
    
    # Check timestamps are sequential
    timestamps=$(jq -r '.debate.messages[].timestamp' test_debate_response.json)
    echo "⏰ Timestamps: $timestamps"
    
    # Check for natural flow (not rigid Heart->Logic->Shadow)
    echo "🔄 Checking for natural conversation flow..."
    personas=$(jq -r '.debate.messages[].persona' test_debate_response.json)
    echo "📝 Speaking order: $personas"
    
    # Check for consecutive same speaker (should be rare but possible)
    consecutive_count=$(echo "$personas" | awk 'p==$0{c++} {p=$0} END{print c+0}')
    echo "🔄 Consecutive same speaker instances: $consecutive_count"
    
else
    echo "❌ Messages array not found in response"
fi

# Check for conclusions
if jq -e '.debate.conclusions' test_debate_response.json > /dev/null 2>&1; then
    echo "✅ Conclusions found"
    conclusion_count=$(jq '.debate.conclusions | length' test_debate_response.json)
    echo "📝 Conclusion count: $conclusion_count"
else
    echo "❌ Conclusions not found"
fi

# Check total duration
if jq -e '.debate.totalDuration' test_debate_response.json > /dev/null 2>&1; then
    duration=$(jq '.debate.totalDuration' test_debate_response.json)
    echo "⏱️ Total duration: ${duration}s"
    
    if [ "$duration" -le 70 ]; then
        echo "✅ Duration within budget (≤70s)"
    else
        echo "⚠️ Duration exceeds budget (>70s)"
    fi
else
    echo "❌ Total duration not found"
fi

echo ""
echo "🎞️ Avatar Animation Testing Instructions:"
echo "=========================================="
echo "1. Open the debate page in your browser"
echo "2. Submit a dilemma to trigger the debate"
echo "3. Watch for these avatar behaviors:"
echo "   - Only the currently speaking avatar should animate"
echo "   - Animation should cycle through 8 frames smoothly"
echo "   - Non-speaking avatars should stay on frame 1"
echo "   - Console should show animation start/stop logs"
echo ""
echo "4. Check browser console for these logs:"
echo "   - '❤️ Heart avatar: Starting animation'"
echo "   - '🧠 Logic avatar: Starting animation'"
echo "   - '😈 Shadow avatar: Starting animation'"
echo "   - 'X avatar: Stopping animation, resetting to frame 1'"
echo ""
echo "5. Verify debate flow is natural:"
echo "   - No rigid Heart→Logic→Shadow pattern"
echo "   - Personas respond to each other naturally"
echo "   - Random but logical conversation flow"
echo ""
echo "🧪 Test completed! Check the results above and verify in browser." 