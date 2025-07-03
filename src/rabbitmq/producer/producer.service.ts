import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { StatusService } from '../../notificacao/service/status.service';

@Injectable()
export class ProducerService {
  private channel: amqp.Channel;
  private readonly queueName: string;

  constructor(
    private configService: ConfigService,
    private statusService: StatusService
  ) {
    const nome = this.configService.get<string>('RABBITMQ_MEU_NOME') || 'desconhecido';
    this.queueName = `fila.notificacao.entrada.${nome}`;
  }

  async connect() {
    const connectionVRSoftware = await amqp.connect({
      protocol: 'amqp',
      hostname: this.configService.get('RABBITMQ_HOST'),
      port: Number(this.configService.get('RABBITMQ_PORT')),
      username: this.configService.get('RABBITMQ_USER'),
      password: this.configService.get('RABBITMQ_PASSWORD'),
    });

    this.channel = await connectionVRSoftware.createChannel();
    await this.channel.assertQueue(this.queueName, { durable: true });
  }

  async sendNotification(payload: { mensagemId: string; conteudoMensagem: string }) {
    await this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(payload)));
    this.statusService.salvarStatus(payload.mensagemId, 'ENVIADO');
  }
}
