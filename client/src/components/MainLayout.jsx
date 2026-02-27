import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import NotificationToast from './NotificationToast';
import FloatingChatWidget from './FloatingChatWidget';
import StatusBar from './StatusBar';
import { useWebSocket } from '../hooks/useWebSocket';
import { WS_URL } from '../utils/api';
import { useAppContext } from '../context/AppContext';

const MainLayout = () => {
    const { addNotification, addMessage } = useAppContext();

    // Handle WebSocket messages from backend
    const handleWebSocketMessage = (data) => {
        switch (data.type) {
            case 'initialData':
                // Data handled via context or direct component subscription if needed
                break;
            case 'sensorData':
                // Broadcasted or handled in hooks
                break;
            case 'deviceStatus':
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
                break;
        }
    };

    const { isConnected, deviceConnected } = useWebSocket(WS_URL, handleWebSocketMessage);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
            <NotificationToast />
            <Header />

            <main className="flex-1 container mx-auto px-4 max-w-7xl pt-[80px] pb-[100px]">
                <Outlet />
            </main>

            <FloatingChatWidget />
            <BottomNav />
            <StatusBar isConnected={isConnected} deviceConnected={deviceConnected} />
        </div>
    );
};

export default MainLayout;
