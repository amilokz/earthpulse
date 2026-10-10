// Pulse Journey: match-3 engine. Pure TypeScript, koi React nahi, taake test ho sake.
// Mood 1 = 😢 sad ... 5 = 😄 great. Sad faces ko match karna = unhe khush karna.

export type Mood = 1 | 2 | 3 | 4 | 5;
export type Special = "row" | "col" | "bomb";

export interface Tile {
  id: number;
  mood: Mood | null; // bomb ka mood null hota hai
  special?: Special;
  lock?: boolean; // 🔒 swap nahi hota, khud match hone par toot-ta hai
  cloud?: boolean; // ☁️ swap nahi hota, paas mein match hone par hat-ta hai
}

export type Board = (Tile | null)[][]; // [row][col]
export interface Pos {
  r: number;
  c: number;
}

export interface Tally {
  moods: Record<Mood, number>;
  clouds: number;
  locks: number;
  score: number;
}

export interface Step {
  board: Board; // is step ke baad ki halat
  cleared: { pos: Pos; tile: Tile }[];
  combo: number;
}

export const SIZE = 7;

// --- Seeded random (same seed = same board, daily challenge ke liye) ---
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Game {
  board: Board;
  private nextId = 1;
  private rand: () => number;

  constructor(
    public palette: Mood[],
    seed: number,
    obstacles: { clouds?: Pos[]; locks?: Pos[] } = {},
  ) {
    this.rand = rng(seed);
    this.board = this.freshBoard();
    for (const p of obstacles.clouds ?? []) if (this.board[p.r]?.[p.c]) this.board[p.r][p.c]!.cloud = true;
    for (const p of obstacles.locks ?? []) if (this.board[p.r]?.[p.c]) this.board[p.r][p.c]!.lock = true;
    if (!this.hasMove()) this.shuffle();
  }

  // ---------- helpers ----------
  private tile(mood: Mood): Tile {
    return { id: this.nextId++, mood };
  }
  private pick(): Mood {
    return this.palette[Math.floor(this.rand() * this.palette.length)];
  }
  private freshBoard(): Board {
    const b: Board = [];
    for (let r = 0; r < SIZE; r++) {
      b.push([]);
      for (let c = 0; c < SIZE; c++) {
        let m: Mood;
        // shuru mein koi match na ho
        do m = this.pick();
        while (
          (c >= 2 && b[r][c - 1]?.mood === m && b[r][c - 2]?.mood === m) ||
          (r >= 2 && b[r - 1][c]?.mood === m && b[r - 2][c]?.mood === m)
        );
        b[r].push(this.tile(m));
      }
    }
    return b;
  }
  static clone(b: Board): Board {
    return b.map((row) => row.map((t) => (t ? { ...t } : null)));
  }
  canSwap(p: Pos) {
    const t = this.board[p.r]?.[p.c];
    return !!t && !t.lock && !t.cloud;
  }
  static adjacent(a: Pos, b: Pos) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }

  // ---------- matches ----------
  /** Har line jismein 3+ same mood hon */
  findRuns(b: Board = this.board): Pos[][] {
    const runs: Pos[][] = [];
    for (let r = 0; r < SIZE; r++) {
      let c = 0;
      while (c < SIZE) {
        const m = b[r][c]?.mood;
        let e = c + 1;
        while (m && e < SIZE && b[r][e]?.mood === m) e++;
        if (m && e - c >= 3) runs.push(Array.from({ length: e - c }, (_, i) => ({ r, c: c + i })));
        c = e;
      }
    }
    for (let c = 0; c < SIZE; c++) {
      let r = 0;
      while (r < SIZE) {
        const m = b[r][c]?.mood;
        let e = r + 1;
        while (m && e < SIZE && b[e][c]?.mood === m) e++;
        if (m && e - r >= 3) runs.push(Array.from({ length: e - r }, (_, i) => ({ r: r + i, c })));
        r = e;
      }
    }
    return runs;
  }

  /** Koi bhi valid chaal hai? (bomb hamesha valid) */
  hasMove(): boolean {
    return this.findMove() !== null;
  }
  findMove(): [Pos, Pos] | null {
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        const a = { r, c };
        if (!this.canSwap(a)) continue;
        for (const b of [
          { r, c: c + 1 },
          { r: r + 1, c },
        ]) {
          if (b.r >= SIZE || b.c >= SIZE || !this.canSwap(b)) continue;
          if (this.board[r][c]!.special === "bomb" || this.board[b.r][b.c]!.special === "bomb") return [a, b];
          const t = Game.clone(this.board);
          [t[a.r][a.c], t[b.r][b.c]] = [t[b.r][b.c], t[a.r][a.c]];
          if (this.findRuns(t).length) return [a, b];
        }
      }
    return null;
  }

  /** Sab tiles mix karo (obstacles apni jagah) */
  shuffle() {
    for (let tries = 0; tries < 50; tries++) {
      const free: Pos[] = [];
      const tiles: Tile[] = [];
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
          if (this.canSwap({ r, c })) {
            free.push({ r, c });
            tiles.push(this.board[r][c]!);
          }
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(this.rand() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
      free.forEach((p, i) => (this.board[p.r][p.c] = tiles[i]));
      if (!this.findRuns().length && this.hasMove()) return;
    }
    // bohot bura luck: naya board, obstacles rakh kar
    const old = this.board;
    this.board = this.freshBoard();
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        if (old[r][c]?.lock) this.board[r][c]!.lock = true;
        if (old[r][c]?.cloud) this.board[r][c]!.cloud = true;
      }
  }

  // ---------- moves ----------
  /** Swap karo. Match na bane to null (board wapas). Warna har cascade ka step. */
  swap(a: Pos, b: Pos, tally: Tally): Step[] | null {
    if (!Game.adjacent(a, b) || !this.canSwap(a) || !this.canSwap(b)) return null;
    const B = this.board;
    const ta = B[a.r][a.c]!;
    const tb = B[b.r][b.c]!;
    [B[a.r][a.c], B[b.r][b.c]] = [tb, ta];

    // 🌈 bomb: jis mood se swap kiya, woh sab saaf
    if (ta.special === "bomb" || tb.special === "bomb") {
      const bombPos = ta.special === "bomb" ? b : a; // swap ke baad bomb yahan hai
      const other = ta.special === "bomb" ? tb : ta;
      const targets = new Set<string>([key(bombPos)]);
      if (other.special === "bomb") {
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) targets.add(key({ r, c }));
      } else {
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (B[r][c]?.mood === other.mood) targets.add(key({ r, c }));
      }
      return this.cascade(tally, [...targets].map(unkey), []);
    }

    const runs = this.findRuns();
    if (!runs.length) {
      [B[a.r][a.c], B[b.r][b.c]] = [ta, tb]; // wapas
      return null;
    }
    return this.cascade(tally, [], [a, b]);
  }

  /** 🔨 Hammer booster: aik tile tod do */
  hammer(p: Pos, tally: Tally): Step[] | null {
    if (!this.board[p.r]?.[p.c]) return null;
    return this.cascade(tally, [p], []);
  }

  private cascade(tally: Tally, forced: Pos[], swapped: Pos[]): Step[] {
    const steps: Step[] = [];
    let combo = 0;
    let first = true;
    while (true) {
      const runs = this.findRuns();
      if (!runs.length && !(first && forced.length)) break;
      combo++;
      const clear = new Map<string, Pos>();
      forced.forEach((p) => first && clear.set(key(p), p));
      const create: { pos: Pos; tile: Tile }[] = [];

      for (const run of runs) {
        run.forEach((p) => clear.set(key(p), p));
        if (run.length >= 4) {
          // special us jagah banta hai jahan player ne swap kiya (warna run ke beech)
          const at = (first && run.find((p) => swapped.some((s) => s.r === p.r && s.c === p.c))) || run[Math.floor(run.length / 2)];
          const mood = this.board[at.r][at.c]!.mood!;
          const horizontal = run[0].r === run[1].r;
          create.push({
            pos: at,
            tile: run.length >= 5 ? { id: this.nextId++, mood: null, special: "bomb" } : { id: this.nextId++, mood, special: horizontal ? "row" : "col" },
          });
        }
      }

      // specials jo saaf ho rahe hain unka asar (chain reaction)
      const queue = [...clear.values()];
      while (queue.length) {
        const p = queue.pop()!;
        const t = this.board[p.r][p.c];
        if (!t?.special || t.special === "bomb") continue;
        for (let i = 0; i < SIZE; i++) {
          const q = t.special === "row" ? { r: p.r, c: i } : { r: i, c: p.c };
          if (!clear.has(key(q)) && this.board[q.r][q.c]) {
            clear.set(key(q), q);
            queue.push(q);
          }
        }
      }

      const cleared: Step["cleared"] = [];
      const cloudHits = new Set<string>();
      for (const p of clear.values()) {
        const t = this.board[p.r][p.c];
        if (!t) continue;
        // 🔒 lock pehli dafa sirf toot-ta hai, tile rehti hai
        if (t.lock) {
          t.lock = false;
          tally.locks++;
          tally.score += 20;
          continue;
        }
        if (t.cloud) {
          t.cloud = false;
          tally.clouds++;
        }
        cleared.push({ pos: p, tile: { ...t } });
        if (t.mood) tally.moods[t.mood]++;
        tally.score += 10 * combo;
        this.board[p.r][p.c] = null;
        for (const n of neighbours(p)) cloudHits.add(key(n));
      }
      for (const k of cloudHits) {
        const p = unkey(k);
        const t = this.board[p.r][p.c];
        if (t?.cloud) {
          t.cloud = false;
          tally.clouds++;
          tally.score += 20;
        }
      }
      for (const s of create) {
        if (!this.board[s.pos.r][s.pos.c]) this.board[s.pos.r][s.pos.c] = s.tile;
      }
      this.gravity();
      steps.push({ board: Game.clone(this.board), cleared, combo });
      first = false;
      if (combo > 30) break; // safety
    }
    if (!this.hasMove()) {
      this.shuffle();
      steps.push({ board: Game.clone(this.board), cleared: [], combo: 0 });
    }
    return steps;
  }

  private gravity() {
    for (let c = 0; c < SIZE; c++) {
      let write = SIZE - 1;
      for (let r = SIZE - 1; r >= 0; r--) {
        const t = this.board[r][c];
        if (t) {
          this.board[r][c] = null;
          this.board[write][c] = t;
          write--;
        }
      }
      for (let r = write; r >= 0; r--) this.board[r][c] = this.tile(this.pick());
    }
  }
}

export const key = (p: Pos) => `${p.r},${p.c}`;
export const unkey = (k: string): Pos => {
  const [r, c] = k.split(",").map(Number);
  return { r, c };
};
const neighbours = (p: Pos): Pos[] =>
  [
    { r: p.r - 1, c: p.c },
    { r: p.r + 1, c: p.c },
    { r: p.r, c: p.c - 1 },
    { r: p.r, c: p.c + 1 },
  ].filter((q) => q.r >= 0 && q.r < SIZE && q.c >= 0 && q.c < SIZE);

export const emptyTally = (): Tally => ({ moods: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, clouds: 0, locks: 0, score: 0 });
