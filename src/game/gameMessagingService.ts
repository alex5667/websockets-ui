import {
  AttackEventData,
  ShipCoordinates,
  HitResult,
  GameStartInfo,
  WinnerId,
} from "../types/gameData.ts";
import { DB } from "../data/DB.ts";
import { MessageType } from "../types/messageTypes.ts";
 

export class GameMessagingService {
  static sendhandleGameFinish
(indexSocket: number, idPlayer: number) {
    const findWsClient = GameMessagingService.searchSocket(indexSocket);
    const winnerInfo: WinnerId = { winPlayer: idPlayer };
    const res = GameMessagingService.createMessage(
      MessageType.Finish,
      winnerInfo
    );
    findWsClient?.send(JSON.stringify(res));
  }

  static sendStatus(
    indexSocket: number,
    status: HitResult,
    attackInfo: AttackEventData
  ) {
    const findWsClient = GameMessagingService.searchSocket(indexSocket);

    const AttackResult = {
      position: {
        x: attackInfo.x,
        y: attackInfo.y,
      },
      currentPlayer: attackInfo.indexPlayer,
      status: status,
    };

    const res = GameMessagingService.createMessage(
      MessageType.Attack,
      AttackResult
    );

    findWsClient?.send(JSON.stringify(res));
  }

  static sendTurn(indexSocket: number, idPlayer: number) {
    const findWsClient = GameMessagingService.searchSocket(indexSocket);

    const res = GameMessagingService.createMessage(MessageType.Turn, {
      currentPlayer: idPlayer,
    });

    findWsClient?.send(JSON.stringify(res));
  }

  static sendMessage(
    idPlayer: number,
    indexSocket: number,
    ships: ShipCoordinates[]
  ) {
    const findWsClient = GameMessagingService.searchSocket(indexSocket);
    const sendData: GameStartInfo = {
      ships: ships,
      currentPlayerIndex: idPlayer,
    };

    const res = GameMessagingService.createMessage(
      MessageType.initializeGame,
      sendData
    );

    findWsClient?.send(JSON.stringify(res));
  }

  private static searchSocket(indexSocket: number) {
    const wsClientsArray = Array.from(DB.wsClients);
    const findWsClient = wsClientsArray.find(
      (ws) => ws.indexSocket === indexSocket
    );

    return findWsClient;
  }

  private static createMessage(type: MessageType, data: any) {
    return {
      type: type,
      data: JSON.stringify(data),
      id: 0,
    };
  }
}
