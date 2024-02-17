import {
  CommandGame,
  IncomingRoom,
  RoomGame,
  GameInfo,
} from "../types/types.ts";
import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { userDB, wsClients } from "../data/userData.ts";
import { rooms, games, winners } from "../data/gameData.ts";

let roomId = 0;
export let idGame = 0;

export class RoomsController {
  ws: WebSocketWithIds;

  constructor(ws: WebSocketWithIds) {
    this.ws = ws;
  }

  private createRoom() {
    if (
      typeof this.ws.id === "number" &&
      typeof this.ws.indexSocket === "number"
    ) {
      const newRoom = {
        roomId: roomId,
        indexSocket: this.ws.indexSocket,
        roomUsers: [
          {
            name: userDB[this.ws.id].name,
            index: this.ws.id,
          },
        ],
      };
      console.log("newRoom", newRoom);
      roomId++;
      rooms.push(newRoom);
      return rooms;
    }
  }

  createGame(data: IncomingRoom) {
    console.log("data", data);
    const searchRoom = rooms.find((room) => room.roomId === data.indexRoom);
    console.log("searchRoom", searchRoom);

    if (
      searchRoom &&
      typeof this.ws.id === "number" &&
      typeof this.ws.indexSocket === "number"
    ) {
      if (
        this.ws.id === searchRoom.roomUsers[0].index ||
        this.checkUserGame()
      ) {
        return;
      }
      const newGame: GameInfo = {
        idGame: idGame,
        players: [
          {
            idPlayer: 0,
            idUser: this.ws.id,
            indexSocket: this.ws.indexSocket,
            shipInfo: [],
            shipsCoord: [],
            isPlayerTurn: true,
            checkWin: 0,
          },
          {
            idPlayer: 1,
            idUser: searchRoom.roomUsers[0].index,
            indexSocket: searchRoom.indexSocket,
            shipInfo: [],
            shipsCoord: [],
            isPlayerTurn: false,
            checkWin: 0,
          },
        ],
      };

      games.set(newGame.idGame, newGame);
      this.deleteRoom(data.indexRoom);
      this.deleteRoomByUserId(this.ws.id);
      this.sendCreateGame(idGame, this.ws.id, newGame.players[0].idPlayer);
      this.sendCreateGame(
        idGame,
        searchRoom.roomUsers[0].index,
        newGame.players[1].idPlayer,
        searchRoom.indexSocket
      );
      idGame++;
    }
  }

  private sendCreateGame(
    idGame: number, idUser: number, idPlayer: number, indexSocket?: number
  ) {
    const wsClientsArray = Array.from(wsClients);

    const findClient = idUser !== this.ws.id ? wsClientsArray.find((ws) => ws.indexSocket === indexSocket) : this.ws;

    const sendData = {
      idGame: idGame,
      idPlayer: idPlayer,
    };

    const res = {
      type: CommandGame.CreateGame,
      data: JSON.stringify(sendData),
      id: 0,
    };
    findClient?.send(JSON.stringify(res));
    // filteredClientArray.forEach((client) => {
    //   client.send(JSON.stringify(res));
    // });
  }

  private deleteRoom(idRoom: number) {
    const searchIndex = rooms.findIndex((room) => room.roomId === idRoom);
    if (searchIndex !== -1) {
      rooms.splice(searchIndex, 1);
    }
  }

  private deleteRoomByUserId(userId: number) {
    const searchIndexRoomByUserId = rooms.findIndex((user) => {
      return user.roomUsers[0].index === userId;
    });

    if (searchIndexRoomByUserId !== -1) {
      rooms.splice(searchIndexRoomByUserId, 1);
    }
  }

  updateRoom() {
    const room = this.createRoom();

    if (room) {
      const res = {
        type: CommandGame.UpdateRoom,
        data: JSON.stringify(this.filterRoomsForUpdate()),
        id: 0,
      };
      this.sendResponseToClients(res);
    }
  }

  updateCurrentRoom() {
    const res = {
      type: CommandGame.UpdateRoom,
      data: JSON.stringify(this.filterRoomsForUpdate()),
      id: 0,
    };
    console.log("roomscontroller", res);
    this.sendResponseToClients(res);
  }
  updateWinners() {
    const res = {
      type: CommandGame.UpdateWin,
      data: JSON.stringify(winners),
      id: 0,
    };
    wsClients.forEach((client) => {
      client.send(JSON.stringify(res));
    });
  }
  private checkUserRooms() {
    const checkRoom = rooms.find((room) => {
      return room.roomUsers.some((user) => this.ws.id === user.index);
    });
    if (checkRoom) {
      return true;
    }
    return false;
  }

  private checkUserGame() {
    const gamesArray = Array.from(games.values());
    const checkRoom = gamesArray.find((room) => {
      return room.players.some((user) => this.ws.id === user.idUser);
    });
    if (checkRoom) {
      return true;
    }
    return false;
  }

  private filterRoomsForUpdate() {
    return rooms.map((room) => {
      const { indexSocket, ...rest } = room;
      console.log("indexSocket roomscontroller", indexSocket);
      console.log("rest roomscontroller", rest);

      return rest;
    });
  }

  private sendResponseToClients(res: any) {
    wsClients.forEach((client) => {
      client.send(JSON.stringify(res));
    });
  }
}
