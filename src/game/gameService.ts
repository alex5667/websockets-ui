
import { ShipCoordinates, Coordinate} from "../types/shipData.ts";
import { HitResult } from "../types/gameData.ts";

export class GameService {
  addShips(ships: ShipCoordinates[]): number[][] {
    const board: number[][] = this.createEmptyBoard();
    for (const ship of ships) {
      const x = ship.position.x;
      const y = ship.position.y;

      const direction = ship.direction;

      for (let i = 0; i < ship.length; i++) {
        const dx = direction ? 0 : i;
        const dy = direction ? i : 0;

        board[y + dy][x + dx] = this.getShipValue(ship.type);
      }
    }
    return board;
  }

  private createEmptyBoard(): number[][] {
    const board: number[][] = [];
    for (let i = 0; i < 10; i++) {
      const row: number[] = [];
      for (let j = 0; j < 10; j++) {
        row.push(0);
      }
      board.push(row);
    }
    return board;
  }

  private getShipValue(type: string): number {
    switch (type) {
      case "small":
        return 1;
      case "medium":
        return 2;
      case "large":
        return 3;
      case "huge":
        return 4;
      default:
        return 0;
    }
  }
  private isValid(x: number, y: number) {
    return x >= 0 && x < 10 && y >= 0 && y < 10;
  }

  attack(x: number, y: number, board: number[][]) {
    if (!this.isValid(x, y)) {
      return null;
    }

    const value = board[y][x];

    if (value === 0) {
      board[y][x] = -5;
      return HitResult.Miss;
    }

    if (value < 0) {
      return value;
    }

    if (value === 1) {
      board[y][x] = -value;
      return HitResult.Killed;
    }

    board[y][x] = -value;
    let count = 1;

    for (let dx = -1; x + dx >= 0; dx--) {
      const cellValue  = board[y][x + dx];
      if (cellValue  === -value) {
        count++;
      }

      if (cellValue  === 0 || cellValue  === -5) {
        break;
      }
    }

    for (let dx = 1; x + dx < board.length; dx++) {
      const cellValue  = board[y][x + dx];

      if (cellValue  === -value) {
        count++;
      }

      if (cellValue  === 0 || cellValue  === -5) {
        break;
      }
    }

    for (let dy = -1; y + dy >= 0; dy--) {
      const cellValue  = board[y + dy][x];

      if (cellValue  === -value) {
        count++;
      }

      if (cellValue  === 0 || cellValue  === -5) {
        break;
      }
    }

    for (let dy = 1; y + dy < board.length; dy++) {
      const cellValue  = board[y + dy][x];

      if (cellValue  === -value) {
        count++;
      }

      if (cellValue  === 0 || cellValue  === -5) {
        break;
      }
    }

    return count === value ? HitResult.Killed : HitResult.Shot;
  }

  getRandomCoordinate(board: number[][]): Coordinate | null {
    const emptyCoordinates: Coordinate[] = [];

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (board[y][x] > 0 || (board[y][x] === 0 && Math.random() <= 0.6)) {
          emptyCoordinates.push({ x, y });
        }
      }
    }

    return emptyCoordinates.length > 0 ? emptyCoordinates[Math.floor(Math.random() * emptyCoordinates.length)] : null;
  }

  markSurroundingCells(
    board: number[][],
    x: number,
    y: number,
    prevX?: number,
    prevY?: number
  ): Coordinate[] {
    const coordinates: Coordinate[] = [];
    const value = board[y][x];
    if (value < 0 && value !== -5) {
      const offsets = [-1, 0, 1];
      for (const dy of offsets) {
        for (const dx of offsets) {
          const newX = x + dx;
          const newY = y + dy;
          if (
            this.isValid(newX, newY) &&
            !(newX === x && newY === y) &&
            !(newX === prevX && newY === prevY)
          ) {
            if (board[newY][newX] === 0) {
              board[newY][newX] = -5;
              coordinates.push({ x: newX, y: newY });
            } else if (board[newY][newX] === value) {
              coordinates.push(
                ...this.markSurroundingCells(board, newX, newY, x, y)
              );
            }
          }
        }
      }
    }
    return coordinates;
  }

  checkWin(wounded: number): boolean {
    return wounded === 20;
  }
}
