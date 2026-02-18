const SkeletonLoader = ({ className = '', variant = 'card' }) => {
  if (variant === 'card') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-none p-6 shadow-soft ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-none"></div>
            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-none"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-none p-6 shadow-soft ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}></div>
  );
};

export default SkeletonLoader;

