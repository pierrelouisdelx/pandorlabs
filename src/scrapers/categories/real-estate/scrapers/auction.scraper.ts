import { BaseScraper } from '@scrapers/base';
import { ScraperCategory } from '@scrapers/enums';
import { ProxyService } from '@scrapers/services/proxy.service';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { AuctionSchema } from './auction.schema';

export class AuctionScraper extends BaseScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'auction',
      ScraperCategory.REAL_ESTATE,
      {
        url: 'https://www.auction.com/',
        metadata: {
          name: 'Auction Property Scraper',
          description: 'Scrapes property listings from auction platforms',
          tags: ['auction', 'real-estate', 'properties'],
        },
        collectionName: 'auction',
        isActive: true,
      },
      connection,
      proxyService,
    );
  }

  protected async onInitialize(): Promise<void> {
    this.logger.log('Initializing Auction scraper');
  }

  protected async onExecute(): Promise<any> {
    this.logger.log('Executing Auction scraper');
    let page = 0;
    let maxPages = 1;
    const limit = 500;
    const results = [];

    while (page <= maxPages) {
      const impit = this.createImpitClient();

      this.logger.log(`Fetching page ${page}`);
      const response = await impit.fetch('https://graph.auction.com/graphql', {
        method: 'POST',
        headers: {
          'User-Agent': 'adc/fetch/resi_search',
          Accept: 'application/json',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          Referer: 'https://www.auction.com/',
          'Content-Type': 'application/json',
          'Auction-Graph-Source': 'auctioncom',
          'x-cid': '3c0cc80d-6c6b-4668-b880-f1307a0a0f07',
          Origin: 'https://www.auction.com',
        },
        body: JSON.stringify({
          query:
            '\n        \n      fragment ListingCardFields on Listing {\n        listing_id\n        urn\n        listing_status_group\n        listing_status\n        listing_status_label(intent: SEARCH)\n        primary_photo\n        primary_property_id\n        listing_photos_count\n        listing_page_path\n        reserve_price\n        is_hot\n        formatted_address(format: DOUBLE_LINE)\n\n        listing_configuration {\n          product_type\n          is_reserve_displayed\n          broker_commission\n          financing_available\n          buyer_premium_available\n          interior_access_allowed\n          occupancy_status\n          asset_type\n          is_first_look_enabled\n          is_direct_offer_enabled\n          is_third_party_online\n        }\n\n        attribution_source {\n          origin_code\n        }\n\n        external_identifiers {\n          data_source\n          external_identifier\n        }\n\n        venue {\n          venue_type\n        }\n\n        event {\n          event_code\n          trustee_sale\n        }\n\n        valuation {\n          seller_current_value_amount\n        }\n\n        strategy {\n          selling_method_attributes {\n            online_segment_type\n          }\n        }\n\n        seller_property {\n          street_description\n          municipality\n          country_primary_subdivision\n          country_secondary_subdivision\n          postal_code\n        }\n\n        program_configuration {\n          program_enrollment_code\n        }\n\n        seller_terms {\n          inspection_terms {\n            is_option_contingency\n            is_contingency\n          }\n          leaseback_terms {\n            leaseback_period_in_days\n            leaseback_period_rent\n          }\n          finance_terms {\n            finance_preference\n            is_contingency\n          }\n          intent\n        }\n\n        primary_property {\n          property_id\n          summary {\n            total_bedrooms\n            total_bathrooms\n            square_footage\n            lot_size\n            year_built\n            valuation\n            structure_type_code\n            structure_type_group\n            address {\n              coordinates {\n                lon\n                lat\n              }\n            }\n          }\n          is_currently_saved @include(if: $hasAuthenticatedUser)\n          is_newly_listed\n          current_user_tracking_state {\n            is_seen\n            is_updated\n          }\n        }\n\n        auction {\n          start_date\n          end_date\n          starting_bid\n          is_online\n          visible_auction_start_date_time\n          bid_instruction {\n            nos_amount\n          }\n        }\n\n        marketing_tags {\n          tag\n        }\n\n        open_houses {\n          local_date\n          start_time\n          end_time\n        }\n\n        listing_summary {\n          is_remote_bid_enabled\n          is_remote_before_and_during_auction_enabled\n          show_opening_bid\n        }\n\n        external_information(resolvePolicy: CACHE_ONLY) {\n          collateral {\n            summary {\n              estimated\n              low\n              high\n              type\n            }\n          }\n        }\n\n        selling_method(resolvePolicy: CACHE_ONLY) {\n          __typename\n          ... on OnlineAuctionSegment {\n            _alias_OnlineAuctionSegment__starting_bid_amount: starting_bid_amount\n\n            _alias_OnlineAuctionSegment__configuration: configuration {\n              is_match_bidding_enabled\n              is_registration_deposit_required_enabled\n              bid_again_count\n              should_bid_again\n            }\n            listing_id\n            __typename\n            start_date\n            segment_type\n            initial_end_date\n            current_time\n            reserve_status\n            starting_bid_amount\n            subject_to_status\n            current_highest_bid {\n              bid_amount\n              type\n            }\n            segment_status\n            current_increment_amount\n            bid_count\n            result {\n              winning_bid_amount\n            }\n          }\n          ... on LiveAuctionSegment {\n            _alias_LiveAuctionSegment__starting_bid_amount: starting_bid_amount\n\n            _alias_LiveAuctionSegment__configuration: configuration {\n              state_deposit_rule\n            }\n            current_highest_bid {\n              bid_amount\n            }\n          }\n        }\n      }\n     \n        query resiSearch_blueprint_seekListingsFromFilters(\n          $filters: ListingCompatabilityFilters!,\n          $aggregationFields: [String!]!,\n          $hasAuthenticatedUser: Boolean!,\n          $requiresAggregation: Boolean!\n        ) {\n          seek_listings_from_filters(filters: $filters) {\n            total_count\n            total_pages\n            size\n            current_page\n            aggregation(fields: $aggregationFields) @include(if: $requiresAggregation)\n            content {\n              ...ListingCardFields\n            }\n          }\n        }\n      ',
          variables: {
            filters: {
              listing_type: 'active',
              sort: 'auction_date_order,resi_sort_v2',
              limit: limit,
              version: 1,
              offset: page * limit,
            },
            hasAuthenticatedUser: false,
            aggregationFields: [],
            requiresAggregation: false,
          },
        }),
      });

      if (!response.ok) {
        this.logger.error(
          `Failed to fetch page ${page}: ${response.statusText}`,
        );
        throw new Error(`Failed to fetch page ${page}: ${response.statusText}`);
      }

      const data = await response.json();

      /*if (data.data.seek_listings_from_filters.total_pages > maxPages) {
        maxPages = data.data.seek_listings_from_filters.total_pages;
      }*/

      const content = data.data.seek_listings_from_filters.content;
      if (content.length === 0) {
        break;
      } else {
        this.logger.log(`Found ${content.length} listings on page ${page}`);
        results.push(...content);
      }

      page++;
    }

    return results;
  }

  getSchema(): MongooseSchema {
    return AuctionSchema;
  }

  protected async onCancel(): Promise<void> {
    this.logger.log('Cancelling Auction scraper');
  }

  protected async onValidate(): Promise<boolean> {
    this.logger.log('Validating Auction scraper');
    return true;
  }
}
