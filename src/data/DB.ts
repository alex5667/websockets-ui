import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { User } from "../types/userData.ts";
import { RoomGame } from "../types/roomData.ts";
import { Winner, GameInfo} from "../types/gameData.ts";
export const DB = {
  games: new Map<number, GameInfo>(),
  rooms: [] as RoomGame[],
  winners: [] as Winner[],
  users: [] as User[],
  wsClients: new Set<WebSocketWithIds>(),
};
