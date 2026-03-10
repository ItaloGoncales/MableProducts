import { ProductStatus } from '../enums'

export interface IProduct {
  id: number
  name: string
  slug: string
  status: ProductStatus
  sellerId?: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
