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
    const maxPages = 23;
    const results = [];

    for (let page = 0; page <= maxPages; page++) {
      const impit = this.createImpitClient();

      this.logger.log(`Fetching page ${page}`);
      const response = await impit.fetch('https://graph.auction.com/graphql', {
        headers: {
          'User-Agent': 'adc/fetch/resi_search',
          Accept: 'application/json',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          Referer: 'https://www.auction.com/',
          'Auction-Graph-Source': 'auctioncom',
          'x-cid': '4506197b-3f07-421e-8ead-ab2deb4c0026',
          'x-datadog-origin': 'rum',
          'x-datadog-parent-id': '4441363362786624015',
          'x-datadog-sampling-priority': '1',
          'x-datadog-trace-id': '6757365868624504342',
          Origin: 'https://www.auction.com',
          'Sec-GPC': '1',
          Connection: 'keep-alive',
          Cookie:
            'BRID=55e4ff1d-c78c-448a-9e7c-954d7e73ee72; visid_incap_825466=McSoZt4/S7iPAdaI1bwLvmj702gAAAAAQUIPAAAAAACpMo/jWTA5ehfPlYuiM571; nlbi_825466=lSs2EZ5UD0pxxAZWumS1YQAAAABTBDme1v3TGsC22oFVFGmx; incap_ses_1810_825466=HqAtAwWmEX+irHGEz2keGfL202gAAAAANpVqYIk/e5pW69M6EO+zHg==; incap_ses_241_825466=eErOHkep4g7vc6LpoTRYA9nJzWgAAAAA1vTNT+iSB4yZL880teLTLw==; visid_incap_2075278=/txc1OSoTdmBfwurkzekxfX202gAAAAAQUIPAAAAAAC24Xc2SEdMsXQhbPFdUTRl; nlbi_2075278=SZL0ZGtD3HAmu17HeaK5wwAAAABHHIGFC2bvoXyxBBlbieiR; incap_ses_1810_2075278=mFpgPbOVaxtJr3GEz2keGff202gAAAAAo2RRSvRTWJtzDlMMWFmyYQ==; OptanonConsent=isGpcEnabled=1&datestamp=Wed+Sep+24+2025+16%3A59%3A06+GMT%2B0200+(Central+European+Summer+Time)&version=202308.2.0&browserGpcFlag=1&isIABGlobal=false&hosts=&consentId=32254b56-9f22-4d9b-9f5d-bd308807f188&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0&AwaitingReconsent=false; incap_ses_1310_2075278=iy60WsMP0Ft2F3+qfA4uErf302gAAAAAi37LzZpJIdhtii1mqG78ag==; incap_ses_1310_825466=NzrpRIe+xQVdMoWqfA4uEmj702gAAAAAxQuL9HY8VpKZxanmWBUO8A==',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
        },
        body: JSON.stringify({
          query:
            '\n        query resiSearch_blueprint_seekListingsFromFilters(\n          $filters: ListingCompatabilityFilters!,\n          $aggregationFields: [String!]!,\n          $hasAuthenticatedUser: Boolean!,\n          $requiresAggregation: Boolean!\n        ) {\n          seek_listings_from_filters(filters: $filters) {\n            total_count\n            total_pages\n            size\n            current_page\n            aggregation(fields: $aggregationFields) @include(if: $requiresAggregation)\n            content {\n                ...ListingCardFields\n                ...ListingPopupCardFields\n            }\n          }\n        }\n        \n  fragment ListingCardFields on Listing {\n    listing_id\n    urn\n    listing_status_group\n    listing_status\n    listing_status_label(intent: SEARCH)\n    primary_photo\n    primary_property_id\n    listing_photos_count\n    listing_page_path\n    reserve_price\n    is_hot\n    formatted_address(format: DOUBLE_LINE)\n    listing_configuration {\n      product_type\n      is_reserve_displayed\n      broker_commission\n      financing_available\n      buyer_premium_available\n      interior_access_allowed\n      occupancy_status\n      asset_type\n      is_first_look_enabled\n      is_direct_offer_enabled\n      is_third_party_online\n    }\n    attribution_source {\n      origin_code\n    }\n    external_identifiers {\n      data_source\n      external_identifier\n    }\n    venue {\n      venue_type\n    }\n    event {\n      event_code\n      trustee_sale\n    }\n    valuation {\n      seller_current_value_amount\n    }\n    strategy {\n      selling_method_attributes {\n        online_segment_type\n      }\n    }\n    seller_property {\n      street_description\n      municipality\n      country_primary_subdivision\n      country_secondary_subdivision\n      postal_code\n    }\n    program_configuration {\n      program_enrollment_code\n    }\n    primary_property {\n      property_id\n      summary {\n        total_bedrooms\n        total_bathrooms\n        square_footage\n        lot_size\n        year_built\n        valuation\n        structure_type_code\n        structure_type_group\n        address {\n          coordinates {\n            lon\n            lat\n          }\n        }\n      }\n      is_currently_saved @include(if: $hasAuthenticatedUser)\n      is_newly_listed\n      current_user_tracking_state {\n        is_seen\n        is_updated\n      }\n    }\n    auction {\n      start_date\n      end_date\n      starting_bid\n      is_online\n      visible_auction_start_date_time\n      bid_instruction {\n        nos_amount\n      }\n    }\n    parties {\n      party_role\n      party_name\n    }\n    marketing_tags {\n      tag\n    }\n    online_auction_segment(resolvePolicy: CACHE_ONLY) {\n      __typename\n      segment_type\n      reserve_status\n      current_highest_bid {\n        bid_amount\n      }\n    }\n    open_houses {\n      local_date\n      start_time\n      end_time\n    }\n    live_auction_segment(resolvePolicy: CACHE_ONLY) {\n      current_highest_bid {\n        bid_amount\n      }\n      configuration {\n        state_deposit_rule\n      }\n    }\n    listing_summary {\n      is_remote_bid_enabled\n      is_remote_before_and_during_auction_enabled\n      show_opening_bid\n    }\n    external_information(resolvePolicy: CACHE_ONLY) {\n      collateral {\n        summary {\n          estimated\n          low\n          high\n          type\n        }\n      }\n    }\n    selling_method {\n      __typename\n      ... on OnlineAuctionSegment {\n        _alias_OnlineAuctionSegment__starting_bid_amount: starting_bid_amount\n      }\n      ... on LiveAuctionSegment {\n        _alias_LiveAuctionSegment__starting_bid_amount: starting_bid_amount\n      }\n    }\n  }\n  fragment ListingPopupCardFields on Listing {\n    listing_id\n    formatted_address_line_1: formatted_address(format: SINGLE_LINE)\n    listing_summary {\n      is_remote_bid_enabled\n      is_remote_before_and_during_auction_enabled\n      show_opening_bid\n    }\n    listing_status_group\n    listing_page_path\n    primary_photo\n    reserve_price\n\n    listing_configuration {\n      product_type\n      asset_type\n      is_third_party_online\n    }\n\n    event {\n      event_code\n    }\n\n    seller_property {\n      street_description\n      country_secondary_subdivision\n      municipality\n      postal_code\n    }\n\n    program_configuration {\n      program_enrollment_code\n    }\n\n    primary_property {\n      property_id\n      summary {\n        total_bedrooms\n        total_bathrooms\n        square_footage\n        address {\n          coordinates {\n            lat\n            lon\n          }\n        }\n      }\n      is_newly_listed\n      current_user_tracking_state {\n        is_seen\n        is_updated\n      }\n    }\n\n    auction {\n      starting_bid\n      is_online\n      bid_instruction {\n        nos_amount\n      }\n    }\n\n    online_auction_segment(resolvePolicy: CACHE_ONLY) {\n      listing_id\n      __typename\n      start_date\n      segment_type\n      initial_end_date\n      current_time\n      reserve_status\n      configuration {\n        is_match_bidding_enabled\n        is_registration_deposit_required_enabled\n        bid_again_count\n        should_bid_again\n      }\n      starting_bid_amount\n      subject_to_status\n      current_highest_bid {\n        bid_amount\n        type\n      }\n      segment_status\n      current_increment_amount\n      bid_count\n      result {\n        winning_bid_amount\n      }\n    }\n\n    live_auction_segment(resolvePolicy: CACHE_ONLY) {\n      current_highest_bid {\n        bid_amount\n      }\n    }\n  }\n\n      ',
          variables: {
            filters: {
              listing_type: 'active',
              sort: 'auction_date_order,resi_sort_v2',
              limit: 500,
              usecode_product_type: 'resi_ft',
              version: 1,
              offset: page * 500,
            },
            hasAuthenticatedUser: false,
            aggregationFields: [],
            requiresAggregation: false,
          },
        }),
        method: 'POST',
      });

      if (!response.ok) {
        this.logger.error(
          `Failed to fetch page ${page}: ${response.statusText}`,
        );
        throw new Error(`Failed to fetch page ${page}: ${response.statusText}`);
      }

      const data = await response.json();

      const content = data.data.seek_listings_from_filters.content;
      if (content.length === 0) {
        break;
      } else {
        console.log(`Found ${content.length} listings on page ${page}`);
        results.push(...content);
      }
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
