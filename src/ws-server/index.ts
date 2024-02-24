import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { dataParsing } from "../utils/utils.ts";
import { WSController } from "./wsController.ts";
import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { GameController } from "../game/gameController.ts";
import { RoomController } from "../room/roomController.ts";
import { DB } from "../data/DB.ts";

dotenv.config();

const WS_Port = Number(process.env.WSS_PORT) || 3000;

export const wss = new WebSocketServer({ port: WS_Port });

wss.on("connection", (ws: WebSocketWithIds) => {
  ws.on("error", console.error);

  ws.on("message", (data) => handleMessage(ws, data));
  ws.on("close", () => handleClose(ws));
});

wss.on("listening", () => {
  console.log(`WebSocket server is running on port ${WS_Port}`);
});

wss.on("error", console.error);

function handleClose(ws: WebSocketWithIds) {
  if (ws.indexSocket !== undefined) {
    new GameController(ws).handlePlayerExit(ws.indexSocket);

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
    console.log(`The user with ID ${ws.id} has been disconnected.`);
  }
}

function handleMessage(ws: WebSocketWithIds, data: any) {
  const result = dataParsing(data.toString());
  new WSController(ws).handleMessage(result);
}
