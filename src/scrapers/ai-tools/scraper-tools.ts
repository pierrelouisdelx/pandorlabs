import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { ScrapersService } from '@scrapers/scrapers.service';
import { CategoryOrchestrator } from '@scrapers/category-orchestrator';

/**
 * Tool: List Scrapers for Category
 * Lists all available scrapers for a specific category
 */
export const listScrapersForCategoryTool = (
  categoryOrchestrator: CategoryOrchestrator,
) => {
  return tool(
    async ({ category }) => {
      try {
        const allScrapers = categoryOrchestrator.getAllSupportedScrapers();

        if (category) {
          const scrapers = allScrapers.get(category as any);
          if (!scrapers || scrapers.length === 0) {
            return JSON.stringify({
              success: false,
              message: `No scrapers found for category: ${category}`,
              availableCategories: Array.from(allScrapers.keys()),
            });
          }

          // Get detailed info for each scraper
          const scrapersInfo = await Promise.all(
            scrapers.map(async (scraperId) => {
              try {
                const scraper =
                  await categoryOrchestrator.getScraper(scraperId);
                return {
                  scraperId: scraper.id,
                  name: scraper.config.metadata?.name || scraperId,
                  description:
                    scraper.config.metadata?.description || 'No description',
                  category: scraper.category,
                  url: scraper.config.url,
                  isActive: scraper.config.isActive,
                  tags: scraper.config.metadata?.tags || [],
                };
              } catch {
                return null;
              }
            }),
          );

          return JSON.stringify({
            success: true,
            category,
            scrapers: scrapersInfo.filter(Boolean),
            count: scrapersInfo.filter(Boolean).length,
          });
        }

        // Return all categories with scraper counts
        const categorySummary = Array.from(allScrapers.entries()).map(
          ([cat, scraperIds]) => ({
            category: cat,
            scraperCount: scraperIds.length,
            scrapers: scraperIds,
          }),
        );

        return JSON.stringify({
          success: true,
          message: 'Available categories and scrapers',
          categories: categorySummary,
          totalScrapers: Array.from(allScrapers.values()).reduce(
            (sum, arr) => sum + arr.length,
            0,
          ),
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    {
      name: 'list_scrapers_for_category',
      description:
        'List all available scrapers for a specific category or all categories. Use this to discover what scrapers are available before fetching data.',
      schema: z.object({
        category: z
          .string()
          .optional()
          .describe(
            'The category to list scrapers for (e.g., "real-estate", "e-commerce", "jobs"). If not provided, lists all categories.',
          ),
      }),
    },
  );
};

/**
 * Tool: Fetch Scraped Data
 * Executes a scraper and retrieves data
 */
export const fetchScrapedDataTool = (scrapersService: ScrapersService) => {
  return tool(
    async ({ scraperId, options }) => {
      try {
        // Find the scraper config by scraperId
        const config = await scrapersService.findById(scraperId);

        if (!config) {
          return JSON.stringify({
            success: false,
            error: `Scraper with ID '${scraperId}' not found. Use list_scrapers_for_category to see available scrapers.`,
          });
        }

        if (!config.isActive) {
          return JSON.stringify({
            success: false,
            error: `Scraper '${scraperId}' is currently inactive.`,
          });
        }

        // Execute the scraper
        const execution = await scrapersService.executeScraper({
          configId: config.id,
          overrideOptions: options || {},
        });

        // Get the execution data
        const data = await scrapersService.getExecutionData(execution.id, {
          page: 1,
          limit: 100,
        });

        return JSON.stringify({
          success: true,
          scraperId,
          executionId: execution.id,
          status: execution.status,
          itemsScraped: execution.itemsScraped,
          data: data.data,
          pagination: data.pagination,
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    {
      name: 'fetch_scraped_data',
      description:
        'Execute a scraper and fetch data from a specific source. Use this after selecting a scraper with list_scrapers_for_category.',
      schema: z.object({
        scraperId: z
          .string()
          .describe(
            'The unique identifier of the scraper to execute (e.g., "zillow-rentals", "acnestudios-products")',
          ),
        options: z
          .record(z.string(), z.any())
          .optional()
          .describe(
            'Optional scraper configuration overrides (e.g., {"maxPages": 5, "filters": {...}})',
          ),
      }),
    },
  );
};

/**
 * Tool: Build New Scraper
 * Creates a new scraper configuration when none exists
 */
export const buildNewScraperTool = () => {
  // TODO: Implement this tool
  return tool(
    async ({ targetUrl, category, dataPoints, scraperName }) => {
      try {
        return JSON.stringify({
          success: false,
          message: 'Not implemented',
          providedInfo: { targetUrl, category, dataPoints, scraperName },
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    {
      name: 'build_new_scraper',
      description:
        'Request building a new scraper when no existing scraper matches the requirements. Only use this as a last resort after checking list_scrapers_for_category.',
      schema: z.object({
        targetUrl: z.url().describe('The target website URL to scrape'),
        category: z
          .string()
          .describe(
            'The category for the new scraper (e.g., "e-commerce", "real-estate", "jobs")',
          ),
        dataPoints: z
          .array(z.string())
          .describe(
            'List of data fields to extract (e.g., ["title", "price", "description", "images"])',
          ),
        scraperName: z
          .string()
          .describe('A descriptive name for the new scraper'),
      }),
    },
  );
};

/**
 * Create all scraper tools
 */
export const createScraperTools = (
  categoryOrchestrator: CategoryOrchestrator,
  scrapersService: ScrapersService,
) => {
  return [
    listScrapersForCategoryTool(categoryOrchestrator),
    fetchScrapedDataTool(scrapersService),
    buildNewScraperTool(),
  ];
};
