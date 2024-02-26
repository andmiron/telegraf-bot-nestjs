import { BotCommand } from 'typegram';
import { BotCommandDescription, BotCommandName } from './bot.constants';
import { createBotCommand } from '../utils/bot.command.creator';

export const BotCommands: BotCommand[] = [
  createBotCommand(BotCommandName.START, BotCommandDescription.START),
  createBotCommand(BotCommandName.SUBSCRIBE, BotCommandDescription.SUBSCRIBE),
  createBotCommand(
    BotCommandName.UNSUBSCRIBE,
    BotCommandDescription.UNSUBSCRIBE,
  ),
  createBotCommand(BotCommandName.CHECK, BotCommandDescription.CHECK),
  createBotCommand(BotCommandName.WEATHER, BotCommandDescription.WEATHER),
  createBotCommand(BotCommandName.UPDATE, BotCommandDescription.UPDATE),
];
