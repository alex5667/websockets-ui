import { WebSocket } from 'ws';

export default interface WebSocketWithIds extends WebSocket {
  id?: number;
  indexSocket?: number;
}