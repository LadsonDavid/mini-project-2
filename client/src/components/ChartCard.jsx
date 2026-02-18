import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const ChartCard = ({ title, data, color = '#0ea5e9', unit = '' }) => {
  const [dataPoints, setDataPoints] = useState([]);
  const [trend, setTrend] = useState(0);
  const maxDataPoints = 50;

  useEffect(() => {
    setDataPoints((prev) => {
      const newPoints = [
        ...prev,
        {
          value: data,
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
        },
      ];
      if (newPoints.length > maxDataPoints) {
        newPoints.shift();
      }

      // Calculate trend
      if (newPoints.length >= 2) {
        const lastValue = newPoints[newPoints.length - 1].value;
        const prevValue = newPoints[newPoints.length - 2].value;
        setTrend(((lastValue - prevValue) / prevValue) * 100);
      }

      return newPoints;
    });
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="premium-card px-3 py-2 shadow-lg">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {payload[0].value.toFixed(1)} {unit}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {payload[0].payload.time}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="group relative overflow-hidden animate-fade-in-up h-full">
      {/* Modern chart card */}
      <div className="relative premium-card h-full flex flex-col p-6 transition-all duration-300">

        {/* Professional Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-label mb-2" style={{ color: 'var(--text-secondary)' }}>
              {title}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-metric" style={{ color: 'var(--text-primary)' }}>
                {data.toFixed(1)}
              </span>
              <span className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {unit}
              </span>
            </div>
          </div>

          {/* Professional trend badge */}
          {dataPoints.length >= 2 && !isNaN(trend) && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold ${trend > 0
              ? 'status-pill-connected'
              : 'status-pill-offline'
              }`}>
              {trend > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {Math.abs(trend).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Professional Chart */}
        <div className="relative flex-1">
          {dataPoints.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Waiting for data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={dataPoints}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill={color}
                  fillOpacity={0.1}
                  dot={false}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Professional Footer */}
        <div className="mt-4 flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{dataPoints.length} / {maxDataPoints} samples</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-none" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)'
          }}>
            <div className="w-2 h-2 rounded-none status-indicator-pulse"
              style={{ backgroundColor: color }}></div>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;

