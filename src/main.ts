import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ValidateObjectIdPipe } from './common/pipes/validateObjectId.pipe';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './common/utils/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe(), new ValidateObjectIdPipe());

  setupSwagger(app);

  await app.listen(configService.get<number>('PORT'));
}

bootstrap();
