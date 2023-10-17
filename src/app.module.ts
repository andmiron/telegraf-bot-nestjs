import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvVarKeys } from './common/env.vars';
import { BotUpdate } from './bot.update';
import { sessionMiddleware } from './middlewares/session.middleware';
import { WeatherScene } from './scenes/weather.scene';
import { SubscribeScene } from './scenes/subscribe.scene';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './common/user.model';
import { DbService } from './services/db.service';
import { TimeConverter } from './services/time.converter';
import { WeatherService } from './services/weather.service';
import { CronService } from './services/cron.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow(EnvVarKeys.MONGO_DB_URI),
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.getOrThrow(EnvVarKeys.TELEGRAM_BOT_TOKEN),
        middlewares: [sessionMiddleware],
      }),
    }),
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
