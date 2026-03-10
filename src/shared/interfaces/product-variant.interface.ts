import { Availability } from '../enums'

export interface IProductVariant {
  id: number
  productId: number
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
  availability: Availability
  position: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
