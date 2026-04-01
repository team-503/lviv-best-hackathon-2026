import 'dotenv/config';
import 'newrelic';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupApp } from './setup-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupApp(app);

  process.on('uncaughtException', (error, origin) => {
    console.error('Uncaught Exception: ', error, 'Origin:', origin);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'Reason:', reason);
  });

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
