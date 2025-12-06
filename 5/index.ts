import * as fs from "fs";

enum Part {
    One,
    Two
} function parsePart(x: string): Part {
    if (x === "1") { return Part.One; }
    else if (x === "2") { return Part.Two; }
    else { throw new Error("Invalid part"); }
}

interface Range {
    begin: number,
    end: number
}

interface Data {
    ranges: Range[],
    ingredients: number[]
}

function open_file_1(path: string): Data {
    const file = fs.readFileSync(path).toString().split("\r\n");
    const ranges = Array();
    let i = 0;

    while (file[i] !== "") {
        const x = file[i].split("-");
        if (x.length !== 2) { throw new Error("Unexpected range: " + file[i]); }

        ranges.push({begin: Number.parseInt(x[0]), end: Number.parseInt(x[1])});
        i++;
    }

    const ingredients = Array();
    for (let j = i + 1; j < file.length; j++) {
        ingredients.push(Number.parseInt(file[j]));
    }

    return { ranges, ingredients }
}

function find_fresh_ingredients_1(data: Data): number {
    let out = 0;
    data.ingredients.forEach((x)=>{
        for (const r of data.ranges) {
            if (x >= r.begin && x <= r.end) {
                out++;
                break;
            }
        }
    });

    return out;
}

function open_file_2(path: string): Range[] {
    const file = fs.readFileSync(path).toString().split("\r\n");
    const ranges = Array();

    for (let i = 0; file[i] !== ""; i++) {
        const x = file[i].split("-");
        if (x.length !== 2) { throw new Error("Unexpected range: " + file[i]); }

        ranges.push({begin: Number.parseInt(x[0]), end: Number.parseInt(x[1])});
    }

    return ranges;
}

function find_fresh_ingredients_2(r: Range[]): number {
    const sorted = r.sort((a, b)=>a.begin - b.begin);
    const new_ranges = Array(); new_ranges.push(sorted[0]);

    let MAX_END = sorted[0].end;
    for (let i = 1; i < sorted.length; i++) {
        const R = sorted[i];
        if (R.begin > MAX_END) {
            new_ranges.push(R);
            MAX_END = R.end;
        } else if (R.end > MAX_END) {
            new_ranges[new_ranges.length - 1].end = R.end;
            MAX_END = R.end;
        }
    }

    let out = 0;
    new_ranges.forEach((x)=>out += x.end - x.begin + 1);
    return out;
}

function solve(path: string, part: Part) {
    if (part === Part.One) {
        const data = open_file_1(path);
        return find_fresh_ingredients_1(data);
    } else {
        const ranges = open_file_2(path);
        return find_fresh_ingredients_2(ranges);
    }
}

function main() {
    if (process.argv.length < 4) { throw new Error("Need path & patrt args"); }
    console.log("Output: " + solve(process.argv[2], parsePart(process.argv[3])));
}

main();