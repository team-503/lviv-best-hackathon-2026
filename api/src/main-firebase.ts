import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, type NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import * as functions from 'firebase-functions/v2';
import { AppModule } from './app.module';
import { setupApp } from './setup-app';

export const createNestServer = async (expressInstance: express.Express): Promise<NestExpressApplication> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(expressInstance));
  setupApp(app);
  return app.init();
};

const server = express();
let isInitialized = false;

export const api = functions.https.onRequest(
  {
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 30,
    region: 'europe-west1',
    memory: '256MiB',
    secrets: [],
  },
  async (request, response) => {
    if (!isInitialized) {
      await createNestServer(server);
      isInitialized = true;
    }
    server(request, response);
  },
);
