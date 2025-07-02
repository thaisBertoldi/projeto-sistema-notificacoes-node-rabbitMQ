import { Module } from '@nestjs/common';
import { NotificacaoController } from './controller/notificacao.controller';
import { ProducerService } from 'src/rabbitmq/producer/producer.service';
import { StatusService } from './service/status.service';

@Module({
  controllers: [NotificacaoController],
  providers: [ProducerService, StatusService],
})
export class NotificacaoModule {}
