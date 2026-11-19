const N = 5;

const key = (r, c) => `${r}-${c}`;

/** All 12 possible lines (5 rows, 5 columns, 2 diagonals) as arrays of "r-c" keys. */
export const ALL_LINES = (() => {
  const lines = [];
  for (let r = 0; r < N; r++) lines.push(Array.from({ length: N }, (_, c) => key(r, c)));
  for (let c = 0; c < N; c++) lines.push(Array.from({ length: N }, (_, r) => key(r, c)));
  lines.push(Array.from({ length: N }, (_, i) => key(i, i)));
  lines.push(Array.from({ length: N }, (_, i) => key(i, N - 1 - i)));
  return lines;
})();

/** Lines fully covered by the marked set (array of "r-c" keys). */
export function completedLines(marks) {
  const set = new Set(marks);
  return ALL_LINES.filter((line) => line.every((k) => set.has(k)));
}

/** Set of cell keys that belong to at least one completed line. */
export function cellsInCompletedLines(marks) {
  return new Set(completedLines(marks).flat());
}

export const cellKey = key;
