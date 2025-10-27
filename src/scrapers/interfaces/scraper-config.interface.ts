export interface IScraperConfig {
  url: string;
  metadata: {
    name: string;
    description: string;
    tags: string[];
  };
  collectionName: string;
  isActive: boolean;
}
