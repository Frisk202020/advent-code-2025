import { inspect } from "util";

export interface MinMax {
    min: number,
    max: number,
}
export function getMinMax(x: number, y: number) {
    if (x <= y) {
        return {min: x, max: y};
    } 
    return {min: y, max: x};
}

export interface RichData {
    points: Point[],
    w: number,
    h: number
}

export class Point {
    #x: number;
    #y: number;

    constructor(x: number, y: number) {
        this.#x = x; this.#y = y;
    } 
    get x() {return this.#x;}
    get y() {return this.#y;}
    
    // assumes matrix correctness
    static parseData(x: number[][]): RichData {
        let w = 0; let h = 0;
        const points =  x.map((x)=>{
            w = Math.max(w, x[0]);
            h = Math.max(h, x[1]);
            return new Point(x[0], x[1])
        });
        return {points, h, w};
    } static solve(x: Point[]) {
        let maxArea = 0;
        for (let i = 0; i < x.length; i++) {
            for (let j = i+1; j < x.length; j++) {
                maxArea = Math.max(maxArea, x[i].getRectangleArea(x[j]));
            }
        }

        return maxArea;
    }

    getRectangleArea(other: Point): number {
        return (Math.abs(this.#x - other.#x)+1) * (Math.abs(this.#y - other.#y)+1);
    }
    [inspect.custom]()  {
        return `{${this.#x}, ${this.#y}}`;
    }
}