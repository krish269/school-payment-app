import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- This is the critical addition ---
  // This enables Cross-Origin Resource Sharing (CORS), which allows
  // your frontend application (running on a different port) to make
  // requests to this backend.
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
