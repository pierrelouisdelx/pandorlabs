import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ScrapedDataEntity } from '@scrapers/schemas';

@Schema({ _id: false })
class ListingConfiguration {
  @Prop()
  product_type?: string;

  @Prop()
  is_reserve_displayed?: boolean;

  @Prop()
  broker_commission?: string | null;

  @Prop()
  financing_available?: string | null;

  @Prop()
  buyer_premium_available?: boolean;

  @Prop()
  interior_access_allowed?: boolean;

  @Prop()
  occupancy_status?: string;

  @Prop()
  asset_type?: string;

  @Prop()
  is_first_look_enabled?: boolean;

  @Prop()
  is_direct_offer_enabled?: boolean;

  @Prop()
  is_third_party_online?: boolean;
}

@Schema({ _id: false })
class AttributionSource {
  @Prop()
  origin_code?: string;
}

@Schema({ _id: false })
class ExternalIdentifier {
  @Prop()
  data_source?: string;

  @Prop()
  external_identifier?: string;
}

@Schema({ _id: false })
class Venue {
  @Prop()
  venue_type?: string;
}

@Schema({ _id: false })
class Event {
  @Prop()
  event_code?: string;

  @Prop()
  trustee_sale?: boolean;
}

@Schema({ _id: false })
class Valuation {
  @Prop()
  seller_current_value_amount?: number;
}

@Schema({ _id: false })
class SellerProperty {
  @Prop()
  street_description?: string;

  @Prop()
  municipality?: string;

  @Prop()
  country_primary_subdivision?: string;

  @Prop()
  country_secondary_subdivision?: string;

  @Prop()
  postal_code?: string;
}

@Schema({ _id: false })
class ProgramConfiguration {
  @Prop()
  program_enrollment_code?: string;
}

@Schema({ _id: false })
class Coordinates {
  @Prop()
  lon?: number;

  @Prop()
  lat?: number;
}

@Schema({ _id: false })
class Address {
  @Prop()
  coordinates?: Coordinates;
}

@Schema({ _id: false })
class PropertySummary {
  @Prop()
  total_bedrooms?: number;

  @Prop()
  total_bathrooms?: number;

  @Prop()
  square_footage?: number;

  @Prop()
  lot_size?: number;

  @Prop()
  year_built?: number;

  @Prop()
  valuation?: number;

  @Prop()
  structure_type_code?: string;

  @Prop()
  structure_type_group?: string;

  @Prop()
  address?: Address;
}

@Schema({ _id: false })
class CurrentUserTrackingState {
  @Prop()
  is_seen?: boolean;

  @Prop()
  is_updated?: boolean;
}

@Schema({ _id: false })
class PrimaryProperty {
  @Prop()
  property_id?: string;

  @Prop()
  summary?: PropertySummary;

  @Prop()
  is_newly_listed?: boolean;

  @Prop()
  current_user_tracking_state?: CurrentUserTrackingState;
}

@Schema({ _id: false })
class BidInstruction {
  @Prop()
  nos_amount?: string | null;
}

@Schema({ _id: false })
class Auction {
  @Prop()
  start_date?: string;

  @Prop()
  end_date?: string | null;

  @Prop()
  starting_bid?: string | null;

  @Prop()
  is_online?: boolean;

  @Prop()
  visible_auction_start_date_time?: string;

  @Prop()
  bid_instruction?: BidInstruction;
}

@Schema({ _id: false })
class ListingSummary {
  @Prop()
  is_remote_bid_enabled?: boolean;

  @Prop()
  is_remote_before_and_during_auction_enabled?: boolean;

  @Prop()
  show_opening_bid?: boolean;
}

@Schema({ _id: false })
class CollateralSummaryItem {
  @Prop()
  estimated?: number;

  @Prop()
  low?: number;

  @Prop()
  high?: number;

  @Prop()
  type?: string;
}

@Schema({ _id: false })
class Collateral {
  @Prop([CollateralSummaryItem])
  summary?: CollateralSummaryItem[];
}

@Schema({ _id: false })
class ExternalInformation {
  @Prop()
  collateral?: Collateral;
}

@Schema({ _id: false })
class SellingMethodConfiguration {
  @Prop()
  state_deposit_rule?: string;
}

@Schema({ _id: false })
class SellingMethod {
  @Prop()
  __typename?: string;

  @Prop()
  _alias_LiveAuctionSegment__starting_bid_amount?: string | null;

  @Prop()
  _alias_LiveAuctionSegment__configuration?: SellingMethodConfiguration;

  @Prop()
  current_highest_bid?: string | null;
}

@Schema()
class BaseSchema {
  @Prop()
  listing_id!: string;

  @Prop()
  urn!: string;

  @Prop()
  listing_status_group!: string;

  @Prop()
  listing_status?: string;

  @Prop()
  listing_status_label?: string;

  @Prop()
  primary_photo?: string;

  @Prop()
  primary_property_id?: string;

  @Prop()
  listing_photos_count?: number;

  @Prop()
  listing_page_path?: string;

  @Prop()
  reserve_price?: string | null;

  @Prop()
  is_hot?: string | null;

  @Prop([String])
  formatted_address?: string[];

  @Prop()
  listing_configuration?: ListingConfiguration;

  @Prop()
  attribution_source?: AttributionSource;

  @Prop([ExternalIdentifier])
  external_identifiers?: ExternalIdentifier[];

  @Prop()
  venue?: Venue;

  @Prop()
  event?: Event;

  @Prop()
  valuation?: Valuation;

  @Prop()
  strategy?: string | null;

  @Prop()
  seller_property?: SellerProperty;

  @Prop()
  program_configuration?: ProgramConfiguration;

  @Prop()
  seller_terms?: string | null;

  @Prop()
  primary_property?: PrimaryProperty;

  @Prop()
  auction?: Auction;

  @Prop([String])
  marketing_tags?: string[];

  @Prop()
  open_houses?: string | null;

  @Prop()
  listing_summary?: ListingSummary;

  @Prop()
  external_information?: ExternalInformation;

  @Prop()
  selling_method?: SellingMethod;
}

export const AuctionSchema = SchemaFactory.createForClass(
  ScrapedDataEntity<BaseSchema>,
);
