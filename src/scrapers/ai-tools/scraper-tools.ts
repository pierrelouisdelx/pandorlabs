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
 * Queries existing scraped data from the database with optional filters
 */
export const fetchScrapedDataTool = (scrapersService: ScrapersService) => {
  return tool(
    async ({ scraperId, filters, options }) => {
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

        // Query existing data from database
        const result = await scrapersService.queryScrapedData(
          scraperId,
          filters,
          options,
        );

        // Return results or no-data message
        if (result.success && result.data && result.data.length > 0) {
          return JSON.stringify({
            success: true,
            source: 'database',
            scraperId,
            category: config.category,
            dataCount: result.count,
            data: result.data,
            pagination: result.pagination,
          });
        } else {
          // Scraper exists but has no data - this is different from scraper not existing
          return JSON.stringify({
            success: true, // Operation succeeded, just no data available
            scraperExists: true,
            hasData: false,
            dataCount: 0,
            scraperId,
            message: `Scraper '${scraperId}' exists but has not collected data yet.`,
            suggestion:
              'Data collection may be in progress, scheduled, or not yet initiated. The scraper is configured and ready, but no data has been scraped yet.',
          });
        }
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
        'Query existing scraped data from the database with optional filters. Returns up to 5 items by default. Use this to check if data is available before executing a scraper.',
      schema: z.object({
        scraperId: z
          .string()
          .describe(
            'The unique identifier of the scraper (e.g., "auction-com", "zillow-rentals")',
          ),
        filters: z
          .record(z.string(), z.any())
          .optional()
          .describe(
            'Optional MongoDB query filters for scraped data fields (e.g., {"primary_property.summary.total_bedrooms": {"$gte": 3}})',
          ),
        options: z
          .object({
            page: z.number().optional().describe('Page number (default: 1)'),
            limit: z
              .number()
              .optional()
              .describe('Items per page (default: 5, max: 100)'),
          })
          .optional()
          .describe('Pagination options'),
      }),
    },
  );
};

/**
 * Tool: Get Schema Sample
 * Returns schema structure and sample data for a specific scraper
 */
export const getSchemaSampleTool = () => {
  return tool(
    async ({ scraperId }) => {
      try {
        // Import schema parser utility
        const {
          generateSchemaDocumentation,
        } = require('@scrapers/utils/schema-parser.util');

        const schemaDoc = generateSchemaDocumentation(scraperId);

        if (!schemaDoc) {
          return JSON.stringify({
            success: false,
            message: `No schema documentation available for scraper: ${scraperId}`,
          });
        }

        return JSON.stringify({
          success: true,
          scraperId,
          schemaName: schemaDoc.schemaName,
          fields: schemaDoc.fields,
          sampleStructure: schemaDoc.sampleStructure,
          message: 'Schema structure and sample data retrieved successfully',
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    {
      name: 'get_schema_sample',
      description:
        'Get the data schema structure and sample data for a specific scraper. Use this to understand what fields are available in the scraped data.',
      schema: z.object({
        scraperId: z
          .string()
          .describe(
            'The scraper ID to get schema information for (e.g., "auction-com")',
          ),
      }),
    },
  );
};

/**
 * Tool: Build New Scraper
 * Creates a new scraper configuration when none exists
 */
export const buildNewScraperTool = (scrapersService: ScrapersService) => {
  return tool(
    async ({ targetUrl, category, dataPoints, scraperName }) => {
      try {
        // Create scraper request in database
        const request = await scrapersService.createScraperRequest({
          targetUrl,
          category,
          dataPoints,
          scraperName,
        });

        return JSON.stringify({
          success: true,
          message:
            'Scraper build request has been queued for manual creation. Our team will review and implement this scraper.',
          requestId: request.id,
          status: request.status,
          estimatedTime: '3-5 business days',
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
        'Request building a NEW scraper ONLY when list_scrapers_for_category shows NO existing scraper for the target website/category. DO NOT use this tool if a scraper already exists but has no data - that simply means data collection is pending. This is a last resort tool - always verify no matching scraper exists first.',
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
    getSchemaSampleTool(),
    buildNewScraperTool(scrapersService),
  ];
};
