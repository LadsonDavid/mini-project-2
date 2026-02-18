import { useState, useEffect } from 'react';
import { useBluetooth } from '../context/BluetoothContext'; // New import
import { useWebSocket } from '../hooks/useWebSocket';
import { useAppContext } from '../context/AppContext';
import { api, WS_URL } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StatusBar from '../components/StatusBar';
import SensorCard from '../components/SensorCard';
import VibrationControl from '../components/VibrationControl';
import MusicPlayer from '../components/MusicPlayer';
import GamesModule from '../components/games/GamesModule';
import FloatingChatWidget from '../components/FloatingChatWidget';
import ChartCard from '../components/ChartCard';
import NotificationToast from '../components/NotificationToast';
import { Favorite as Heart, Thermostat as Thermometer, Psychology as Brain, Error as AlertCircle, CheckCircle, ExpandMore as ChevronDown, ExpandLess as ChevronUp, Close as X, BluetoothDisabled } from '@mui/icons-material';

const Dashboard = () => {
  const { addNotification, addMessage, messages } = useAppContext();
  const { isConnected: isBluetoothConnected, connect: connectBluetooth } = useBluetooth(); // Use Bluetooth Context

  const [sensorData, setSensorData] = useState({
    heartRate: 0,
    temperature: 0,
    vibrationLevel: 0,
    timestamp: null,
  });
  const [prevSensorData, setPrevSensorData] = useState({
    heartRate: 0,
    temperature: 0,
    vibrationLevel: 0,
  });
  const [trends, setTrends] = useState({
    heartRate: 0,
    temperature: 0,
    vibrationLevel: 0,
  });

  // Keep existing deviceConnected for WebSocket ESP32 backend connection
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [showCharts, setShowCharts] = useState(false);

  // Handle WebSocket messages from backend
  const handleWebSocketMessage = (data) => {
    // Only log important messages (not sensor data to reduce console noise)
    if (data.type !== 'sensorData') {
      console.log('[WebSocket]', data.type, data);
    }

    switch (data.type) {
      case 'initialData':
        setSensorData(data.data);
        setDeviceConnected(data.deviceConnected);
        break;

      case 'sensorData':
        setSensorData(data.data);
        break;

      case 'deviceStatus':
        setDeviceConnected(data.connected);
        if (data.connected) {
          addNotification('ESP32 device connected via Backend', 'success');
        } else {
          addNotification('ESP32 device disconnected from Backend', 'warning');
        }
        break;

      case 'esp32Message':
        addMessage(data.message, 'esp32');
        addNotification(`ESP32: ${data.message}`, 'info');
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  // Connect to backend WebSocket
  const { isConnected, sendCommand } = useWebSocket(WS_URL, handleWebSocketMessage);

  // Calculate trends when sensor data updates
  useEffect(() => {
    if (sensorData.heartRate !== 0 && prevSensorData.heartRate !== 0) {
      setTrends({
        heartRate: ((sensorData.heartRate - prevSensorData.heartRate) / prevSensorData.heartRate) * 100,
        temperature: ((sensorData.temperature - prevSensorData.temperature) / prevSensorData.temperature) * 100,
        vibrationLevel: ((sensorData.vibrationLevel - prevSensorData.vibrationLevel) / (prevSensorData.vibrationLevel || 1)) * 100,
      });
    }
    setPrevSensorData(sensorData);
  }, [sensorData]);

  // Check if all vitals are normal
  const allNormal = sensorData.heartRate > 0 &&
    sensorData.heartRate >= 60 && sensorData.heartRate <= 100 &&
    sensorData.temperature >= 36 && sensorData.temperature <= 37.5;

  // Persist warning dismissal
  useEffect(() => {
    const dismissed = localStorage.getItem('warningDismissed');
    if (dismissed === 'true') {
      setShowWarning(false);
    }
  }, []);

  // Prevent auto-scroll on page load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  const dismissWarning = () => {
    setShowWarning(false);
    localStorage.setItem('warningDismissed', 'true');
  };

  const handleSendVibration = async ({ level, duration }) => {
    try {
      const result = await api.vibrate(level, duration);
      if (result.success) {
        addNotification(`Vibration sent: ${result.message}`, 'success');
      } else {
        addNotification(result.error || 'Failed to send vibration', 'error');
      }
    } catch (error) {
      const errorMessage = error.message || 'Error sending vibration command';
      addNotification(errorMessage, 'error');
      console.error('Vibration error:', error);
    }
  };

  const handleSendMessage = async (message) => {
    try {
      addMessage(message, 'user');
      const result = await api.sendMessage(message);
      if (result.success) {
        addNotification('Message sent to ESP32', 'success');
      } else {
        addNotification(result.error || 'Failed to send message', 'error');
      }
    } catch (error) {
      const errorMessage = error.message || 'Error sending message';
      addNotification(errorMessage, 'error');
      console.error('Message send error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Notification Toast */}
      <NotificationToast />

      {/* Header with Bluetooth prop removed (handled internally by Header) */}
      <Header />

      <main className="flex-1 container mx-auto px-3 sm:px-6 lg:px-10" role="main" aria-label="Health Dashboard" style={{ paddingTop: '70px', paddingBottom: '80px' }}>

        {/* Bluetooth Disconnection Warning */}
        {!isBluetoothConnected && showWarning && (
          <div className="animate-fade-in-down" style={{ animationDuration: '300ms', marginBottom: 'var(--space-4)' }}>
            <div className="relative overflow-hidden" style={{
              width: '100%',
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid #3b82f6', // Blue for Bluetooth
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-none bg-blue-500/20 flex items-center justify-center relative">
                  <BluetoothDisabled className="w-5 h-5 animate-pulse" style={{ color: '#3b82f6' }} />
                </div>
              </div>
              <div className="relative flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base" style={{ color: '#3b82f6' }}>
                    Connect Smart Headband
                  </h3>
                </div>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Pair your device to receive real-time brainwave and sensor data.
                </p>
                <button
                  onClick={connectBluetooth}
                  className="px-3 py-1.5 rounded-none text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer"
                >
                  Connect Now
                </button>
              </div>
              <button
                onClick={dismissWarning}
                className="relative flex-shrink-0 p-1 hover:bg-white/10 rounded-none transition-colors"
                aria-label="Dismiss warning"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Backend Connection Status Banner */}
        {(!isConnected || !deviceConnected) && showWarning && (
          <div className="animate-fade-in-down" style={{ animationDuration: '300ms', marginBottom: 'var(--space-4)' }}>
            <div className="relative overflow-hidden" style={{
              width: '100%',
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--color-alert)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              {/* Solid pulse background */}
              <div className="absolute inset-0 bg-orange-500/5 animate-pulse" style={{ animationDuration: '2s' }}></div>

              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-none bg-[var(--color-alert)]/20 flex items-center justify-center relative">
                  <AlertCircle className="w-5 h-5 animate-pulse" style={{ color: 'var(--color-alert)' }} />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-none h-3 w-3 bg-orange-500"></span>
                  </span>
                </div>
              </div>
              <div className="relative flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base" style={{ color: 'var(--color-alert)' }}>
                    {!isConnected ? 'Backend Server Offline' : 'Backend Device Lost'}
                  </h3>
                  {deviceConnected && !isConnected && (
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-medium">
                      Reconnecting...
                    </span>
                  )}
                </div>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {!isConnected
                    ? 'Start the backend server to enable real-time monitoring and device control.'
                    : 'ESP32 device disconnected from backend. Using demo mode.'}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <code className="px-3 py-1.5 rounded-none text-xs font-mono border transition-all hover:bg-white/5" style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-medium)'
                  }}>
                    {!isConnected ? '$ cd backend && npm run dev' : '✓ Running in Demo Mode'}
                  </code>
                </div>
              </div>
              <button
                onClick={dismissWarning}
                className="relative flex-shrink-0 p-1 hover:bg-white/10 rounded-none transition-colors"
                aria-label="Dismiss warning"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Health Summary Banner */}
        {(isConnected && deviceConnected || isBluetoothConnected) && sensorData.heartRate > 0 && (
          <div className="animate-fade-in-down" style={{ animationDuration: '300ms', marginBottom: 'var(--space-4)' }}>
            <div className="flex items-center justify-between p-5 rounded-none border premium-card" style={{
              backgroundColor: allNormal ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
              borderColor: allNormal ? 'rgba(16, 185, 129, 0.3)' : 'rgba(251, 191, 36, 0.3)'
            }}>
              <div className="flex items-center gap-3">
                {allNormal ? (
                  <CheckCircle className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                ) : (
                  <AlertCircle className="w-6 h-6" style={{ color: '#D97706' }} />
                )}
                <div>
                  <h3 className="font-semibold" style={{ color: allNormal ? 'var(--color-success)' : '#D97706' }}>
                    {allNormal ? "All systems normal" : "Some metrics need attention"}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {allNormal
                      ? "You're doing great! Keep it up."
                      : "Review your vitals and consult a healthcare provider if needed."}
                  </p>
                </div>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Hero Sensor Cards with Integrated Trends */}
        <section aria-label="Vital Signs" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 className="section-header">Vitals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 animate-fade-in-up">

            <SensorCard
              title="Heart Rate"
              value={sensorData.heartRate}
              unit="BPM"
              type="heart_rate"
              icon={Heart}
              trend={trends.heartRate}
            />
            <SensorCard
              title="Temperature"
              value={sensorData.temperature}
              unit="°C"
              type="temperature"
              icon={Thermometer}
              trend={trends.temperature}
            />
            <SensorCard
              title="Vibration Level"
              value={sensorData.vibrationLevel * 33.33}
              unit="%"
              type="eeg"
              icon={Brain}
              trend={trends.vibrationLevel}
            />
          </div>
        </section>

        {/* Collapsible Charts Section */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="w-full flex items-center justify-between p-4 premium-card rounded-none transition-all duration-200 group"
            style={{ background: 'var(--color-card)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-primary flex items-center justify-center">
                {showCharts ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Advanced analytics</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Historical trends and detailed charts</p>
              </div>
            </div>
            <span className="text-xs transition-colors" style={{ color: 'var(--text-tertiary)' }}>
              {showCharts ? 'Hide' : 'Show'}
            </span>
          </button>

          {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 animate-fade-in-up">
              <ChartCard
                title="Heart Rate Trend"
                data={sensorData.heartRate}
                color="#ef4444"
                unit="BPM"
              />
              <ChartCard
                title="Temperature Trend"
                data={sensorData.temperature}
                color="#f59e0b"
                unit="°C"
              />
              <ChartCard
                title="Vibration Trend"
                data={sensorData.vibrationLevel}
                color="#6366f1"
                unit=""
              />
            </div>
          )}
        </div>

        {/* Therapeutic Controls */}
        <section aria-label="Therapeutic Controls" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 className="section-header">Therapy controls</h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <VibrationControl onSendVibration={handleSendVibration} />
          </div>
        </section>

        {/* Music Therapy */}
        <section aria-label="Music Therapy" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 className="section-header">Music therapy</h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <MusicPlayer />
          </div>
        </section>

        {/* Wellness Games */}
        <section aria-label="Wellness Games" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 className="section-header">Wellness games</h2>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <GamesModule />
          </div>
        </section>

      </main>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />

      <StatusBar isConnected={isConnected} deviceConnected={deviceConnected} />
    </div>
  );
};

export default Dashboard;

