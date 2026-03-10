import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { setupSwagger } from './shared/config/swagger.config'

async function bootstrap() {
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
bootstrap()
