import { httpServer } from './http_server/index.ts';

import { wss } from "./ws-server/index.ts";
import dotenv from "dotenv";

dotenv.config();

const HTTP_PORT = Number(process.env.HTTP_PORT) || 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

wss.on("close", () => {
  console.log("WebSocket server close");
});
