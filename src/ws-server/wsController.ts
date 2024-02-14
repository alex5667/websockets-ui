import { WebSocket } from 'ws';
import { IncomingData, IncomingUser } from '../types/types.ts';
import { registerUsers } from '../users/users.ts';
import { CommandGame } from '../types/types.ts';

export class WSController {
  message!: IncomingData;
  data: IncomingUser;
  ws: WebSocket;

  constructor(ws: WebSocket, message: IncomingData) {
    this.message = message;
    this.data = this.message.data as IncomingUser;
    this.ws = ws;
  }

  checkCommand() {
    switch (this.message.type) {
      case CommandGame.Reg:
        registerUsers(this.ws, this.data);
    }
  }
}