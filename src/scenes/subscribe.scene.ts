import { Ctx, Hears, On, Scene, SceneEnter } from 'nestjs-telegraf';
import {
  BotResponse,
  LogMessages,
  ScenesId,
  TimeTrigger,
} from '../common/bot.constants';
import { KeyboardButton, Message } from 'typegram';
import { Markup } from 'telegraf';
import { DbService } from '../services/db.service';
import { TimeConverter } from '../services/time.converter';
import { CustomContext } from '../interfaces/custom.scene.context';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Scene(ScenesId.SUBSCRIBE_SCENE)
export class SubscribeScene {
  constructor(
    @InjectPinoLogger() private readonly logger: PinoLogger,
    private readonly userService: DbService,
    private readonly timeConverter: TimeConverter,
  ) {}

  @SceneEnter()
  async start(@Ctx() ctx: CustomContext) {
    this.logger.info(
      {
        user: ctx.message.from.username,
        scene: ScenesId.SUBSCRIBE_SCENE,
      },
      LogMessages.ENTER_SCENE,
    );

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
  async getTime(@Ctx() ctx: CustomContext & { message: Message.TextMessage }) {
    ctx.scene.session.time = this.timeConverter.convertHoursStringToMinutes(
      ctx.message.text,
    );
    ctx.scene.session.timeInput = ctx.message.text;

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
    @Ctx() ctx: CustomContext & { message: Message.LocationMessage },
  ) {
    const { latitude, longitude } = ctx.message.location;
    ctx.scene.session.latitude = latitude;
    ctx.scene.session.longitude = longitude;
    ctx.scene.session.offset =
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
    ctx: CustomContext & { message: Message.TextMessage },
  ) {
    try {
      ctx.scene.session.chatId = ctx.chat.id;
      const { time, offset, timeInput, longitude, latitude, chatId } =
        ctx.scene.session;

      const user = await this.userService.createOrUpdateUser({
        time,
        offset,
        timeInput,
        longitude,
        latitude,
        chatId,
      });
      this.logger.info({ user }, LogMessages.USER_SAVED);

      await ctx.reply(BotResponse.SUBSCRIBED + ctx.scene.session.timeInput);
      this.logger.info(
        {
          user: ctx.message.from.username,
          scene: ScenesId.SUBSCRIBE_SCENE,
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
          scene: ScenesId.SUBSCRIBE_SCENE,
        },
        LogMessages.LEFT_SCENE,
      );
      await ctx.scene.leave();
    }
  }

  @Hears('/cancel')
  async onCancel(@Ctx() ctx: CustomContext) {
    this.logger.info(
      {
        user: ctx.message.from.username,
        scene: ScenesId.SUBSCRIBE_SCENE,
      },
      LogMessages.LEFT_SCENE,
    );
    await ctx.scene.leave();
    await ctx.reply(BotResponse.SCENE_EXIT);
  }
}
