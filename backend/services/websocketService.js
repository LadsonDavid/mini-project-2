import { WebSocketServer } from 'ws';

class WebSocketService {
  constructor() {
    this.esp32Client = null;
    this.frontendClients = new Set();
    this.sensorData = {
      temperature: 0,
      heartRate: 0,
      vibrationLevel: 0,
      timestamp: Date.now(),
    };
    this.demoMode = true; // Start in demo mode by default
    this.simulatorInterval = null;
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws, req) => {
      const clientType = req.url;

      if (clientType === '/esp32') {
        this.handleESP32Connection(ws);
      } else if (clientType === '/frontend') {
        this.handleFrontendConnection(ws);
      } else {
        ws.close();
      }
    });

    console.log('WebSocket service initialized');
    
    // Start demo mode simulator
    this.startDemoMode();
  }

  handleESP32Connection(ws) {
    console.log('ESP32 connected');
    this.stopDemoMode(); // Stop simulator when real hardware connects
    this.esp32Client = ws;

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: 'connected', message: 'ESP32 connected to server' }));

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Update sensor data
        if (message.type === 'sensorData') {
          this.sensorData = {
            temperature: message.temperature || 0,
            heartRate: message.heartRate || 0,
            vibrationLevel: message.vibrationLevel || 0,
            timestamp: Date.now(),
          };

          // Broadcast to all frontend clients
          this.broadcastToFrontend({
            type: 'sensorData',
            data: this.sensorData,
          });
        }

        // Handle ESP32 messages/responses
        if (message.type === 'message') {
          this.broadcastToFrontend({
            type: 'esp32Message',
            message: message.content,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error(' Error parsing ESP32 message:', error.message);
        // Notify frontend of parsing error
        this.broadcastToFrontend({
          type: 'error',
          message: 'Invalid data received from device',
          timestamp: Date.now(),
        });
      }
    });

    ws.on('close', () => {
      console.log('  ESP32 disconnected');
      this.esp32Client = null;
      
      // Restart demo mode when hardware disconnects
      console.log(' Switching back to demo mode...');
      this.startDemoMode();
      
      // Notify frontend clients
      this.broadcastToFrontend({
        type: 'deviceStatus',
        connected: false,
        message: 'Device disconnected - switched to demo mode',
      });
    });

    ws.on('error', (error) => {
      console.error(' ESP32 WebSocket error:', error.message);
    });

    // Notify frontend clients that ESP32 is connected
    this.broadcastToFrontend({
      type: 'deviceStatus',
      connected: true,
    });
  }

  handleFrontendConnection(ws) {
    this.frontendClients.add(ws);

    // Send current sensor data and device status
    ws.send(JSON.stringify({
      type: 'initialData',
      data: this.sensorData,
      deviceConnected: this.esp32Client !== null,
    }));

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Forward commands to ESP32
        if (message.type === 'command') {
          this.sendToESP32(message);
        }
      } catch (error) {
        console.error(' Error parsing frontend message:', error.message);
        // Send error back to client
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
      }
    });

    ws.on('close', () => {
      this.frontendClients.delete(ws);
      console.log(' Frontend client disconnected (Remaining:', this.frontendClients.size + ')');
    });

    ws.on('error', (error) => {
      // Silently handle errors unless they're critical
      if (error.code !== 'ECONNRESET') {
        console.error(' Error parsing frontend WebSocket error:', error.message);
      }
      this.frontendClients.delete(ws);
    });
  }

  broadcastToFrontend(data) {
    const message = JSON.stringify(data);
    this.frontendClients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  sendToESP32(data) {
    if (this.esp32Client && this.esp32Client.readyState === 1) {
      this.esp32Client.send(JSON.stringify(data));
      return true;
    }
    console.error('ESP32 not connected');
    return false;
  }

  isESP32Connected() {
    return this.esp32Client !== null && this.esp32Client.readyState === 1;
  }

  getSensorData() {
    return this.sensorData;
  }

  // DEMO MODE: Simulate realistic sensor data
  startDemoMode() {
    if (this.simulatorInterval) {
      clearInterval(this.simulatorInterval);
    }

    this.demoMode = true;
    
    let heartRateBase = 75;
    let tempBase = 36.5;
    let stressBase = 1;
    let time = 0;

    this.simulatorInterval = setInterval(() => {
      if (this.demoMode && !this.esp32Client) {
        time += 1;
        
        // Realistic variation with smooth waves
        const heartRateVariation = Math.sin(time * 0.1) * 5 + Math.random() * 3;
        const tempVariation = Math.sin(time * 0.05) * 0.3 + Math.random() * 0.1;
        const stressVariation = Math.sin(time * 0.15) * 0.5 + Math.random() * 0.3;

        this.sensorData = {
          heartRate: Math.round(heartRateBase + heartRateVariation),
          temperature: parseFloat((tempBase + tempVariation).toFixed(1)),
          vibrationLevel: Math.max(0, Math.min(3, Math.round(stressBase + stressVariation))),
          timestamp: Date.now(),
        };

        // Broadcast to frontend clients
        this.broadcastToFrontend({
          type: 'sensorData',
          data: this.sensorData,
        });

        // Simulate occasional device messages
        if (time % 30 === 0) {
          this.broadcastToFrontend({
            type: 'esp32Message',
            message: 'System check: All sensors nominal',
            timestamp: Date.now(),
          });
        }
      }
    }, 1000); // Update every 1 second
  }

  stopDemoMode() {
    if (this.simulatorInterval) {
      clearInterval(this.simulatorInterval);
      this.simulatorInterval = null;
    }
    this.demoMode = false;
  }

  toggleDemoMode(enabled) {
    this.demoMode = enabled;
    if (enabled && !this.esp32Client) {
      this.startDemoMode();
    } else {
      this.stopDemoMode();
    }
    return this.demoMode;
  }

  isDemoMode() {
    return this.demoMode;
  }
}

export default new WebSocketService();

