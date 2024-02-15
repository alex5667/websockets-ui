import { WebSocket } from 'ws';
import { IncomingData, IncomingUser } from '../types/types.ts';
import { registerUsers } from '../users/users.ts';
import { CommandGame } from '../types/types.ts';
import WebSocketEx from '../types/websocketEx.ts';
import { RoomsController } from '../room/RoomsController.ts';
export class WSController {
  message!: IncomingData;
  data: IncomingUser;
  ws: WebSocketEx;

  constructor(ws: WebSocketEx, message: IncomingData) {
    this.message = message;
    this.data = this.message.data as IncomingUser;
    this.ws = ws;
  }

  checkCommand() {
    switch (this.message.type) {
      case CommandGame.Reg:
        registerUsers(this.ws, this.data);
        new RoomsController(this.ws).updateCurrentRoom();
        break;

      case CommandGame.CreateRoom:
        console.log('Room', this.data, this.ws.id);
        new RoomsController(this.ws).updateRoom();
        break;
    }
  }
}