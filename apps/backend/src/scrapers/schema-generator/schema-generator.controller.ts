import { Body, Controller, Post } from '@nestjs/common';
import { SchemaGeneratorService } from './schema-generator.service';

export class GenerateSchemaDto {
  data!: any;
  className!: string;
  includeBaseImport?: boolean;
}

export class GenerateSchemaFromFileDto {
  filePath!: string;
  className?: string;
  includeBaseImport?: boolean;
}

/**
 * Controller for schema generation endpoints
 */
@Controller('scrapers/schemas')
export class SchemaGeneratorController {
  constructor(private readonly schemaGenerator: SchemaGeneratorService) {}

  /**
   * Generate schema from JSON data
   * POST /scrapers/schemas/generate
   * Body: { data: {...}, className: "MySchema", includeBaseImport: true }
   */
  @Post('generate')
  generateSchema(@Body() dto: GenerateSchemaDto): { code: string } {
    const code = this.schemaGenerator.generateFromJson(
      dto.data,
      dto.className,
      dto.includeBaseImport ?? true,
    );

    return { code };
  }

  /**
   * Generate schema from JSON file
   * POST /scrapers/schemas/generate-from-file
   * Body: { filePath: "/path/to/file.json", className: "MySchema", includeBaseImport: true }
   */
  @Post('generate-from-file')
  async generateSchemaFromFile(
    @Body() dto: GenerateSchemaFromFileDto,
  ): Promise<{ code: string }> {
    const code = await this.schemaGenerator.generateFromFile(
      dto.filePath,
      dto.className,
      dto.includeBaseImport ?? true,
    );

    return { code };
  }
}
