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

  constructor(ws: WebSocketWithIds, message: IncomingData) {
    this.message = message;
    this.data = this.message.data;
    this.ws = ws;
    this.RoomController = new RoomController(this.ws);
    this.gameController = new GameController(this.ws);
  }

  handleMessage() {
    switch (this.message.type) {
      case MessageType.Reg:
        handleUserRegistration(this.ws, this.data as IncomingUser);
        this.RoomController.updateRoom();
        this.RoomController.updateWinners();
        console.log("User registered");
        break;

      case MessageType.CreateRoom:
        console.log("Room", this.data, this.ws.id);
        this.RoomController.updateRoom(true);
        console.log("Room added");
        break;

      case MessageType.AddUserToRoom:
        this.RoomController.createGame(this.data as IncomingRoom);
        this.RoomController.updateRoom();
        console.log("Game created");
        break;

      case MessageType.AddShips:
        this.gameController.startGame(this.data as UserShipsConfiguration);
        console.log("Ships added");
        break;

      case MessageType.Attack:
        this.gameController.attackControl(this.data as AttackEventData);
        console.log("The attack happened");
        break;

      case MessageType.RundomAttack:
        this.gameController.getRandomAttack(this.data as RandomAttack);
        console.log("Random attack happened");
        break;
      case MessageType.SinglePlay:
        this.RoomController.createGameWithBot();
        this.RoomController.updateRoom();
        console.log("Single game was created");
        break;

      default:
        console.error("Invalid message type");
        break;
    }
  }
}
