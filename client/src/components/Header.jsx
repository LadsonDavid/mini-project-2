import { useTheme } from '../hooks/useTheme';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const Header = ({ isConnected }) => {
  const { theme, toggleTheme } = useTheme();

  return (
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

            {/* Professional Status Pill */}
            <div className={`status-pill ${isConnected ? 'status-pill-connected' : 'status-pill-offline'}`}>
              <span className={`status-indicator ${isConnected ? 'status-indicator-pulse' : ''}`}></span>
              <span className="hidden sm:inline">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* Theme toggle */}
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

      {/* Animated bottom border */}

    </header>
  );
};

export default Header;

