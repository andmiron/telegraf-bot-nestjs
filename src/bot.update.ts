import { Command, Ctx, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import {
  BotCommandName,
  BotResponse,
  LogMessages,
  ScenesId,
} from './common/bot.constants';
import { DbService } from './services/db.service';
import { BotCommands } from './common/bot.commands';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CustomContext } from './interfaces/custom.scene.context';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private bot: Telegraf,
    @InjectPinoLogger() private logger: PinoLogger,
    private dbService: DbService,
  ) {}

  @Command(BotCommandName.WEATHER)
  async getWeather(@Ctx() ctx: CustomContext) {
    await ctx.scene.enter(ScenesId.WEATHER_SCENE);
  }

  @Command(BotCommandName.SUBSCRIBE)
  async onSubscribe(@Ctx() ctx: CustomContext) {
    try {
      if (await this.dbService.findUser(ctx.chat.id)) {
        await ctx.reply(BotResponse.ALREADY_SUBSCRIBED);
      } else {
        await ctx.scene.enter(ScenesId.SUBSCRIBE_SCENE);
      }
    } catch (err) {
      this.logger.error(err.message);
      throw new Error(err.message);
    }
  }

  @Command(BotCommandName.UNSUBSCRIBE)
  async onUnsubscribe(@Ctx() ctx: CustomContext) {
    try {
      const userToDelete = await this.dbService.findUser(ctx.chat.id);
      if (userToDelete) {
        await this.dbService.deleteUser(ctx.chat.id);
        this.logger.info({ userToDelete }, LogMessages.USER_DELETED);
        await ctx.reply(BotResponse.UNSUBSCRIBE);
      } else {
        await ctx.reply(BotResponse.NO_SUBSCRIPTION);
      }
    } catch (err) {
      this.logger.error(err.message);
      throw new Error(err.message);
    }
  }
  @Command(BotCommandName.CHECK)
  async onCheck(@Ctx() ctx: CustomContext) {
    try {
      const user = await this.dbService.findUser(ctx.chat.id);
      if (user) {
        await ctx.reply(BotResponse.CHECK + user.timeInput);
      } else {
        await ctx.reply(BotResponse.NO_SUBSCRIPTION);
      }
    } catch (err) {
      this.logger.error(err.message);
      throw new Error(err.message);
    }
  }

  @Command(BotCommandName.UPDATE)
  async onUpdate(@Ctx() ctx: CustomContext) {
    try {
      const user = await this.dbService.findUser(ctx.chat.id);
      if (user) {
        await ctx.scene.enter(ScenesId.SUBSCRIBE_SCENE);
      } else {
        await ctx.reply(BotResponse.NO_SUBSCRIPTION);
      }
    } catch (err) {
      this.logger.error(err.message);
      throw new Error(err.message);
    }
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.bot.telegram.setMyCommands(BotCommands);
    const commands = await ctx.telegram.getMyCommands();
    const replyKeyboard = [];
    for (const command of commands) {
      replyKeyboard.push(Markup.button.text(`/${command.command}`));
    }
    await ctx.reply(BotResponse.START, Markup.keyboard(replyKeyboard).resize());
  }
}
