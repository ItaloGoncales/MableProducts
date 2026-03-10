import { Logger, Module, OnApplicationShutdown, OnModuleDestroy } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthGuard } from './shared/guards/auth.guard'

// Config imports
import appConfig from './shared/config/app.config'
import databaseConfig from './shared/config/database.config'

const configs = [appConfig, databaseConfig]

const env = process.env.NODE_ENV || 'development'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `./src/shared/config/.env.${env}`,
      isGlobal: true,
      load: configs,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database'),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements OnApplicationShutdown, OnModuleDestroy {
  private readonly log = new Logger(AppModule.name)

  /**
   * Handle a shutdown signal from the operating system to perform any
   * cleanup specific to the shutting down the application.
   *
   * NOTE: this interface can be added to other Injectable components in the
   * the application and is called after OnModuleDestroy, if that interface
   * has been implemented.
   *
   * @see https://docs.nestjs.com/fundamentals/lifecycle-events
   */
  async onApplicationShutdown(signal: string) {
    this.log.log({ message: 'onApplicationShutdown', signal })
  }

  /**
   * Handle any specific cleanup prior to Module destruction.
   *
   * @see https://docs.nestjs.com/fundamentals/lifecycle-events
   */
  async onModuleDestroy() {
    this.log.log('onModuleDestroy')
  }
}
