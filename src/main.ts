import 'reflect-metadata'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { setupSwagger } from './shared/config/swagger.config'

let cachedApp: any

async function bootstrap() {
  if (cachedApp) {
    return cachedApp
  }

  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const nodeEnv = configService.get<string>('NODE_ENV')
  const port = configService.get<number>('PORT') || 3000

  // Enable CORS for any origin
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  )

  // Enable shutdown hooks
  app.enableShutdownHooks()

  // Enable Swagger only in development and test
  if (nodeEnv !== 'production') {
    setupSwagger(app)
  }

  const log = new Logger('Bootstrap')

  // Don't call listen() - just init for serverless
  await app.init()
  cachedApp = app
  
  log.log({
    message: 'NestJS initialized',
    environment: nodeEnv,
  })

  return app
}

// For Vercel serverless
export default async (req: any, res: any) => {
  const app = await bootstrap()
  const expressApp = app.getHttpAdapter().getInstance()
  return expressApp(req, res)
}

// For local execution with traditional server
async function startServer() {
  const app = await NestFactory.create(AppModule)
  
  const configService = app.get(ConfigService)
  const nodeEnv = configService.get<string>('NODE_ENV')
  const port = configService.get<number>('PORT') || 3000

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  app.enableShutdownHooks()

  if (nodeEnv !== 'production') {
    setupSwagger(app)
  }

  const log = new Logger('Bootstrap')

  await app.listen(port, () =>
    log.log({
      message: 'Service listening',
      port,
      environment: nodeEnv,
      corsEnabled: true,
      swaggerEnabled: nodeEnv !== 'production',
      swaggerUrl: nodeEnv !== 'production' ? `http://localhost:${port}/api/docs` : undefined,
    }),
  )
}

// Only start server if running directly (not via Vercel)
if (require.main === module) {
  startServer()
}
