/**
 * Bluetooth Service
 * Handles direct interactions with the Web Bluetooth API.
 * 
 * Note: specific service UUIDs should be replaced with the actual 
 * UUIDs of the Smart Headband once known. For now, we use 
 * 'battery_service' as a standard test case.
 */

// UUIDs for the Smart Headband services - REPLACE THESE with actual device UUIDs
// Using standard Battery Service for demonstration/testing compatibility
export const HEADBAND_SERVICE_UUID = 'battery_service';
export const HEADBAND_CHARACTERISTIC_UUID = 'battery_level';

class BluetoothService {
    constructor() {
        this.device = null;
        this.server = null;
    }

    /**
     * Request a Bluetooth device and connect to it
     * @returns {Promise<BluetoothDevice>} The connected device
     */
    async connect() {
        if (!navigator.bluetooth) {
            throw new Error('Web Bluetooth API is not available in this browser.');
        }

        try {
            console.log('Requesting Bluetooth Device...');

            // Request device with specific filters
            // Filtering for devices starting with "Smart" to avoid "Unknown Device" clutter
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'Smart' }],
                optionalServices: [HEADBAND_SERVICE_UUID] // Required to access service later
            });

            console.log('> Name:      ' + this.device.name);
            console.log('> Id:        ' + this.device.id);
            console.log('> Connected: ' + this.device.gatt.connected);

            // Connect to GATT Server
            console.log('Connecting to GATT Server...');
            this.server = await this.device.gatt.connect();

            console.log('Connected to ' + this.device.name);
            return this.device;
        } catch (error) {
            console.log('Argh! ' + error);
            throw error;
        }
    }

    /**
     * Disconnect from the current device
     */
    disconnect() {
        if (this.device && this.device.gatt.connected) {
            this.device.gatt.disconnect();
            console.log('Device disconnected');
        }
        this.device = null;
        this.server = null;
    }

    /**
     * Check if currently connected
     * @returns {boolean}
     */
    isConnected() {
        return this.device && this.device.gatt.connected;
    }

    /**
     * Example method to read battery level
     */
    async readBatteryLevel() {
        if (!this.server) throw new Error('Not connected');

        try {
            const service = await this.server.getPrimaryService(HEADBAND_SERVICE_UUID);
            const characteristic = await service.getCharacteristic(HEADBAND_CHARACTERISTIC_UUID);
            const value = await characteristic.readValue();
            return value.getUint8(0);
        } catch (error) {
            console.error('Error reading battery level:', error);
            throw error;
        }
    }
}

export const bluetoothService = new BluetoothService();
