abstract class Solver<T> {
    #solution: Readonly<T[]>;
    protected solutionLength: number;
    protected buttons: Readonly<number[][]>;
    protected totalPresses: number;
    
    constructor(sol: T[], buttons: number[][], n: number) {
        this.#solution = sol; this.buttons = buttons; this.totalPresses = n; this.solutionLength= sol.length;
    } protected getSolutionElm(i: number) { return this.#solution[i]; }

    protected abstract solve(): boolean;
    protected abstract press(state: T[], btnId: number): void;
    protected checkState(state: T[]) {
        // assumes state is equal length as solution
        for (let i = 0; i < state.length; i++) {
            if (state[i] !== this.#solution[i]) { return false; }
        }

        return true;
    }
}

export class LightSolver extends Solver<boolean> {
    #maxWalletMap: Map<number, number>;

    constructor(sol: boolean[], buttons: number[][], n: number) {
        super(sol, buttons, n);
        this.#maxWalletMap = new Map();

        const key = buttons.length - n;
        for (let i = 0; i < n; i++) {
            this.#maxWalletMap.set(key + i, n-i);
        }
    }

    solve(): boolean {
        for (
            let startId = 0; 
            startId < this.buttons.length - this.totalPresses + 1; 
            startId++
        ) {
            if (this.#search(
                Array<boolean>(this.solutionLength).fill(false),
                this.totalPresses - 1,
                startId,
            )) { return true; }
        }

        return false;
    }
    #search(state: boolean[], wallet: number, btnId: number): boolean {
        this.press(state, btnId);
        if (wallet === 0) {
            return this.checkState(state);
        }

        for (let i = btnId + 1; i < this.buttons.length; i++) {
            const walletCap = this.#maxWalletMap.get(i);
            if (walletCap !== undefined && wallet > walletCap) {
                break;
            }

            if (this.#search(Array.from(state), wallet-1, i)) {
                return true;
            }
        }
        return false;
    }

    // assumes id does not overflow and btn is correct (no inputs point to overflows)
    protected press(state: boolean[], id: number) {
        this.buttons[id].forEach((i)=>{
            state[i] = !state[i];
        });
    }
}

// Deep search first : from one starting btn try all possible combinations 
export class JoltageSolver extends Solver<number> {
    #maxId: number;
    #maxPerButtons: number[];

    constructor(sol: number[], buttons: number[][], n: number) {
        super(sol, buttons, n);
        this.#maxId = buttons.length - 1;
        this.#maxPerButtons = buttons.map((x)=>{
            let min = sol[x[0]];
            for (let i = 1; i < x.length; i++) {
                min = Math.min(min, sol[x[i]]);
            }

            return min;
        });
    }

    solve() {
        return this.#search(Array(this.solutionLength).fill(0), 0, this.totalPresses);
    }
    #search(state: number[], btnId: number, nLeft: number): boolean {
        if (nLeft === 0) {
            return this.checkState(state);
        }
        if (btnId >= this.#maxId) {
            this.#multiplePresses(state, btnId, nLeft);
            return this.checkState(state);
        }

        // decreasing so max recursions is worst case
        for (let i = Math.min(nLeft, this.#maxPerButtons[btnId]); i >= 0; i--) {
            const s = Array.from(state);
            this.#multiplePresses(s, btnId, i);
            if (this.#hasSolutionOverflow(state)) { return false; }
            if (this.#search(
                s, btnId + 1, nLeft - i
            )) { return true; }
        }
        return false;
    }

    #multiplePresses(state: number[], id: number, n: number) {
        this.buttons[id].forEach((i)=>{
            state[i] += n;
        });
    }
    protected press(state: number[], id: number) {
        this.buttons[id].forEach((i)=>{
            state[i]++;
        });
    }

    #hasSolutionOverflow(state: number[]) {
        for (let i = 0; i < state.length; i++) {
            if (state[i] > this.getSolutionElm(i)) { return true; }
        }

        return false;
    }
}

// Breadth search : try to  press each btn as many as possible, then as many - 1 + each possible other press, then many - 2....
export class JoltageSolver2 extends Solver<number> {
    #maxId: number;
    #maxPerButtons: number[];

    constructor(sol: number[], buttons: number[][], n: number) {
        super(sol, buttons, n);
        this.#maxId = buttons.length - 1;
        this.#maxPerButtons = buttons.map((x)=>{
            let min = sol[x[0]];
            for (let i = 1; i < x.length; i++) {
                min = Math.min(min, sol[x[i]]);
            }

            return min;
        });
    }

    solve() {
        for (let initPresses = this.totalPresses; initPresses >= 0; initPresses--) {
            for (let initBtn = 0; initBtn < this.buttons.length; initBtn++) {
                if (initPresses > this.#maxPerButtons[initBtn]) { continue; }

                const state = Array(this.solutionLength).fill(0);
                this.#multiplePresses(state, initBtn, initPresses);
                if (initBtn === this.buttons.length-1) {
                    if (this.checkState(state)) { return true; }
                } else {
                    if (this.#search(state, initBtn + 1, this.totalPresses - initPresses)) { return true; }
                }
            }
        }

        return false;
    }
    #search(state: number[], btnId: number, nLeft: number): boolean {
        if (nLeft === 0) {
            return this.checkState(state);
        }
        if (btnId >= this.#maxId) {
            this.#multiplePresses(state, btnId, nLeft);
            return this.checkState(state);
        }

        // decreasing so max recursions is worst case
        for (let i = Math.min(nLeft, this.#maxPerButtons[btnId]); i >= 0; i--) {
            const s = Array.from(state);
            this.#multiplePresses(s, btnId, i);
            if (this.#hasSolutionOverflow(state)) { return false; }
            if (this.#search(
                s, btnId + 1, nLeft - i
            )) { return true; }
        }
        return false;
    }

    #multiplePresses(state: number[], id: number, n: number) {
        this.buttons[id].forEach((i)=>{
            state[i] += n;
        });
    }
    protected press(state: number[], id: number) {
        this.buttons[id].forEach((i)=>{
            state[i]++;
        });
    }

    #hasSolutionOverflow(state: number[]) {
        for (let i = 0; i < state.length; i++) {
            if (state[i] > this.getSolutionElm(i)) { return true; }
        }

        return false;
    }
}