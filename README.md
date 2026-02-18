# Smart Headband Dashboard

A complete full-stack IoT dashboard for monitoring and controlling a smart headband device with ESP32. Features real-time sensor data visualization, vibration control, massage mode, and bi-directional messaging.

## 🌟 Features

### Frontend (React Dashboard)
- 📊 **Real-time Sensor Monitoring**: Track heart rate, temperature, and vibration levels
- 📈 **Live Charts**: Beautiful charts using Recharts library
- 🎯 **Vibration Control**: Adjustable intensity (Off, Low, Medium, High) and duration
- 💆 **Massage Mode**: Start/stop continuous massage patterns
- 💬 **Chat Interface**: Two-way messaging between dashboard and ESP32
- 🌓 **Dark/Light Mode**: Toggle themes with persistent storage
- 🔔 **Notifications**: Real-time toast notifications for events
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Modern UI**: Tailwind CSS with Lucide React icons

### Backend (Node.js Server)
- 🔌 **Dual WebSocket**: Separate connections for ESP32 and frontend
- 🚀 **REST API**: HTTP endpoints for device control
- ♻️ **Auto-reconnect**: Automatic reconnection handling
- 📡 **Real-time Forwarding**: Broadcasts ESP32 data to all connected clients
- 🔒 **CORS Enabled**: Secure cross-origin requests

### Hardware (ESP32)
- 📲 **WebSocket Client**: Connects to backend server
- 🔬 **Sensor Integration**: Temperature and heart rate sensors
- 🔊 **Vibration Motor**: PWM control for variable intensity
- 📟 **Display Support**: Send messages to OLED/LCD
- 🔄 **Massage Patterns**: Programmable vibration sequences

## 🏗️ Architecture

```
┌─────────────┐         WebSocket          ┌─────────────┐
│             │◄──────────────────────────►│             │
│   ESP32     │    ws://server:8080/esp32  │   Backend   │
│  Hardware   │                             │   (Node.js) │
│             │         Commands            │             │
└─────────────┘                             └─────────────┘
                                                    ▲
                                                    │
                                             WebSocket
                                                    │
                                   ws://server:8080/frontend
                                                    │
                                                    ▼
                                            ┌─────────────┐
                                            │  Frontend   │
                                            │   (React)   │
                                            │  Dashboard  │
                                            └─────────────┘
```

## 📁 Project Structure

```
smart-headband-dashboard/
│
├── frontend/                    # React application
│   ├── public/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── SensorCard.jsx
│   │   │   ├── VibrationControl.jsx
│   │   │   ├── MassageControl.jsx
│   │   │   ├── ChatBox.jsx
│   │   │   └── ChartCard.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js
│   │   │   └── useTheme.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── constants.js
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   └── styles/
│   │       └── index.css
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     # Node.js server
│   ├── config/
│   │   └── config.js
│   ├── controllers/
│   │   └── deviceController.js
│   ├── routes/
│   │   └── deviceRoutes.js
│   ├── services/
│   │   └── websocketService.js
│   ├── .env
│   ├── server.js
│   ├── ESP32_EXAMPLE.ino       # Arduino example code
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **ESP32** development board (optional for testing)
- **Arduino IDE** (for ESP32 programming)

### 1. Install Dependencies

#### Frontend
```bash
# In project root
npm install
```

#### Backend
```bash
# Install backend dependencies
npm run backend:install

# OR manually
cd backend
npm install
```

### 2. Configure Backend

Edit `backend/.env`:
```env
PORT=5000
WS_PORT=8080
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### 3. Start the Servers

#### Option A: Run separately (recommended for development)

Terminal 1 - Backend:
```bash
npm run backend
```

Terminal 2 - Frontend:
```bash
npm run dev
```

#### Option B: Run manually

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
npm run dev
```

### 4. Open the Dashboard

Navigate to `http://localhost:5173` in your browser.

### 5. Connect ESP32 (Optional)

1. Open `backend/ESP32_EXAMPLE.ino` in Arduino IDE
2. Update WiFi credentials and server IP
3. Install required libraries:
   - `WebSocketsClient`
   - `ArduinoJson`
4. Upload to ESP32
5. Monitor Serial output for connection status

## 📡 API Documentation

### REST API Endpoints

Base URL: `http://localhost:8080/api`

#### GET /status
Get device status and sensor data
```bash
curl http://localhost:8080/api/status
```

#### POST /vibrate
Control vibration motor
```bash
curl -X POST http://localhost:8080/api/vibrate \
  -H "Content-Type: application/json" \
  -d '{"level": 2, "duration": 1000}'
```

#### POST /message
Send message to ESP32
```bash
curl -X POST http://localhost:8080/api/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Take a break"}'
```

#### POST /massage
Toggle massage mode
```bash
curl -X POST http://localhost:8080/api/massage \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### WebSocket Protocol

#### ESP32 → Backend
```json
{
  "type": "sensorData",
  "temperature": 36.5,
  "heartRate": 75,
  "vibrationLevel": 0
}
```

#### Backend → ESP32
```json
{
  "type": "command",
  "command": "vibrate",
  "level": 2,
  "duration": 1000
}
```

See [backend/README.md](backend/README.md) for complete API documentation.

## 🛠️ Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run backend` - Start backend server with auto-reload
- `npm run backend:install` - Install backend dependencies

### Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS 4
- Recharts (charts)
- Lucide React (icons)
- WebSocket API

**Backend:**
- Node.js
- Express.js
- ws (WebSocket)
- CORS
- dotenv

**Hardware:**
- ESP32
- WebSocketsClient
- ArduinoJson

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#6366f1',    // Indigo
      secondary: '#8b5cf6',  // Purple
      accent: '#ec4899',     // Pink
    },
  },
}
```

### Sensor Thresholds

Edit `src/utils/constants.js`:
```javascript
export const SENSOR_THRESHOLDS = {
  HEART_RATE: {
    WARNING: 100,
    DANGER: 150,
  },
  TEMPERATURE: {
    WARNING: 37.5,
    DANGER: 39,
  },
};
```

## 🔧 Troubleshooting

### Backend won't start
- Check if port 8080 is available
- Verify `.env` file exists in `backend/`
- Run `npm run backend:install`

### Frontend can't connect to backend
- Ensure backend server is running
- Check `src/utils/api.js` for correct backend URL
- Verify CORS settings in `backend/.env`

### ESP32 won't connect
- Check WiFi credentials in Arduino code
- Verify server IP address (use `ipconfig` or `ifconfig`)
- Ensure firewall allows port 8080
- Check Serial Monitor for error messages

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the GitHub repository.

---

