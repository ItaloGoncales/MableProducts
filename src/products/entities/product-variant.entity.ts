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

  @Column('int')
  productId: number

  @Column('varchar', { unique: true, length: 100 })
  sku: string

  @Column('varchar', { length: 500 })
  name: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceRetail: number

  @Column({ type: 'jsonb', default: {} })
  options: Record<string, string>

  @Column('int', { nullable: true })
  eachCount?: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  eachSize?: number

  @Column('varchar', { length: 20, nullable: true })
  eachSizeUnit?: string

  @Column('varchar', { length: 50, nullable: true })
  eachName?: string

  @Column('varchar', { length: 50, nullable: true })
  eachNamePlural?: string

  @Column({
    type: 'enum',
    enum: Availability,
    default: Availability.IN_STOCK,
  })
  availability: Availability

  @Column('int', { default: 0 })
  position: number

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date

  // Relations (not in interface - ORM-specific)
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product?: Product
}
