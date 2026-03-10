import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProductStatus, Availability } from '../../shared/enums'

export class ProductOptionDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: 'Flavor' })
  name: string

  @ApiProperty({ example: ['Vanilla (Original)', 'Peanut Butter Chocolate'] })
  values: string[]

  @ApiProperty({ example: 0 })
  position: number
}

export class ProductVariantDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: 'WO425' })
  sku: string

  @ApiProperty({ example: 'Chunk Nibbles - 4.25 oz, Vanilla (Original)' })
  name: string

  @ApiPropertyOptional({ example: 'Our Vanilla (Original) flavor...' })
  description?: string

  @ApiProperty({ example: 5.49 })
  priceRetail: number

  @ApiProperty({ example: { Flavor: 'Vanilla (Original)', Size: '4.25 oz' } })
  options: Record<string, string>

  @ApiPropertyOptional({ example: 12 })
  eachCount?: number

  @ApiPropertyOptional({ example: 4.25 })
  eachSize?: number

  @ApiPropertyOptional({ example: 'oz' })
  eachSizeUnit?: string

  @ApiPropertyOptional({ example: 'pouch' })
  eachName?: string

  @ApiPropertyOptional({ example: 'pouches' })
  eachNamePlural?: string

  @ApiProperty({ enum: Availability, example: Availability.IN_STOCK })
  availability: Availability

  @ApiProperty({ example: 0 })
  position: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiPropertyOptional()
  deletedAt?: Date
}

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: 'Chunk Nibbles' })
  name: string

  @ApiProperty({ example: 'chunk-nibbles' })
  slug: string

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.AVAILABLE })
  status: ProductStatus

  @ApiPropertyOptional({ example: 2830 })
  sellerId?: number

  @ApiProperty({ type: [ProductOptionDto] })
  options: ProductOptionDto[]

  @ApiProperty({ type: [ProductVariantDto] })
  variants: ProductVariantDto[]

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiPropertyOptional()
  deletedAt?: Date
}
