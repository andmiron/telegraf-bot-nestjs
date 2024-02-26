import { Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { BotResponse, LogMessages, ScenesId } from '../common/bot.constants';
import { Markup } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { Message } from 'typegram';
import { generateWeatherString } from '../utils/string.generator';
import { WeatherService } from '../services/weather.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Scene(ScenesId.WEATHER_SCENE)
export class WeatherScene {
  constructor(
    @InjectPinoLogger() private readonly logger: PinoLogger,
    private weatherService: WeatherService,
  ) {}

  @SceneEnter()
  async enterScene(@Ctx() ctx: SceneContext) {
    this.logger.info(
      {
        user: ctx.message.from.username,
        scene: ScenesId.WEATHER_SCENE,
      },
      LogMessages.ENTER_SCENE,
    );

    await ctx.reply(
      BotResponse.SHARE_LOCATION,
      Markup.keyboard([Markup.button.locationRequest(BotResponse.SHARE_BUTTON)])
        .resize()
        .oneTime(),
    );
  }

  @On('location')
  async getLocation(
    @Ctx()
    ctx: SceneContext & { message: Message.LocationMessage },
  ) {
    const { latitude, longitude } = ctx.message.location;

    try {
      const weatherData = await this.weatherService.getWeather(
        latitude,
        longitude,
      );

      const weatherMessage = generateWeatherString(weatherData);
      await ctx.reply(weatherMessage, {
        reply_markup: {
          remove_keyboard: true,
        },
      });

      this.logger.info(
        {
          user: ctx.message.from.username,
          scene: ScenesId.WEATHER_SCENE,
        },
        LogMessages.LEFT_SCENE,
      );
      await ctx.scene.leave();
    } catch (err) {
      this.logger.error(err.message);
      await ctx.reply(BotResponse.WEATHER_FETCH_ERROR);

      this.logger.info(
        {
          user: ctx.message.from.username,
          scene: ScenesId.WEATHER_SCENE,
        },
        LogMessages.LEFT_SCENE,
      );
      await ctx.scene.leave();
    }
  }
}
