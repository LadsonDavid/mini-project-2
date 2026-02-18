import { useState, useEffect } from 'react';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StatusBar = ({ isConnected, deviceConnected }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl bg-[var(--color-bg)]/95 border-t border-[var(--border-divider)]">
      <div className="container mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between" style={{height: '48px'}}>
          {/* Left: Device Status & Info */}
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 text-xs font-medium ${
              isConnected && deviceConnected ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
            }`}>
              {isConnected && deviceConnected ? (
                <>
                  <WifiIcon sx={{ fontSize: 14 }} />
                  <span className="hidden sm:inline">Connected to ESP32</span>
                  <span className="sm:hidden">Connected</span>
                </>
              ) : (
                <>
                  <WifiOffIcon sx={{ fontSize: 14 }} />
                  <span className="hidden sm:inline">
                    {!isConnected ? 'Backend offline' : 'Device disconnected'}
                  </span>
                  <span className="sm:hidden">Offline</span>
                </>
              )}
            </div>
            
            {/* System Info - Desktop Only */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
              <span className="opacity-50">|</span>
              <span>Device: ESP32-02</span>
              <span className="opacity-50">|</span>
              <span>Firmware v1.4.7</span>
              <span className="opacity-50">|</span>
              <span>Mode: {isConnected && deviceConnected ? 'Active' : 'Idle'}</span>
            </div>
          </div>

          {/* Right: Live Feed & Time */}
          <div className="flex items-center gap-4">
            {isConnected && deviceConnected && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                <FiberManualRecordIcon sx={{ fontSize: 12, color: 'var(--color-success)', animation: 'pulse 2s ease-in-out infinite' }} />
                <span className="hidden md:inline">Live feed</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5">
              <AccessTimeIcon sx={{ fontSize: 14, color: 'var(--text-tertiary)' }} />
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;

