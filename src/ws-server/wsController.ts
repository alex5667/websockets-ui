import { IncomingData } from "../types/types.ts";
import { IncomingUser } from "../types/userData.ts";
import { handleUserRegistration } from "../users/users.ts";
import { MessageType } from "../types/messageTypes.ts";
import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { RoomController } from "../room/roomController.ts";
import { GameController } from "../game/gameController.ts";
import { AttackEventData, RandomAttack } from "../types/gameData.ts";
import { UserShipsConfiguration } from "../types/gameData.ts";
import { IncomingRoom } from "../types/roomData.ts";
export class WSController {
  message!: IncomingData;
  data:
    | IncomingUser
    | IncomingRoom
    | UserShipsConfiguration
    | AttackEventData
    | RandomAttack
    | unknown;
  ws: WebSocketWithIds;
  RoomController: RoomController;
  gameController: GameController;

  constructor(ws: WebSocketWithIds,) {
    this.ws = ws;
    this.RoomController = new RoomController(this.ws);
    this.gameController = new GameController(this.ws);
  }

  handleMessage( message: IncomingData) {
    switch (message.type) {
      case MessageType.Reg:
        handleUserRegistration(this.ws, message.data as IncomingUser);
        this.RoomController.updateRoom();
        this.RoomController.handleWinnerUpdate();
        break;

      case MessageType.CreateRoom:
        this.RoomController.updateRoom(true);
        break;

      case MessageType.AddUserToRoom:
        this.RoomController.createGame(message.data as IncomingRoom);
        this.RoomController.updateRoom();
        break;

      case MessageType.placeShips:
        this.gameController.initializeGame(message.data as UserShipsConfiguration);
        break;

      case MessageType.Attack:
        this.gameController.handleAttack(message.data as AttackEventData);
        break;

      case MessageType.RandomAttack:
        this.gameController.initiateRandomAttack(message.data as RandomAttack);
        break;
      case MessageType.SinglePlay:
        this.RoomController.createGameWithBot();
        this.RoomController.updateRoom();
        break;

      default:
        console.error("Invalid message type");
        break;
    }
  }
}
