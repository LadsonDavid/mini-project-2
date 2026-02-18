const CircularProgress = ({ value, max, size = 120, strokeWidth = 8, color = '#0ea5e9', label, icon: Icon }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (value / max) * 100;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return '#ef4444'; // red
    if (percentage >= 60) return '#f59e0b'; // orange
    return color; // default
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${getColor()}40)`,
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {Icon && <Icon className="w-6 h-6 mb-1" style={{ color: getColor() }} />}
        <span className="text-2xl font-bold" style={{ color: getColor() }}>
          {value.toFixed(0)}
        </span>
        {label && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;

