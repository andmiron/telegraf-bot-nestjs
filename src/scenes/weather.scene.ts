import { Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { BotResponse, ScenesId } from '../common/bot.constants';
import { Markup } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { Message } from 'typegram';
import { generateWeatherString } from '../utils/string.generator';
import { WeatherService } from '../services/weather.service';

@Scene(ScenesId.WEATHER_SCENE)
export class WeatherScene {
  constructor(private weatherService: WeatherService) {}

  @SceneEnter()
  async enterScene(@Ctx() ctx: SceneContext) {
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
    const weatherData = await this.weatherService.getWeather(
      latitude,
      longitude,
    );

    if (weatherData) {
      const weatherMessage = generateWeatherString(weatherData);
      await ctx.reply(weatherMessage, {
        reply_markup: {
          remove_keyboard: true,
        },
      });
      await ctx.scene.leave();
    } else {
      await ctx.reply(BotResponse.WEATHER_FETCH_ERROR);
      await ctx.scene.leave();
    }
  }
}
