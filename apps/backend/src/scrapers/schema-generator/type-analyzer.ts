import { FieldType, TypeAnalysisResult, FieldDefinition } from './types';

/**
 * Analyzes JSON data to infer TypeScript/Mongoose types
 */
export class TypeAnalyzer {
  /**
   * Analyze a value and determine its type
   */
  static analyzeValue(value: any, key: string): TypeAnalysisResult {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return { type: FieldType.MIXED, isArray: false };
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return {
          type: FieldType.ARRAY,
          isArray: true,
          arrayElementType: FieldType.MIXED,
        };
      }

      const firstElement = value[0];
      const elementAnalysis = this.analyzeValue(firstElement, key);

      return {
        type: FieldType.ARRAY,
        isArray: true,
        arrayElementType: elementAnalysis.type,
        nestedClassName: elementAnalysis.nestedClassName,
        nestedFields: elementAnalysis.nestedFields,
      };
    }

    // Handle objects
    if (typeof value === 'object') {
      const nestedClassName = this.generateNestedClassName(key);
      const nestedFields = this.analyzeObject(value);

      return {
        type: FieldType.OBJECT,
        isArray: false,
        nestedClassName,
        nestedFields,
      };
    }

    // Handle primitives
    if (typeof value === 'string') {
      // Check if it's an ISO date string
      if (this.isISODateString(value)) {
        return { type: FieldType.DATE, isArray: false };
      }
      return { type: FieldType.STRING, isArray: false };
    }

    if (typeof value === 'number') {
      return { type: FieldType.NUMBER, isArray: false };
    }

    if (typeof value === 'boolean') {
      return { type: FieldType.BOOLEAN, isArray: false };
    }

    // Fallback
    return { type: FieldType.MIXED, isArray: false };
  }

  /**
   * Analyze an object and return field definitions
   */
  static analyzeObject(obj: Record<string, any>): FieldDefinition[] {
    const fields: FieldDefinition[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const analysis = this.analyzeValue(value, key);
      const isOptional = value === null || value === undefined;

      fields.push({
        name: key,
        type: analysis.type,
        isOptional,
        isArray: analysis.isArray,
        arrayElementType: analysis.arrayElementType,
        nestedClassName: analysis.nestedClassName,
        nestedFields: analysis.nestedFields,
      });
    }

    return fields;
  }

  /**
   * Check if a string is an ISO date format
   */
  private static isISODateString(value: string): boolean {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoDateRegex.test(value);
  }

  /**
   * Generate a nested class name from a field name
   */
  private static generateNestedClassName(fieldName: string): string {
    // Convert snake_case or camelCase to PascalCase
    const pascalCase = fieldName
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    return pascalCase.charAt(0).toUpperCase() + pascalCase.slice(1) + 'Schema';
  }
}
