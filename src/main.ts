import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
    autoFlushLogs: false,
  });
  app.useLogger(app.get(Logger));
  return app;
}

bootstrap();
