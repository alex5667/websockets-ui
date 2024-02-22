import {
  AttackUser,
  ShipsCoord,
  StatusAttack,
  StartGameData,
  WinnerId,
  GameInfo,
  CommandGame,
} from "../types/types.ts";
import { DB } from "../data/DB.ts";

export class GameMessagingService {
  static sendFinishGame(indexSocket: number, idPlayer: number) {
    const findWsClient = GameMessagingService.searchSocket(indexSocket);
    const winnerInfo: WinnerId = { winPlayer: idPlayer };
    const res = GameMessagingService.createMessage(
      CommandGame.Finish,
      winnerInfo
    );
    findWsClient?.send(JSON.stringify(res));
  }

  static sendStatus(
    indexSocket: number,
    status: StatusAttack,
    attackInfo: AttackUser
  ) {
    const findWsClient = GameMessagingService.searchSocket(indexSocket);

    const attackStatus = {
      position: {
        x: attackInfo.x,
        y: attackInfo.y,
      },
      currentPlayer: attackInfo.indexPlayer,
      status: status,
    };

    const res = GameMessagingService.createMessage(
      CommandGame.Attack,
      attackStatus
    );

    findWsClient?.send(JSON.stringify(res));
  }

  static sendTurn(indexSocket: number, idPlayer: number) {
    const findWsClient = GameMessagingService.searchSocket(indexSocket);

    const res = GameMessagingService.createMessage(CommandGame.Turn, {
      currentPlayer: idPlayer,
    });

    findWsClient?.send(JSON.stringify(res));
  }

  static sendMessage(
    idPlayer: number,
    indexSocket: number,
    ships: ShipsCoord[]
  ) {
    const findWsClient = GameMessagingService.searchSocket(indexSocket);
    const sendData: StartGameData = {
      ships: ships,
      currentPlayerIndex: idPlayer,
    };

    const res = GameMessagingService.createMessage(
      CommandGame.StartGame,
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

  private static createMessage(type: CommandGame, data: any) {
    return {
      type: type,
      data: JSON.stringify(data),
      id: 0,
    };
  }
}
