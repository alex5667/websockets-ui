import { RoomGame, GameInfo, Winner } from "../types/types.ts";

export const games: Map<number, GameInfo> = new Map();
export const rooms: RoomGame[] = [];
export const winners: Winner[] = [];
