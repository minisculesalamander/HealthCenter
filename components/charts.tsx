export function VerticalBars({
  points,
  ariaLabel,
}: {
  points: { label: string; value: number; display: string }[];
  ariaLabel: string;
}) {
  const max = Math.max(1, ...points.map((point) => point.value));
  return (
    <div className="bars" role="img" aria-label={ariaLabel}>
      {points.map((point) => (
        <div className="bar" key={point.label}>
          <div className="bar-value">{point.display}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${point.value <= 0 ? 0 : Math.max(6, (point.value / max) * 100)}%` }}
            />
          </div>
          <div className="bar-label">{point.label}</div>
        </div>
      ))}
    </div>
  );
}

export function HorizontalBars({
  rows,
  ariaLabel,
}: {
  rows: { label: string; value: number; display: string }[];
  ariaLabel: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <div className="hbars" role="img" aria-label={ariaLabel}>
      {rows.map((row) => (
        <div className="hbar" key={row.label}>
          <div className="hbar-label">{row.label}</div>
          <div className="hbar-track">
            <div className="hbar-fill" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
          <div className="hbar-value">{row.display}</div>
        </div>
      ))}
    </div>
  );
}

export function TrendChart({
  points,
  ariaLabel,
}: {
  points: { label: string; value: number | null }[];
  ariaLabel: string;
}) {
  const usable = points.flatMap((point) => (point.value === null ? [] : [point.value]));
  if (usable.length === 0) {
    return <p className="quiet">Log a weighted working set to draw this trend.</p>;
  }
  const min = Math.min(...usable);
  const max = Math.max(...usable);
  const span = max - min || Math.max(Math.abs(max) * 0.25, 1);
  const yMin = min - span * 0.2;
  const yMax = max + span * 0.2;
  const width = 640;
  const height = 220;
  const padX = 18;
  const padY = 18;
  const coords = points.flatMap((point, index) => {
    if (point.value === null) return [];
    const x = points.length === 1 ? width / 2 : padX + (index * (width - padX * 2)) / (points.length - 1);
    const y = padY + ((yMax - point.value) / (yMax - yMin)) * (height - padY * 2);
    return [{ x, y, label: point.label, value: point.value }];
  });
  const path = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  return (
    <svg className="trend" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
      <path d={path} />
      {coords.map((point) => (
        <g key={`${point.label}-${point.x}`}>
          <circle cx={point.x} cy={point.y} r="5" />
          <text x={point.x} y={height - 2} textAnchor="middle">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
