import { ShipCoordinates } from "./shipData.ts";

export interface IncomingUser {
    name: string;
    password: string;
  }
  
  export interface ResponseUserInfo {
    name: string;
    index: number;
  }
  
  export interface ResponseUser extends ResponseUserInfo {
    error: boolean;
    errorText: string;
  }
  
  export interface User {
    name: string;
    password: string;
    index: number;
  }
  export interface PlayerInfo {
    idPlayer: number;
    idUser: number;
    indexSocket: number;
    shipInfo: number[][];
    ShipCoordinates: ShipCoordinates[];
    isPlayerTurn: boolean;
    checkWin: number;
  }