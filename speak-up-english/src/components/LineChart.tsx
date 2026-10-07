interface Props {
  data: number[]
  label: string
  /** Optional shaded target band. */
  band?: [number, number]
  height?: number
}

export default function LineChart({ data, label, band, height = 140 }: Props) {
  const width = 320
  const pad = 24
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No data yet. Complete a speaking task to see your trend.</p>
  }
  const values = band ? [...data, ...band] : data
  const max = Math.max(...values) * 1.1 || 1
  const min = Math.min(0, ...values)
  const x = (i: number) => pad + (data.length === 1 ? (width - 2 * pad) / 2 : (i / (data.length - 1)) * (width - 2 * pad))
  const y = (v: number) => height - pad - ((v - min) / (max - min)) * (height - 2 * pad)
  const path = data.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')
  return (
    <figure>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={`${label}: ${data.join(', ')}`}>
        {band && (
          <rect x={pad} width={width - 2 * pad} y={y(band[1])} height={Math.max(0, y(band[0]) - y(band[1]))} fill="var(--good)" opacity={0.12} />
        )}
        <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} stroke="var(--border)" />
        <path d={path} fill="none" stroke="var(--gold)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill="var(--gold)" />
        ))}
        <text x={pad} y={14} fontSize={10} fill="var(--muted)">max {Math.round(Math.max(...data))}</text>
        <text x={width - pad} y={14} fontSize={10} fill="var(--muted)" textAnchor="end">latest {Math.round(data[data.length - 1])}</text>
      </svg>
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  )
}
