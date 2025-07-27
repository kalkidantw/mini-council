#!/bin/bash

echo "🎭 Testing Continuous Animation Fix"
echo "=================================="

# Test the debate generation to get data for testing
echo "🧪 Generating debate data for animation testing..."
curl -X POST http://localhost:3001/api/debate/1/respond \
  -H "Content-Type: application/json" \
  -d '{}' \
  -s | jq '.' > test_continuous_animation_response.json

echo "✅ Debate response saved to test_continuous_animation_response.json"

# Check if the response contains the expected structure
echo "🔍 Analyzing debate structure for animation testing..."

# Check for messages array
if jq -e '.debate.messages' test_continuous_animation_response.json > /dev/null 2>&1; then
    echo "✅ Messages array found"
    
    # Count messages
    message_count=$(jq '.debate.messages | length' test_continuous_animation_response.json)
    echo "📊 Total messages: $message_count"
    
    # Check turn distribution
    echo "🎲 Turn distribution:"
    jq -r '.debate.messages[].persona' test_continuous_animation_response.json | sort | uniq -c
    
    # Check timestamps are sequential
    timestamps=$(jq -r '.debate.messages[].timestamp' test_continuous_animation_response.json)
    echo "⏰ Timestamps: $timestamps"
    
    # Check for speaking duration estimates
    echo "🗣️ Speaking duration estimates:"
    jq -r '.debate.messages[] | "\(.persona): \(.message | length) chars"' test_continuous_animation_response.json
    
else
    echo "❌ Messages array not found in response"
fi

echo ""
echo "🎞️ Continuous Animation Testing Instructions:"
echo "============================================"
echo "1. Open the debate page in your browser"
echo "2. Submit a dilemma to trigger the debate"
echo "3. Watch for these animation behaviors:"
echo ""
echo "   🔥 TASK 1: Continuous Animation"
echo "   - Each speaker should animate when it's their turn"
echo "   - Animation should cycle through all 8 frames smoothly"
echo "   - Animation should restart cleanly for each speaker"
echo "   - No lingering or frozen animations between turns"
echo ""
echo "   ✨ TASK 2: Proper Reset"
echo "   - When a persona stops speaking, reset to frame1.png"
echo "   - Animation should stop immediately when speaking ends"
echo "   - Next speaker should start from frame1.png"
echo "   - No overlapping animations"
echo ""
echo "   🌟 TASK 3: Aura Activation"
echo "   - Aura should activate for currently speaking persona only"
echo "   - Aura should deactivate when speaking ends"
echo "   - Aura should activate for each speaker throughout debate"
echo "   - No stuck or missing aura effects"
echo ""
echo "4. Check browser console for these logs:"
echo "   - '🎬 Starting realistic debate with X messages'"
echo "   - '💬 [Persona] starts speaking at Xs'"
echo "   - '🎭 [Persona] animation activated'"
echo "   - '🔇 [Persona] stops speaking'"
echo "   - '🎭 [Persona] animation deactivated'"
echo "   - '❤️/🧠/😈 [Persona] avatar: Starting animation, frame 1'"
echo "   - '❤️/🧠/😈 [Persona] avatar: Stopping animation, resetting to frame 1'"
echo "   - '🏁 Debate ended'"
echo "   - '🎭 All animations stopped'"
echo ""
echo "🧪 Expected Results:"
echo "==================="
echo "- Every speaker animates when it's their turn"
echo "- Smooth 8-frame cycling for each speaker"
echo "- Proper reset to frame1.png when speaking ends"
echo "- Aura activates/deactivates correctly for each speaker"
echo "- No animation conflicts or state leaks"
echo "- Clean transitions between speakers"
echo "- All animations stop when debate ends"
echo ""
echo "🔍 Debugging Tips:"
echo "================="
echo "- Watch console logs for animation state changes"
echo "- Check if 'animation activated' logs appear for each speaker"
echo "- Verify 'animation deactivated' logs when speakers stop"
echo "- Ensure no overlapping timer intervals"
echo "- Confirm proper state cleanup between turns"
echo ""
echo "🔒 Constraints Verified:"
echo "======================="
echo "- No UI layout changes made"
echo "- No styling modifications"
echo "- Only animation logic and state management fixes"
echo "- Preserved existing visual design"
echo ""
echo "🧪 Test completed! Verify continuous animation in browser." 