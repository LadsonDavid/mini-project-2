import { TrendingUp, TrendingDown, Remove as Minus } from '@mui/icons-material';

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, unit, change, icon: Icon, color = 'primary' }) => {
  const getTrend = () => {
    if (change > 0) return { icon: TrendingUp, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-900/20' };
    if (change < 0) return { icon: TrendingDown, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-900/20' };
    return { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20' };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  return (
    <div className="group relative overflow-hidden">
      {/* Glassmorphism card */}
      <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-none p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
        {/* Gradient overlay */}
        {/* Solid overlay */}
        <div className={`absolute inset-0 bg-${color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

        {/* Content */}
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-none bg-${color} shadow-glow`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-none ${trend.bg}`}>
              <TrendIcon className={`w-3 h-3 ${trend.color}`} />
              <span className={`text-xs font-semibold ${trend.color}`}>
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {value.toFixed(1)}
              </span>
              <span className="text-lg text-gray-500 dark:text-gray-400">
                {unit}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

