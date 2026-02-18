import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

const NotificationToast = () => {
  const { notifications, removeNotification } = useAppContext();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const Toast = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircleIcon sx={{ fontSize: 20 }} />,
    error: <ErrorIcon sx={{ fontSize: 20 }} />,
    warning: <WarningIcon sx={{ fontSize: 20 }} />,
    info: <InfoIcon sx={{ fontSize: 20 }} />,
  };

  const colors = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400',
  };

  return (
    <div
      className={`
        ${colors[notification.type]}
        border-l-4 p-4 rounded-none shadow-large backdrop-blur-md
        animate-slide-in-right
        transform transition-all duration-300 hover:scale-105
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {icons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {notification.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;

