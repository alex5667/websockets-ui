import { IncomingUser } from "./userData.ts";
import { AttackEventData, RandomAttack } from "./gameData.ts";
import { UserShipsConfiguration } from "./gameData.ts";

export interface IncomingData {
  type: string;
  data:
    | IncomingUser
    | IncomingRoom
    | UserShipsConfiguration
    | AttackEventData
    | RandomAttack;
  id: 0;
}

export interface IncomingRoom {
  indexRoom: number;
}
