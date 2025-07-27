#!/bin/bash

echo "🧠 Testing Upgraded Synthesize Wisdom Modal"
echo "=========================================="

# Test the debate generation to get conclusions for modal testing
echo "🧪 Generating debate with conclusions for modal testing..."
curl -X POST http://localhost:3001/api/debate/1/respond \
  -H "Content-Type: application/json" \
  -d '{}' \
  -s | jq '.' > test_modal_response.json

echo "✅ Debate response saved to test_modal_response.json"

# Check if the response contains conclusions for modal testing
echo "🔍 Analyzing modal content structure..."

# Check for conclusions array
if jq -e '.debate.conclusions' test_modal_response.json > /dev/null 2>&1; then
    echo "✅ Conclusions array found for modal testing"
    
    # Display the conclusions that will be used in the modal
    echo "📝 Persona conclusions for modal:"
    jq -r '.debate.conclusions[] | "\(.persona): \(.finalOpinion)"' test_modal_response.json
    
    # Test the helper functions logic
    echo ""
    echo "🧠 Testing modal helper functions..."
    
    # Extract conclusions for testing
    heart_opinion=$(jq -r '.debate.conclusions[] | select(.persona=="Heart") | .finalOpinion' test_modal_response.json)
    logic_opinion=$(jq -r '.debate.conclusions[] | select(.persona=="Logic") | .finalOpinion' test_modal_response.json)
    shadow_opinion=$(jq -r '.debate.conclusions[] | select(.persona=="Shadow") | .finalOpinion' test_modal_response.json)
    
    echo "💭 Heart opinion: $heart_opinion"
    echo "🧠 Logic opinion: $logic_opinion"
    echo "😈 Shadow opinion: $shadow_opinion"
    
    # Test sentiment analysis
    positive_words=("should" "recommend" "good" "beneficial" "positive" "proceed" "go ahead" "yes")
    negative_words=("shouldn't" "avoid" "bad" "risky" "negative" "don't" "no" "reconsider")
    
    echo ""
    echo "📊 Sentiment analysis for modal decision generation:"
    
    # Check Heart sentiment
    heart_positive=false
    heart_negative=false
    for word in "${positive_words[@]}"; do
        if [[ "$heart_opinion" == *"$word"* ]]; then
            heart_positive=true
            break
        fi
    done
    for word in "${negative_words[@]}"; do
        if [[ "$heart_opinion" == *"$word"* ]]; then
            heart_negative=true
            break
        fi
    done
    echo "❤️ Heart: $(if $heart_positive; then echo "POSITIVE"; elif $heart_negative; then echo "NEGATIVE"; else echo "NEUTRAL"; fi)"
    
    # Check Logic sentiment
    logic_positive=false
    logic_negative=false
    for word in "${positive_words[@]}"; do
        if [[ "$logic_opinion" == *"$word"* ]]; then
            logic_positive=true
            break
        fi
    done
    for word in "${negative_words[@]}"; do
        if [[ "$logic_opinion" == *"$word"* ]]; then
            logic_negative=true
            break
        fi
    done
    echo "🧠 Logic: $(if $logic_positive; then echo "POSITIVE"; elif $logic_negative; then echo "NEGATIVE"; else echo "NEUTRAL"; fi)"
    
    # Check Shadow sentiment
    shadow_positive=false
    shadow_negative=false
    for word in "${positive_words[@]}"; do
        if [[ "$shadow_opinion" == *"$word"* ]]; then
            shadow_positive=true
            break
        fi
    done
    for word in "${negative_words[@]}"; do
        if [[ "$shadow_opinion" == *"$word"* ]]; then
            shadow_negative=true
            break
        fi
    done
    echo "😈 Shadow: $(if $shadow_positive; then echo "POSITIVE"; elif $shadow_negative; then echo "NEGATIVE"; else echo "NEUTRAL"; fi)"
    
else
    echo "❌ Conclusions array not found for modal testing"
fi

echo ""
echo "🎯 Modal Testing Instructions:"
echo "=============================="
echo "1. Open the debate page in your browser"
echo "2. Submit a dilemma to trigger the debate"
echo "3. Wait for the debate to complete"
echo "4. Verify the modal automatically appears"
echo ""
echo "5. Check the three distinct sections:"
echo "   ⚖️ Balanced Perspective - Should show neutral blend of all viewpoints"
echo "   ✅ Final Decision - Should show ONE clear conclusion (not 3 choices)"
echo "   📊 Opinion Summary - Should show agreement/disagreement patterns"
echo ""
echo "6. Verify the disclaimer footer appears:"
echo "   'This is AI-generated and not a substitute for professional advice...'"
echo ""
echo "7. Check that the Synthesize Wisdom button is always visible"
echo "8. Verify no avatar squares appear inside the modal"
echo ""
echo "🧪 Expected Modal Behavior:"
echo "=========================="
echo "- Modal should auto-open when debate ends"
echo "- Three distinct sections with clear headers and icons"
echo "- Final Decision should be decisive (Yes/No/Proceed with caution)"
echo "- Opinion Summary should show who agreed/disagreed"
echo "- Disclaimer should appear at the bottom"
echo "- Modal should be scrollable if content is long"
echo ""
echo "🧪 Test completed! Verify the modal functionality in browser." 