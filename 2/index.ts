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
    start: number;
    end: number;
}

function open_file(path: string): Range[] {
    return fs.readFileSync(path).toString().split(",").map((x)=>{
        const range = x.split("-");
        if (range.length !== 2) { throw new Error("Failed to parse an entry to range: " + range.toString()) }

        return {start: Number.parseInt(range[0]), end: Number.parseInt(range[1])};
    });
}

function find_pattern(str: string, mod: number): boolean {
    const template = str.substring(0, mod);
    for (let j = mod; j <= str.length - mod; j+=mod) {
        if (template !== str.substring(j, j+mod)) { return false; }
    }

    return true;
}

function find_invalid_ids_2(x: Range[]): number[] {
    const out = Array();
    x.forEach((x)=>{
        for (let i = x.start; i <= x.end; i++) {
            const str = i.toString();
            if (str.length === 2) {
                if (str[0] === str[1]) { out.push(i); continue; }
            }
            for (let mod = 1; mod <= Math.floor(str.length/2); mod++) {
                const n = str.length;
                if (n % mod !== 0 || n / mod <= 1) { continue; }
                if (find_pattern(str, mod)) { out.push(i); break; }
            }
        }
    });

    return out;
}

function find_invalid_ids_1(x: Range[]): number[] {
    const out = Array();
    x.forEach((x)=>{
        for (let i = x.start; i <= x.end; i++) {
            const str = i.toString();
            if (str.length % 2 === 1) { continue; }

            let half = str.length / 2;
            if (str.substring(0, half) == str.substring(half)) { out.push(i); }
        }
    });

    return out;
}

function find_invalid_ids(x: Range[], part: Part): number[] {
    if (part === Part.One) { return find_invalid_ids_1(x); }
    else { return find_invalid_ids_2(x); }
}

function sum(x: number[]): number {
    let n = 0;
    x.forEach((x)=>n += x);
    return n;
}

function main() {
    if (process.argv.length < 4) { throw new Error("Please prompt input file and part to sollve"); }

    let path = process.argv[2];
    let part = parsePart(process.argv[3]);
    console.log(
        "Invalid IDs sum: " + sum(find_invalid_ids(open_file(path), part))
    );
}

main();