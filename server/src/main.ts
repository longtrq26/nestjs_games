import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: configService.get('CLIENT_BASE_URL'),
    methods: 'GET, POST, PUT, PATCH, DELETE, HEAD',
    credentials: true,
  });

  const port = configService.get<number>('port') || 3001;
  await app.listen(port);

  console.log(`Server is running on: ${await app.getUrl()}`);
}
bootstrap();
