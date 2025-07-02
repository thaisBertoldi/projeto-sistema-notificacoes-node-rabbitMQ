import { Injectable } from '@nestjs/common';

@Injectable()
export class StatusService {
  private statusMap = new Map<string, string>();

  setStatus(mensagemId: string, status: string) {
    this.statusMap.set(mensagemId, status);
  }

  getStatus(mensagemId: string): string | undefined {
    return this.statusMap.get(mensagemId);
  }

  getAllStatus(): Map<string, string> {
    return this.statusMap;
  }
}
