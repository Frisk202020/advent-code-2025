import * as fs from "fs";

enum Part {
    One,
    Two
} function parsePart(x: string): Part {
    if (x === "1") { return Part.One; }
    else if (x === "2") { return Part.Two; }
    else { throw new Error("Invalid part"); }
}

class Grid {
    lines: boolean[][];
    line_length: number;

    constructor(file: string[]) {
        this.lines = file.map((x)=>{
            let out = Array(x.length).fill(false);
            for (let i = 0; i < x.length; i++) {
                if (x.charAt(i) === "@") { out[i] = true; }
                else if (x.charAt(i) !== ".") { throw new Error("Unrecognized char -- abort"); }
            }
            return out;
        });

        this.line_length = this.lines[0].length;
    }

    #is_paper(x: number, y: number): boolean {
        if (x < 0 ||  x >= this.line_length || y < 0 || y >= this.lines.length) {
            return false;
        }

        return this.lines[y][x];
    }

    to_rich_grid(): RichGrid {
        const rich_array = Array.from(
            { length: this.lines.length },
            () => Array(this.line_length).fill(-1)
        );

        for (let y = 0; y < this.lines.length; y++) {
            for (let x = 0; x < this.line_length; x++) {
                if (!this.lines[y][x]) { continue; }

                let n = 0;
                for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {
                        if (i === 0 && j === 0) { continue; }
                        if (this.#is_paper(x + i, y + j)) { n++; }
                    }
                }
                rich_array[y][x] = n;
            }
        }

        return { lines: rich_array, line_length: this.line_length}
    }
}

interface RichGrid {
    lines: number[][],
    line_length: number
}

class RicherGrid {
    lines: number[][];
    line_length: number;

    constructor(from: RichGrid) {
        this.lines = from.lines;
        this.line_length = from.line_length;
    }

    // assumes x/y correctness
    remove_paper(x: number, y: number) {
        this.lines[y][x] = -1;

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                const X = x + i; const Y = y + j;
                if (X < 0 || X >= this.line_length || Y < 0 || Y >= this.lines.length) { continue; }
                if (this.lines[Y][X] > -1) { this.lines[Y][X]--; }
            }
        }  
    }
}

function open_file(path: string): string[] {
    return fs.readFileSync(path).toString().split("\r\n");
}

function output_1(grid: RichGrid): number {
    let out = 0;
    for (let y = 0; y < grid.lines.length; y++) {
        for (let x = 0; x < grid.line_length; x++) {
            const n = grid.lines[y][x];
            if (n > -1 && n < 4) {
                out++;
            }
        }
    }

    return out;
}

function output_2(from_grid: RichGrid): number {
    let grid = new RicherGrid(from_grid);
    let out = 0;

    while (output_2_loop(grid)) {
        out++;
    }

    return out;
}

function output_2_loop(grid: RicherGrid): boolean {
    for (let y = 0; y < grid.lines.length; y++) {
        for (let x = 0; x < grid.line_length; x++) {
            const n = grid.lines[y][x];
            if (n > -1 && n < 4) {
                grid.remove_paper(x, y);
                return true;
            }
        }
    }
    return false;
} 

function output(grid: RichGrid, part: Part) {
    if (part === Part.One) { return output_1(grid); }
    else { return output_2(grid); }
}

function main() {
    if (process.argv.length < 4) { throw new Error("Need to specify path and part"); }
    const part = parsePart(process.argv[3]);
    
    const file = open_file(process.argv[2]);
    const grid = new Grid(file);
    const rich_grid = grid.to_rich_grid();
    console.log("Output: " + output(rich_grid, part));
}

main();