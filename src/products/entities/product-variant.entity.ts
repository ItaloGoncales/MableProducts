import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { IProductVariant } from '../../shared/interfaces'
import { Availability } from '../../shared/enums'
import { Product } from './product.entity'

@Entity('product_variants')
export class ProductVariant implements IProductVariant {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  productId: number

  @Column({ unique: true, length: 100 })
  sku: string

  @Column({ length: 500 })
  name: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceRetail: number

  @Column({ type: 'jsonb', default: {} })
  options: Record<string, string>

  @Column({ nullable: true })
  eachCount?: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  eachSize?: number

  @Column({ length: 20, nullable: true })
  eachSizeUnit?: string

  @Column({ length: 50, nullable: true })
  eachName?: string

  @Column({ length: 50, nullable: true })
  eachNamePlural?: string

  @Column({
    type: 'enum',
    enum: Availability,
    default: Availability.IN_STOCK,
  })
  availability: Availability

  @Column({ default: 0 })
  position: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt?: Date

  // Relations (not in interface - ORM-specific)
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product?: Product
}
