import * as fs from "fs";
import { Point } from "./shared.js";

enum RichElement {
    OutOfBounds,
    Obstacle,
    Void
}
export class DataMap {
    #elms: boolean[][] // true: obstacle
    #line_length: number;
    #starting_point!: Point;
    #splitters: Set<string>;
    #beamStartPoints: Set<string>;

    constructor(file_path: string) {
        this.#splitters = new Set();
        this.#beamStartPoints = new Set(); // omitting starting point bc irrelevant

        const data = fs.readFileSync(file_path).toString().split("\r\n");
        this.#line_length = data[0].length;
        
        this.#elms = Array.from(
            { length: data.length },
            () => Array(this.#line_length).fill(false)
        );

        for (let y = 0; y < data.length; y++) {
            for (let x = 0; x < this.#line_length; x++) {
                if (data[y][x] === ".") { continue; }
                else if (data[y][x] === "^") { this.#elms[y][x] = true; }
                else if (data[y][x] === "S") { this.#starting_point = new Point(x, y); }
                else { throw new Error("Unrecognized map elmement: " + data[y][x]); }
            }
        }
    }

    #resolveRound(beams: Beam[]) {
        for (let i = 0; i < beams.length; i++) {
            switch (this.#tryMoveDownward(beams[i])) {
                case RichElement.Obstacle:
                    const b = beams.splice(i, 1);
                    if (b.length > 0) {
                        this.#splitBeam(b[0], beams);
                    }
                    return;
                case RichElement.OutOfBounds:
                    beams.splice(i, 1);
                    return;
            }
        }
    }

    #splitBeam(beam: Beam, beams: Beam[]) {
        const setElm = beam.setElm;
        if (!this.#splitters.has(setElm)) {
            this.#splitters.add(setElm);
        }

        if (beam.x > 0) {
            this.#tryAddBeam(beam.x-1, beam.y, beams);
        } if (beam.x < this.#line_length) {
            this.#tryAddBeam(beam.x+1, beam.y, beams);
        }
    } 
    #tryAddBeam(x: number, y: number, beams: Beam[]) {
        const p = new Point(x, y);
        const setElm = p.toString();
        if (!this.#beamStartPoints.has(setElm)) {
            beams.push(new Beam(p));
            this.#beamStartPoints.add(setElm);
        }
    }

    #tryMoveDownward(beam: Beam): RichElement {
        if (beam.y >= this.#elms.length-1) { return RichElement.OutOfBounds; }
        
        beam.moveDown();
        return this.#elms[beam.y][beam.x] ? RichElement.Obstacle : RichElement.Void;
    }

    resolve(): number {
        let beams = [new Beam(this.#starting_point)];

        while (beams.length > 0) {
            this.#resolveRound(beams);
        }

        return this.#splitters.size;
    }
}
class Beam {
    #position: Point;

    constructor(pos: Point) {
        this.#position = pos;
    }

    get y() {
        return this.#position.y;
    } get x() {
        return this.#position.x;
    } get setElm() {
        return this.#position.toString();
    }
    moveDown() {
        this.#position.y++;
    }
}