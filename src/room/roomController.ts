import { CommandGame, IncomingRoom, GameInfo } from "../types/types.ts";
import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { GameService } from "../game/gameService.ts";
import { shipForBot } from "../data/shipForBot.ts";
import { DB } from "../data/DB.ts";

let roomId = 0;
export let idGame = 0;

export class RoomController {
  ws: WebSocketWithIds;
  gameService: GameService;

  constructor(ws: WebSocketWithIds) {
    this.ws = ws;
    this.gameService = new GameService();
  }

  private createRoom() {
    if (!this.validateWebSocketIds()) return;

    const newRoom = {
      roomId: roomId,
      indexSocket: this.ws.indexSocket!,
      roomUsers: [
        {
          name: DB.users[this.ws.id!].name,
          index: this.ws.id!,
        },
      ],
    };
    roomId++;

    DB.rooms.push(newRoom);
    return newRoom;
  }

  private validateWebSocketIds(): boolean {
    return (
      typeof this.ws.id === "number" && typeof this.ws.indexSocket === "number"
    );
  }

  createGame(data: IncomingRoom) {
    const searchRoom = DB.rooms.find((room) => room.roomId === data.indexRoom);

    if (!searchRoom || !this.validateWebSocketIds()) return;

    const userId = this.ws.id;
    const userIndexSocket = this.ws.indexSocket;
    const firstRoomUserIndex = searchRoom.roomUsers[0].index;
    const firstRoomIndexSocket = searchRoom.indexSocket;

    if (userId === firstRoomUserIndex || this.checkUserGame()) return;

    const newGame: GameInfo = {
      idGame: idGame,
      players: [
        {
          idPlayer: 0,
          idUser: userId!,
          indexSocket: userIndexSocket!,
          shipInfo: [],
          shipsCoord: [],
          isPlayerTurn: true,
          checkWin: 0,
        },
        {
          idPlayer: 1,
          idUser: firstRoomUserIndex,
          indexSocket: firstRoomIndexSocket,
          shipInfo: [],
          shipsCoord: [],
          isPlayerTurn: false,
          checkWin: 0,
        },
      ],
    };

    DB.games.set(newGame.idGame, newGame);
    this.deleteRoom(data.indexRoom);
    this.deleteRoomByUserId(userId!);
    this.sendCreateGame(idGame, userId!, newGame.players[0].idPlayer);
    this.sendCreateGame(
      idGame,
      firstRoomUserIndex,
      newGame.players[1].idPlayer,
      firstRoomIndexSocket
    );
    idGame++;
  }

  createGameWithBot() {
    if (this.validateWebSocketIds()) {
      if (this.checkUserGame()) {
        return;
      }
      const shipsBot =
        shipForBot[Math.floor(Math.random() * shipForBot.length)];
      const newGame: GameInfo = {
        idGame: idGame,
        isBot: true,
        players: [
          {
            idPlayer: 0,
            idUser: this.ws.id!,
            indexSocket: this.ws.indexSocket!,
            shipInfo: [],
            shipsCoord: [],
            isPlayerTurn: true,
            checkWin: 0,
          },
          {
            idPlayer: 1,
            idUser: -1,
            indexSocket: -1,
            shipInfo: this.gameService.addShips(shipsBot),
            shipsCoord: shipsBot,
            isPlayerTurn: false,
            checkWin: 0,
          },
        ],
      };

      DB.games.set(newGame.idGame, newGame);
      this.deleteRoomByUserId(this.ws.id!);
      this.sendCreateGame(idGame, this.ws.id!, newGame.players[0].idPlayer);
      idGame++;
    }
  }

  private sendCreateGame(
    idGame: number,
    idUser: number,
    idPlayer: number,
    indexSocket?: number
  ) {
    const wsClientsArray = Array.from(DB.wsClients);

    const findWsClient =
      idUser !== this.ws.id
        ? wsClientsArray.find((ws) => ws.indexSocket === indexSocket)
        : this.ws;

    const sendData = { idGame, idPlayer };

    const res = {
      type: CommandGame.CreateGame,
      data: JSON.stringify(sendData),
      id: 0,
    };
    findWsClient?.send(JSON.stringify(res));
  }

  private deleteRoom(idRoom: number) {
    const index = DB.rooms.findIndex((room) => room.roomId === idRoom);
    if (index !== -1) {
      DB.rooms.splice(index, 1);
    }
  }

  private deleteRoomByUserId(userId: number) {
    const index = DB.rooms.findIndex((user) => {
      return user.roomUsers[0].index === userId;
    });

    if (index !== -1) {
      DB.rooms.splice(index, 1);
    }
  }

  // updateRoom() {
  //   const room = this.createRoom();

  //   if (room) {
  //     const res = {
  //       type: CommandGame.UpdateRoom,
  //       data: JSON.stringify(this.filterRoomsForUpdate()),
  //       id: 0,
  //     };
  //     this.sendResponseToClients(res);
  //   }
  // }

  updateRoom(isCreateRoom: boolean = false) {
    if (isCreateRoom) {
        const room = this.createRoom();
        if (!room) return;
    }

    const res = {
        type: CommandGame.UpdateRoom,
        data: JSON.stringify(this.filterRoomsForUpdate()),
        id: 0,
    };
    console.log("RoomController", res);
    this.sendResponseToClients(res);
}
  // updateCurrentRoom() {
  //   const res = {
  //     type: CommandGame.UpdateRoom,
  //     data: JSON.stringify(this.filterRoomsForUpdate()),
  //     id: 0,
  //   };
  //   console.log("RoomController", res);
  //   this.sendResponseToClients(res);
  // }
  updateWinners() {
    const res = {
      type: CommandGame.UpdateWin,
      data: JSON.stringify(DB.winners),
      id: 0,
    };
    this.sendResponseToClients(res);
  }

  private checkUserGame() {
    const gamesArray = Array.from(DB.games.values());
    return gamesArray.some((room) =>
      room.players.some((user) => this.ws.id === user.idUser)
    );
  }

  private filterRoomsForUpdate() {
    return DB.rooms.map(({ indexSocket, ...rest }) => rest);
  }

  private sendResponseToClients(res: any) {
    DB.wsClients.forEach((client) => {
      client.send(JSON.stringify(res));
    });
  }
}
