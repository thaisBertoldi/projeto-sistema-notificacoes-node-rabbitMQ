import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProducerService } from './rabbitmq/producer/producer.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const producerService = app.get(ProducerService);
  await producerService.connect();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
