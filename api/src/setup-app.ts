import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import config from 'config';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import type { Response } from 'express';
import helmet from 'helmet';
import { join } from 'path';
import { DatabaseExceptionFilter } from './common/exception-filters/database-exception.filter';
import { getSessionIdentifier } from './common/helpers/session-identifier';
import { sessionIdCookieMiddleware } from './common/middlewares/session-id-cookie.middleware';

export function setupApp(app: NestExpressApplication): NestExpressApplication {
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    methods: config.get('cors.methods'),
    credentials: true,
  });
  app.use(cookieParser());
  app.use(sessionIdCookieMiddleware);
  if (process.env.NODE_ENV !== 'development') {
    app.use(
      doubleCsrf({
        getSecret: () => process.env.CSRF_SECRET as string,
        getSessionIdentifier,
        getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
        cookieName: '__csrf',
        cookieOptions: {
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
        },
      }).doubleCsrfProtection,
    );
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new DatabaseExceptionFilter());

  // TODO: use firebase/supabase storage
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res: Response) => {
      res.setHeader('Content-Disposition', 'attachment');
    },
  });

  if (process.env.NODE_ENV === 'development') {
    const swaggerConfig = new DocumentBuilder().setTitle('API').setVersion('1.0').build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  return app;
}
