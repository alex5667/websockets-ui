export enum CommandGame {
  Reg = "reg",
  UpdateWin = "update_winners",
  CreateRoom = "create_room",
  AddUserToRoom = "add_user_to_room",
  CreateGame = "create_game",
  UpdateRoom = "update_room",
  AddShips = "add_ships",
  StartGame = "start_game",
  Attack = "attack",
  RandomAttack = "randomAttack",
  Turn = "turn",
  Finish = "finish",
  SinglePlay = "single_play",
}

export interface IncomingData {
  type: string;
  data: unknown;
  id: 0;
}

export interface IncomingUser {
  name: string;
  password: string;
}
interface ResponseUserInfo {
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

export interface RoomGame {
  roomId: number;
  indexSocket: number;
  roomUsers: ResponseUserInfo[];
}

export interface GameInfo {
  idGame: number;
  players: PlayerInfo[];
}

interface PlayerInfo {
  idPlayer: number;
  indexSocket: number;
  shipInfo: Array<number[]>;
  shipsCoord: ShipsCoord[];
  checkWin: number;
}

export interface IncomingUser {
  name: string;
  password: string;
}

export interface IncomingRoom {
  indexRoom: number;
}
export interface IncomingData {
  type: string;
  data: IncomingUser | IncomingRoom | unknown;
  id: 0;
}

export interface CreateGame {
  idGame: number;
  idPlayer: number;
}
export interface IncomingData {
  type: string;
  data: IncomingUser | IncomingRoom | UserShips | unknown;
  id: 0;
}

export interface UserShips {
  gameId: number;
  ships: ShipsCoord[];
  indexPlayer: number;
}

export interface ShipsCoord {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

export interface StartGameData {
  ships: ShipsCoord[];
  currentPlayerIndex: number;
}
