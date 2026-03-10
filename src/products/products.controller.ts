import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dtos/create-product.dto'
import { CreateVariantDto } from './dtos/create-variant.dto'
import { FilterProductsDto } from './dtos/filter-products.dto'
import { ProductResponseDto } from './dtos/product-response.dto'
import { PaginatedResponseDto } from '../shared/dtos'

@ApiTags('products')
@ApiBearerAuth('bearer')
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Creates a product without variants. Use POST /:id/variants to add variants separately.',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing bearer token',
  })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.createProduct(createProductDto)
  }

  @Post(':id/variants')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add variants to a product',
    description:
      'Adds one or more variants to an existing product. Automatically manages product options based on variant options.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: Number,
  })
  @ApiResponse({
    status: 201,
    description: 'Variants added successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Duplicate SKU or variant options',
  })
  async addVariants(@Param('id', ParseIntPipe) id: number, @Body() createVariantDtos: CreateVariantDto[]) {
    return await this.productsService.addVariants(id, createVariantDtos)
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Returns a paginated list of products with optional filters. Includes options and variants.',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: PaginatedResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing bearer token',
  })
  async findAll(@Query() filterDto: FilterProductsDto) {
    return await this.productsService.findAll(filterDto)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a product by ID',
    description: 'Returns a single product with all options and variants.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing bearer token',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.findOne(id)
  }
}
