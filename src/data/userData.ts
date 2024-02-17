import { User, GameInfo } from '../types/types.ts';
import WebSocketEx from '../types/websocketEx.ts';



export const userDB: User[] = [];

export const wsClients = new Set<WebSocketEx>();