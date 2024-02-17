import {
  IncomingData,
  IncomingRoom,
  IncomingUser,
  UserShips,
} from "../types/types.ts";
import { registerUsers } from "../users/users.ts";
import { CommandGame } from "../types/types.ts";
import WebSocketEx from "../types/websocketEx.ts";
import { RoomsController } from "../room/roomsController.ts";
import { GameController } from "../game/gameController.ts";

export class WSController {
  message!: IncomingData;
  data: IncomingUser | IncomingRoom | UserShips | unknown;
  ws: WebSocketEx;
  roomsController: RoomsController;
  gameController: GameController;

  constructor(ws: WebSocketEx, message: IncomingData) {
    this.message = message;
    this.data = this.message.data;
    this.ws = ws;
    this.roomsController = new RoomsController(this.ws);
    this.gameController = new GameController(this.ws);
  }

  checkCommand() {
    switch (this.message.type) {
      case CommandGame.Reg:
        registerUsers(this.ws, this.data as IncomingUser);
        this.roomsController.updateCurrentRoom();
        break;

      case CommandGame.CreateRoom:
        console.log("Room", this.data, this.ws.id);
        this.roomsController.updateRoom();
        break;

      case CommandGame.AddUserToRoom:
        this.roomsController.createGame(this.data as IncomingRoom);
        this.roomsController.updateCurrentRoom();
        break;
      case CommandGame.AddShips:
        this.gameController.startGame(this.data as UserShips);
        console.log("game");
    }
  }
}
