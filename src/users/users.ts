import { IncomingUser } from "../types/types.ts";
import { userDB, wsClients } from "../data/userData.ts";
import { CommandGame } from "../types/types.ts";
import { createErrorPayload, createSuccessPayload } from "../utils/utils.ts";
import WebSocketWithIds from "../types/WebSocketWithIds.ts";

let indexSocket = 0;

export const registerUsers = (ws: WebSocketWithIds, data: IncomingUser) => {
  const { name, password } = data;

  const res = {
    type: CommandGame.Reg,
    data: "",
    id: 0,
  };
  const findUser = userDB.find((user) => user.name === name);

  if (!name || !password|| name.length < 5 || password.length < 5) {
    res.data = createErrorPayload(data, "Name or password is missing");
  } else if (findUser && findUser.password !== password) {
    res.data = createErrorPayload(data, "Wrong password");
  } else if (findUser && findUser.password === password) {
    res.data = createSuccessPayload(name, findUser.index);
    ws.id = findUser.index;
    ws.indexSocket = indexSocket;
    indexSocket++;
    wsClients.add(ws);

  } else {
    const newUser = addUser(name, password);
    res.data = createSuccessPayload(name, newUser.index);
    ws.id = newUser.index;
    ws.indexSocket = indexSocket;
    indexSocket++;
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
  return newUser;
};
