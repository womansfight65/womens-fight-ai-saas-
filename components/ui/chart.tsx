/** Small, dependency-free line charts. Every point comes from a real row — nothing here is smoothed or invented. */

interface Point {
  date: string;
  value: number;
}

function buildPath(points: Point[], width: number, height: number, max: number, padding: number): string {
  if (points.length < 2) return '';
  const step = (width - padding * 2) / (points.length - 1);
  return points
    .map((p, i) => {
      const x = padding + i * step;
      const y = height - padding - (max > 0 ? (p.value / max) * (height - padding * 2) : 0);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function Sparkline({
  points,
  color,
  height = 56,
}: {
  points: Point[];
  color: string;
  height?: number;
}) {
  const width = 240;
  const padding = 4;
  const max = Math.max(...points.map((p) => p.value), 1);
  const path = buildPath(points, width, height, max, padding);

  if (points.length < 2) {
    return (
      <div className="flex items-center text-2xs text-ink-faint" style={{ height }}>
        Not enough days yet for a trend line.
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-full" preserveAspectRatio="none" aria-hidden>
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MultiLineChart({
  lines,
  height = 220,
}: {
  lines: Array<{ label: string; color: string; points: Point[] }>;
  height?: number;
}) {
  const width = 900;
  const padding = 24;

  /* Every line is re-plotted against the same shared set of dates, so two
   * platforms with data on different days still line up on the x-axis
   * instead of each stretching to fill the width on its own. */
  const allDates = [...new Set(lines.flatMap((l) => l.points.map((p) => p.date)))].sort((a, b) =>
    a.localeCompare(b),
  );
  const max = Math.max(...lines.flatMap((l) => l.points.map((p) => p.value)), 1);

  if (allDates.length < 2) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-ink-muted">
        Not enough days of data yet to draw a trend.
      </div>
    );
  }

  const aligned = lines.map((line) => {
    const byDate = new Map(line.points.map((p) => [p.date, p.value]));
    return { ...line, points: allDates.map((date) => ({ date, value: byDate.get(date) ?? 0 })) };
  });

  const gridLines = 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full" preserveAspectRatio="none">
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = padding + (i * (height - padding * 2)) / gridLines;
        return (
          <line
            key={i}
            x1={padding}
            x2={width - padding}
            y1={y}
            y2={y}
            stroke="currentColor"
            className="text-line"
            strokeWidth={1}
          />
        );
      })}
      {aligned.map((line) => (
        <path
          key={line.label}
          d={buildPath(line.points, width, height, max, padding)}
          fill="none"
          stroke={line.color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
