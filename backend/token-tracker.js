// Token tracking utility for OpenAI API cost management
// gpt-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens

class TokenTracker {
  constructor() {
    this.totalTokens = 0;
    this.totalCost = 0;
    this.dailyUsage = {};
    this.monthlyUsage = {};
  }

  // Calculate cost based on OpenAI's gpt-4o-mini pricing
  calculateCost(inputTokens, outputTokens) {
    const inputCost = (inputTokens * 0.15) / 1000000; // $0.15 per 1M input tokens
    const outputCost = (outputTokens * 0.60) / 1000000; // $0.60 per 1M output tokens
    return inputCost + outputCost;
  }

  // Track token usage for a persona response
  trackUsage(persona, usage) {
    if (!usage) return;

    const { prompt_tokens, completion_tokens, total_tokens } = usage;
    const cost = this.calculateCost(prompt_tokens, completion_tokens);

    // Update totals
    this.totalTokens += total_tokens;
    this.totalCost += cost;

    // Update daily usage
    const today = new Date().toISOString().split('T')[0];
    if (!this.dailyUsage[today]) {
      this.dailyUsage[today] = { tokens: 0, cost: 0, calls: 0 };
    }
    this.dailyUsage[today].tokens += total_tokens;
    this.dailyUsage[today].cost += cost;
    this.dailyUsage[today].calls += 1;

    // Update monthly usage
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    if (!this.monthlyUsage[thisMonth]) {
      this.monthlyUsage[thisMonth] = { tokens: 0, cost: 0, calls: 0 };
    }
    this.monthlyUsage[thisMonth].tokens += total_tokens;
    this.monthlyUsage[thisMonth].cost += cost;
    this.monthlyUsage[thisMonth].calls += 1;

    // Log detailed usage
    console.log(`📊 ${persona} usage: ${prompt_tokens} input + ${completion_tokens} output = ${total_tokens} total tokens`);
    console.log(`💰 Cost: $${cost.toFixed(6)} (Total: $${this.totalCost.toFixed(4)})`);
    
    // Budget warning
    if (this.monthlyUsage[thisMonth].cost > 3.5) {
      console.log(`⚠️ WARNING: Monthly budget nearly exceeded! Current: $${this.monthlyUsage[thisMonth].cost.toFixed(2)}/4.00`);
    }
  }

  // Get current usage summary
  getSummary() {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthly = this.monthlyUsage[thisMonth] || { tokens: 0, cost: 0, calls: 0 };
    
    return {
      totalTokens: this.totalTokens,
      totalCost: this.totalCost,
      monthlyTokens: monthly.tokens,
      monthlyCost: monthly.cost,
      monthlyCalls: monthly.calls,
      budgetRemaining: 4.00 - monthly.cost
    };
  }

  // Print usage summary
  printSummary() {
    const summary = this.getSummary();
    console.log('\n📈 TOKEN USAGE SUMMARY:');
    console.log(`🧠 Total tokens used: ${summary.totalTokens.toLocaleString()}`);
    console.log(`💰 Total cost: $${summary.totalCost.toFixed(4)}`);
    console.log(`📅 This month: ${summary.monthlyTokens.toLocaleString()} tokens, $${summary.monthlyCost.toFixed(4)}`);
    console.log(`📞 API calls this month: ${summary.monthlyCalls}`);
    console.log(`💳 Budget remaining: $${summary.budgetRemaining.toFixed(2)}`);
    
    if (summary.budgetRemaining < 0.50) {
      console.log(`🚨 WARNING: Budget nearly exhausted!`);
    }
  }
}

// Create singleton instance
const tokenTracker = new TokenTracker();

module.exports = {
  tokenTracker,
  TokenTracker
}; 