import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AnalyzeQueryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  query!: string;
}
