export interface IScraperConfig {
  url?: string;
  metadata?: {
    name?: string;
    description?: string;
    createdBy?: string;
    tags?: string[];
  };
  collectionName?: string;
}
