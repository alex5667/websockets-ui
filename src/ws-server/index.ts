import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { parseData } from '../utils/utils.ts';
import { WSController } from './wsController.ts';

dotenv.config();

const WS_Port = Number(process.env.WSS_PORT) || 3000;

export const wss = new WebSocketServer({ port: WS_Port });

wss.on('connection', (ws) => {
  console.log(`WebSocket server start on port ${WS_Port}`);
  ws.on('error', console.error);

  ws.on('message', (data) => {
    console.log('received', data);

    const result = parseData(data.toString());
    console.log(result)
    new WSController(ws, result).checkCommand();
  });
});

wss.on('listening', () => {
  console.log(`WebSocket server work on port ${WS_Port}`);
});

