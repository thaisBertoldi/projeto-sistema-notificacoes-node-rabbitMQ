import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { NotificacaoDto } from '../dto/notificacao.dto';
import { ProducerService } from 'src/rabbitmq/producer/producer.service';
import { StatusService } from '../service/status.service';

@Controller('api/notificar')
export class NotificacaoController {
  constructor(
    private readonly producerService: ProducerService,
    private readonly statusService: StatusService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async notificar(@Body() notificacao: NotificacaoDto) {
    if (
      !notificacao.conteudoMensagem ||
      notificacao.conteudoMensagem.trim() === ''
    ) {
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

  @Get('status/:mensagemId')
  getStatus(@Param('mensagemId') mensagemId: string) {
    const status = this.statusService.getStatus(mensagemId);
    if (!status) {
      throw new NotFoundException(
        `Status não encontrado para mensagemId informado. Id: ${mensagemId}`,
      );
    }
    return { mensagemId, status };
  }
}
