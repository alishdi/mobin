import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { json, urlencoded } from 'express';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const isDev = configService.get<string>('NODE_ENV') === 'development';

  // Security & Performance
  app.use(helmet());
  app.use(compression());
  app.use(morgan(isDev ? 'dev' : 'combined'));

  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.enableCors({
    origin: isDev ? 'http://localhost:3000' : process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
    serveRoot: '/',
  })

  const apiPrefix = configService.get<string>('API_PREFIX');
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(cookieParser());

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (isDev) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('مبین خودرو API')
      .setDescription('پلتفرم جامع فروش اقساطی خودرو')
      .setVersion('1.0')

      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'توکن JWT را وارد کنید',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get<number>('PORT');
  await app.listen(port);

  console.log(`\n🚀 مبین خودرو API running on: http://localhost:${port}/${apiPrefix}`);
  if (isDev) {
    console.log(`📚 Swagger docs: http://localhost:${port}/docs\n`);
  }
}
bootstrap();