// Opacity of the accent color per heatmap activity level; 0 = empty cell.
export const LEVELS = [0, 0.3, 0.55, 0.8, 1];

export function cellStyle(accent: string, level: number) {
  return level === 0 ? undefined : { backgroundColor: accent, opacity: LEVELS[level] };
}
