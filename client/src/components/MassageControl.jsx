import { useAppContext } from '../context/AppContext';
import WavesIcon from '@mui/icons-material/Waves';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const MassageControl = ({ onToggleMassage }) => {
  const { isRecording: isMassageActive, setIsRecording: setIsMassageActive } = useAppContext();

  const handleToggle = () => {
    const newState = !isMassageActive;
    setIsMassageActive(newState);

    if (onToggleMassage) {
      onToggleMassage(newState);
    }
  };

  return (
    <div className="group premium-card h-full flex flex-col p-6 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-8">
        <WavesIcon sx={{ fontSize: 28, color: 'rgb(34, 197, 94)' }} />
        <div>
          <h3 className="text-title text-[var(--text-primary)]" style={{ fontSize: '16px' }}>
            Massage session
          </h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            Continuous therapeutic patterns
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-5 rounded-none shadow-md transition-all var(--transition-base)"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)'
          }}>
          <div>
            <p className="text-label text-[var(--text-secondary)] mb-1">Session status</p>
            <div className="flex items-center gap-2">
              <p className={`text-base font-semibold transition-colors var(--transition-base) ${isMassageActive
                ? 'text-[var(--color-success)]'
                : 'text-[var(--text-muted)]'
                }`}>
                {isMassageActive ? 'Active session' : 'Ready when you are'}
              </p>
              {isMassageActive && (
                <span className="w-2 h-2 rounded-none bg-[var(--color-success)] status-glow"></span>
              )}
            </div>
          </div>
          <div
            className={`w-16 h-16 rounded-none flex items-center justify-center transition-all var(--transition-base) shadow-md ${isMassageActive
              ? 'gradient-success'
              : 'bg-white/10'
              }`}
          >
            <WavesIcon sx={{ fontSize: 32, color: isMassageActive ? 'white' : 'rgba(255,255,255,0.4)', transition: 'color 0.3s' }} />
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`w-full py-3 px-5 rounded-none font-semibold text-sm transition-all var(--transition-base) flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.01] ${isMassageActive
            ? 'gradient-danger text-white'
            : 'gradient-success text-white btn-gradient-pulse'
            }`}
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          {isMassageActive ? (
            <>
              <PauseIcon sx={{ fontSize: 18 }} />
              <span>End session</span>
            </>
          ) : (
            <>
              <PlayArrowIcon sx={{ fontSize: 18 }} />
              <span>Begin session</span>
            </>
          )}
        </button>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Designed to help you relax and unwind
        </p>
      </div>
    </div>
  );
};

export default MassageControl;

