'use client'

export interface RadarAxis {
  key: string
  label: string
  value: number // 1-5
}

interface RadarChartProps {
  axes: RadarAxis[]
  size?: number
  className?: string
}

export function RadarChart({ axes, size = 280, className }: RadarChartProps) {
  if (axes.length < 3) return null

  const padding = 90 // room for labels on all sides
  const viewSize = size + padding * 2
  const cx = viewSize / 2
  const cy = viewSize / 2
  const maxRadius = size * 0.38
  const labelOffset = 28
  const N = axes.length
  const levels = [1, 2, 3, 4, 5]

  const getAngle = (i: number) => (2 * Math.PI * i) / N - Math.PI / 2

  const getPoint = (i: number, value: number) => {
    const angle = getAngle(i)
    const normalized = (value - 1) / 4 // 1->0, 5->1
    const r = maxRadius * normalized
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    }
  }

  const polygonPoints = (level: number) =>
    axes.map((_, i) => {
      const { x, y } = getPoint(i, level)
      return `${x},${y}`
    }).join(' ')

  const dataPoints = axes.map((axis, i) => {
    const { x, y } = getPoint(i, axis.value)
    return `${x},${y}`
  }).join(' ')

  const getTextAnchor = (i: number): 'start' | 'middle' | 'end' => {
    const angle = getAngle(i)
    const cosA = Math.cos(angle)
    if (cosA > 0.3) return 'start'
    if (cosA < -0.3) return 'end'
    return 'middle'
  }

  const getDy = (i: number): number => {
    const angle = getAngle(i)
    const sinA = Math.sin(angle)
    if (sinA < -0.5) return -6 // top labels: shift up
    if (sinA > 0.5) return 8   // bottom labels: shift down
    return 0
  }

  return (
    <div className={`w-full ${className || ''}`}>
      <svg viewBox={`0 0 ${viewSize} ${viewSize}`} className="w-full max-w-140 mx-auto">
        {/* Grid polygons */}
        {levels.map(level => (
          <polygon
            key={`grid-${level}`}
            points={polygonPoints(level)}
            fill="none"
            stroke="currentColor"
            strokeOpacity={level === 5 ? 0.3 : 0.12}
            strokeWidth={level === 5 ? 1.5 : 0.75}
            className="text-stone-400 dark:text-stone-600"
          />
        ))}

        {/* Axis lines */}
        {axes.map((_, i) => {
          const outer = getPoint(i, 5)
          return (
            <line
              key={`axis-${i}`}
              x1={cx} y1={cy}
              x2={outer.x} y2={outer.y}
              stroke="currentColor"
              strokeOpacity={0.25}
              strokeWidth={1}
              className="text-stone-400 dark:text-stone-600"
            />
          )
        })}

        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill="currentColor"
          fillOpacity={0.15}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
          className="text-cyan-500 dark:text-cyan-400"
        />

        {/* Score dots */}
        {axes.map((axis, i) => {
          const { x, y } = getPoint(i, axis.value)
          return (
            <circle
              key={`dot-${i}`}
              cx={x} cy={y} r={3.5}
              fill="currentColor"
              className="text-cyan-600 dark:text-cyan-400"
            />
          )
        })}

        {/* Labels + scores */}
        {axes.map((axis, i) => {
          const angle = getAngle(i)
          const lx = cx + (maxRadius + labelOffset) * Math.cos(angle)
          const ly = cy + (maxRadius + labelOffset) * Math.sin(angle) + getDy(i)
          return (
            <g key={`label-${i}`}>
              <text
                x={lx} y={ly}
                textAnchor={getTextAnchor(i)}
                dominantBaseline="central"
                className="fill-stone-800 dark:fill-stone-200"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                {axis.label}
              </text>
              <text
                x={lx} y={ly + 15}
                textAnchor={getTextAnchor(i)}
                dominantBaseline="central"
                className="fill-cyan-600 dark:fill-cyan-300"
                style={{ fontSize: '12px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
              >
                {axis.value.toFixed(1)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
