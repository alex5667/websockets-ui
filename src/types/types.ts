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
  RundomAttack = 'randomAttack',

}

export interface IncomingData {
  type: string;
  data: IncomingUser | IncomingRoom | UserShips | AttackUser | RandomAttack;
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
  isBot?: true;
  players: PlayerInfo[];
}

interface PlayerInfo {
  idPlayer: number;
  idUser: number;
  indexSocket: number;
  shipInfo: number[][];
  shipsCoord: ShipsCoord[];
  isPlayerTurn: boolean;
  checkWin: number;
}

export interface Coordinate {
  x: number;
  y: number;
}
export interface IncomingUser {
  name: string;
  password: string;
}

export interface IncomingRoom {
  indexRoom: number;
}


export interface CreateGame {
  idGame: number;
  idPlayer: number;
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


export enum StatusAttack {
  Miss = 'miss',
  Killed = 'killed',
  Shot = 'shot',
}

export interface AttackUser {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
}

export interface RandomAttack {
  gameId: number;
  indexPlayer: number;
}

export interface AttackStatus {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: number;
  status: StatusAttack;
}

export interface Winner {
  name: string;
  wins: number;
}

export interface WinnerId {
  winPlayer: number;
}