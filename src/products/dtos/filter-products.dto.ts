import { IsEnum, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { ProductStatus } from '../../shared/enums'

export class FilterProductsDto {
  @ApiPropertyOptional({
    description: 'Filter by product status',
    enum: ProductStatus,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus

  @ApiPropertyOptional({
    description: 'Filter by seller ID',
    example: 2830,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sellerId?: number

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20

  @ApiPropertyOptional({
    description: 'Detailed view',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  detailed?: boolean = false
}
