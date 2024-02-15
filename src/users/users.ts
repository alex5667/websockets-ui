import { IncomingUser } from "../types/types.ts";
import WebSocket from "ws";
import { userDB } from "./userDB.ts";
import { CommandGame } from "../types/types.ts";
import { createErrorPayload, createSuccessPayload } from "../utils/utils.ts";
import WebSocketEx from "../types/websocketEx.ts";

export const wsClients = new Set<WebSocketEx>();

export const registerUsers = (ws: WebSocketEx, data: IncomingUser) => {
  const { name, password } = data;

  const res = {
    type: CommandGame.Reg,
    data: "",
    id: 0,
  };
  const findUser = userDB.find((user) => user.name === name);

  if (!name || !password) {
    res.data = createErrorPayload(data, "Name or password is missing");
  } else  if (findUser && findUser.password !== password) {
      res.data = createErrorPayload(data, "Wrong password");
    } else  if(findUser && findUser.password === password){
      res.data = createSuccessPayload(name, findUser.index);
      ws.id = findUser.index;
      wsClients.add(ws);
    }    
    else {
      const newUser = addUser(name, password);
      res.data = createSuccessPayload(name, newUser.index);
      ws.id = newUser.index;
      wsClients.add(ws);
    }
  

  ws.send(JSON.stringify(res));
  console.log("Send message to client: ", JSON.stringify(res));
};

const addUser = (name: string, password: string, users = userDB) => {
  const newUser = {
    name: name,
    password: password,
    index: users.length,
  };

  users.push(newUser);
  console.log("users(users)", users);
  return newUser;
};
