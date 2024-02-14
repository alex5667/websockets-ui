import { IncomingUser } from "../types/types.ts";
import WebSocket from "ws";
import { userDB } from "./userDB.ts";
import { CommandGame } from "../types/types.ts";

export const registerUsers = (ws: WebSocket, data: IncomingUser) => {
  const { name, password } = data;
  console.log("name", name);
  console.log("password", password);
  const res = {
    type: CommandGame.Reg,
    data: "",
    id: 0,
  };
  const findUser = userDB.find((elem) => elem.name === name);

  if (!name || !password) {
    res.data = JSON.stringify({
      ...data,
      error: true,
      errorText: "Error: Name or password is missing",
    });
  } else if (findUser && findUser.password !== password) {
    res.data = JSON.stringify({
      name: name,
      index: findUser.index,
      error: true,
      errorText: "Error: Wrong password",
    });
  } else {
    const newUser = addUser(name, password);
    res.data = JSON.stringify({
      name: name,
      index: newUser.index,
      error: false,
      errorText: "",
    });
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
  console.log("users" ,users);
  return newUser;
};
