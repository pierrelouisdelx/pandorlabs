/**
 * Schema Parser Utility
 * Extracts schema structure from Mongoose schema files for documentation
 */

export interface SchemaField {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
  nested?: SchemaField[];
}

export interface SchemaDocumentation {
  schemaName: string;
  fields: SchemaField[];
  sampleStructure: Record<string, any>;
}

/**
 * Parse auction schema and return structured documentation
 * This is a simplified parser that provides the schema structure
 */
export function parseAuctionSchema(): SchemaDocumentation {
  return {
    schemaName: 'Auction',
    fields: [
      {
        name: 'listing_id',
        type: 'string',
        optional: false,
        description: 'Unique listing identifier',
      },
      {
        name: 'urn',
        type: 'string',
        optional: false,
        description: 'Uniform Resource Name for the listing',
      },
      {
        name: 'listing_status_group',
        type: 'string',
        optional: false,
        description: 'Status group (e.g., active, sold, pending)',
      },
      {
        name: 'listing_status',
        type: 'string',
        optional: true,
        description: 'Detailed listing status',
      },
      {
        name: 'primary_photo',
        type: 'string',
        optional: true,
        description: 'URL to the primary property photo',
      },
      {
        name: 'formatted_address',
        type: 'string[]',
        optional: true,
        description: 'Human-readable address components',
      },
      {
        name: 'primary_property',
        type: 'object',
        optional: true,
        description: 'Primary property details',
        nested: [
          {
            name: 'property_id',
            type: 'string',
            optional: true,
            description: 'Property identifier',
          },
          {
            name: 'summary',
            type: 'object',
            optional: true,
            description: 'Property summary information',
            nested: [
              {
                name: 'total_bedrooms',
                type: 'number',
                optional: true,
              },
              {
                name: 'total_bathrooms',
                type: 'number',
                optional: true,
              },
              {
                name: 'square_footage',
                type: 'number',
                optional: true,
              },
              {
                name: 'lot_size',
                type: 'number',
                optional: true,
              },
              {
                name: 'year_built',
                type: 'number',
                optional: true,
              },
              {
                name: 'valuation',
                type: 'number',
                optional: true,
              },
              {
                name: 'structure_type_code',
                type: 'string',
                optional: true,
              },
              {
                name: 'address',
                type: 'object',
                optional: true,
                nested: [
                  {
                    name: 'coordinates',
                    type: 'object',
                    optional: true,
                    nested: [
                      { name: 'lon', type: 'number', optional: true },
                      { name: 'lat', type: 'number', optional: true },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'auction',
        type: 'object',
        optional: true,
        description: 'Auction details',
        nested: [
          {
            name: 'start_date',
            type: 'string',
            optional: true,
            description: 'Auction start date (ISO format)',
          },
          {
            name: 'end_date',
            type: 'string',
            optional: true,
            description: 'Auction end date (ISO format)',
          },
          {
            name: 'starting_bid',
            type: 'string',
            optional: true,
            description: 'Starting bid amount',
          },
          {
            name: 'is_online',
            type: 'boolean',
            optional: true,
            description: 'Whether auction is online',
          },
        ],
      },
      {
        name: 'reserve_price',
        type: 'string',
        optional: true,
        description: 'Reserve price for the property',
      },
      {
        name: 'valuation',
        type: 'object',
        optional: true,
        description: 'Property valuation information',
        nested: [
          {
            name: 'seller_current_value_amount',
            type: 'number',
            optional: true,
          },
        ],
      },
      {
        name: 'seller_property',
        type: 'object',
        optional: true,
        description: 'Seller property information',
        nested: [
          { name: 'street_description', type: 'string', optional: true },
          { name: 'municipality', type: 'string', optional: true },
          {
            name: 'country_primary_subdivision',
            type: 'string',
            optional: true,
          },
          { name: 'postal_code', type: 'string', optional: true },
        ],
      },
      {
        name: 'listing_configuration',
        type: 'object',
        optional: true,
        description: 'Listing configuration options',
        nested: [
          { name: 'product_type', type: 'string', optional: true },
          { name: 'occupancy_status', type: 'string', optional: true },
          { name: 'asset_type', type: 'string', optional: true },
        ],
      },
    ],
    sampleStructure: {
      listing_id: 'example-123',
      urn: 'urn:auction:property:123',
      listing_status_group: 'active',
      listing_status: 'open_for_bidding',
      primary_photo: 'https://example.com/photo.jpg',
      formatted_address: ['123 Main St', 'Bristol, CT 06010'],
      primary_property: {
        property_id: 'prop-456',
        summary: {
          total_bedrooms: 3,
          total_bathrooms: 2,
          square_footage: 1500,
          lot_size: 5000,
          year_built: 1995,
          valuation: 250000,
          structure_type_code: 'SFR',
          address: {
            coordinates: {
              lon: -72.9493,
              lat: 41.6718,
            },
          },
        },
      },
      auction: {
        start_date: '2024-01-15T10:00:00Z',
        end_date: '2024-01-22T18:00:00Z',
        starting_bid: '150000',
        is_online: true,
      },
      reserve_price: '200000',
      valuation: {
        seller_current_value_amount: 250000,
      },
    },
  };
}

/**
 * Generate generic schema documentation from any schema file
 * Future enhancement: Parse TypeScript files dynamically
 */
export function generateSchemaDocumentation(
  scraperId: string,
): SchemaDocumentation | null {
  // For now, only auction schema is supported
  if (scraperId === 'auction-com' || scraperId.includes('auction')) {
    return parseAuctionSchema();
  }

  // Return null for unsupported schemas
  return null;
}
