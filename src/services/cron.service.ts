import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EnvVarKeys } from '../common/env.vars';
import { DbService } from './db.service';
import { WeatherService } from './weather.service';
import { generateWeatherString } from '../utils/string.generator';
import { BotResponse, TimeZone } from '../common/bot.constants';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class CronService {
  constructor(
    @InjectBot() private bot: Telegraf,
    private dbService: DbService,
    private weatherService: WeatherService,
  ) {}

  @Cron(EnvVarKeys.CRON_TIME, {
    timeZone: TimeZone,
  })
  async cronJob() {
    const currentDate = new Date();
    const currentMinute =
      currentDate.getHours() * 60 + currentDate.getMinutes();

    const users = await this.dbService.findUsers();
    let chatId: number;
    try {
      for await (const user of users) {
        const userMinute = user.time;
        const { latitude, longitude } = user;
        chatId = user.chatId;
        const weatherData = await this.weatherService.getWeather(
          latitude,
          longitude,
        );
        if (currentMinute + user.offset === userMinute && weatherData) {
          const weatherString = generateWeatherString(weatherData);
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
      await this.bot.telegram.sendMessage(
        chatId,
        BotResponse.WEATHER_FETCH_ERROR,
      );
    }
  }
}
