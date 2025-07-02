import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NotificacaoDto } from '../dto/notificacao.dto';
import { ProducerService } from 'src/rabbitmq/producer/producer.service';

@Controller('api')
export class NotificacaoController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('notificar')
  @HttpCode(HttpStatus.ACCEPTED)
  async notificar(@Body() notificacao: NotificacaoDto) {
    if (!notificacao.conteudoMensagem || notificacao.conteudoMensagem.trim() === '') {
      throw new BadRequestException(
        'O campo conteudoMensagem não pode ser vazio.',
      );
    }

    try {
      await this.producerService.sendNotification(notificacao);
      return {
        mensagem: `Id: ${notificacao.mensagemId}, requisição recebida e será processada assincronamente.`,
      };
    } catch (error) {
      throw new BadRequestException('Não foi possível enviar a notificação.');
    }
  }
}
