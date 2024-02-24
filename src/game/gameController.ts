import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { GameService } from "./gameService.ts";
import { DB } from "../data/DB.ts";
import {
  AttackEventData,
  RandomAttack,
  UserShipsConfiguration,
  HitResult,
  GameInfo,
} from "../types/gameData.ts";
import { MessageType } from "../types/messageTypes.ts";
import { GameMessagingService } from "./gameMessagingService.ts";

export class GameController {
  ws: WebSocketWithIds;
  gameService: GameService;

  constructor(ws: WebSocketWithIds) {
    this.ws = ws;
    this.gameService = new GameService();
  }

  initializeGame(data: UserShipsConfiguration) {
    const activeGame = DB.games.get(data.gameId);
    const userGameArray = this.gameService.placeShips(data.ships);
    const foundUser = activeGame?.players[data.indexPlayer];

    if (foundUser && activeGame) {
      foundUser.shipInfo = userGameArray;

      if (activeGame.players.every((player) => player.shipInfo.length !== 0)) {
        activeGame.players.forEach((user) => {
          GameMessagingService.sendMessage(
            user.idPlayer,
            user.indexSocket,
            user.ShipCoordinates
          );
          GameMessagingService.sendTurn(
            user.indexSocket,
            activeGame.players[0].idPlayer
          );
        });
      }
    }
  }

  handleAttack(attackInfo: AttackEventData) {
    const activeGame = DB.games.get(attackInfo.gameId);

    if (activeGame?.players[attackInfo.indexPlayer].isPlayerTurn) {
      const result = this.gameService.attack(
        attackInfo.x,
        attackInfo.y,
        activeGame?.players[1 - attackInfo.indexPlayer].shipInfo
      );

      if (result === HitResult.Miss) {
        activeGame?.players.forEach((user) => {
          GameMessagingService.sendStatus(
            user.indexSocket,
            HitResult.Miss,
            attackInfo
          );
          GameMessagingService.sendTurn(
            user.indexSocket,
            activeGame.players[1 - attackInfo.indexPlayer].idPlayer
          );
        });
        activeGame.players[attackInfo.indexPlayer].isPlayerTurn = false;
        activeGame.players[1 - attackInfo.indexPlayer].isPlayerTurn = true;
        this.initiateBotAttack(activeGame, attackInfo.indexPlayer === 0);
      }

      if (typeof result === "number") {
        let status: HitResult;
        result === -5 ? (status = HitResult.Miss) : (status = HitResult.Shot);
        activeGame?.players.forEach((user) => {
          GameMessagingService.sendStatus(user.indexSocket, status, attackInfo);
          GameMessagingService.sendTurn(
            user.indexSocket,
            activeGame.players[1 - attackInfo.indexPlayer].idPlayer
          );
        });
        activeGame.players[attackInfo.indexPlayer].isPlayerTurn = false;
        activeGame.players[1 - attackInfo.indexPlayer].isPlayerTurn = true;
        this.initiateBotAttack(activeGame, attackInfo.indexPlayer === 0);
      }
      if (result === HitResult.Shot) {
        activeGame?.players.forEach((user) => {
          GameMessagingService.sendStatus(user.indexSocket, result, attackInfo);
          GameMessagingService.sendTurn(
            user.indexSocket,
            activeGame.players[attackInfo.indexPlayer].idPlayer
          );
        });
        activeGame.players[attackInfo.indexPlayer].checkWin += 1;
        this.initiateBotAttack(activeGame, attackInfo.indexPlayer === 1);
      }

      if (result === HitResult.Killed) {
        activeGame?.players.forEach((user) => {
          GameMessagingService.sendStatus(user.indexSocket, result, attackInfo);
          GameMessagingService.sendTurn(
            user.indexSocket,
            activeGame.players[attackInfo.indexPlayer].idPlayer
          );
        });

        const coord = this.gameService.markSurroundingCells(
          activeGame?.players[1 - attackInfo.indexPlayer].shipInfo,
          attackInfo.x,
          attackInfo.y
        );
        activeGame?.players.forEach((user) => {
          for (let i = 0; i < coord.length; i++) {
            attackInfo.x = coord[i].x;
            attackInfo.y = coord[i].y;
            GameMessagingService.sendStatus(
              user.indexSocket,
              HitResult.Miss,
              attackInfo
            );
            GameMessagingService.sendTurn(
              user.indexSocket,
              activeGame.players[attackInfo.indexPlayer].idPlayer
            );
          }
        });

        activeGame.players[attackInfo.indexPlayer].checkWin += 1;

        const checkWin = this.handleGameFinish
(
          activeGame.players[attackInfo.indexPlayer].checkWin,
          activeGame.players[attackInfo.indexPlayer].idUser,
          activeGame.idGame
        );
        if (checkWin) {
          activeGame?.players.forEach((user) => {
            GameMessagingService.sendhandleGameFinish
(
              user.indexSocket,
              activeGame.players[attackInfo.indexPlayer].idPlayer
            );
          });
        }
        this.initiateBotAttack(activeGame, attackInfo.indexPlayer === 1);
      }
    }
  }

  private initiateBotAttack(activeGame: GameInfo, isIndex: boolean) {
    if (activeGame.isBot && isIndex) {
      const randomAttack: RandomAttack = {
        gameId: activeGame.idGame,
        indexPlayer: 1,
      };
      setTimeout(() => this.initiateRandomAttack(randomAttack), 1000);
    }
  }

  initiateRandomAttack(randomAttackInfo: RandomAttack) {
    const activeGame = DB.games.get(randomAttackInfo.gameId);

    if (activeGame) {
      const randomCoord = this.gameService.getRandomEmptyCoordinate(
        activeGame.players[1 - randomAttackInfo.indexPlayer].shipInfo
      );
      if (randomCoord) {
        const attackInfo: AttackEventData = {
          gameId: randomAttackInfo.gameId,
          x: randomCoord.x,
          y: randomCoord.y,
          indexPlayer: randomAttackInfo.indexPlayer,
        };

        this.handleAttack(attackInfo);
      }
    }
  }

  handlePlayerExit(indexSocket: number) {
    const arrayFromGames = Array.from(DB.games.values());
    const activeGame = arrayFromGames.find((game) =>
      game.players.some((player) => player.indexSocket === indexSocket)
    );

    if (activeGame) {
      const indexExitPlayer = activeGame.players.findIndex(
        (player) => player.indexSocket === indexSocket
      );

      if (indexExitPlayer !== -1) {
        this.handleWinnerUpdate(
          activeGame.idGame,
          activeGame.players[1 - indexExitPlayer].idUser
        );

        GameMessagingService.sendhandleGameFinish
(
          activeGame.players[1 - indexExitPlayer].indexSocket,
          activeGame.players[1 - indexExitPlayer].idPlayer
        );
      }
    }
  }

  private handleWinnerUpdate(idGame: number, idUser: number) {
    const checkDb = DB.users[idUser];
    let nameUser: string;

    if (!checkDb) {
      nameUser = "Bot";
    } else {
      nameUser = checkDb.name;
    }

    const checkWinners = DB.winners.find((winner) => winner.name === nameUser);
    if (checkWinners) {
      checkWinners.wins += 1;
    }
    if (!checkWinners) {
      DB.winners.push({ name: nameUser, wins: 1 });
    }
    DB.wsClients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: MessageType.UpdateWin,
          data: JSON.stringify(DB.winners),
          id: 0,
        })
      );
    });
    DB.games.delete(idGame);
  }

  private handleGameFinish
(numberShot: number, idUser: number, idGame: number) {
    const isWin = this.gameService.checkWin(numberShot);

    if (!isWin) {
      return false;
    }

    if (isWin) {
      this.handleWinnerUpdate(idGame, idUser);
    }
    return true;
  }
}
