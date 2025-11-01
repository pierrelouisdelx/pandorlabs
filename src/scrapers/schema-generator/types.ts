/**
 * Internal types for schema generation
 */

export enum FieldType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATE = 'Date',
  ARRAY = 'Array',
  OBJECT = 'Object',
  MIXED = 'Mixed',
}

export interface FieldDefinition {
  name: string;
  type: FieldType;
  isOptional: boolean;
  isArray: boolean;
  arrayElementType?: FieldType | string; // String for nested class names
  nestedClassName?: string;
  nestedFields?: FieldDefinition[];
}

export interface GeneratedSchema {
  className: string;
  fields: FieldDefinition[];
  nestedClasses: GeneratedSchema[];
}

export interface TypeAnalysisResult {
  type: FieldType;
  isArray: boolean;
  arrayElementType?: FieldType | string;
  nestedClassName?: string;
  nestedFields?: FieldDefinition[];
}
