import { registerAs } from '@nestjs/config'
import { join } from 'path'

export default registerAs('database', () => {
  const config = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'mable',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mable_products',
    autoLoadEntities: true,
    entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
    synchronize: false, // Always false - use migrations
    logging: process.env.NODE_ENV !== 'production',
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: false, // Allows self-signed certificates
          }
        : false,
    migrations: [join(__dirname, '../../database/migrations/**/*{.ts,.js}')],
    migrationsRun: false, // Run migrations manually
  }

  return config
})
