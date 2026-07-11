import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { TypeAnalyzer } from './type-analyzer';
import { CodeGenerator } from './code-generator';
import { GeneratedSchema, FieldDefinition } from './types';

/**
 * Service for generating NestJS Mongoose schemas from JSON data
 */
@Injectable()
export class SchemaGeneratorService {
  /**
   * Generate schema from JSON data
   * @param data - JSON object or array of objects
   * @param className - Name for the generated schema class
   * @param includeBaseImport - Whether to include ScrapedDataEntity import
   * @returns Generated TypeScript schema code
   */
  generateFromJson(
    data: any,
    className: string,
    includeBaseImport: boolean = true,
  ): string {
    // If data is an array, use the first element
    const sampleData = Array.isArray(data) ? data[0] : data;

    if (!sampleData || typeof sampleData !== 'object') {
      throw new Error('Data must be an object or array of objects');
    }

    // Analyze the structure
    const schema = this.buildSchema(sampleData, className);

    // Generate code
    return CodeGenerator.generateSchemaFile(schema, includeBaseImport);
  }

  /**
   * Generate schema from a JSON file
   * @param filePath - Path to JSON file
   * @param className - Optional class name (derived from filename if not provided)
   * @param includeBaseImport - Whether to include ScrapedDataEntity import
   * @returns Generated TypeScript schema code
   */
  async generateFromFile(
    filePath: string,
    className?: string,
    includeBaseImport: boolean = true,
  ): Promise<string> {
    // Read the file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Derive class name from filename if not provided
    const derivedClassName =
      className || this.deriveClassNameFromPath(filePath);

    return this.generateFromJson(data, derivedClassName, includeBaseImport);
  }

  /**
   * Build schema structure from data
   */
  private buildSchema(
    data: Record<string, any>,
    className: string,
  ): GeneratedSchema {
    const fields = TypeAnalyzer.analyzeObject(data);
    const nestedClasses: GeneratedSchema[] = [];
    const seenClassNames = new Set<string>();

    // Extract nested classes
    for (const field of fields) {
      if (field.nestedFields && field.nestedClassName) {
        // Skip if we've already seen this class name
        if (!seenClassNames.has(field.nestedClassName)) {
          const nestedSchema = this.buildSchemaFromFields(
            field.nestedFields,
            field.nestedClassName,
            seenClassNames,
          );
          nestedClasses.push(nestedSchema);
          seenClassNames.add(field.nestedClassName);

          // Recursively handle deeply nested classes
          for (const deepNested of nestedSchema.nestedClasses) {
            if (!seenClassNames.has(deepNested.className)) {
              nestedClasses.push(deepNested);
              seenClassNames.add(deepNested.className);
            }
          }
        }
      }

      // Handle arrays of objects
      if (field.isArray && field.nestedFields && field.nestedClassName) {
        if (!seenClassNames.has(field.nestedClassName)) {
          const nestedSchema = this.buildSchemaFromFields(
            field.nestedFields,
            field.nestedClassName,
            seenClassNames,
          );
          nestedClasses.push(nestedSchema);
          seenClassNames.add(field.nestedClassName);

          for (const deepNested of nestedSchema.nestedClasses) {
            if (!seenClassNames.has(deepNested.className)) {
              nestedClasses.push(deepNested);
              seenClassNames.add(deepNested.className);
            }
          }
        }
      }
    }

    // Remove nested fields from main class (they're now separate classes)
    const cleanedFields = fields.map((field) => {
      if (field.nestedFields) {
        const { nestedFields, ...cleanField } = field;
        return cleanField;
      }
      return field;
    });

    return {
      className,
      fields: cleanedFields,
      nestedClasses,
    };
  }

  /**
   * Build schema from field definitions
   */
  private buildSchemaFromFields(
    fields: FieldDefinition[],
    className: string,
    seenClassNames: Set<string>,
  ): GeneratedSchema {
    const nestedClasses: GeneratedSchema[] = [];

    for (const field of fields) {
      if (field.nestedFields && field.nestedClassName) {
        if (!seenClassNames.has(field.nestedClassName)) {
          const nestedSchema = this.buildSchemaFromFields(
            field.nestedFields,
            field.nestedClassName,
            seenClassNames,
          );
          nestedClasses.push(nestedSchema);
          seenClassNames.add(field.nestedClassName);

          for (const deepNested of nestedSchema.nestedClasses) {
            if (!seenClassNames.has(deepNested.className)) {
              nestedClasses.push(deepNested);
              seenClassNames.add(deepNested.className);
            }
          }
        }
      }
    }

    const cleanedFields = fields.map((field) => {
      if (field.nestedFields) {
        const { nestedFields, ...cleanField } = field;
        return cleanField;
      }
      return field;
    });

    return {
      className,
      fields: cleanedFields,
      nestedClasses,
    };
  }

  /**
   * Derive class name from file path
   */
  private deriveClassNameFromPath(filePath: string): string {
    const filename = filePath.split('/').pop() || 'Generated';
    const nameWithoutExt = filename.replace(/\.json$/, '');

    // Convert to PascalCase
    const pascalCase = nameWithoutExt
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    return pascalCase + 'Schema';
  }
}
