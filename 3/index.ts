import * as fs from "fs";

enum Part {
    One,
    Two
} function parsePart(x: string): Part {
    if (x === "1") { return Part.One; }
    else if (x === "2") { return Part.Two; }
    else { throw new Error("Invalid part"); }
}

function byteToNumber(x: number): number {
    if (x < 48 || x > 57) { throw new Error("Invalid byte range: " + x); }
    return x - 48;
}

interface Batteries {
    lines: number[][],
    line_length: number
}
function open_file(path: string): Batteries {
    const lines = Array();
    const file = fs.readFileSync(path);
    let line_length = 0;
    for (let x of file) {
        if (x !== 13 && x !== 10) { line_length++; }
        else { break; }
    }

    const step = line_length + 2; // each line has \r\n
    for (let i = 0; i < file.length; i+=step) {
        lines.push(
            file.subarray(i, i+line_length).map((x)=>byteToNumber(x))
        );
    }

    return {lines, line_length};
}

interface BatteryChoice {
    left: number,
    right: number
}
function analyze_batteries(b: Batteries): BatteryChoice[] {
    return b.lines.map((line)=>{
        let choice = {left: 0, right: 0};

        for (let i = 0; i < line.length-1; i++) {
            if (line[i] > choice.left) {
                choice.left = line[i]; choice.right = 0;
            } else if (line[i] > choice.right) {
                choice.right = line[i];
            }
        }
        const last = line[line.length-1]; 
        if (last > choice.right) { choice.right = last; }      

        return choice;
    });
}
function compute_output(b: BatteryChoice[]): number {
    let out = 0;
    b.forEach((x)=>out += x.left * 10 + x.right)

    return out;
}


function analyze_batteries_2(b: Batteries): number[][] {
    return b.lines.map((line)=>{
        let choice = Array<number>(12).fill(0);

        for (let i = 0; i < line.length; i++) {
            let begin = Math.max(0, i + 12 - line.length);
            for (let j = begin; j < 12; j++) {
                if (line[i] > choice[j]) {
                    choice[j] = line[i]; 
                    for (let k = j+1; k < 12;  k++) {
                        choice[k] = 0;
                    }
                    break;
                }
            }
        }    

        return choice;
    });
}
function compute_output_2(b: number[][]) {
    let out = 0;
    b.forEach((choice)=>{
        for (let i = 0; i < 12; i++) {
            out += Math.pow(10, 11-i) * choice[i]; 
        }
    });

    return out;
}

function analyze(b: Batteries, p: Part): number {
    if (p === Part.One) {
        return compute_output(analyze_batteries(b));
    } else {
        return compute_output_2(analyze_batteries_2(b));
    }
}

function main() {
    if (process.argv.length < 4) { throw new Error("Need to specify input file and part"); }

    console.log(
        analyze(open_file(process.argv[2]), parsePart(process.argv[3]))
    )
}

main();