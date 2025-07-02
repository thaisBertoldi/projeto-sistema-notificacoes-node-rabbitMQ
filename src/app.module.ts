import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificacaoModule } from './notificacao/notificacao.module';
import { ConfigModule } from '@nestjs/config';
import { ConsumerService } from './rabbitmq/consumer/consumer.service';
import { StatusService } from './notificacao/service/status.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), NotificacaoModule],
  controllers: [AppController],
  providers: [AppService, ConsumerService, StatusService],
})
export class AppModule {}
