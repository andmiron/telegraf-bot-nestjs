import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvVarKeys } from './config/env.vars';
import { BotUpdate } from './bot.update';
import { WeatherScene } from './scenes/weather.scene';
import { SubscribeScene } from './scenes/subscribe.scene';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './common/user.model';
import { DbService } from './services/db.service';
import { TimeConverter } from './services/time.converter';
import { WeatherService } from './services/weather.service';
import { CronService } from './services/cron.service';
import { LoggerModule } from 'nestjs-pino';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { session } from 'telegraf';
import { LoggerOptions } from './config/logger.options';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(LoggerOptions),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const mongoServer = await MongoMemoryServer.create();
        return {
          uri: mongoServer.getUri(),
        };
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.getOrThrow(EnvVarKeys.TELEGRAM_BOT_TOKEN),
        middlewares: [session()],
      }),
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    BotUpdate,
    WeatherScene,
    SubscribeScene,
    DbService,
    TimeConverter,
    WeatherService,
    CronService,
  ],
})
export class AppModule {}
