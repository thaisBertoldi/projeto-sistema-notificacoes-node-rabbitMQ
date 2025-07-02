import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class ProducerService {
  private channel: amqp.Channel;
  private readonly queue: string;

  constructor(private configService: ConfigService) {
    this.queue = this.configService.get('RABBITMQ_QUEUE')  || 'notifications';
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
    await this.channel.assertQueue(this.queue, { durable: true });
  }

  async sendNotification(data: any) {
    this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(data)));
  }
}
