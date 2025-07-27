# Budget Management Guide - OpenAI API

## 💰 Budget Overview

- **Monthly Budget**: $4.00
- **Model**: gpt-4o-mini
- **Pricing**: 
  - Input tokens: $0.15 per 1M tokens
  - Output tokens: $0.60 per 1M tokens

## 🔧 Token Limits Applied

### Response Limits
- **max_tokens**: 250 per persona response
- **Expected response length**: ~1000 characters
- **Cost per persona**: ~$0.0001-0.0002
- **Cost per full debate (3 personas)**: ~$0.0003-0.0006

### Budget Calculations
- **$4.00 budget** = ~6,667 full debates per month
- **Daily limit**: ~222 debates per day
- **Safe daily limit**: ~150 debates per day (with buffer)

## 📊 Token Tracking Features

### Real-time Monitoring
- ✅ Token usage per persona
- ✅ Cost calculation per response
- ✅ Daily and monthly usage tracking
- ✅ Budget remaining alerts
- ✅ API call counting

### Console Logs
```
🤖 Using OpenAI model: gpt-4o-mini for persona: Heart
📊 Heart usage: 75 input + 180 output = 255 total tokens
💰 Cost: $0.000123 (Total: $0.000123)
✅ Successfully generated Heart response (180 characters)

📈 TOKEN USAGE SUMMARY:
🧠 Total tokens used: 765
💰 Total cost: $0.000369
📅 This month: 765 tokens, $0.000369
📞 API calls this month: 3
💳 Budget remaining: $3.99963
```

## 🚨 Budget Alerts

### Warning Thresholds
- **$3.50 spent**: Warning message appears
- **$3.75 spent**: Critical warning
- **$4.00 spent**: Budget exhausted

### Automatic Safeguards
- ✅ max_tokens limit prevents runaway costs
- ✅ Response length monitoring
- ✅ Cost tracking per API call

## 🧪 Testing

### Quick Test
```bash
./test-token-tracking.sh
```

### Expected Results
- Each persona uses ~200-250 tokens
- Total cost per debate: ~$0.0003-0.0006
- Budget remaining updates after each call

## 📈 Usage Optimization Tips

### 1. **Keep Dilemmas Concise**
- Shorter dilemmas = fewer input tokens
- Target: 50-100 words per dilemma

### 2. **Monitor Daily Usage**
- Check console logs for daily summaries
- Stay under 150 debates per day

### 3. **Response Quality**
- 250 tokens = ~1000 characters
- Sufficient for meaningful persona responses
- Balances quality with cost

### 4. **Emergency Controls**
If you need to reduce costs further:
- Reduce max_tokens to 150
- Simplify system prompts
- Add conversation history limits

## 🔍 Monitoring Commands

### Check Current Usage
```bash
# In your backend console
const { tokenTracker } = require('./token-tracker');
tokenTracker.printSummary();
```

### View Daily Logs
```bash
tail -f your-backend-log-file | grep -E '(📊|💰|📈)'
```

### Test Single Persona
```bash
curl -X POST http://localhost:3001/api/debate/{DILEMMA_ID}/respond \
  -H "Content-Type: application/json" \
  -d '{"dummy": "data"}'
```

## 🎯 Cost Breakdown Example

### Single Debate (3 personas)
- **Input tokens**: ~225 (75 per persona)
- **Output tokens**: ~540 (180 per persona)
- **Total tokens**: ~765
- **Total cost**: ~$0.000369

### Monthly Budget Usage
- **$4.00 budget** ÷ **$0.000369 per debate** = **~10,840 debates**
- **Safe limit**: ~6,000 debates per month (with buffer)

## 🚀 Next Steps

1. Run the test script to verify tracking
2. Monitor your first few debates
3. Check console logs for cost summaries
4. Stay within daily limits
5. Enjoy your cost-effective AI personas! 🎭 