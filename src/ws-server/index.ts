import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { parseData } from "../utils/utils.ts";
import { WSController } from "./wsController.ts";
import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { wsClients } from "../data/userData.ts";
import { GameController } from "../game/gameController.ts";
import { rooms } from "../data/gameData.ts";
import { RoomsController } from "../room/roomsController.ts";
import { IncomingMessage } from "http";

dotenv.config();

const WS_Port = Number(process.env.WSS_PORT) || 3000;

export const wss = new WebSocketServer({ port: WS_Port });

wss.on("connection", (ws: WebSocketWithIds, req: IncomingMessage) => {
  const socketData = req.socket;
  console.log(
    `Client was connected on port ${socketData.remotePort}, with address ${socketData.remoteAddress} and protocol ${socketData.remoteFamily}!`
  );
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
    if (ws.id !== undefined && ws.indexSocket !== undefined) {
      console.log(`User with id ${ws.id} and indexSocket ${ws.indexSocket} was disconnected!`);
    }
    console.log(
      `Client on port ${socketData.remotePort}, with address ${socketData.remoteAddress} and protocol ${socketData.remoteFamily} was disconnected!`,
    );
  });
});

wss.on('listening', () => {
  const address = wss.address();

  if (typeof address === 'object' && address !== null) {
    console.log(
      `WebSocket server is running on port ${WS_Port}`,
    );
  } else {
    console.log(`WebSocket server is running on port ${WS_Port}`);
  }
});

wss.on('error', console.error);
