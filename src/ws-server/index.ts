import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { parseData } from "../utils/utils.ts";
import { WSController } from "./wsController.ts";
import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { wsClients } from "../data/userData.ts";
import { GameController } from "../game/gameController.ts";
import { rooms } from "../data/gameData.ts";
import { RoomsController } from "../room/roomsController.ts";

dotenv.config();

const WS_Port = Number(process.env.WSS_PORT) || 3000;

export const wss = new WebSocketServer({ port: WS_Port });

wss.on("connection", (ws: WebSocketWithIds) => {
  console.log(`WebSocket server start on port ${WS_Port}`);
  ws.on("error", console.error);

  ws.on("message", (data) => {
    console.log("received (ws-server)", data.toString());

    const result = parseData(data.toString());
    console.log("result", result);
    new WSController(ws, result).checkCommand();
  });
  ws.on("close", () => {
    if (ws.indexSocket !== undefined) {
      new GameController(ws).isPlayerExit(ws.indexSocket);

      const searchIndexRoom = rooms.findIndex((user) => {
        return user.indexSocket === ws.indexSocket;
      });
      if (searchIndexRoom !== -1) {
        rooms.splice(searchIndexRoom, 1);

        new RoomsController(ws).updateCurrentRoom();
      }
    }
    wsClients.delete(ws);
    console.log(`User with id ${ws.id} and ${ws.indexSocket} was closed`);
  });
});

wss.on("listening", () => {
  const adress = wss.address();
  console.log(`WebSocket server work on port ${WS_Port} and ${adress}`);
});
