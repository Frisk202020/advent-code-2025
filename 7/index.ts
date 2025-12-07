import { DataMap } from "./part1.js";
import { LightMap } from "./part2.js";

enum Part {
    One,
    Two
} function parsePart(x: string): Part {
    if (x === "1") { return Part.One; }
    else if (x === "2") { return Part.Two; }
    else { throw new Error("Invalid part"); }
}

function main() {
    if (process.argv.length < 4) { throw new Error("Need path & patrt args"); }

    const path = process.argv[2];
    const map = parsePart(process.argv[3]) === Part.One
        ? new DataMap(path)
        : new LightMap(path);

    console.log("Output: " + map.resolve());
}

main();