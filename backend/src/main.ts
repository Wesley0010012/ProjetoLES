import './load-environment';
import compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Comprime as respostas JSON (gzip/br) antes de enviar ao front — sem isso,
  // payloads maiores (ex.: /admin/analysis) trafegam sem compressão.
  app.use(compression());
  app.enableCors({
    origin:
      process.env.FRONTEND_ORIGIN ??
      process.env.FRONTEND_URL ??
      'http://localhost:3000',
  });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
