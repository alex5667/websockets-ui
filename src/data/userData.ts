import { User, GameInfo } from '../types/types.ts';
import WebSocketWithIds from '../types/WebSocketWithIds.ts';



export const userDB: User[] = [];

export const wsClients = new Set<WebSocketWithIds>();