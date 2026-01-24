import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dns from 'dns';

// Force usage of IPv4 to prevent ENETUNREACH on Render/Supabase
// This is a common fix when Node prefers IPv6 but the network route is erratic
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: '*', // Permissive for debugging. In production, lists specific domains.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`Backend server running on: http://localhost:${port}/api/v1`);
}
bootstrap();
