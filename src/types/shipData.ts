export interface ShipCoordinates {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}


export interface Coordinate {
    x: number;
    y: number;
  }