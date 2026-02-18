import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useBluetooth } from '../context/BluetoothContext';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import BluetoothDisabledIcon from '@mui/icons-material/BluetoothDisabled';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { isConnected, isConnecting, connect, disconnect, error } = useBluetooth();
  const [showGuide, setShowGuide] = useState(false);

  // Directly connect if already connected (to disconnect)
  // Show guide if not connected
  const handleConnectClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      setShowGuide(true);
    }
  };

  const startScanning = async () => {
    setShowGuide(false);
    await connect();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--color-bg)] border-b border-[var(--border-subtle)]">
        <div className="container mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-14">

            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <img
                src="/smart-headband-favicon.svg"
                alt="Smart Headband Logo"
                className="w-8 h-8 object-contain"
              />

              {/* Title - Sentence Case */}
              <div className="hidden sm:block">
                <h1 className="text-title text-[var(--text-primary)]">
                  Smart Headband
                </h1>
                <p className="text-xs text-[var(--text-tertiary)] font-normal">
                  Real-time health monitoring
                </p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">

              {/* Error Message (if any) */}
              {error && (
                <span className="text-red-500 text-xs hidden sm:inline mr-2">
                  {error}
                </span>
              )}

              {/* Status Pill */}
              <button
                onClick={handleConnectClick}
                disabled={isConnecting}
                className={`status-pill ${isConnected ? 'status-pill-connected' : 'status-pill-offline'} cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2`}
                title={isConnected ? "Disconnect" : "Connect Device"}
              >
                {isConnecting ? (
                  <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
                ) : (
                  <span className={`status-indicator ${isConnected ? 'status-indicator-pulse' : ''}`}></span>
                )}

                <span className="hidden sm:inline font-medium">
                  {isConnecting ? 'Connecting...' : (isConnected ? 'Connected' : 'Connect')}
                </span>

                {/* Mobile Icon */}
                <span className="sm:hidden">
                  {isConnected ? <BluetoothIcon fontSize="small" /> : <BluetoothDisabledIcon fontSize="small" />}
                </span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-none bg-white/5 hover:bg-white/10 transition-all var(--transition-fast) border border-[var(--border-subtle)] hover:border-[var(--border-medium)]"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <DarkModeIcon sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
                ) : (
                  <LightModeIcon sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Connection Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--color-card)] border border-[var(--border-subtle)] rounded-lg shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <BluetoothIcon className="text-blue-500" />
              Connect Headband
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <p className="text-sm text-[var(--text-secondary)]">Ensure your Smart Headband is turned on and in pairing mode (LED blinking).</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <p className="text-sm text-[var(--text-secondary)]">Click "Start Scan" below to open the browser dialog.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <p className="text-sm text-[var(--text-secondary)]">Select <strong className="text-[var(--text-primary)]">"Smart Headband"</strong> from the list and click Pair.</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={startScanning}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 shadow-lg hover:shadow-blue-500/25"
                style={{ cursor: 'pointer' }}
              >
                <BluetoothIcon fontSize="small" />
                Start Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
