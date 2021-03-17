import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const swStats = require('swagger-stats');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: false }));
  app.setGlobalPrefix('api/v1');
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
  const port = process.env.PORT || 3000;

  const options = new DocumentBuilder()
    .setTitle('Subtitle database api')
    .setDescription('Beautiful API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  app.use(swStats.getMiddleware({ swaggerSpec: document }));

  await app.listen(port);

  console.log(
    `\n***   Lang Subtitles Database api started on port ${port}.   ***`,
  );
}
bootstrap();
