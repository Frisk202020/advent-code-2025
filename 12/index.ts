import { readFileSync } from "fs";

function main() {
    const cost = [6,7,5,7,7,7];
    const data = readFileSync("data.md").toString().split("\r\n");
    let triviallyImpossible = 0;

    data.forEach((x)=>{
        const a = x.split(": ");
        const spaceData = a[0].split("x").map((x)=>Number.parseInt(x));
        const presentsData = a[1].split(" ").map((x)=>Number.parseInt(x));

        let space = spaceData[0] * spaceData[1];
        for (let i = 0; i < presentsData.length; i++) {
            space -= cost[i] * presentsData[i];
        }

        if (space < 0) { triviallyImpossible++; }
    });

    console.log(triviallyImpossible);
}

main();