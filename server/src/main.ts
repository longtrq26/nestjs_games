import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000', // or true for all
    credentials: true, // if using cookies/auth
  });

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
