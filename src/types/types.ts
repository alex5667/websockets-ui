export enum CommandGame {
  Reg = 'reg',
  UpdateWin = 'update_winners',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  CreateGame = 'create_game',
  UpdateRoom = 'update_room',
  AddShips = 'add_ships',
  StartGame = 'start_game',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
  Turn = 'turn',
  Finish = 'finish',
  SinglePlay = 'single_play',
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
  roomUsers: ResponseUserInfo[];
}

