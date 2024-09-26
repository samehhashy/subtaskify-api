import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ValidateObjectIdPipe } from './common/pipes/validateObjectId.pipe';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe(), new ValidateObjectIdPipe());

  const config = new DocumentBuilder()
    .setTitle('Todos App')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme();
  SwaggerModule.setup('api', app, document, {
    customCss: theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK),
  });

  await app.listen(3000);
}

bootstrap();
