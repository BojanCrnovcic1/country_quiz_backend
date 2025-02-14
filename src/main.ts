import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StorageConfig } from 'config/storage.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(StorageConfig.flags.destination, {
    prefix: StorageConfig.flags.urlPrefix,
    maxAge: StorageConfig.flags.maxAge,
  });

  app.useStaticAssets(StorageConfig.profile.destination, {
    prefix: StorageConfig.profile.urlPrefix,
    maxAge: StorageConfig.profile.maxAge,
  });


  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: "*",
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization"
  });
  


  await app.listen(3000);
}
bootstrap();
