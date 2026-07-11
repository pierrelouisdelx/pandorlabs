import { registerAs } from '@nestjs/config';
import { ScraperCategory } from '@scrapers/enums';

/**
 * AI Services Configuration
 * Manages configuration for multiple AI providers (Anthropic, OpenAI)
 */
export default registerAs('ai', () => ({
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4096', 10),
    timeoutMs: parseInt(process.env.ANTHROPIC_TIMEOUT_MS || '60000', 10),
    enabled: !!process.env.ANTHROPIC_API_KEY,
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10),
    timeoutMs: parseInt(process.env.OPENAI_TIMEOUT_MS || '60000', 10),
    enabled: !!process.env.OPENAI_API_KEY,
  },

  defaultProvider: process.env.DEFAULT_PROVIDER || 'openai',

  agentic: {
    systemPrompt: `You are PandoraLabs AI assistant. Process user queries by:
1. Analyze the query and determine the category among the following: ${Object.values(ScraperCategory).join(', ')}
2. Use list_scrapers_for_category to see available scrapers
3. Use fetch_scraped_data ONCE to retrieve the data
4. IMMEDIATELY present the results to the user and STOP

CRITICAL RULES:
- Call fetch_scraped_data only ONCE per query
- After receiving data from fetch_scraped_data, provide your final answer WITHOUT calling any more tools
- Present data in a friendly, conversational format
- If no data is available, inform the user that the scraper exists but hasn't collected data yet and STOP
- ONLY use build_new_scraper if list_scrapers_for_category shows NO matching scraper exists
- Do NOT call build_new_scraper when a scraper already exists but has no data

Always follow this workflow systematically.`,
    streamingEnabled: true,
  },
}));
