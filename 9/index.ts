import { readFileSync } from "fs";
import { Point } from "./shared.js";
import { GreenTiles } from "./part2.js";

enum Part {
    One,
    Two
} function parsePart(x: string): Part {
    if (x === "1") { return Part.One; }
    else if (x === "2") { return Part.Two; }
    else { throw new Error("Invalid part"); }
}

function solve2(data: Point[]) {
    const greenTiles = GreenTiles.fromRedTiles(data);

    let maxArea = 0;
    for (let i = 0; i < data.length; i++) {
        for (let j = i+1; j < data.length; j++) {
            const A = data[i]; const B = data[j];
            if (!greenTiles.isRectangleValid(A, B)) { continue; }

            maxArea = Math.max(maxArea, A.getRectangleArea(B));
        }
    }

    return maxArea;
}

function open_file(path: string): Point[] {
    const data = readFileSync(path).toString()
        .split("\r\n")
        .map((x)=>x.split(","))
        .map((x)=>x.map((x)=>Number.parseInt(x)));
    if (data.some(
        (x)=>{
            if (x.length !== 2) {
                throw new Error(`Parsed ${x.length} coordinates on a line`);
            }
            return x.some((x)=>Number.isNaN(x))
        }
    )) { throw new Error("File parsing failed : found NaN"); }

    return Point.parseData(data).points;
}

function main() {
    if (process.argv.length < 4) { throw new Error("Need path & patrt args"); }
    
    const data = open_file(process.argv[2]);
    const part = parsePart(process.argv[3]);
    console.log(`Output: ${
        part === Part.One ? Point.solve(data) : solve2(data)
    }`);
}

main();