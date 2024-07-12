import { Params } from 'nestjs-pino';

export const LoggerOptions: Params = {
  pinoHttp: {
    transport: {
      target: 'pino-pretty',
      options: {
        sync: true,
        singleLine: true,
        ignore: 'pid,hostname',
      },
    },
    autoLogging: true,
  },
};
