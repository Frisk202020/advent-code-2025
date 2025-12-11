import { readFileSync } from "fs";

enum Part {
    One,
    Two
} function parsePart(x: string): Part {
    if (x === "1") { return Part.One; }
    else if (x === "2") { return Part.Two; }
    else { throw new Error("Invalid part"); }
}

// Mapper maps unique number ID to string values for easier computation
type InnerMap = Map<string, number>;
class Mapper {
    #inner: InnerMap;
    #nextValue: number;

    constructor() {
        this.#inner = new Map();
        this.#nextValue = 0;
    }

    map(k: string): number {
        const v = this.#inner.get(k);
        if (v === undefined) {
            this.#inner.set(k, this.#nextValue);
            const out = this.#nextValue;
            this.#nextValue++;
            return out;
        }

        return v;
    }

    #garanteedGet(k: string): number {
        const v = this.#inner.get(k);
        if (v === undefined) {
            return -1;
        }

        return v;
    }
    get you(): number {
        return this.#garanteedGet("you");
    } get out(): number {
        return this.#garanteedGet("out");
    } get svr() {
        return this.#garanteedGet("svr");
    } get fft() {
        return this.#garanteedGet("fft");
    } get dac() {
        return this.#garanteedGet("dac");
    }
}

type PowerMap = Map<number, number[]>;
class Factory {
    #map: PowerMap;
    #youId: number;
    #outId: number;
    #svrId: number; #fftId: number; #dacId: number;
    static #error = "Factory is missing required ids"; 

    constructor(map: PowerMap, you: number, out: number, svr: number, fft: number, dac: number) {
        this.#map = map; this.#youId = you; this.#outId = out; this.#svrId = svr; this.#fftId = fft; this.#dacId = dac;
    } static fromFile(path: string): Factory {
        const file = readFileSync(path).toString().split("\r\n");
        const map: PowerMap = new Map();
        const mapper = new Mapper();

        file.forEach((x)=>{
            const line = x.split(" ");
            const key = mapper.map(line[0].substring(0, 3));
            const value = Array<number>();
            for (let i = 1; i < line.length; i++) {
                value.push(mapper.map(line[i]));
            }

            map.set(key, value);
        });

        //console.log(mapper);
        return new Factory(map, mapper.you, mapper.out, mapper.svr, mapper.fft, mapper.dac);
    }
    assert(part: Part) {
        if (part === Part.One) {
            if (this.#youId < 0 || this.#outId < 0) { throw new Error(Factory.#error); }
            return;
        }
        if (this.#svrId < 0 || this.#fftId < 0 || this.#dacId < 0 || this.#outId < 0) {
            throw new Error(Factory.#error);
        }
    }

    solve(part: Part) {
        return part === Part.One 
            ? this.#search(this.#youId, new Set([this.#youId]))
            : this.#toFftSolver().solve() * this.#toDacSolver().solve() * this.#toOutSolver().solve()
    }
    #search(key: number, queue: Set<number>): number {
        const peers = this.#map.get(key)!;
        let out = 0; 
        for (const x of peers) {
            if (x === this.#outId) { return 1; }
            if (queue.has(x)) { continue; }

            const set = new Set(queue);
            set.add(x);
            out += this.#search(x, set);
        }
        return out;
    }

    #toFftSolver() {
        return new Solver(this.#map, this.#svrId, this.#fftId, this.#dacId, this.#outId);
    }
    #toDacSolver() {
        return new Solver(this.#map, this.#fftId, this.#dacId, this.#outId, this.#svrId);
    }
    #toOutSolver() {
        return new Solver(this.#map, this.#dacId, this.#outId, this.#svrId, this.#fftId);
    }
}

interface RichValue {
    peers: number[],
    value: number // -1: undefined, 0: leads to blacklist, 1+: solution 
}
class RichMap extends Map<number, RichValue> {
    static fromPowerMap(map: PowerMap) {
        const m = new RichMap();
        for (const [k, v] of map.entries()) {
            m.set(k, {peers: Array.from(v), value: -1});
        }

        return m;
    }
}
class Solver {
    #map: RichMap;
    #from: number;
    #to: number;
    #blacklist1: number;
    #blacklist2: number;

    constructor(map: PowerMap, from: number, to: number, b1: number, b2: number) {
        this.#map = RichMap.fromPowerMap(map); this.#from = from; this.#to = to; this.#blacklist1 = b1; this.#blacklist2 = b2;
    } 

    solve() {
        return this.#search(this.#from);
    }

    #search(key: number) {
        const value = this.#map.get(key)!;
        let out = 0; 
        for (const x of value.peers) {
            if (x === this.#to) { 
                value.value = 1;
                return 1;
            }
            if (x === this.#blacklist1 || x === this.#blacklist2) {
                value.value = 0;
                return 0;
            }
            
            const xData = this.#map.get(x)!;
            if (xData.value === -1) {
                const res = this.#search(x);
                out += res;
                xData.value = res;
            } else {
                out += xData.value;
            }
        }
        return out;
    }
}

function main() {
    if (process.argv.length < 4) { throw new Error("Need path & path args"); }
    const part = parsePart(process.argv[3]);

    const factory = Factory.fromFile(process.argv[2]);
    factory.assert(part);
    console.log("Output: " + factory.solve(part));
}

main();