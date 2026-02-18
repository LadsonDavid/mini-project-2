# Smart Headband Backend Server

Node.js backend server with Express and WebSocket for Smart Headband Dashboard.

## Features

- **REST API** endpoints for device control
- **WebSocket** server for real-time communication
- **Dual WebSocket connections**: One for ESP32, one for frontend clients
- **Auto-reconnect** support
- **CORS** enabled for cross-origin requests

## Installation

```bash
cd backend
npm install
```

## Configuration

Edit `.env` file to configure the server:

```env
PORT=5000
WS_PORT=8080
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on:
- HTTP API: `http://localhost:8080/api`
- WebSocket (ESP32): `ws://localhost:8080/esp32`
- WebSocket (Frontend): `ws://localhost:8080/frontend`

## API Endpoints

### GET /health
Health check endpoint
```bash
curl http://localhost:8080/health
```

### GET /api/status
Get device connection status and current sensor data
```bash
curl http://localhost:8080/api/status
```

### POST /api/vibrate
Control vibration motor
```bash
curl -X POST http://localhost:8080/api/vibrate \
  -H "Content-Type: application/json" \
  -d '{"level": 2, "duration": 1000}'
```

Parameters:
- `level` (number): 0-3 (Off, Slow, Medium, High)
- `duration` (number): Duration in milliseconds

### POST /api/message
Send message to ESP32 display
```bash
curl -X POST http://localhost:8080/api/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Take a break"}'
```

### POST /api/massage
Toggle massage mode
```bash
curl -X POST http://localhost:8080/api/massage \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

## WebSocket Protocol

### ESP32 → Backend (Send Sensor Data)

Connect to: `ws://localhost:8080/esp32`

Send sensor data:
```json
{
  "type": "sensorData",
  "temperature": 36.5,
  "heartRate": 75,
  "vibrationLevel": 1,
  "timestamp": 1234567890
}
```

Send status message:
```json
{
  "type": "message",
  "content": "System ready"
}
```

### Backend → ESP32 (Receive Commands)

Vibration command:
```json
{
  "type": "command",
  "command": "vibrate",
  "level": 2,
  "duration": 1000
}
```

Display message command:
```json
{
  "type": "command",
  "command": "display",
  "message": "Take a break"
}
```

Massage mode command:
```json
{
  "type": "command",
  "command": "massage",
  "enabled": true
}
```

### Frontend ↔ Backend

Connect to: `ws://localhost:8080/frontend`

Frontend automatically receives:
- Initial data on connection
- Sensor data updates
- Device connection status
- ESP32 messages

## Project Structure

```
backend/
├── config/
│   └── config.js          # Configuration management
├── controllers/
│   └── deviceController.js # API endpoint handlers
├── routes/
│   └── deviceRoutes.js    # API route definitions
├── services/
│   └── websocketService.js # WebSocket logic
├── .env                   # Environment variables
├── server.js              # Main server file
└── package.json           # Dependencies
```

## Error Handling

All API endpoints return JSON responses:

Success:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "error": "Error description"
}
```

## Development

- Server uses `nodemon` for auto-reload during development
- WebSocket connections are logged to console
- All API requests are logged with timestamp

## Troubleshooting

### ESP32 won't connect
- Check WebSocket URL: `ws://YOUR_SERVER_IP:8080/esp32`
- Ensure firewall allows connections on port 8080
- Verify ESP32 is on the same network

### Frontend won't connect
- Start backend server first
- Check `src/utils/api.js` for correct URL
- Verify CORS origin in `.env`

## License

MIT

