import { UserShips } from "../types/types.ts";

export class GameService {
  addShips(ships: UserShips) {
    const board: Array<number[]> = Array(10)
      .fill(0)
      .map(() => Array(10).fill(0));
    for (const ship of ships.ships) {
      const x = ship.position.x;
      const y = ship.position.y;

      const direction = ship.direction;

      for (let i = 0; i < ship.length; i++) {
        const dx = direction ? 0 : i;
        const dy = direction ? i : 0;

        board[y + dy][x + dx] =
          ship.type === "small"
            ? 1
            : ship.type === "medium"
              ? 2
              : ship.type === "large"
                ? 3
                : 4;
      }
    }
    return board;
  }

  private isValid(x: number, y: number) {
    return x >= 0 && x < 10 && y >= 0 && y < 10;
  }

  attack(x: number, y: number, board: Array<number[]>) {
    if (!this.isValid(x, y)) {
      return null;
    }

    const value = board[y][x];

    if (value === 0) {
      board[y][x] = -1;

      return { status: "miss" };
    }

    if (value < 0) {
      return null;
    }

    board[y][x] = -value;

    let killed = true;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (Math.abs(dx) + Math.abs(dy) !== 1 || (dx === 0 && dy === 0)) {
          continue;
        }

        if (this.isValid(x + dx, y + dy)) {
          const neighbor = board[x + dx][y + dy];

          if (neighbor === value) {
            killed = false;
            break;
          }
        }
      }

      if (killed) {
        break;
      }
    }

    return { status: killed ? "killed" : "shot" };
  }
}
