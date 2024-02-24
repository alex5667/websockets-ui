import { httpServer } from "./http_server/index.ts";

import { wss } from "./ws-server/index.ts";
import dotenv from "dotenv";

dotenv.config();

const HTTP_PORT = Number(process.env.HTTP_PORT) || 8181;

console.log(`Initiate a static HTTP server on port ${HTTP_PORT}!`);
httpServer.listen(HTTP_PORT);

wss.on("close", () => {
  console.log("Close the WebSocket server");
});
