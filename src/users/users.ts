import { IncomingUser, CommandGame, User } from "../types/types.ts";
import { createErrorPayload, createSuccessPayload } from "../utils/utils.ts";
import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { DB } from "../data/DB.ts";

let indexSocket = 0;

export const handleUserRegistration = (
  ws: WebSocketWithIds,
  data: IncomingUser
) => {
  const { name, password } = data;

  const res = {
    type: CommandGame.Reg,
    data: "",
    id: 0,
  };
  const foundUser = DB.users.find((user) => user.name === name);

  if (!name || !password || name.length < 5 || password.length < 5) {
    res.data = createErrorPayload(
      data,
      "Name or password is invalid. They should be at least 5 characters long."
    );
  } else if (foundUser) {
    if (foundUser.password !== password) {
      res.data = createErrorPayload(
        data,
        "Incorrect password. Please verify your password and try again."
      );
    } else {
      res.data = handleExistingUser(ws, foundUser);
    }
  } else {
    res.data = handleNewUser(ws, name, password);
  }

  ws.send(JSON.stringify(res));
  console.log("Message sent to client: ", JSON.stringify(res));
};

const addUser = (name: string, password: string) => {
  const newUser = {
    name: name,
    password: password,
    index: DB.users.length,
  };

  DB.users.push(newUser);
  return newUser;
};

function handleExistingUser(ws: WebSocketWithIds, user: User) {
  ws.id = user.index;
  ws.indexSocket = indexSocket;
  indexSocket++;
  DB.wsClients.add(ws);
  return createSuccessPayload(user.name, user.index);
}

function handleNewUser(ws: WebSocketWithIds, name: string, password: string) {
  const newUser = addUser(name, password);
  ws.id = newUser.index;
  ws.indexSocket = indexSocket;
  indexSocket++;
  DB.wsClients.add(ws);
  return createSuccessPayload(name, newUser.index);
}
