import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, EntityManager } from 'typeorm'
import equal from 'fast-deep-equal'
import { Product } from './entities/product.entity'
import { ProductOption } from './entities/product-option.entity'
import { ProductVariant } from './entities/product-variant.entity'
import { CreateProductDto } from './dtos/create-product.dto'
import { CreateVariantDto } from './dtos/create-variant.dto'
import { FilterProductsDto } from './dtos/filter-products.dto'
import { ProductStatus } from '../shared/enums'
import { PaginatedResponseDto } from '../shared/dtos'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductOption)
    private productOptionRepository: Repository<ProductOption>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    private dataSource: DataSource,
  ) {}

  /**
   * Generate URL-friendly slug from product name
   * Normalizes accented characters (ç→c, á→a, etc.) before processing
   * Ensures uniqueness by appending number if needed
   */
  private async generateSlug(name: string, productId?: number): Promise<string> {
    let slug = name
      .toLowerCase()
      .trim()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

    // Check if slug exists
    let counter = 1
    let uniqueSlug = slug
    let exists = true

    while (exists) {
      const existing = await this.productRepository.findOne({
        where: { slug: uniqueSlug },
      })

      if (!existing || existing.id === productId) {
        exists = false
      } else {
        uniqueSlug = `${slug}-${counter}`
        counter++
      }
    }

    return uniqueSlug
  }

  /**
   * Create a new product (without variants initially)
   * Variants should be added separately via addVariants()
   */
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { name, slug, status, sellerId } = createProductDto

    // Generate slug if not provided
    const finalSlug = slug || (await this.generateSlug(name))

    // Create product
    const product = this.productRepository.create({
      name,
      slug: finalSlug,
      status: status || ProductStatus.DRAFT,
      sellerId,
    })

    return await this.productRepository.save(product)
  }

  /**
   * Add variants to an existing product
   * Automatically manages product options based on variant options
   * Uses transaction to prevent race conditions and data loss
   */
  async addVariants(productId: number, createVariantDtos: CreateVariantDto[]): Promise<Product> {
    // Use transaction to ensure data consistency
    return await this.dataSource.transaction(async (manager) => {
      // Check if product exists (with lock to prevent concurrent modifications)
      const product = await manager.findOne(Product, {
        where: { id: productId },
        relations: ['options', 'variants'],
        lock: { mode: 'pessimistic_write' }, // Lock row until transaction completes
      })

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`)
      }

      // Validate and create variants
      const newVariants: ProductVariant[] = []

      for (const dto of createVariantDtos) {
        // Check SKU uniqueness (within transaction)
        const existingSku = await manager.findOne(ProductVariant, {
          where: { sku: dto.sku },
        })

        if (existingSku) {
          throw new ConflictException(`SKU '${dto.sku}' already exists`)
        }

        // Check duplicate variant options (if options provided)
        if (dto.options && Object.keys(dto.options).length > 0) {
          const existingVariants = await manager.find(ProductVariant, {
            where: { productId },
          })

          const duplicate = existingVariants.find((variant) => equal(variant.options, dto.options))

          if (duplicate) {
            throw new ConflictException(
              `Variant with options ${JSON.stringify(dto.options)} already exists for this product`,
            )
          }
        }

        // Create variant
        const variant = manager.create(ProductVariant, {
          ...dto,
          productId,
          options: dto.options || {},
        })

        newVariants.push(variant)
      }

      // Save all variants (within transaction)
      await manager.save(ProductVariant, newVariants)

      // Auto-manage options based on all variants (within transaction)
      await this.autoManageOptionsInTransaction(manager, productId)

      // Return updated product with relations
      return await manager.findOne(Product, {
        where: { id: productId },
        relations: ['options', 'variants'],
      })
    })
  }

  /**
   * Auto-manage product options within a transaction
   * Used by addVariants to ensure atomicity
   */
  private async autoManageOptionsInTransaction(manager: EntityManager, productId: number): Promise<void> {
    // Get all variants for this product
    const variants = await manager.find(ProductVariant, {
      where: { productId },
    })

    // Extract all unique option names and their values
    const optionsMap = new Map<string, Set<string>>()

    variants.forEach((variant) => {
      Object.entries(variant.options).forEach(([optionName, optionValue]) => {
        if (!optionsMap.has(optionName)) {
          optionsMap.set(optionName, new Set())
        }
        optionsMap.get(optionName).add(optionValue)
      })
    })

    // Get existing options for this product
    const existingOptions = await manager.find(ProductOption, {
      where: { productId },
    })

    // Create a map of existing options by name
    const existingOptionsMap = new Map<string, ProductOption>()
    existingOptions.forEach((option) => {
      existingOptionsMap.set(option.name, option)
    })

    // Update or create options
    const optionsToSave: ProductOption[] = []
    let position = 0

    for (const [name, valuesSet] of optionsMap.entries()) {
      const sortedValues = Array.from(valuesSet).sort()

      if (existingOptionsMap.has(name)) {
        // Update existing option
        const existingOption = existingOptionsMap.get(name)
        existingOption.values = sortedValues
        existingOption.position = position
        optionsToSave.push(existingOption)
        existingOptionsMap.delete(name)
      } else {
        // Create new option
        const newOption = manager.create(ProductOption, {
          productId,
          name,
          values: sortedValues,
          position,
        })
        optionsToSave.push(newOption)
      }
      position++
    }

    // Save all options (updates + new ones)
    if (optionsToSave.length > 0) {
      await manager.save(ProductOption, optionsToSave)
    }

    // Remove options that are no longer used
    const unusedOptions = Array.from(existingOptionsMap.values())
    if (unusedOptions.length > 0) {
      await manager.remove(ProductOption, unusedOptions)
    }
  }

  /**
   * Find all products with pagination and filters
   * Includes options and variants in response
   */
  async findAll(filterDto: FilterProductsDto): Promise<PaginatedResponseDto<Product>> {
    const { status, sellerId, page = 1, limit = 20 } = filterDto

    // Build query
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.options', 'options')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.deletedAt IS NULL') // Exclude soft-deleted products

    // Apply filters
    if (status) {
      queryBuilder.andWhere('product.status = :status', { status })
    }

    if (sellerId) {
      queryBuilder.andWhere('product.sellerId = :sellerId', { sellerId })
    }

    // Order by creation date (newest first)
    queryBuilder.orderBy('product.createdAt', 'DESC')

    // Pagination
    const skip = (page - 1) * limit
    queryBuilder.skip(skip).take(limit)

    // Execute query
    const [products, total] = await queryBuilder.getManyAndCount()

    return new PaginatedResponseDto(products, total, page, limit)
  }

  /**
   * Find one product by ID
   * Includes options and variants in response
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['options', 'variants'],
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    return product
  }
}
