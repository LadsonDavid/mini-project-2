import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { bluetoothService } from '../services/bluetoothService';

const BluetoothContext = createContext(null);

export const BluetoothProvider = ({ children }) => {
    const [device, setDevice] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // Handle device disconnection events
    const onDisconnected = useCallback(() => {
        console.log('Device disconnected via event listener');
        setIsConnected(false);
        setDevice(null);
    }, []);

    const connect = async () => {
        setError(null);
        setIsConnecting(true);
        try {
            const connectedDevice = await bluetoothService.connect();

            // Add listener for manual disconnects (e.g. out of range)
            connectedDevice.addEventListener('gattserverdisconnected', onDisconnected);

            setDevice(connectedDevice);
            setIsConnected(true);
            return connectedDevice;
        } catch (err) {
            console.error('Connection failed:', err);
            // Ignore "User cancelled" errors as they are normal flow
            if (err.name !== 'NotFoundError' && err.message !== 'User cancelled the requestDevice() chooser.') {
                setError(err.message || 'Failed to connect to device');
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnect = () => {
        if (device) {
            // Remove listener to prevent double-firing state updates
            device.removeEventListener('gattserverdisconnected', onDisconnected);
        }
        bluetoothService.disconnect();
        setDevice(null);
        setIsConnected(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (device) {
                device.removeEventListener('gattserverdisconnected', onDisconnected);
                if (device.gatt.connected) {
                    device.gatt.disconnect();
                }
            }
        };
    }, [device, onDisconnected]);

    const value = {
        device,
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect
    };

    return (
        <BluetoothContext.Provider value={value}>
            {children}
        </BluetoothContext.Provider>
    );
};

export const useBluetooth = () => {
    const context = useContext(BluetoothContext);
    if (!context) {
        throw new Error('useBluetooth must be used within a BluetoothProvider');
    }
    return context;
};
