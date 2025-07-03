import * as amqp from 'amqplib';
import { ProducerService } from './producer.service';

jest.mock('amqplib');

describe('ProducerService', () => {
  let service: ProducerService;
  let mockChannel: any;
  let mockStatusService: any;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          RABBITMQ_MEU_NOME: 'teste',
          RABBITMQ_HOST: 'localhost',
          RABBITMQ_PORT: 5672,
          RABBITMQ_USER: 'user',
          RABBITMQ_PASSWORD: 'pass',
        };
        return config[key];
      }),
    };

    mockStatusService = {
      salvarStatus: jest.fn(),
    };

    mockChannel = {
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
    };

    const mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    service = new ProducerService(
      mockConfigService as any,
      mockStatusService as any,
    );

    await service.connect();
  });

  it('deve enviar notificação para o RabbitMQ e salvar status como ENVIADO', async () => {
    const payload = {
      mensagemId: 'abc123',
      conteudoMensagem: 'teste',
    };

    await service.sendNotification(payload);

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'fila.notificacao.entrada.teste',
      Buffer.from(JSON.stringify(payload)),
    );

    expect(mockStatusService.salvarStatus).toHaveBeenCalledWith(
      payload.mensagemId,
      'ENVIADO',
    );
  });
});
