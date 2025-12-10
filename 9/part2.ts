import { inspect } from "util";
import { getMinMax, type MinMax, Point } from "./shared.js";

class Interval {
    #from: number;
    #to: number;

    constructor(from: number, to: number) {
        this.#from = from; this.#to = to;
    } static fromMinMax(x: MinMax): Interval {
        return new Interval(x.min, x.max);
    }

    // where from <= to
    #includes(other: Interval) {
        return other.#from >= this.#from && other.#to <= this.#to;
    } static includedInArray(arr: Interval[], candidate: Interval) {
        return arr.some((x)=>x.#includes(candidate));
    }

    [inspect.custom]()  {
        return `{${this.#from}, ${this.#to}}`;
    }

    // for sort() on Interval[]
    compare(other: Interval) {
        return this.#from - other.#from;
    }

    // assumes arr is sorted by #from
    // @return : if merge happened 
    // The idea is that we stop at first array mutation, to continue in fresh loop
    static tryMergeArray(arr: Interval[]) {
        for (let i = 0; i < arr.length - 1; i++) {
            if (Interval.#tryMerge(arr, i, i+1)) { 
                return true;
            }
        }

        return false;
    } 

    // @return : if merge happened
    static #tryMerge(arr: Interval[], i1: number, i2: number): boolean {
        if (arr[i1].#to < arr[i2].#from) { return false; }

        const int = new Interval(arr[i1].#from, Math.max(arr[i2].#to, arr[i1].#to));
        arr[i1] = int;
        arr.splice(i2, 1);
        return true;
    }
}

type GreenMap = Map<number, Interval[]>;
type PeerMap = Map<number, number>;
export class GreenTiles {
    #valid_by_x: GreenMap;
    #valid_by_y: GreenMap;
    
    constructor(x: GreenMap, y: GreenMap) {
        this.#valid_by_x = x; this.#valid_by_y = y;
    }

    isRectangleValid(a: Point, b: Point) {
        const minMaxX = getMinMax(a.x, b.x); const i_x = Interval.fromMinMax(minMaxX);
        const minMaxY = getMinMax(a.y, b.y); const i_y = Interval.fromMinMax(minMaxY);
        for (const x of [
            {i: i_x, ref: this.#valid_by_y.get(a.y)},
            {i: i_x, ref: this.#valid_by_y.get(b.y)},
            {i: i_y, ref: this.#valid_by_x.get(a.x)},
            {i: i_y, ref: this.#valid_by_x.get(b.x)}
        ]) {
            if (x.ref === undefined || !Interval.includedInArray(x.ref, x.i)) {
                return false;
            }
        }

        return true;
    }

    /*
        The idea for finding inner area is to build it while building borders. 
        The idea is the following :
            - while adding a valid point from a border, we check if it can connect if an already-verified peer (from past borders)
            If found: mark all the interval valid (orthogonal w.r.t border direction)
            Else: mark as peer waitinng for connection

            - red tiles are a special case. A tile from which a border starts is marked as accepting connections except if 
            at least one point of the current border connects to a peer (try it to vizualize)

            - when all green tiles are in place we have that a rectangle is valid iif all its edges are valid, i-e are 
            a sub-interval if valid intervals
        
        Last given answer is was still too high so there's edge cases I'm missing
    */
    static fromRedTiles(tiles: Point[]): GreenTiles {
        const X: GreenMap = new Map(); const Y: GreenMap = new Map();
        const peers_by_x: PeerMap = new Map(); const peers_by_y: PeerMap = new Map();

        for (let i = 0; i < tiles.length; i++) {
            const p1 = tiles[i]; const p2 = tiles[(i+1) % tiles.length];

            if (p1.x === p2.x) {
                const minMax = getMinMax(p1.y, p2.y);
                GreenTiles.#addToMap(X, p1.x, Interval.fromMinMax(minMax));

                let redTileIsOpenForConnection = true;
                const y = minMax.min;
                const peer = peers_by_y.get(y);
                if (peer !== undefined) {
                    GreenTiles.#connection(p1.x, peer, y, Y, peers_by_y)
                }
                for (let y = minMax.min + 1; y < minMax.max; y++) {
                    const peer = peers_by_y.get(y);
                    if (peer === undefined) {
                        // open for connection
                        peers_by_y.set(y, p1.x);
                    } else {
                        // connection
                        GreenTiles.#connection(p1.x, peer, y, Y, peers_by_y);
                        redTileIsOpenForConnection = false;
                    }
                }

                if (redTileIsOpenForConnection) {
                    peers_by_y.set(y, p1.x);
                }
            } else if (p1.y === p2.y) {
                const minMax = getMinMax(p1.x, p2.x);
                GreenTiles.#addToMap(Y, p1.y,Interval.fromMinMax(minMax));

                let redTileIsOpenForConnection = true;
                const x = minMax.min;
                const peer = peers_by_x.get(x);
                if (peer !== undefined) {
                    GreenTiles.#connection(p1.y, peer, x, X, peers_by_x);
                }
                for (let x = minMax.min + 1; x < minMax.max; x++) {
                    const peer = peers_by_x.get(x);
                    if (peer === undefined) {
                        peers_by_x.set(x, p1.y);
                    } else {
                        // connection
                        GreenTiles.#connection(p1.y, peer, x, X, peers_by_y);
                        redTileIsOpenForConnection = false;
                    }
                }

                if (redTileIsOpenForConnection) {
                    peers_by_x.set(x, p1.y);
                }
            } else {
                throw new Error(`Found two red tiles with no coordinate in common: ${p1}, ${p2}`);
            }
        }

        console.log(X.entries());
        GreenTiles.#postProcessing(X); GreenTiles.#postProcessing(Y);
        console.log(X.entries());
        return new GreenTiles(X, Y);
    }

    static #postProcessing(x: GreenMap) {
        for (const k of x.keys()) {
            const v = x.get(k)!.sort((a, b)=>a.compare(b));
            while (Interval.tryMergeArray(v)) {}

            x.set(k, v);
        }
    }

    static #connection(peer1: number, peer2: number, key: number, tileMap: GreenMap, PeerMap: PeerMap) {
        const minMax = getMinMax(peer1, peer2);
        GreenTiles.#addToMap(tileMap, key, Interval.fromMinMax(minMax));
        PeerMap.delete(key);
    }

    static #addToMap(map: GreenMap, k: number, x: Interval) {
        const v = map.get(k);
        if (v === undefined) {
            map.set(k, [x]);
        } else {
            v.push(x);
        }
    }
}