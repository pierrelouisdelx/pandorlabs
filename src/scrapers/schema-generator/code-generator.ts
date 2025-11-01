import { FieldDefinition, FieldType, GeneratedSchema } from './types';

/**
 * Generates TypeScript code for NestJS Mongoose schemas
 */
export class CodeGenerator {
  /**
   * Generate complete schema file content
   */
  static generateSchemaFile(
    schema: GeneratedSchema,
    baseImport: boolean = true,
  ): string {
    const imports = this.generateImports(baseImport);
    const nestedClasses = schema.nestedClasses
      .map((nested) => this.generateClass(nested))
      .join('\n\n');
    const mainClass = this.generateClass(schema);

    return `${imports}\n\n${nestedClasses}${nestedClasses ? '\n\n' : ''}${mainClass}\n`;
  }

  /**
   * Generate import statements
   */
  private static generateImports(includeBase: boolean): string {
    const imports = [
      "import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';",
    ];

    if (includeBase) {
      imports.push("import { ScrapedDataEntity } from '@scrapers/schemas';");
    }

    return imports.join('\n');
  }

  /**
   * Generate a class definition
   */
  private static generateClass(schema: GeneratedSchema): string {
    const classDecorator = '@Schema()';
    const fields = schema.fields
      .map((field) => this.generateField(field))
      .join('\n\n  ');

    return `${classDecorator}
export class ${schema.className} {
  ${fields}
}

export const ${schema.className}Factory = SchemaFactory.createForClass(${schema.className});`;
  }

  /**
   * Generate a field with @Prop decorator
   */
  private static generateField(field: FieldDefinition): string {
    const propConfig = this.generatePropConfig(field);
    const decorator = `@Prop(${propConfig})`;
    const tsTypeAnnotation = this.generateTypeScriptTypeAnnotation(field);
    const optional = field.isOptional ? '?' : '';

    return `${decorator}\n  ${field.name}${optional}: ${tsTypeAnnotation};`;
  }

  /**
   * Generate @Prop configuration object
   */
  private static generatePropConfig(field: FieldDefinition): string {
    const config: string[] = [];

    // Type configuration
    if (field.isArray) {
      if (
        field.arrayElementType === FieldType.OBJECT &&
        field.nestedClassName
      ) {
        config.push(`type: [${field.nestedClassName}]`);
      } else {
        const elementType = this.mapFieldTypeToMongoose(
          field.arrayElementType as FieldType,
        );
        config.push(`type: [${elementType}]`);
      }
    } else if (field.type === FieldType.OBJECT && field.nestedClassName) {
      config.push(`type: ${field.nestedClassName}`);
    } else {
      const mongooseType = this.mapFieldTypeToMongoose(field.type);
      config.push(`type: ${mongooseType}`);
    }

    // Required/optional
    if (!field.isOptional) {
      config.push('required: false');
    }

    return `{ ${config.join(', ')} }`;
  }

  /**
   * Generate TypeScript type annotation for field declarations
   */
  private static generateTypeScriptTypeAnnotation(
    field: FieldDefinition,
  ): string {
    if (field.isArray) {
      if (
        field.arrayElementType === FieldType.OBJECT &&
        field.nestedClassName
      ) {
        return `${field.nestedClassName}[]`;
      }
      if (field.arrayElementType === FieldType.MIXED) {
        return 'any[]';
      }
      const elementType = this.mapFieldTypeToTypeScript(
        field.arrayElementType as FieldType,
      );
      return `${elementType}[]`;
    }

    if (field.type === FieldType.OBJECT && field.nestedClassName) {
      return field.nestedClassName;
    }

    if (field.type === FieldType.MIXED) {
      return 'any';
    }

    return this.mapFieldTypeToTypeScript(field.type);
  }

  /**
   * Map FieldType to Mongoose type
   */
  private static mapFieldTypeToMongoose(type: FieldType): string {
    switch (type) {
      case FieldType.STRING:
        return 'String';
      case FieldType.NUMBER:
        return 'Number';
      case FieldType.BOOLEAN:
        return 'Boolean';
      case FieldType.DATE:
        return 'Date';
      case FieldType.MIXED:
        return 'Schema.Types.Mixed';
      default:
        return 'Schema.Types.Mixed';
    }
  }

  /**
   * Map FieldType to TypeScript type
   */
  private static mapFieldTypeToTypeScript(type: FieldType | string): string {
    // If it's a string (class name), return it directly
    if (typeof type === 'string') {
      return type;
    }

    // If it's a FieldType enum, map to TypeScript type
    switch (type) {
      case FieldType.STRING:
        return 'string';
      case FieldType.NUMBER:
        return 'number';
      case FieldType.BOOLEAN:
        return 'boolean';
      case FieldType.DATE:
        return 'Date';
      case FieldType.MIXED:
        return 'any';
      default:
        return 'any';
    }
  }
}
