import { CommandGame } from "../types/types.ts";
import { RoomGame } from "../types/types.ts";
import WebSocketEx from "../types/websocketEx.ts";
import { userDB } from "../users/userDB.ts";
import { wsClients } from "../users/users.ts";

const rooms: RoomGame[] = [];

export class RoomsController {
  ws: WebSocketEx;

  constructor(ws: WebSocketEx) {
    this.ws = ws;
  }

  createRoom() {
    if (typeof this.ws.id === "number") {
      const newRoom = {
        roomId: rooms.length,
        roomUsers: [
          {
            name: userDB[this.ws.id].name,
            index: this.ws.id,
          },
        ],
      };
      console.log("newRoom", newRoom);
      rooms.push(newRoom);
      return rooms;
    }
  }

  updateRoom() {
    const room = this.createRoom();

    if (room) {
      const res = {
        type: CommandGame.UpdateRoom,
        data: JSON.stringify(room),
        id: 0,
      };
      wsClients.forEach((client) => {
        client.send(JSON.stringify(res));
      });
    }
  }

  updateCurrentRoom() {
    const res = {
      type: CommandGame.UpdateRoom,
      data: JSON.stringify(rooms),
      id: 0,
    };
    wsClients.forEach((client) => {
      client.send(JSON.stringify(res));
    });
  }
}
