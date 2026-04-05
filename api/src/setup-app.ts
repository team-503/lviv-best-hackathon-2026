import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import config from 'config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { sessionIdCookieMiddleware } from './common/middlewares/session-id-cookie.middleware';
import { csrfUtilities } from './csrf/csrf.constants';
import { PrismaExceptionFilter } from './prisma/exception-filters/prisma-exception.filter';

export function setupApp(app: NestExpressApplication): NestExpressApplication {
  app.use(helmet());
  app.enableCors({
    origin: (origin, callback) => {
      const allowed = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? [];
      if (!origin || allowed.includes(origin) || origin.match(/^http:\/\/localhost:\d+$/)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: config.get('cors.methods'),
    credentials: true,
  });
  app.use(cookieParser());
  app.use(sessionIdCookieMiddleware);
  if (process.env.NODE_ENV !== 'development') {
    app.use(csrfUtilities.doubleCsrfProtection);
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  const swaggerConfig = new DocumentBuilder().setTitle('API').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  return app;
}
