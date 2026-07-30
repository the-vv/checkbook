import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin) {
    app.enableCors({ origin: corsOrigin, credentials: true });
  }

  app.setGlobalPrefix('api');

  const publicPath = join(__dirname, '..', 'public');
  app.useStaticAssets(publicPath);
  app.use((req: any, res: any, next: any) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(join(publicPath, 'index.html'));
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
