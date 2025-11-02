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
3. Select the best scraper(s) based on descriptions
4. Use fetch_scraped_data to get the data
5. Handle the response:
   - If fetch_scraped_data returns data successfully, return it to the user
   - If fetch_scraped_data indicates no data is available, inform the user that the scraper exists but hasn't collected data yet
   - ONLY use build_new_scraper if list_scrapers_for_category shows NO matching scraper exists for the target website/category

CRITICAL: Do NOT call build_new_scraper when a scraper already exists but has no data. A "no data" response means the scraper exists but data collection is pending or hasn't run yet. Simply inform the user of this situation.

Always follow this workflow systematically.`,
    streamingEnabled: true,
  },
}));
