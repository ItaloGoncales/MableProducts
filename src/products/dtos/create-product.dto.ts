import { IsString, IsEnum, IsOptional, IsInt, MinLength, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProductStatus } from '../../shared/enums'

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Chunk Nibbles',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string

  @ApiPropertyOptional({
    description: 'Product slug (auto-generated from name if not provided)',
    example: 'chunk-nibbles',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string

  @ApiPropertyOptional({
    description: 'Product status',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus

  @ApiPropertyOptional({
    description: 'Seller ID',
    example: 2830,
  })
  @IsOptional()
  @IsInt()
  sellerId?: number
}
