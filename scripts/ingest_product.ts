#!/usr/bin/env ts-node
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { IProduct } from '../src/shared/interfaces/product.interface'
import { IProductVariant } from '../src/shared/interfaces/product-variant.interface'
import { IProductOption } from '../src/shared/interfaces/product-option.interface'
import { ProductStatus } from '../src/shared/enums/product-status.enum'
import { Availability } from '../src/shared/enums/availability.enum'

// Load environment-specific .env file
const env = process.env.NODE_ENV || 'development'
const envPath = path.join(__dirname, '..', 'src', 'shared', 'config', `.env.${env}`)

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log(`✅ Loaded environment from: ${envPath}`)
} else {
  console.warn(`⚠️  Environment file not found: ${envPath}`)
  console.warn(`⚠️  Falling back to process.env`)
}

// Response type that includes relations
interface ProductResponse extends IProduct {
  options?: IProductOption[]
  variants?: IProductVariant[]
}

interface MableVariant {
  sku: string
  name: string
  description?: string
  priceRetail: string | number
  options: Record<string, string>
  eachCount?: number
  eachSize?: string | number
  eachSizeUnit?: string
  eachName?: string
  eachNamePlural?: string
  availability: string
  position: number
}

interface MableProduct {
  product: {
    name: string
    slug: string
    sellerId?: number
    status: string
    variants: MableVariant[]
  }
}

interface CreateProductDto {
  name: string
  slug?: string
  status?: ProductStatus
  sellerId?: number
}

interface CreateVariantDto {
  sku: string
  name: string
  description?: string
  priceRetail: number
  options: Record<string, string>
  eachCount?: number
  eachSize?: number
  eachSizeUnit?: string
  eachName?: string
  eachNamePlural?: string
  availability?: Availability
  position?: number
}

class ProductIngestionService {
  private baseUrl: string
  private authToken: string

  constructor() {
    const env = process.env.NODE_ENV || 'development'
    
    // Determine base URL based on environment
    if (env === 'production') {
      this.baseUrl = 'https://mable-products.vercel.app'
    } else {
      this.baseUrl = 'http://localhost:3000'
    }

    // Get auth token from environment
    this.authToken = process.env.AUTH_BEARER_TOKEN || ''
    
    if (!this.authToken) {
      console.warn('⚠️  Warning: AUTH_BEARER_TOKEN not set in environment')
    }
  }

  private async makeRequest(endpoint: string, method: string, body?: any) {
    const url = `${this.baseUrl}${endpoint}`
    
    console.log(`📡 ${method} ${url}`)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return response.json()
  }

  private transformVariant(variant: MableVariant): CreateVariantDto {
    return {
      sku: variant.sku,
      name: variant.name,
      description: variant.description,
      priceRetail: typeof variant.priceRetail === 'string' 
        ? parseFloat(variant.priceRetail) 
        : variant.priceRetail,
      options: variant.options,
      eachCount: variant.eachCount,
      eachSize: variant.eachSize 
        ? (typeof variant.eachSize === 'string' ? parseFloat(variant.eachSize) : variant.eachSize)
        : undefined,
      eachSizeUnit: variant.eachSizeUnit,
      eachName: variant.eachName,
      eachNamePlural: variant.eachNamePlural,
      availability: variant.availability as any,
      position: variant.position,
    }
  }

  async ingestProduct(mableData: MableProduct): Promise<ProductResponse> {
    const { product } = mableData

    console.log(`\n🚀 Starting ingestion for: ${product.name}`)
    console.log(`📦 Variants to process: ${product.variants.length}`)

    // Step 1: Check if product already exists
    console.log('\n📝 Step 1: Checking if product exists...')
    let existingProduct: ProductResponse | null = null
    
    try {
      const products = await this.makeRequest('/api/products', 'GET')
      existingProduct = products.data.find((p: ProductResponse) => p.slug === product.slug)
    } catch (error) {
      // Ignore error, will create new product
    }

    let productToUpdate: ProductResponse

    if (existingProduct) {
      console.log(`⚠️  Product already exists with ID: ${existingProduct.id}`)
      console.log(`   Skipping product creation, will add/update variants...`)
      productToUpdate = existingProduct
    } else {
      // Create the product
      console.log('📝 Creating new product...')
      const createProductDto: CreateProductDto = {
        name: product.name,
        slug: product.slug,
        status: product.status as ProductStatus,
        sellerId: product.sellerId,
      }

      productToUpdate = await this.makeRequest(
        '/api/products',
        'POST',
        createProductDto
      )

      console.log(`✅ Product created with ID: ${productToUpdate.id}`)
    }

    // Step 2: Add variants (with SKU conflict handling)
    console.log('\n📝 Step 2: Adding variants...')
    const variants = product.variants.map(v => this.transformVariant(v))

    let productWithVariants: ProductResponse
    
    try {
      productWithVariants = await this.makeRequest(
        `/api/products/${productToUpdate.id}/variants`,
        'POST',
        variants
      )

      console.log(`✅ Added ${productWithVariants.variants?.length || 0} variants`)
      console.log(`✅ Auto-generated ${productWithVariants.options?.length || 0} options:`)
      
      productWithVariants.options?.forEach((option) => {
        console.log(`   - ${option.name}: [${option.values.join(', ')}]`)
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('409')) {
        console.log(`⚠️  Some variants already exist (SKU conflict)`)
        console.log(`   Fetching current product state...`)
        productWithVariants = await this.makeRequest(
          `/api/products/${productToUpdate.id}`,
          'GET'
        )
      } else {
        throw error
      }
    }

    console.log(`\n🎉 Successfully ingested product: ${product.name}`)
    console.log(`🔗 Product ID: ${productToUpdate.id}`)
    
    return productWithVariants
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('❌ Error: No JSON file provided')
    console.log('\nUsage:')
    console.log('  ts-node scripts/ingest_product.ts <json-file>')
    console.log('\nExamples:')
    console.log('  ts-node scripts/ingest_product.ts mable_response_example.json')
    console.log('  NODE_ENV=production ts-node scripts/ingest_product.ts mable_response_example_complex.json')
    process.exit(1)
  }

  const jsonFilePath = args[0]
  const absolutePath = path.isAbsolute(jsonFilePath)
    ? jsonFilePath
    : path.join(process.cwd(), jsonFilePath)

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: File not found: ${absolutePath}`)
    process.exit(1)
  }

  console.log(`📂 Reading file: ${absolutePath}`)
  
  const fileContent = fs.readFileSync(absolutePath, 'utf-8')
  const mableData: MableProduct = JSON.parse(fileContent)

  const service = new ProductIngestionService()
  
  try {
    const result = await service.ingestProduct(mableData)
    console.log('\n✨ Ingestion completed successfully!')
    console.log(`\n📊 Final product structure:`)
    console.log(`   - Product ID: ${result.id}`)
    console.log(`   - Name: ${result.name}`)
    console.log(`   - Slug: ${result.slug}`)
    console.log(`   - Status: ${result.status}`)
    console.log(`   - Options: ${result.options?.length || 0}`)
    console.log(`   - Variants: ${result.variants?.length || 0}`)
  } catch (error) {
    console.error('\n❌ Ingestion failed:')
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { ProductIngestionService }
