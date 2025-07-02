import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { Server } from 'socket.io';

@Injectable()
export class ConsumerService {
  private io: Server;
  private readonly queue: string;

  constructor(private configService: ConfigService) {
    this.queue = this.configService.get('RABBITMQ_QUEUE')  || 'notifications';
  }

  setSocketServer(io: Server) {
    this.io = io;
  }

  async consume() {
    const connectionVRSoftware = await amqp.connect({
      protocol: 'amqp',
      hostname: this.configService.get('RABBITMQ_HOST'),
      port: Number(this.configService.get('RABBITMQ_PORT')),
      username: this.configService.get('RABBITMQ_USER'),
      password: this.configService.get('RABBITMQ_PASS'),
    });

    const channel = await connectionVRSoftware.createChannel();
    await channel.assertQueue(this.queue, { durable: true });

    channel.consume(this.queue, async (message) => {
      if (message !== null) {
        const data = JSON.parse(message.content.toString());

        await new Promise(res => setTimeout(res, 3000));

        this.io.emit('feedback-notification-result', {
          id: data.id,
          status: 'sucesso',
          mensagem: data.mensagem,
        });

        channel.ack(message);
      }
    });
  }
}
