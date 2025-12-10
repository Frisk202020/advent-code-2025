import { readFileSync } from "fs";
import { JoltageSolver, JoltageSolver2, LightSolver } from "./solver.js";

enum Part {
    One,
    Two
} function parsePart(x: string): Part {
    if (x === "1") { return Part.One; }
    else if (x === "2") { return Part.Two; }
    else { throw new Error("Invalid part"); }
}

class Machine {
    #solution: boolean[];
    #buttons: number[][];
    #joltage: number[];

    constructor(solution: boolean[], buttons: number[][], joltage: number[]) {
        this.#solution = solution; this.#buttons = buttons; 
        this.#joltage = joltage;
    } static fromStr(x: string): Machine[] {
        return x.split("\r\n").map((x)=>this.#fromStr(x));
    }
    #toLightSolver(nPresses: number): LightSolver {
        return new LightSolver(this.#solution, this.#buttons, nPresses);
    }
    #toJoltageSolver(nPresses: number): JoltageSolver {
        return new JoltageSolver(this.#joltage, this.#buttons, nPresses);
    }
    #toJoltageSolver2(nPresses: number): JoltageSolver2 {
        return new JoltageSolver2(this.#joltage, this.#buttons, nPresses);
    }
    
    static #fromStr(x: string): Machine {
        const entries = x.split(" ");
        const solution = Array<boolean>();
        for (let i = 1; i < entries[0].length-1; i++) {
            solution.push(entries[0][i] === "#");
        }  

        const buttons = Array<number[]>();
        for (let i = 1; i < entries.length-1; i++) {
            buttons.push(this.#parseNumberArray(entries[i]));
        }

        const joltage = this.#parseNumberArray(entries[entries.length-1]);
        return new Machine(solution, buttons, joltage);
    } 

    // ignoring wrapper char 
    static #parseNumberArray(x: string): number[] {
        return x
            .substring(1, x.length)
            .split(",")
            .map((x)=>Number.parseInt(x))
    }

    lightSolver(): number {
        for (let nPresses = 1; true; nPresses++) {
            const solver = this.#toLightSolver(nPresses);
            if (solver.solve()) { return nPresses; }
        }   
    }
    joltageSolver(): number {
        let minPresses = 0;
        for (const x of this.#joltage) {
            minPresses = Math.max(minPresses, x);
        }

        for (let nPresses = minPresses; true; nPresses++) {
            const solver = this.#toJoltageSolver2(nPresses);
            if (solver.solve()) { return nPresses; }
        }  
    }
    
    toString() {
        return `
            ${this.#solution.toString()}\n
            ${this.#buttons.map((x)=>`[${x.toString()}]`)}\n
            ${this.#joltage.toString()}\n
        `;
    }
}

function main() {
    if (process.argv.length < 4) { throw new Error("Need file and part args"); }

    const file = readFileSync(process.argv[2]).toString(); const part = parsePart(process.argv[3]);
    const machines = Machine.fromStr(file);
    let out = 0;
    if (part === Part.One) {
        machines.forEach((x)=>out += x.lightSolver());
    } else {
        let progress = 0;
        machines.forEach((x)=>{
            out += x.joltageSolver();
            progress++;
            console.log(`Progress: ${100 * progress / machines.length}%`);
        });
    }
    console.log("Output: " + out);
}

main();