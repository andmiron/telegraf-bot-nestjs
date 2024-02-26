import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DbService } from './db.service';
import { WeatherService } from './weather.service';
import { generateWeatherString } from '../utils/string.generator';
import { BotResponse, LogMessages, TimeZone } from '../common/bot.constants';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { TimeConverter } from './time.converter';

@Injectable()
export class CronService {
  constructor(
    @InjectPinoLogger() private logger: PinoLogger,
    @InjectBot() private bot: Telegraf,
    private timeConverter: TimeConverter,
    private dbService: DbService,
    private weatherService: WeatherService,
  ) {}

  @Cron('* * * * *', {
    timeZone: TimeZone,
  })
  async cronJob() {
    const users = await this.dbService.findUsers();
    this.logger.info({ userCount: users.length }, LogMessages.CRON_RUN);
    let chatId: number;

    try {
      for await (const user of users) {
        chatId = user.chatId;

        const weatherData = await this.weatherService.getWeather(
          user.latitude,
          user.longitude,
        );

        if (
          this.timeConverter.isMinuteToRunCron(user.time, user.offset) &&
          weatherData
        ) {
          const weatherString = generateWeatherString(weatherData);
          this.logger.info({ user: user._id }, LogMessages.MESSAGE_SENT);
          await this.bot.telegram.sendMessage(chatId, weatherString);
        }
        if (!weatherData) {
          await this.bot.telegram.sendMessage(
            chatId,
            BotResponse.WEATHER_FETCH_ERROR,
          );
        }
      }
    } catch (err) {
      this.logger.error(err.message);
      await this.bot.telegram.sendMessage(
        chatId,
        BotResponse.WEATHER_FETCH_ERROR,
      );
      throw new Error(err.message);
    }
  }
}
