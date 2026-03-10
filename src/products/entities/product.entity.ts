import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm'
import { IProduct } from '../../shared/interfaces'
import { ProductStatus } from '../../shared/enums'
import { ProductOption } from './product-option.entity'
import { ProductVariant } from './product-variant.entity'

@Entity('products')
export class Product implements IProduct {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { length: 255 })
  name: string

  @Column('varchar', { unique: true, length: 255 })
  slug: string

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus

  @Column('int', { nullable: true })
  sellerId?: number

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date

  // Relations (not in interface - ORM-specific)
  @OneToMany(() => ProductOption, (option) => option.product, {
    cascade: true,
    eager: true,
  })
  options?: ProductOption[]

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
    eager: true,
  })
  variants?: ProductVariant[]
}
