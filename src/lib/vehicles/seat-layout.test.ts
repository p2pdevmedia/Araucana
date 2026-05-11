import { describe, expect, test } from "vitest";
import { getSeatCanvasSize, moveSeatToPosition, removeSeatAtIndex, updateSeatNumber } from "./seat-layout";

describe("seat layout editing", () => {
  test("moves a seat into an empty row and column", () => {
    expect(
      moveSeatToPosition(
        [
          { number: "01", row: 1, column: 1 },
          { number: "02", row: 1, column: 2 }
        ],
        0,
        2,
        4
      )
    ).toEqual([
      { number: "01", row: 2, column: 4 },
      { number: "02", row: 1, column: 2 }
    ]);
  });

  test("swaps positions when dropping over another seat", () => {
    expect(
      moveSeatToPosition(
        [
          { number: "01", row: 1, column: 1 },
          { number: "02", row: 1, column: 2 }
        ],
        0,
        1,
        2
      )
    ).toEqual([
      { number: "01", row: 1, column: 2 },
      { number: "02", row: 1, column: 1 }
    ]);
  });

  test("updates a seat number inline", () => {
    expect(updateSeatNumber([{ number: "01", row: 1, column: 1 }], 0, " 12 ")).toEqual([
      { number: "12", row: 1, column: 1 }
    ]);
  });

  test("removes a seat without leaving an empty layout", () => {
    expect(removeSeatAtIndex([{ number: "01", row: 1, column: 1 }], 0)).toEqual([{ number: "01", row: 1, column: 1 }]);
    expect(
      removeSeatAtIndex(
        [
          { number: "01", row: 1, column: 1 },
          { number: "02", row: 1, column: 2 }
        ],
        0
      )
    ).toEqual([{ number: "02", row: 1, column: 2 }]);
  });

  test("keeps extra drop space to the right and below the current layout", () => {
    expect(getSeatCanvasSize([{ number: "01", row: 1, column: 1 }])).toEqual({
      rows: 2,
      columns: 5
    });

    expect(getSeatCanvasSize([{ number: "01", row: 2, column: 5 }])).toEqual({
      rows: 3,
      columns: 6
    });
  });
});
