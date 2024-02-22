import WebSocketWithIds from "../types/WebSocketWithIds.ts";
import { GameService } from "./gameService.ts";
import { DB } from "../data/DB.ts";
import {
  AttackUser,
  RandomAttack,
  ShipsCoord,
  UserShips,
  AttackStatus,
  StartGameData,
  WinnerId,
  StatusAttack,
  GameInfo,
  CommandGame,
} from "../types/types.ts";
import { GameMessagingService } from "./gameMessagingService.ts";

export class GameController {
  ws: WebSocketWithIds;
  gameService: GameService;

  constructor(ws: WebSocketWithIds) {
    this.ws = ws;
    this.gameService = new GameService();
  }

  startGame(data: UserShips) {
    const currentGame = DB.games.get(data.gameId);
    const userGameArray = this.gameService.addShips(data.ships);
    const foundUser = currentGame?.players[data.indexPlayer];

    if (foundUser && currentGame) {
      foundUser.shipInfo = userGameArray;

      if (currentGame.players.every((player) => player.shipInfo.length !== 0)) {
        currentGame.players.forEach((user) => {
          GameMessagingService.sendMessage(
            user.idPlayer,
            user.indexSocket,
            user.shipsCoord
          );
          GameMessagingService.sendTurn(
            user.indexSocket,
            currentGame.players[0].idPlayer
          );
        });
      }
    }
  }

  attackControl(attackInfo: AttackUser) {
    const currentGame = DB.games.get(attackInfo.gameId);

    if (currentGame?.players[attackInfo.indexPlayer].isPlayerTurn) {
      const result = this.gameService.attack(
        attackInfo.x,
        attackInfo.y,
        currentGame?.players[1 - attackInfo.indexPlayer].shipInfo
      );

      if (result === StatusAttack.Miss) {
        currentGame?.players.forEach((user) => {
          GameMessagingService.sendStatus(
            user.indexSocket,
            StatusAttack.Miss,
            attackInfo
          );
          GameMessagingService.sendTurn(
            user.indexSocket,
            currentGame.players[1 - attackInfo.indexPlayer].idPlayer
          );
        });
        currentGame.players[attackInfo.indexPlayer].isPlayerTurn = false;
        currentGame.players[1 - attackInfo.indexPlayer].isPlayerTurn = true;
        this.getBotAttack(currentGame, attackInfo.indexPlayer === 0);
      }

      if (typeof result === "number") {
        let status: StatusAttack;
        result === -5
          ? (status = StatusAttack.Miss)
          : (status = StatusAttack.Shot);
        currentGame?.players.forEach((user) => {
          GameMessagingService.sendStatus(user.indexSocket, status, attackInfo);
          GameMessagingService.sendTurn(
            user.indexSocket,
            currentGame.players[1 - attackInfo.indexPlayer].idPlayer
          );
        });
        currentGame.players[attackInfo.indexPlayer].isPlayerTurn = false;
        currentGame.players[1 - attackInfo.indexPlayer].isPlayerTurn = true;
        this.getBotAttack(currentGame, attackInfo.indexPlayer === 0);
      }
      if (result === StatusAttack.Shot) {
        currentGame?.players.forEach((user) => {
          GameMessagingService.sendStatus(user.indexSocket, result, attackInfo);
          GameMessagingService.sendTurn(
            user.indexSocket,
            currentGame.players[attackInfo.indexPlayer].idPlayer
          );
        });
        currentGame.players[attackInfo.indexPlayer].checkWin += 1;
        this.getBotAttack(currentGame, attackInfo.indexPlayer === 1);
      }

      if (result === StatusAttack.Killed) {
        currentGame?.players.forEach((user) => {
          GameMessagingService.sendStatus(user.indexSocket, result, attackInfo);
          GameMessagingService.sendTurn(
            user.indexSocket,
            currentGame.players[attackInfo.indexPlayer].idPlayer
          );
        });

        const coord = this.gameService.markSurroundingCells(
          currentGame?.players[1 - attackInfo.indexPlayer].shipInfo,
          attackInfo.x,
          attackInfo.y
        );
        currentGame?.players.forEach((user) => {
          for (let i = 0; i < coord.length; i++) {
            attackInfo.x = coord[i].x;
            attackInfo.y = coord[i].y;
            GameMessagingService.sendStatus(
              user.indexSocket,
              StatusAttack.Miss,
              attackInfo
            );
            GameMessagingService.sendTurn(
              user.indexSocket,
              currentGame.players[attackInfo.indexPlayer].idPlayer
            );
          }
        });

        currentGame.players[attackInfo.indexPlayer].checkWin += 1;

        const checkWin = this.finishGame(
          currentGame.players[attackInfo.indexPlayer].checkWin,
          currentGame.players[attackInfo.indexPlayer].idUser,
          currentGame.idGame
        );
        if (checkWin) {
          currentGame?.players.forEach((user) => {
            GameMessagingService.sendFinishGame(
              user.indexSocket,
              currentGame.players[attackInfo.indexPlayer].idPlayer
            );
          });
        }
        this.getBotAttack(currentGame, attackInfo.indexPlayer === 1);
      }
    }
  }

  private getBotAttack(currentGame: GameInfo, isIndex: boolean) {
    if (currentGame.isBot && isIndex) {
      const randomAttack: RandomAttack = {
        gameId: currentGame.idGame,
        indexPlayer: 1,
      };
      setTimeout(() => this.getRandomAttack(randomAttack), 1000);
    }
  }

  getRandomAttack(randomAttackInfo: RandomAttack) {
    const currentGame = DB.games.get(randomAttackInfo.gameId);

    if (currentGame) {
      const randomCoord = this.gameService.getRandomCoordinate(
        currentGame.players[1 - randomAttackInfo.indexPlayer].shipInfo
      );
      if (randomCoord) {
        const attackInfo: AttackUser = {
          gameId: randomAttackInfo.gameId,
          x: randomCoord.x,
          y: randomCoord.y,
          indexPlayer: randomAttackInfo.indexPlayer,
        };

        this.attackControl(attackInfo);
      }
    }
  }

  isPlayerExit(indexSocket: number) {
    const arrayFromGames = Array.from(DB.games.values());
    const currentGame = arrayFromGames.find((game) =>
      game.players.some((player) => player.indexSocket === indexSocket)
    );

    if (currentGame) {
      const indexExitPlayer = currentGame.players.findIndex(
        (player) => player.indexSocket === indexSocket
      );

      if (indexExitPlayer !== -1) {
        this.updateWinners(
          currentGame.idGame,
          currentGame.players[1 - indexExitPlayer].idUser
        );

        GameMessagingService.sendFinishGame(
          currentGame.players[1 - indexExitPlayer].indexSocket,
          currentGame.players[1 - indexExitPlayer].idPlayer
        );
      }
    }
  }

  private updateWinners(idGame: number, idUser: number) {
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
          type: CommandGame.UpdateWin,
          data: JSON.stringify(DB.winners),
          id: 0,
        })
      );
    });
    DB.games.delete(idGame);
  }

  private finishGame(numberShot: number, idUser: number, idGame: number) {
    const isWin = this.gameService.checkWin(numberShot);

    if (!isWin) {
      return false;
    }

    if (isWin) {
      this.updateWinners(idGame, idUser);
    }
    return true;
  }
}
