import * as dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('W.E.B.U API')
    .setDescription('Tài liệu API cho hệ thống học thuật toán W.E.B.U')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
