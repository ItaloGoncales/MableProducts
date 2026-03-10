import { DataSource } from 'typeorm'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables
const env = process.env.NODE_ENV || 'development'
config({ path: join(__dirname, `../shared/config/.env.${env}`) })

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'mable',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mable_products',
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, './migrations/**/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
})
