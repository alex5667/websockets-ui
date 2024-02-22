import {
  IncomingData,
  AttackUser,
  IncomingRoom,
  IncomingUser,
  UserShips,
  RandomAttack,
} from "../types/types.ts";
import { handleUserRegistration } from "../users/users.ts";
import { CommandGame } from "../types/types.ts";
import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { RoomController } from "../room/roomController.ts";
import { GameController } from "../game/gameController.ts";

export class WSController {
  message!: IncomingData;
  data:
    | IncomingUser
    | IncomingRoom
    | UserShips
    | AttackUser
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

  checkCommand() {
    switch (this.message.type) {
      case CommandGame.Reg:
        handleUserRegistration(this.ws, this.data as IncomingUser);
        this.RoomController.updateRoom();
        this.RoomController.updateWinners();
        console.log("User registered");
        break;

      case CommandGame.CreateRoom:
        console.log("Room", this.data, this.ws.id);
        this.RoomController.updateRoom(true);
        console.log("Room added");
        break;

      case CommandGame.AddUserToRoom:
        this.RoomController.createGame(this.data as IncomingRoom);
        this.RoomController.updateRoom();
        console.log("Game created");
        break;

      case CommandGame.AddShips:
        this.gameController.startGame(this.data as UserShips);
        console.log("Ships added");
        break;

      case CommandGame.Attack:
        this.gameController.attackControl(this.data as AttackUser);
        console.log("The attack happened");
        break;

      case CommandGame.RundomAttack:
        this.gameController.getRandomAttack(this.data as RandomAttack);
        console.log("Random attack happened");
        break;
      case CommandGame.SinglePlay:
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
