import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketToGameService {
  private readonly map = new Map<string, string>();

  set(clientId: string, gameId: string) {
    this.map.set(clientId, gameId);
  }

  get(clientId: string): string | undefined {
    return this.map.get(clientId);
  }

  delete(clientId: string) {
    this.map.delete(clientId);
  }

  has(clientId: string): boolean {
    return this.map.has(clientId);
  }

  clear() {
    this.map.clear();
  }
}
