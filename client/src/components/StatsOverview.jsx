import { Favorite as Heart, Thermostat as Thermometer, MonitorHeart as Activity, TrendingUp } from '@mui/icons-material';

const StatsOverview = ({ sensorData }) => {

  const stats = [
    {
      label: 'Avg Heart Rate',
      value: `${sensorData.heartRate.toFixed(0)}`,
      unit: 'BPM',
      icon: Heart,
      color: 'pink',
      trend: '+2.5%',
      trendUp: true
    },
    {
      label: 'Avg Temperature',
      value: `${sensorData.temperature.toFixed(1)}`,
      unit: '°C',
      icon: Thermometer,
      color: 'orange',
      trend: '+0.3%',
      trendUp: true
    },
    {
      label: 'Vibration Level',
      value: `${sensorData.vibrationLevel.toFixed(0)}`,
      unit: '',
      icon: Activity,
      color: 'purple',
      trend: 'Medium',
      trendUp: null
    },
    {
      label: 'Session Time',
      value: '45',
      unit: 'min',
      icon: TrendingUp,
      color: 'blue',
      trend: 'Active',
      trendUp: true
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      pink: {
        bg: 'bg-pink-50 dark:bg-pink-900/20',
        text: 'text-pink-600 dark:text-pink-400',
        border: 'border-pink-200 dark:border-pink-800'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800'
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = getColorClasses(stat.color);

        return (
          <div
            key={index}
            className="group relative premium-card rounded-none p-7 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <div className={`relative w-14 h-14 rounded-none ${colorClasses.bg} flex items-center justify-center shadow-lg`}>
                  <Icon className={`w-7 h-7 ${colorClasses.text}`} />
                </div>
                {stat.trendUp !== null && (
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-none ${stat.trendUp
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg'
                    : 'bg-white/10 text-white/50 border border-white/20'
                    }`}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-label text-[#B0B0B0]">
                  {stat.label}
                </p>
                <div className="flex items-baseline space-x-2.5">
                  <span className="text-metric text-[#E6E6E6]" style={{ fontSize: '32px' }}>
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-base font-semibold text-[#B0B0B0]">
                      {stat.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;

