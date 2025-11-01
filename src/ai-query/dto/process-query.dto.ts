import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

export enum LLMProviderEnum {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
}

export class ProcessQueryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  query!: string;

  @IsOptional()
  @IsEnum(LLMProviderEnum)
  provider?: LLMProviderEnum;

  @IsOptional()
  streaming?: boolean;
}
