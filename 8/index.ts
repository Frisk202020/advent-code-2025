import { readFileSync } from "fs";

enum Part {
    One,
    Two
} function parsePart(x: string): Part {
    if (x === "1") { return Part.One; }
    else if (x === "2") { return Part.Two; }
    else { throw new Error("Invalid part"); }
}

enum File {
    Test,
    Data
} function parseFile(x: string): File {
    if (x === "test") { return File.Test; }
    else if (x === "data") { return File.Data; }
    else { throw new Error("Invalid part"); }
}

interface SolveParams {
    file_path: string,
    connections: number,
    nBoxes: number
} function getParams(x: File): SolveParams {
    if (x === File.Test) {
        return {file_path: "test.md", connections: 10, nBoxes: 20};
    }
    return {file_path: "data.md", connections: 1000, nBoxes: 1000};
}
 
interface Distance {
    id1: number,
    id2: number,
    d: number
}
function clusters(sorted_map: Distance[], connections: number): Set<number>[] {
    const out: Set<number>[] = [];
    for (let i = 0; i < connections; i++) {
        add_to_cluster(sorted_map[i], out);
    }

    return out;
} 

interface RichDistance {
    id1: number,
    id2: number,
    xProduct: number,
    d: number
}

function clusters2(sorted_map: RichDistance[], nBoxes: number): number {
    const l: Set<number>[] = [];
    add_to_cluster(sorted_map[0], l);
    let i = 0;

    // last comparaison is equivalent to check if network is entirely connected as values in it are unique
    while (i < sorted_map.length-1 && l[0].size < nBoxes) {
        i++;
        add_to_cluster(sorted_map[i], l);        
    }

    return sorted_map[i].xProduct;
}
function add_to_cluster(candidate: Distance, list: Set<number>[]) {
    let cluster_for_id1 = -1;
    let cluster_for_id2 = -1

    for (let i = 0; i < list.length; i++) {
        const idSet = list[i];
        // assume no duplicates in the list (distance map has no duplicates)
        if (cluster_for_id1 < 0 && idSet.has(candidate.id1)) { 
            cluster_for_id1 = i;
            if (cluster_for_id2 >= 0) {
                merge_clusters(cluster_for_id1, cluster_for_id2, list);
                return;
            } else {
                idSet.add(candidate.id2);
            }
        } else if (cluster_for_id2 < 0 && idSet.has(candidate.id2)) {
            cluster_for_id2 = i;
            if (cluster_for_id1 >= 0) {
                merge_clusters(cluster_for_id1, cluster_for_id2, list);
                return;
            } else {
                idSet.add(candidate.id1);
            }
        } 
    }
    if (cluster_for_id1 >= 0 || cluster_for_id2 >= 0) { return; }

    list.push(new Set([candidate.id1, candidate.id2]));
    return;
}
function merge_clusters(i: number, j: number, l: Set<number>[]) {
    for (const x of l[j]) {
        l[i].add(x);
    }
    l.splice(j, 1);
}

class Box {
    #id: number;
    #x: number;
    #y: number;
    #z: number;
    #distanceMap: Map<number, number>;
    static #nextId = 0;


    constructor(x: number, y: number, z: number) {
        this.#id = Box.#nextId;
        this.#distanceMap = new Map();
        this.#x = x; this.#y = y; this.#z = z;
        Box.#nextId++;
    }
    // Assumes matrix correctess (no NaN; 3-length arrays)
    static fromNumberMatrix(x: number[][]): Box[] {
        return x.map((x)=>new Box(x[0], x[1], x[2]))
    } static solve(x: Box[], connections: number): number {
        const distance_map = Box.#computeDistanceMap(x).sort((a, b)=>a.d - b.d);
        const c = clusters(distance_map, connections).sort((a, b)=>b.size - a.size);

        return c[0].size * c[1].size * c[2].size;
    } static solve2(x: Box[], nBoxes: number): number {
        const distance_map = Box.#computeRichDistanceMap(x).sort((a,b)=>a.d - b.d);
        return clusters2(distance_map, nBoxes);
    }
    
    static #normComponent(x1: number, x2: number): number {
        return Math.pow(Math.abs(x1 - x2), 2);
    } static #computeDistanceMap(x: Box[]): Distance[] {
        const out: Distance[] = [];
        for (let i = 0; i < x.length; i++) {
            for (let j = i+1; j < x.length; j++) {
                const d = x[i].#computeDistance(x[j]);
                out.push({id1: x[i].#id, id2: x[j].#id, d});
            }
        }

        return out;
    } static #computeRichDistanceMap(x: Box[]): RichDistance[] {
        const out: RichDistance[] = [];
        for (let i = 0; i < x.length; i++) {
            for (let j = i+1; j < x.length; j++) {
                const d = x[i].#computeDistance(x[j]);
                out.push({id1: x[i].#id, id2: x[j].#id, d, xProduct: x[i].#x * x[j].#x});
            }
        }

        return out;
    }

    #computeDistance(other: Box): number {
        const d = Box.#normComponent(this.#x, other.#x) 
            + Box.#normComponent(this.#y, other.#y) 
            + Box.#normComponent(this.#z, other.#z); 
        
        this.#distanceMap.set(other.#id, d);
        other.#distanceMap.set(this.#id, d);
        return d;
    }
}

function open_file(path: string): Box[] {
    const data = readFileSync(path).toString()
        .split("\r\n")
        .map((x)=>x.split(","))
        .map((x)=>x.map((x)=>Number.parseInt(x)));
    if (data.some(
        (x)=>{
            if (x.length !== 3) {
                throw new Error(`Parsed ${x.length} coordinates on a line`);
            }
            return x.some((x)=>Number.isNaN(x))
        }
    )) { throw new Error("File parsing failed : found NaN"); }

    return Box.fromNumberMatrix(data);
}

function main() {
    if (process.argv.length < 4) { throw new Error("Need path & patrt args"); }
    const params = getParams(parseFile(process.argv[2]));
    const part = parsePart(process.argv[3]);

    const boxes = open_file(params.file_path);
    console.log(`Output: ${
        part === Part.One ? Box.solve(boxes,params.connections) : Box.solve2(boxes, params.nBoxes)
    }`);
}

main();