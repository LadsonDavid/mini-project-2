import { useState, useRef } from 'react';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // 'off', 'all', 'one'
  const [showPlaylist, setShowPlaylist] = useState(true);
  const audioRef = useRef(null);

  const tracks = [
    {
      name: 'Weightless',
      description: "World's most relaxing song - Proven to reduce anxiety 65%",
      url: '/music/Weightless.mp3',
      color: 'from-blue-400 to-cyan-400',
    },
    {
      name: 'Alpha Waves Meditation',
      description: '432Hz frequency - Deep relaxation and headache relief',
      url: '/music/alpha-waves-meditation-432-hz-372269.mp3',
      color: 'from-purple-400 to-pink-400',
    },
    {
      name: 'Binaural Waves 11Hz',
      description: 'Alpha waves for relaxed focus and pain relief',
      url: '/music/simply-meditation-series-11hz-alpha-binaural-waves-for-relaxed-focus-8028.mp3',
      color: 'from-indigo-400 to-purple-400',
    },
    {
      name: 'River Flows in You',
      description: 'Yiruma - Gentle piano melody for stress relief',
      url: '/music/Yiruma, (이루마) - River Flows in You.mp3',
      color: 'from-cyan-400 to-teal-400',
    },
    {
      name: 'Nuvole Bianche',
      description: 'Ludovico Einaudi - Calming piano composition',
      url: '/music/Nuvole Bianche.mp3',
      color: 'from-green-400 to-emerald-400',
    },
    {
      name: 'Clair de Lune',
      description: 'Debussy - Classic relaxation masterpiece',
      url: '/music/claire-de-lune-debussy-piano-411227.mp3',
      color: 'from-blue-300 to-indigo-300',
    },
    {
      name: 'Moonlight Sonata',
      description: 'Beethoven - Soothing classical for deep calm',
      url: '/music/Classicals.de-Beethoven-Moonlight-Sonata-1.-Movement-Sonata-Nr.-14,-Op.-27,-Nr.-2.mp3',
      color: 'from-slate-400 to-blue-400',
    },
    {
      name: 'Bach Suite No. 3',
      description: 'Baroque elegance - Reduces tension and anxiety',
      url: '/music/Bach-Orchestral-Suite-no.-3-in-D-major-BWV-1068-Download-free-sheet-music(chosic.com).mp3',
      color: 'from-amber-400 to-orange-400',
    },
  ];

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrackChange = (index) => {
    setCurrentTrack(index);
    setAudioError(false);
    setIsPlaying(true);
    // Auto-play the new track
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }, 100);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.current.currentTime = percentage * duration;
    }
  };

  const handleNext = () => {
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      setCurrentTrack(randomIndex);
    } else {
      setCurrentTrack((prev) => (prev + 1) % tracks.length);
    }
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
      setIsPlaying(true);
    }
  };

  const handleTrackEnd = () => {
    if (repeat === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (repeat === 'all') {
      handleNext();
    } else {
      if (currentTrack < tracks.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    }
  };

  const toggleShuffle = () => setShuffle(!shuffle);

  const toggleRepeat = () => {
    setRepeat((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  return (
    <div className="premium-card overflow-hidden">
      {/* Now Playing Header */}
      <div className="p-5 pb-4 bg-indigo-50 dark:bg-indigo-950/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-none bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg">
              <MusicNoteIcon sx={{ fontSize: 28, color: 'white' }} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {tracks[currentTrack].name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Therapeutic Music
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="p-2 rounded-none hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
          >
            {showPlaylist ? <ExpandLessIcon sx={{ fontSize: 20 }} /> : <QueueMusicIcon sx={{ fontSize: 20 }} />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            className="w-full h-1.5 bg-gray-300 dark:bg-gray-700 rounded-none overflow-hidden cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-none transition-all duration-100"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div className="max-h-64 overflow-y-auto bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
          {tracks.map((track, index) => (
            <button
              key={index}
              onClick={() => handleTrackChange(index)}
              className={`w-full px-5 py-3.5 text-left transition-all duration-200 border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${currentTrack === index
                ? 'bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/30'
                : 'bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-none flex items-center justify-center transition-all ${currentTrack === index
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                  {currentTrack === index && isPlaying ? (
                    <PauseIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <PlayArrowIcon sx={{ fontSize: 18 }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${currentTrack === index
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-900 dark:text-gray-100'
                    }`}>
                    {track.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {track.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Player Controls */}
      <div className="p-5 pt-4 space-y-4">
        {/* Main Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-none transition-all ${shuffle ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            title="Shuffle"
          >
            <ShuffleIcon sx={{ fontSize: 20 }} />
          </button>

          <button
            onClick={handlePrevious}
            className="p-2 rounded-none text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="Previous"
          >
            <SkipPreviousIcon sx={{ fontSize: 32 }} />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-none bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon sx={{ fontSize: 32, color: 'white' }} /> : <PlayArrowIcon sx={{ fontSize: 32, color: 'white' }} />}
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-none text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="Next"
          >
            <SkipNextIcon sx={{ fontSize: 32 }} />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-none transition-all ${repeat !== 'off' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            title={repeat === 'one' ? 'Repeat One' : repeat === 'all' ? 'Repeat All' : 'Repeat Off'}
          >
            {repeat === 'one' ? <RepeatOneIcon sx={{ fontSize: 20 }} /> : <RepeatIcon sx={{ fontSize: 20 }} />}
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 px-2">
          <button onClick={toggleMute} className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Mute">
            {isMuted || volume === 0 ? <VolumeOffIcon sx={{ fontSize: 20 }} /> : <VolumeUpIcon sx={{ fontSize: 20 }} />}
          </button>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider w-full h-1.5 rounded-none appearance-none cursor-pointer"
              style={{ '--volume-percent': `${volume * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium w-10 text-right text-gray-600 dark:text-gray-400">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={tracks[currentTrack].url}
        onEnded={handleTrackEnd}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={() => {
          setAudioError(true);
          setIsPlaying(false);
        }}
      />

      {/* Error Message */}
      {audioError && (
        <p className="text-xs text-center mt-2" style={{ color: 'var(--color-alert)' }}>
          Audio unavailable (network/CORS issue) - Player UI functional for demo
        </p>
      )}
    </div>
  );
};

export default MusicPlayer;

