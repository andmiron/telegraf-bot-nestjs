import { BotCommand } from 'typegram';
import { BotCommandDescription, BotCommandName } from './bot.constants';

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

function createBotCommand(command: string, description: string): BotCommand {
  return {
    command,
    description,
  };
}
