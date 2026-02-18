// ESP32 Serial to WebSocket Bridge
// Connect ESP32 via USB → Read serial data → Forward to WebSocket backend
// Usage: node esp32-serial-bridge.js [COM_PORT]

import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import WebSocket from 'ws';

const WS_URL = 'ws://localhost:8080/esp32';
const BAUD_RATE = 115200;

// Get COM port from command line or use default
const COM_PORT = process.argv[2] || 'COM3'; // Windows: COM3, Linux: /dev/ttyUSB0, Mac: /dev/cu.usbserial

console.log('=====================================');
console.log('ESP32 Serial → WebSocket Bridge');
console.log('=====================================');
console.log(`COM Port: ${COM_PORT}`);
console.log(`Baud Rate: ${BAUD_RATE}`);
console.log(`WebSocket: ${WS_URL}`);
console.log('=====================================\n');

let ws = null;
let serialPort = null;

// Initialize WebSocket connection
function connectWebSocket() {
  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('✅ Connected to backend WebSocket');
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📩 Received from backend:', message);

      // Forward commands to ESP32
      if (message.type === 'command') {
        const serialCommand = JSON.stringify(message) + '\n';
        if (serialPort && serialPort.isOpen) {
          serialPort.write(serialCommand, (err) => {
            if (err) {
              console.error('❌ Error writing to serial:', err.message);
            } else {
              console.log('📤 Sent to ESP32:', serialCommand.trim());
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });

  ws.on('close', () => {
    console.log('⚠️ WebSocket closed. Reconnecting in 3s...');
    setTimeout(connectWebSocket, 3000);
  });
}

// Initialize Serial Port
function connectSerial() {
  try {
    serialPort = new SerialPort({
      path: COM_PORT,
      baudRate: BAUD_RATE,
      autoOpen: false,
    });

    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    serialPort.open((err) => {
      if (err) {
        console.error('❌ Error opening serial port:', err.message);
        console.log('\n💡 TIPS:');
        console.log('  - Check if ESP32 is connected via USB');
        console.log('  - Verify COM port (Windows: Device Manager, Linux: ls /dev/tty*)');
        console.log('  - Close Arduino IDE Serial Monitor');
        console.log('  - Run: node esp32-serial-bridge.js COM4 (your correct port)\n');
        process.exit(1);
      }

      console.log('✅ Serial port opened successfully\n');
      console.log('Waiting for ESP32 data...\n');
    });

    parser.on('data', (line) => {
      try {
        const trimmed = line.trim();
        console.log('📥 ESP32:', trimmed);

        // Try to parse as JSON
        const data = JSON.parse(trimmed);

        // Forward sensor data to backend
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'sensorData',
            ...data,
          }));
        }
      } catch (error) {
        // Not JSON, treat as plain message
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'message',
            content: line.trim(),
          }));
        }
      }
    });

    serialPort.on('error', (err) => {
      console.error('❌ Serial port error:', err.message);
    });

    serialPort.on('close', () => {
      console.log('⚠️ Serial port closed');
    });
  } catch (error) {
    console.error('❌ Error initializing serial port:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down bridge...');
  
  if (serialPort && serialPort.isOpen) {
    serialPort.close();
  }
  
  if (ws) {
    ws.close();
  }
  
  console.log('✅ Bridge closed');
  process.exit(0);
});

// Start connections
connectWebSocket();
connectSerial();

