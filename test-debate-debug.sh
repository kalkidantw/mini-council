#!/bin/bash

echo "🔍 Debugging Debate Generation"
echo "=============================="

# Test 1: Create a dilemma
echo "📝 Step 1: Creating test dilemma..."
DILEMMA_RESPONSE=$(curl -s -X POST http://localhost:3001/api/dilemma \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Should I learn to code?"}')

DILEMMA_ID=$(echo $DILEMMA_RESPONSE | jq -r '.dilemma.id')
echo "✅ Dilemma created with ID: $DILEMMA_ID"

# Test 2: Generate debate with verbose output
echo "🎤 Step 2: Generating debate..."
DEBATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/debate/$DILEMMA_ID/respond \
  -H "Content-Type: application/json" \
  -d '{"volumeLevels": {"Heart": 100, "Logic": 100, "Shadow": 100}}')

echo "📊 Full response:"
echo $DEBATE_RESPONSE | jq '.'

# Check success
SUCCESS=$(echo $DEBATE_RESPONSE | jq -r '.success')
echo "✅ Success: $SUCCESS"

# Check message count
MESSAGE_COUNT=$(echo $DEBATE_RESPONSE | jq '.debate.messages | length')
echo "📝 Message count: $MESSAGE_COUNT"

# Check total duration
TOTAL_DURATION=$(echo $DEBATE_RESPONSE | jq -r '.debate.totalDuration')
echo "⏱️ Total duration: $TOTAL_DURATION"

if [ "$MESSAGE_COUNT" -eq 0 ]; then
    echo "❌ No messages generated - there's an issue with the debate engine"
    echo "🔍 Check the backend logs for errors"
else
    echo "✅ Messages generated successfully"
    
    # Show first few messages
    echo "📋 First 3 messages:"
    echo $DEBATE_RESPONSE | jq '.debate.messages[0:3] | .[] | {persona, timestamp, message: (.message | .[0:50])}'
fi 