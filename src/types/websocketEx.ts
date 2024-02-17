import { WebSocket } from 'ws';

export default interface WebSocketEx extends WebSocket {
  id?: number;
  indexSocket?: number;
}