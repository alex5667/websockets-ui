import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { parseData } from "../utils/utils.ts";
import { WSController } from "./wsController.ts";
import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { GameController } from "../game/gameController.ts";
import { RoomController } from "../room/roomController.ts";
import { IncomingMessage } from "http";
import { DB } from "../data/DB.ts";

dotenv.config();

const WS_Port = Number(process.env.WSS_PORT) || 3000;

export const wss = new WebSocketServer({ port: WS_Port });

wss.on("connection", (ws: WebSocketWithIds) => {
  ws.on("error", console.error);

  ws.on("message", (data) => {

    const result = parseData(data.toString());
    console.log("result", result);
    new WSController(ws, result).checkCommand();
  });
  ws.on("close", () => {
    if (ws.indexSocket !== undefined) {
      new GameController(ws).isPlayerExit(ws.indexSocket);

      const searchIndexRoom = DB.rooms.findIndex((user) => {
        return user.indexSocket === ws.indexSocket;
      });
      if (searchIndexRoom !== -1) {
        DB.rooms.splice(searchIndexRoom, 1);

        new RoomController(ws).updateRoom();
      }
    }
    DB.wsClients.delete(ws);
    if (ws.id !== undefined && ws.indexSocket !== undefined) {
      console.log(
        `User with id ${ws.id} and indexSocket ${ws.indexSocket} was disconnected!`
      );
    }
  });
});

wss.on("listening", () => {
  const address = wss.address();

  if (typeof address === "object" && address !== null) {
    console.log(`WebSocket server is running on port ${WS_Port}`);
  } else {
    console.log(`WebSocket server is running on port ${WS_Port}`);
  }
});

wss.on("error", console.error);
