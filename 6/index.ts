import * as fs from "fs";

enum Part {
    One,
    Two
} function parsePart(x: string): Part {
    if (x === "1") { return Part.One; }
    else if (x === "2") { return Part.Two; }
    else { throw new Error("Invalid part"); }
}

interface Problem {
    entries: number[],
    is_addition: boolean
}

function open_file_1(path: string): Problem[] {
    const data = fs.readFileSync(path).toString().split("\r\n")
        .map((x)=>x.split(" "))
        .map((x)=>x.filter((x)=>x !== ""));

    const out = Array<Problem>(data[0].length);
    const n = data.length-1;
    for (let i = 0; i < data[0].length; i++) {
        const entries = Array(n);
        for (let j = 0; j < n; j++) {
            entries[j] = Number.parseInt(data[j][i]);
        }
        if (data[n][i] === "+") {
            out[i] = {entries, is_addition: true};
        } else if (data[n][i] === "*") {
            out[i] = {entries, is_addition: false};
        } else {
            throw new Error("Unrecognized operand: " + data[i][n]);
        }
    }

    return out;
}

function open_file_2(path: string): Problem[] {
    const file = fs.readFileSync(path).toString().split("\r\n").map((x)=>x.split("").reverse());
    const n_number_lines = file.length - 1;
    const operands = file[n_number_lines];
    const n_chars = file[0].length;
    
    const problems = Array();
    let entries = Array();
    for (let i = 0; i < n_chars; i++) {
        const collected = Array();
        for (let j = 0; j < n_number_lines; j++) {
            if (file[j][i] !== " ") {
                collected.push(Number.parseInt(file[j][i]));
            }
        }
        
        const collected_rev = collected.reverse();
        let entry = 0;
        for (let j = 0; j < collected_rev.length; j++) {
            entry += collected_rev[j] * Math.pow(10, j);
        }
        entries.push(entry);

        if (operands[i] === " ") {
            continue;
        } else if (operands[i] === "+") {
            problems.push({entries, is_addition: true});
        } else if (operands[i] === "*") {
            problems.push({entries, is_addition: false});
        } else {
            throw new Error("Unrecognized operand: " + operands[i]);
        }
        entries = Array();
        i++; // skip next column (empty)
    }

    return problems;
}

function open_file(path: string, part: Part): Problem[] {
    if (part === Part.One) {
        return open_file_1(path);
    } else {
        return open_file_2(path);
    }
}

function solve(p: Problem[]): number {
    let out = 0;
    p.forEach((x)=>{
        let problem_res = x.entries[0];
        if (x.is_addition) {
            for (let i = 1; i < x.entries.length; i++) {
                problem_res += x.entries[i];
            }
        } else {
            for (let i = 1; i < x.entries.length; i++) {
                problem_res *= x.entries[i];
            }
        }

        out += problem_res;
    });

    return out;
}

function main() {
    if (process.argv.length < 4) { throw new Error("Need path & patrt args"); }

    const data = open_file(process.argv[2], parsePart(process.argv[3]));
    console.log("Output: " + solve(data));
}

main();