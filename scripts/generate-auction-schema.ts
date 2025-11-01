import { SchemaGeneratorService } from '../src/scrapers/schema-generator';
import { promises as fs } from 'fs';
import * as path from 'path';

async function main() {
  const generator = new SchemaGeneratorService();

  const jsonPath = path.join(
    __dirname,
    '../src/scrapers/categories/real-estate/scrapers/auction.json',
  );
  const outputPath = path.join(
    __dirname,
    '../src/scrapers/categories/real-estate/scrapers/auction.schema.ts',
  );

  console.log('Reading JSON from:', jsonPath);
  const generatedCode = await generator.generateFromFile(
    jsonPath,
    'AuctionListing',
    false, // Don't include ScrapedDataEntity import for now
  );

  console.log('Generated schema:\n');
  console.log(generatedCode);

  console.log('\nWriting to:', outputPath);
  await fs.writeFile(outputPath, generatedCode, 'utf-8');

  console.log('✅ Schema generated successfully!');
}

main().catch(console.error);
