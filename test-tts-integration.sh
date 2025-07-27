#!/bin/bash

echo "🎭 Testing TTS Integration for Split Yourself Into Stems"
echo "========================================================"

# Test 1: Create a dilemma
echo "📝 Step 1: Creating a test dilemma..."
DILEMMA_RESPONSE=$(curl -s -X POST http://localhost:3001/api/dilemma \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Should I learn to play the guitar?"}')

DILEMMA_ID=$(echo $DILEMMA_RESPONSE | jq -r '.dilemma.id')
echo "✅ Dilemma created with ID: $DILEMMA_ID"

# Test 2: Generate debate with TTS
echo "🎤 Step 2: Generating debate with TTS audio..."
DEBATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \
  -H "Content-Type: application/json" \
  -d '{"volumeLevels": {"Heart": 100, "Logic": 100, "Shadow": 100}}')

# Check if TTS was generated
SUCCESS=$(echo $DEBATE_RESPONSE | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
    echo "✅ Debate generated successfully"
    
    # Check for audio data
    MESSAGE_COUNT=$(echo $DEBATE_RESPONSE | jq '.debate.messages | length')
    AUDIO_COUNT=$(echo $DEBATE_RESPONSE | jq '.debate.messages | map(select(.audioData != null)) | length')
    
    echo "📊 Messages: $MESSAGE_COUNT"
    echo "🎵 Audio clips: $AUDIO_COUNT"
    
    if [ "$AUDIO_COUNT" -gt 0 ]; then
        echo "✅ TTS integration working! Audio data is included in the response."
        
        # Show first message details
        FIRST_MESSAGE=$(echo $DEBATE_RESPONSE | jq '.debate.messages[0]')
        PERSONA=$(echo $FIRST_MESSAGE | jq -r '.persona')
        MESSAGE_TEXT=$(echo $FIRST_MESSAGE | jq -r '.message')
        AUDIO_SIZE=$(echo $FIRST_MESSAGE | jq -r '.audioData | length')
        
        echo "🎭 First message:"
        echo "   Persona: $PERSONA"
        echo "   Text: $MESSAGE_TEXT"
        echo "   Audio data size: $AUDIO_SIZE characters (base64)"
        
    else
        echo "❌ No audio data found in the response"
        exit 1
    fi
    
else
    echo "❌ Debate generation failed"
    echo $DEBATE_RESPONSE | jq '.'
    exit 1
fi

echo ""
echo "🎉 TTS Integration Test Complete!"
echo "=================================="
echo "✅ Dilemma creation: Working"
echo "✅ Debate generation: Working"
echo "✅ TTS audio generation: Working"
echo "✅ Audio data inclusion: Working"
echo ""
echo "🚀 The frontend should now play TTS audio when messages appear!"
echo "   Visit: http://localhost:3000/debate?id=$DILEMMA_ID" 