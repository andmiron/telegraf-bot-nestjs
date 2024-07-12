import { Ctx, Hears, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { BotResponse, ScenesId, TimeTrigger } from '../common/bot.constants';
import { KeyboardButton, Message } from 'typegram';
import { Markup } from 'telegraf';
import { CustomSceneContext } from '../interfaces/custom.scene.context';
import { DbService } from '../services/db.service';
import { TimeConverter } from '../services/time.converter';

@Scene(ScenesId.SUBSCRIBE_SCENE)
export class SubscribeScene {
  constructor(
    private readonly userService: DbService,
    private timeConverter: TimeConverter,
  ) {}

  @SceneEnter()
  async start(@Ctx() ctx: SceneContext<CustomSceneContext>) {
    const keyboardButtons: KeyboardButton[] = [];

    for (let hour = 0; hour < 24; hour++) {
      keyboardButtons.push(
        Markup.button.text(`${hour < 10 ? `0${hour}` : hour}:00`),
      );
    }

    const replyKeyboard = Markup.keyboard(keyboardButtons, { columns: 3 })
      .resize()
      .oneTime()
      .placeholder('HH:MM');

    await ctx.reply(BotResponse.TIME_INPUT, replyKeyboard);
  }

  @Hears(TimeTrigger)
  async getTime(
    @Ctx()
    ctx: SceneContext<CustomSceneContext> & { message: Message.TextMessage },
  ) {
    ctx.session.__scenes.time = this.timeConverter.convertHoursStringToMinutes(
      ctx.message.text,
    );
    ctx.session.__scenes.timeInput = ctx.message.text;

    await ctx.reply(
      BotResponse.SHARE_LOCATION,
      Markup.keyboard([
        Markup.button.locationRequest(BotResponse.SHARE_BUTTON),
        Markup.button.text('/cancel'),
      ])
        .resize()
        .oneTime(),
    );
  }

  @On('location')
  async subscribeRequest(
    @Ctx()
    ctx: SceneContext<CustomSceneContext> & {
      message: Message.LocationMessage;
    },
  ) {
    const { latitude, longitude } = ctx.message.location;
    ctx.session.__scenes.latitude = latitude;
    ctx.session.__scenes.longitude = longitude;

    ctx.session.__scenes.offset =
      await this.timeConverter.getUtcOffsetMinutesFromCoordinates(
        latitude,
        longitude,
      );

    await ctx.reply(
      BotResponse.SUBMIT_SUBSCRIPTION,
      Markup.keyboard([
        Markup.button.text(BotResponse.SUBSCRIBE_BUTTON),
        Markup.button.text('/cancel'),
      ])
        .resize()
        .oneTime(),
    );
  }

  @Hears(BotResponse.SUBSCRIBE_BUTTON)
  async subscribe(
    @Ctx()
    ctx: SceneContext<CustomSceneContext> & { message: Message.TextMessage },
  ) {
    try {
      console.log(ctx.session);
      ctx.session.__scenes.chatId = ctx.chat.id;
      const { time, offset, timeInput, longitude, latitude, chatId } =
        ctx.session.__scenes;
      await this.userService.createOrUpdateUser({
        time,
        offset,
        timeInput,
        longitude,
        latitude,
        chatId,
      });
      await ctx.reply(BotResponse.SUBSCRIBED + ctx.session.__scenes.timeInput);
      await ctx.scene.leave();
    } catch (err) {
      await ctx.reply(BotResponse.WEATHER_FETCH_ERROR);
      await ctx.scene.leave();
    }
  }

  @Hears('/cancel')
  async onCancel(@Ctx() ctx: SceneContext<CustomSceneContext>) {
    await ctx.scene.leave();
    await ctx.reply(BotResponse.SCENE_EXIT);
  }
}
