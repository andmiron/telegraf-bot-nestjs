import { Command, Ctx, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { BotCommandName, BotResponse, ScenesId } from './common/bot.constants';
import { SceneContext } from 'telegraf/typings/scenes';
import { DbService } from './services/db.service';
import { BotCommands } from './common/bot.commands';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private bot: Telegraf,
    private dbService: DbService,
  ) {}

  @Command(BotCommandName.WEATHER)
  async getWeather(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter(ScenesId.WEATHER_SCENE);
  }

  @Command(BotCommandName.SUBSCRIBE)
  async onSubscribe(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter(ScenesId.SUBSCRIBE_SCENE);
  }

  @Command(BotCommandName.UNSUBSCRIBE)
  async onUnsubscribe(@Ctx() ctx: SceneContext) {
    const chatId = ctx.chat.id;
    const userToDelete = await this.dbService.findUser(chatId);
    if (userToDelete) {
      await this.dbService.deleteUser(chatId);
      await ctx.reply(BotResponse.UNSUBSCRIBE);
    } else {
      await ctx.reply(BotResponse.NO_SUBSCRIPTION);
    }
  }
  @Command(BotCommandName.CHECK)
  async onCheck(@Ctx() ctx: SceneContext) {
    const userId = ctx.chat.id;
    const user = await this.dbService.findUser(userId);
    if (user) {
      await ctx.reply(BotResponse.CHECK + user.timeInput);
    } else {
      await ctx.reply(BotResponse.NO_SUBSCRIPTION);
    }
  }

  @Command(BotCommandName.UPDATE)
  async onUpdate(@Ctx() ctx: SceneContext) {
    const user = await this.dbService.findUser(ctx.chat.id);
    if (user) {
      await ctx.scene.enter(ScenesId.SUBSCRIBE_SCENE);
    } else {
      await ctx.reply(BotResponse.NO_SUBSCRIPTION);
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
