import { IsString, IsEnum, IsOptional, IsInt, IsNumber, IsObject, MinLength, MaxLength, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Availability } from '../../shared/enums'

export class CreateVariantDto {
  @ApiProperty({
    description: 'Unique SKU (globally unique)',
    example: 'WO425',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  sku: string

  @ApiProperty({
    description: 'Variant name',
    example: 'Chunk Nibbles - 4.25 oz, Vanilla (Original)',
    minLength: 3,
    maxLength: 500,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  name: string

  @ApiPropertyOptional({
    description: 'Variant description',
    example: "Our Vanilla (Original) flavor is based on Grandma Cuddy's original recipe...",
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string

  @ApiProperty({
    description: 'Retail price',
    example: 5.49,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  priceRetail: number

  @ApiPropertyOptional({
    description: 'Variant options (e.g., {"Flavor": "Vanilla", "Size": "4.25 oz"})',
    example: { Flavor: 'Vanilla (Original)', Size: '4.25 oz' },
  })
  @IsOptional()
  @IsObject()
  options?: Record<string, string>

  @ApiPropertyOptional({
    description: 'Number of items per case',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  eachCount?: number

  @ApiPropertyOptional({
    description: 'Size of each item',
    example: 4.25,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  eachSize?: number

  @ApiPropertyOptional({
    description: 'Unit of measurement',
    example: 'oz',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  eachSizeUnit?: string

  @ApiPropertyOptional({
    description: 'Singular item name',
    example: 'pouch',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  eachName?: string

  @ApiPropertyOptional({
    description: 'Plural item name',
    example: 'pouches',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  eachNamePlural?: string

  @ApiPropertyOptional({
    description: 'Availability status',
    enum: Availability,
    default: Availability.IN_STOCK,
  })
  @IsOptional()
  @IsEnum(Availability)
  availability?: Availability

  @ApiPropertyOptional({
    description: 'Display position',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number
}
