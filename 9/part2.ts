import { inspect } from "util";
import { getMinMax, MinMax, Point } from "./shared.js";

class Interval {
    #from: number;
    #to: number;

    constructor(from: number, to: number) {
        this.#from = from; this.#to = to;
    } static fromMinMax(x: MinMax): Interval {
        return new Interval(x.min, x.max);
    }

    [inspect.custom]()  {
        return `{${this.#from}, ${this.#to}}`;
    }

    contains(x: number) {
        return x > this.#from && x < this.#to;
    }
}

class BorderMap {
    inner: Map<number, Interval[]>;

    constructor() {
        this.inner = new Map();
    }

    add(k: number, v: Interval) {
        const x = this.inner.get(k);
        if (x === undefined) {
            this.inner.set(k, [v]);
        } else {
            x.push(v);
        }
    }

    contains(k: number, v: number) {
        const val = this.inner.get(k);
        if (val === undefined) { return false; }

        return val.some((x)=>x.contains(v));
    }
}

class Borders {
    #borders_by_x: BorderMap;
    #borders_by_y: BorderMap;

    constructor(x: BorderMap, y: BorderMap) {
        this.#borders_by_x = x; this.#borders_by_y = y;
    } static fromRedTiles(tiles: Point[]) {
        const X: BorderMap = new BorderMap(); const Y = new BorderMap();
        for (let i = 0; i < tiles.length; i++) {
            const p1 = tiles[i]; const p2 = tiles[(i+1)%tiles.length];

            if (p1.x === p2.x) {
                X.add(p1.x, Interval.fromMinMax(getMinMax(p1.y, p2.y)));
            } else {
                Y.add(p1.y, Interval.fromMinMax(getMinMax(p1.x, p2.x)));
            }
        }

        return new Borders(X, Y);
    }

    isRectangleValid(a: Point, b: Point) {
        const i_x = getMinMax(a.x, b.x);
        const i_y = getMinMax(a.y, b.y);
        for (const x of [i_x.min+1, i_x.max-1]) {
            for (let y = i_y.min+1; y < i_y.max-1; y++) {
                if (this.#borders_by_y.contains(y, x)) { return false; }
            }
        }
        for (const y of [i_y.min+1, i_y.max-1]) {
            for (let x = i_x.min+1; x <= i_x.max-1; x++) {
                if (this.#borders_by_x.contains(x, y)) { return false; }
            }
        }

        return true;
    }
}

export function solve2(redTiles: Point[]) {
    const borders = Borders.fromRedTiles(redTiles);

    let maxArea = 0;
    for (let i = 0; i < redTiles.length; i++) {
        for (let j = i+1; j < redTiles.length; j++) {
            const A = redTiles[i]; const B = redTiles[j];
            if (!borders.isRectangleValid(A, B)) { continue; }

            maxArea = Math.max(maxArea, A.getRectangleArea(B));
        }
    }

    return maxArea;
}