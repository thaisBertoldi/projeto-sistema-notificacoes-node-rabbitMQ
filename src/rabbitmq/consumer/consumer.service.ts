import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { StatusService } from 'src/notificacao/service/status.service';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelConsume: amqp.Channel;
  private channelPublish: amqp.Channel;
  private readonly queueConsume: string;
  private readonly queuePublish: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly statusService: StatusService,
  ) {
    const nome = this.configService.get<string>('RABBITMQ_MEU_NOME') || 'desconhecido';

    this.queueConsume = `fila.notificacao.entrada.${nome}`;
    this.queuePublish = `fila.notificacao.status.${nome}`;
  }

  async onModuleInit() {
    const conn = await amqp.connect({
      protocol: 'amqp',
      hostname: this.configService.get('RABBITMQ_HOST'),
      port: Number(this.configService.get('RABBITMQ_PORT')),
      username: this.configService.get('RABBITMQ_USER'),
      password: this.configService.get('RABBITMQ_PASSWORD'),
    });

    this.channelConsume = await conn.createChannel();
    this.channelPublish = await conn.createChannel();

    await this.channelConsume.assertQueue(this.queueConsume, { durable: true });
    await this.channelPublish.assertQueue(this.queuePublish, { durable: true });

    this.channelConsume.consume(this.queueConsume, async (mensagem) => {
      if (mensagem) {
        try {
          const content = JSON.parse(mensagem.content.toString());
          console.log('Mensagem recebida:', content);

          await new Promise((res) =>
            setTimeout(res, 1000 + Math.random() * 1000),
          );
          const rand = Math.floor(Math.random() * 10) + 1;
          const status =
            rand <= 2 ? 'FALHA_PROCESSAMENTO' : 'PROCESSADO_SUCESSO';
          this.statusService.atualizarStatus(content.mensagemId, status);
          const resultadoMensagem = {
            mensagemId: content.mensagemId,
            status,
          };

          this.channelPublish.sendToQueue(
            this.queuePublish,
            Buffer.from(JSON.stringify(resultadoMensagem)),
          );
          console.log('Status publicado:', resultadoMensagem);

          this.channelConsume.ack(mensagem);
        } catch (err) {
          throw new InternalServerErrorException('Erro ao processar mensagem:', err);
        }
      }
    })
  }
}
