import { PlayerInfo } from "./userData.ts";

export interface CreateGame {
    idGame: number;
    idPlayer: number;
  }
  
  export interface UserShipsConfiguration {
    gameId: number;
    ships: ShipCoordinates[];
    indexPlayer: number;
  }
  
  export interface ShipCoordinates {
    position: {
      x: number;
      y: number;
    };
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
  }
  
  export interface GameStartInfo {
    ships: ShipCoordinates[];
    currentPlayerIndex: number;
  }
  
  export enum HitResult {
    Miss = 'miss',
    Killed = 'killed',
    Shot = 'shot',
  }
  
  export interface AttackEventData {
    gameId: number;
    x: number;
    y: number;
    indexPlayer: number;
  }
  
  export interface RandomAttack {
    gameId: number;
    indexPlayer: number;
  }
  
  export interface AttackResult {
    position: {
      x: number;
      y: number;
    };
    currentPlayer: number;
    status: HitResult;
  }
  
  export interface Winner {
    name: string;
    wins: number;
  }
  
  export interface WinnerId {
    winPlayer: number;
  }
  export interface GameInfo {
    idGame: number;
    isBot?: true;
    players: PlayerInfo[];
  }
  
  export interface AttackEventData {
    gameId: number;
    x: number;
    y: number;
    indexPlayer: number;
  }
  