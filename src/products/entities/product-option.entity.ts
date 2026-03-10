import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { IProductOption } from '../../shared/interfaces'
import { Product } from './product.entity'

@Entity('product_options')
export class ProductOption implements IProductOption {
  @PrimaryGeneratedColumn()
  id: number

  @Column('int')
  productId: number

  @Column('varchar', { length: 100 })
  name: string

  @Column('text', { array: true })
  values: string[]

  @Column('int', { default: 0 })
  position: number

  // Relations (not in interface - ORM-specific)
  @ManyToOne(() => Product, (product) => product.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product?: Product
}
