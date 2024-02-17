import WebSocketEx from "../types/websocketEx.ts";
import { GameService } from "./gameService.ts";
import { games } from "../data/gameData.ts";
import { ShipsCoord, UserShips } from "../types/types.ts";
import { StartGameData } from "../types/types.ts";
import { wsClients } from "../data/userData.ts";
import { CommandGame } from "../types/types.ts";

export class GameController {
  ws: WebSocketEx;
  gameService: GameService;

  constructor(ws: WebSocketEx) {
    this.ws = ws;
    this.gameService = new GameService();
  }

  startGame(data: UserShips) {
    console.log("data startgame", data);
    const currentGame = games.get(data.gameId);

    const userGameArray = this.gameService.addShips(data);
    const findUser = currentGame?.players.find(
      (user) => user.idPlayer === data.indexPlayer
    );

    console.log("findUser gamecontroller", findUser);
    if (findUser && currentGame) {
      findUser.shipInfo = userGameArray;

      if (
        currentGame?.players[0].shipInfo.length !== 0 &&
        currentGame?.players[1].shipInfo.length !== 0
      ) {
        currentGame?.players.forEach((user) => {
          this.sendMessage(user.idPlayer, user.indexSocket, user.shipsCoord);
        });
        this.sendTurn(
          currentGame.players[0].indexSocket,
          currentGame.players[0].idPlayer
        );
      }
    }
  }

  private sendTurn(indexSocket: number, idPlayer: number) {
    const findClient = this.searchSocket(indexSocket);

    const res = {
      type: CommandGame.Turn,
      data: JSON.stringify({ currentPlayer: idPlayer }),
      id: 0,
    };

    findClient?.send(JSON.stringify(res));
  }

  private searchSocket(indexSocket: number) {
    const wsClientsArray = Array.from(wsClients);
    const findClient = wsClientsArray.find(
      (ws) => ws.indexSocket === indexSocket
    );

    return findClient;
  }

  private sendMessage(
    idPlayer: number,
    indexSocket: number,
    ships: ShipsCoord[]
  ) {
    const findClient = this.searchSocket(indexSocket);
    console.log("findClient", findClient);
    const sendData: StartGameData = {
      ships: ships,
      currentPlayerIndex: idPlayer,
    };

    const res = {
      type: CommandGame.StartGame,
      data: JSON.stringify(sendData),
      id: 0,
    };

    findClient?.send(JSON.stringify(res));
  }
}
