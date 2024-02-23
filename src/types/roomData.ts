import { ResponseUserInfo } from "./userData.ts";
import { ShipCoordinates } from "./shipData.ts";

export interface IncomingRoom {
  indexRoom: number;
}

export interface RoomGame {
  roomId: number;
  indexSocket: number;
  roomUsers: ResponseUserInfo[];
}


