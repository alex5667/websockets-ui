import { User, GameInfo, RoomGame, Winner } from '../types/types.ts';
import WebSocketWithIds from '../types/WebSocketWithIds.ts';

export const DB = {
  games: new Map<number, GameInfo>(),
  rooms: [] as RoomGame[],
  winners: [] as Winner[],
  users: [] as User[],
  wsClients: new Set<WebSocketWithIds>()
};