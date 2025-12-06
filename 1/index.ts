import * as fs from "fs";

enum Part {
    One,
    Two
}

function open_file(path: string) {
    return fs.readFileSync(path).toString().split("\n");
}

function parse_array(x: string[]): Command[] {
    return x.map((x)=>{return {
        direction: x[0] == 'R',
        distance: Number.parseInt(x.substring(1))
    }})
} 

function search_pwd_1(x: Command[]): number {
    let res = 0;
    let dial = 50;

    x.forEach((x)=>{
        let d = x.distance % 100;

        if (x.direction) {
            dial = (dial + d) % 100; 
        } else {
            dial -= d;
            if (dial < 0) { dial = 100 + dial; }
        }

        if (dial == 0) { res++; }
    });

    return res;
}

function search_pwd_2(x: Command[]): number {
    let res = 0;
    let dial = 50;

    x.forEach((x)=>{
        let d_mod = x.distance % 100;
        res += (x.distance - d_mod) / 100;

        if (x.direction) {
            dial += d_mod;
            if (dial > 99) {
                res++;
                dial %= 100;
            }
        } else {
            if (dial == 0) { dial = 100; }
            dial -= d_mod;

            if (dial <= 0) {
                res++
            } 
            if (dial < 0) {
                dial += 100;
            }
        }
    });

    return res;
}

function search_pwd(x: Command[], part: Part): number {
    if (part == Part.One) {
        return search_pwd_1(x);
    } else {
        return search_pwd_2(x);
    }
}

function main() {
    let path = "data.md";
    let part = Part.Two;
    console.log(
        "password: " + search_pwd(parse_array(open_file(path)), part)
    );
}

main();

interface Command {
    direction: boolean,
    distance: number
}