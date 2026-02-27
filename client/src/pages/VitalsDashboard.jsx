import { useState, useEffect, useRef } from 'react';
import { useBluetooth } from '../context/BluetoothContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAppContext } from '../context/AppContext';
import { api, WS_URL } from '../utils/api';
import SensorCard from '../components/SensorCard';
import VibrationControl from '../components/VibrationControl';
import { Favorite as Heart, Thermostat as Thermometer, Psychology as Brain, Error as AlertCircle, CheckCircle, BluetoothDisabled, Close as X } from '@mui/icons-material';

const VitalsDashboard = () => {
    const { addNotification } = useAppContext();
    const { isConnected: isBluetoothConnected, connect: connectBluetooth } = useBluetooth();

    const [sensorData, setSensorData] = useState({
        heartRate: 0,
        temperature: 0,
        vibrationLevel: 0,
        timestamp: null,
    });
    const prevSensorDataRef = useRef({
        heartRate: 0,
        temperature: 0,
        vibrationLevel: 0,
    });
    const [trends, setTrends] = useState({
        heartRate: 0,
        temperature: 0,
        vibrationLevel: 0,
    });

    // deviceConnected handled by parent or removed
    const [showWarning, setShowWarning] = useState(true);

    const handleWebSocketMessage = (data) => {
        switch (data.type) {
            case 'initialData':
                setSensorData(data.data);
                break;
            case 'sensorData':
                setSensorData(data.data);
                break;
            case 'deviceStatus':
                // deviceConnected = data.connected;
                break;
            default:
                break;
        }
    };

    useWebSocket(WS_URL, handleWebSocketMessage);

    useEffect(() => {
        const prev = prevSensorDataRef.current;
        if (sensorData.heartRate !== 0 && prev.heartRate !== 0) {
            setTrends({
                heartRate: ((sensorData.heartRate - prev.heartRate) / prev.heartRate) * 100,
                temperature: ((sensorData.temperature - prev.temperature) / prev.temperature) * 100,
                vibrationLevel: ((sensorData.vibrationLevel - prev.vibrationLevel) / (prev.vibrationLevel || 1)) * 100,
            });
        }
        prevSensorDataRef.current = sensorData;
    }, [sensorData]);

    const allNormal = sensorData.heartRate > 0 &&
        sensorData.heartRate >= 60 && sensorData.heartRate <= 100 &&
        sensorData.temperature >= 36 && sensorData.temperature <= 37.5;

    const handleSendVibration = async ({ level, duration }) => {
        try {
            const result = await api.vibrate(level, duration);
            if (result.success) {
                addNotification(`Vibration sent: ${result.message}`, 'success');
            } else {
                addNotification(result.error || 'Failed to send vibration', 'error');
            }
        } catch (error) {
            addNotification(error.message || 'Error sending vibration command', 'error');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Dynamic Connection Status Banner */}
            {!isBluetoothConnected && showWarning && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-none p-4 flex items-start gap-4">
                    <BluetoothDisabled className="text-blue-500 mt-1" />
                    <div className="flex-1">
                        <h3 className="font-bold text-blue-600 dark:text-blue-400">Device Offline</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Join your Smart Headband to start monitoring.</p>
                        <button onClick={connectBluetooth} className="mt-2 text-xs font-bold uppercase tracking-wider bg-blue-500 text-white px-3 py-1.5 hover:bg-blue-600 transition-colors">Connect</button>
                    </div>
                    <button onClick={() => setShowWarning(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                </div>
            )}

            {/* Health Status */}
            {sensorData.heartRate > 0 && (
                <div className={`p-4 border animate-slide-up ${allNormal ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-3">
                        {allNormal ? <CheckCircle className="text-emerald-500" /> : <AlertCircle className="text-amber-500" />}
                        <span className={`font-bold ${allNormal ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {allNormal ? 'All vitals within normal range' : 'Careful monitoring advised'}
                        </span>
                    </div>
                </div>
            )}

            {/* Sensor Grid */}
            <section>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary" />
                    Real-time Vitals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SensorCard title="Heart Rate" value={sensorData.heartRate} unit="BPM" type="heart_rate" icon={Heart} trend={trends.heartRate} />
                    <SensorCard title="Temperature" value={sensorData.temperature} unit="°C" type="temperature" icon={Thermometer} trend={trends.temperature} />
                    <SensorCard title="Neural Activity" value={sensorData.vibrationLevel * 33.33} unit="%" type="eeg" icon={Brain} trend={trends.vibrationLevel} />
                </div>
            </section>

            {/* Controls */}
            <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-secondary" />
                    Therapy Controls
                </h2>
                <VibrationControl onSendVibration={handleSendVibration} />
            </section>
        </div>
    );
};

export default VitalsDashboard;
