import { Point } from "./shared.js";
import * as fs from "fs";

export class LightMap {
    #obstacles: Point[];
    #starting_point!: Point;
    #beamNest: Map<string, number>;

    constructor(file_path: string) {
        const data = fs.readFileSync(file_path).toString().split("\r\n");
        const line_length = data[0].length;
        this.#obstacles = Array();
        this.#beamNest = new Map();

        for (let y = 0; y < data.length; y++) {
            for (let x = 0; x < line_length; x++) {
                if (data[y][x] === ".") { continue; }
                else if (data[y][x] === "S") { this.#starting_point = new Point(x, y);}
                else if (data[y][x] === "^") { this.#obstacles.push(new Point(x, y)); }
                else { throw new Error("Unrecognized map elmement: " + data[y][x]); }
            }
        }
    }

    resolve() {
        return this.#findNestValue(this.#starting_point, 0);
    }

    #findNestValue(nestPoint: Point, start_index: number): number {
        const key = nestPoint.toString();
        const v = this.#beamNest.get(key);
        if (v !== undefined) {
            return v;
        }
        
        for (let i = start_index; i < this.#obstacles.length; i++) {
            if (nestPoint.x === this.#obstacles[i].x) {
                const val = this.#findNestValue(
                    new Point(nestPoint.x-1, this.#obstacles[i].y), 
                    i+1
                ) + this.#findNestValue(
                    new Point(nestPoint.x+1, this.#obstacles[i].y),
                    i+1
                );

                this.#beamNest.set(key, val);
                return val;
            }
        }

        this.#beamNest.set(key, 1);
        return 1;
    }
}