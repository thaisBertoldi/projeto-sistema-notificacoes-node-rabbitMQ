import { Injectable } from '@nestjs/common';

@Injectable()
export class StatusService {
  private statusMap = new Map<string, string>();

  salvarStatus(mensagemId: string, status: string) {
    this.statusMap.set(mensagemId, status);
  }

  atualizarStatus(mensagemId: string, status: string) {
    this.statusMap.set(mensagemId, status);
  }

  getStatus(mensagemId: string): string | undefined {
    return this.statusMap.get(mensagemId);
  }

  listarTodos() {
    return Array.from(this.statusMap.entries()).map(([id, status]) => ({
      mensagemId: id,
      status,
    }));
  }
}
