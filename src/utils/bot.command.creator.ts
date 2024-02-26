import { BotCommand } from 'typegram';

export const createBotCommand = (
  command: string,
  description: string,
): BotCommand => {
  return {
    command: command,
    description: description,
  };
};
