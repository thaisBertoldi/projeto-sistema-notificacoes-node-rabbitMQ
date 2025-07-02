import { Module } from '@nestjs/common';
import { NotificacaoController } from './controller/notificacao.controller';
import { ProducerService } from 'src/rabbitmq/producer/producer.service';

@Module({
  controllers: [NotificacaoController],
  providers: [ProducerService],
})
export class NotificacaoModule {}
