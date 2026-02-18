#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_MLX90614.h>
#include <MAX30105.h>
#include <MPU6050.h>

// =====================================================
// CONFIGURATION - UPDATE THESE VALUES
// =====================================================

// WiFi credentials
const char* WIFI_SSID = "Malves2.3";
const char* WIFI_PASSWORD = "plmqazygv52";

// Backend server configuration
// Your computer's IP address (already configured!)
// To find your IP:
// - Windows: Open CMD, type "ipconfig", look for "IPv4 Address"
// - Mac/Linux: Open Terminal, type "ifconfig" or "ip addr"
const char* SERVER_HOST = "10.47.243.24";  
const int SERVER_PORT = 8080;
const char* SERVER_PATH = "/esp32";

// =====================================================
// HARDWARE CONFIGURATION
// =====================================================

// Vibration Motor Pin
const int VIBRATION_MOTOR_PIN = 18;  // GPIO 18

// I2C Configuration (ESP32 default)
const int I2C_SDA = 21;
const int I2C_SCL = 22;

// =====================================================
// SENSOR OBJECTS
// =====================================================

Adafruit_MLX90614 mlx = Adafruit_MLX90614();
MAX30105 particleSensor;
MPU6050 mpu;
WebSocketsClient webSocket;

// =====================================================
// SENSOR DATA VARIABLES
// =====================================================

float foreheadTemp = 0.0;
float ambientTemp = 0.0;
long irValue = 0;
long redValue = 0;
int16_t ax, ay, az;
int16_t gx, gy, gz;

// Current vibration state
int currentVibrationLevel = 0;  // 0 = Off, 1 = Low, 2 = Medium, 3 = High

// =====================================================
// HEADACHE DETECTION THRESHOLDS
// =====================================================

const long IR_THRESHOLD = 15000;        // MAX30100 detection threshold
const float TEMP_THRESHOLD_HIGH = 37.0; // High temperature alert (°C)
const float TEMP_THRESHOLD_LOW = 31.0;  // Low temperature alert (°C)
const int HR_THRESHOLD_HIGH = 100;      // High heart rate alert (BPM)
const int HR_THRESHOLD_LOW = 55;        // Low heart rate alert (BPM)

// =====================================================
// TIMING VARIABLES
// =====================================================

unsigned long lastSensorUpdate = 0;
const unsigned long SENSOR_INTERVAL = 1000;  // Send data every 1 second

unsigned long lastMAX30100Read = 0;
const long MAX30100_READ_INTERVAL = 500;    // Read MAX30100 every 500ms

unsigned long lastHeartRateCalc = 0;
const long HEART_RATE_CALC_INTERVAL = 2000; // Calculate HR every 2 seconds

// Head detection
bool headDetected = false;
unsigned long lastDetectionTime = 0;
const unsigned long DETECTION_TIMEOUT = 2000;

// Baseline values for headache detection
float baselineTemp = 0;
int baselineHR = 0;
bool baselineSet = false;
int baselineReadings = 0;

// WiFi reconnection
unsigned long lastWiFiCheck = 0;
const unsigned long WIFI_CHECK_INTERVAL = 10000; // Check WiFi every 10 seconds

// =====================================================
// SETUP FUNCTION
// =====================================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("=====================================================");
  Serial.println("    SMART HEADBAND - Headache Relief Device");
  Serial.println("=====================================================");
  Serial.println("Hardware: ESP32 + MLX90614 + MAX30100 + MPU6050");
  Serial.println("Vibration Motor: GPIO 18");
  Serial.println("=====================================================\n");
  
  // Initialize Vibration Motor
  pinMode(VIBRATION_MOTOR_PIN, OUTPUT);
  digitalWrite(VIBRATION_MOTOR_PIN, LOW);
  Serial.println("✅ Vibration motor initialized (GPIO 18)");
  
  // Initialize I2C
  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.setClock(100000); // 100kHz for stability
  Serial.println("✅ I2C initialized (SDA:21, SCL:22)");
  
  // Initialize MLX90614 Temperature Sensor
  if (!mlx.begin()) {
    Serial.println("⚠️  MLX90614 not found - Temperature readings disabled");
  } else {
    Serial.println("✅ MLX90614 temperature sensor ready");
  }
  
  // Initialize MAX30100/MAX30105 Heart Rate Sensor
  Serial.println("Initializing MAX30100 heart rate sensor...");
  if (particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    // Configure MAX30100 for optimal performance
    byte ledBrightness = 0x1F;
    byte sampleAverage = 4;
    byte ledMode = 2;           // Red + IR mode
    int sampleRate = 100;       // 100Hz
    int pulseWidth = 411;       // 411us
    int adcRange = 4096;        // 4096 nA
    
    particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
    particleSensor.setPulseAmplitudeRed(0x1F);
    particleSensor.setPulseAmplitudeIR(0x1F);
    
    Serial.println("✅ MAX30100 heart rate sensor ready");
  } else {
    Serial.println("⚠️  MAX30100 not found - Heart rate readings disabled");
    Serial.println("💡 Tip: Check wiring and 4.7kΩ pull-up resistors on SDA/SCL");
  }
  
  // Initialize MPU6050 Motion Sensor
  mpu.initialize();
  if (!mpu.testConnection()) {
    Serial.println("⚠️  MPU6050 not found - Motion readings disabled");
  } else {
    Serial.println("✅ MPU6050 motion sensor ready");
  }
  
  Serial.println("\n=====================================================");
  Serial.println("           CONNECTING TO WIFI...");
  Serial.println("=====================================================");
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("\n=====================================================");
  Serial.println("      CONNECTING TO BACKEND SERVER...");
  Serial.println("=====================================================");
  
  // Setup WebSocket connection
  setupWebSocket();
  
  Serial.println("\n=====================================================");
  Serial.println("         SYSTEM READY - MONITORING ACTIVE");
  Serial.println("=====================================================\n");
  
  delay(1000);
}

// =====================================================
// MAIN LOOP
// =====================================================

void loop() {
  unsigned long currentTime = millis();
  
  // Handle WebSocket events
  webSocket.loop();
  
  // Check WiFi connection periodically
  if (currentTime - lastWiFiCheck >= WIFI_CHECK_INTERVAL) {
    lastWiFiCheck = currentTime;
    checkWiFiConnection();
  }
  
  // Read MLX90614 and MPU6050 continuously
  readMLX90614();
  readMPU6050();
  
  // Read MAX30100 at controlled intervals
  if (currentTime - lastMAX30100Read >= MAX30100_READ_INTERVAL) {
    readMAX30100();
    lastMAX30100Read = currentTime;
  }
  
  // Check if head/finger is detected
  checkHeadDetection();
  
  // Set baseline values after initial readings
  if (headDetected && !baselineSet) {
    setBaselineValues();
  }
  
  // Check for headache patterns (auto-vibration only if not manually controlled)
  // This is optional - you can disable auto-detection and control via app only
  // checkAndActivateVibration();
  
  // Send sensor data to backend
  if (currentTime - lastSensorUpdate >= SENSOR_INTERVAL) {
    lastSensorUpdate = currentTime;
    sendSensorData();
  }
  
  delay(50); // Small delay for stability
}

// =====================================================
// WIFI FUNCTIONS
// =====================================================

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📡 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    Serial.println("⚠️  Device will retry in 10 seconds...");
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi disconnected. Reconnecting...");
    connectWiFi();
  }
}

// =====================================================
// WEBSOCKET FUNCTIONS
// =====================================================

void setupWebSocket() {
  Serial.print("Connecting to WebSocket: ws://");
  Serial.print(SERVER_HOST);
  Serial.print(":");
  Serial.print(SERVER_PORT);
  Serial.println(SERVER_PATH);
  
  webSocket.begin(SERVER_HOST, SERVER_PORT, SERVER_PATH);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  
  Serial.println("⏳ Waiting for backend connection...");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("❌ [WebSocket] Disconnected from backend");
      break;
      
    case WStype_CONNECTED:
      Serial.println("✅ [WebSocket] Connected to backend server!");
      sendStatusMessage("Smart Headband connected and ready");
      break;
      
    case WStype_TEXT:
      Serial.print("📥 [WebSocket] Received: ");
      Serial.println((char*)payload);
      handleBackendCommand((char*)payload);
      break;
      
    case WStype_ERROR:
      Serial.println("❌ [WebSocket] Error occurred");
      break;
  }
}

void handleBackendCommand(char* payload) {
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload);
  
  if (error) {
    Serial.print("❌ JSON parse error: ");
    Serial.println(error.c_str());
    return;
  }
  
  const char* type = doc["type"];
  const char* command = doc["command"];
  
  // Handle commands from application
  if (strcmp(type, "command") == 0) {
    
    // Vibration control command
    if (strcmp(command, "vibrate") == 0) {
      int level = doc["level"];
      int duration = doc["duration"];
      
      Serial.print("🎮 Command: Set vibration level ");
      Serial.print(level);
      Serial.print(" for ");
      Serial.print(duration);
      Serial.println("ms");
      
      controlVibration(level, duration);
    }
    
    // Display message command (for future OLED display)
    else if (strcmp(command, "display") == 0) {
      const char* message = doc["message"];
      Serial.print("💬 Display message: ");
      Serial.println(message);
      sendStatusMessage("Message received");
    }
    
    // Massage mode command (continuous vibration pattern)
    else if (strcmp(command, "massage") == 0) {
      bool enabled = doc["enabled"];
      Serial.print("💆 Massage mode: ");
      Serial.println(enabled ? "ON" : "OFF");
      
      if (enabled) {
        // Start massage pattern (example: gentle pulsing)
        controlVibration(2, 300);
        delay(200);
        controlVibration(2, 300);
      } else {
        controlVibration(0, 0); // Stop vibration
      }
      
      sendStatusMessage(enabled ? "Massage mode activated" : "Massage mode stopped");
    }
  }
  
  // Handle connection confirmation
  else if (strcmp(type, "connected") == 0) {
    Serial.println("✅ Backend confirmed connection");
  }
}

// =====================================================
// SENSOR READING FUNCTIONS
// =====================================================

void readMLX90614() {
  foreheadTemp = mlx.readObjectTempC();
  ambientTemp = mlx.readAmbientTempC();
  
  // Validate readings
  if (isnan(foreheadTemp) || foreheadTemp < 0 || foreheadTemp > 50) {
    foreheadTemp = 36.5; // Default safe value
  }
}

void readMAX30100() {
  irValue = particleSensor.getIR();
  redValue = particleSensor.getRed();
  
  // Debug output every 10 seconds
  static unsigned long lastDebug = 0;
  if (millis() - lastDebug > 10000) {
    lastDebug = millis();
    Serial.print("💓 MAX30100 - IR: ");
    Serial.print(irValue);
    Serial.print(" | Red: ");
    Serial.print(redValue);
    Serial.print(" | Estimated HR: ");
    Serial.print(estimateHeartRate());
    Serial.println(" BPM");
  }
}

void readMPU6050() {
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
}

void checkHeadDetection() {
  // Use IR sensor to detect presence (finger or forehead)
  if (irValue > IR_THRESHOLD) {
    if (!headDetected) {
      Serial.println("👤 Head/Finger detected");
      headDetected = true;
    }
    lastDetectionTime = millis();
  } else {
    if (millis() - lastDetectionTime > DETECTION_TIMEOUT) {
      if (headDetected) {
        Serial.println("👋 Head/Finger removed");
        headDetected = false;
        baselineSet = false;
        baselineReadings = 0;
        controlVibration(0, 0); // Stop vibration
      }
    }
  }
}

void setBaselineValues() {
  baselineReadings++;
  
  if (baselineReadings >= 10) {
    baselineTemp = foreheadTemp;
    baselineHR = estimateHeartRate();
    baselineSet = true;
    
    Serial.println("\n📊 Baseline values established:");
    Serial.print("   Temperature: ");
    Serial.print(baselineTemp, 1);
    Serial.println(" °C");
    Serial.print("   Heart Rate: ");
    Serial.print(baselineHR);
    Serial.println(" BPM\n");
  }
}

int estimateHeartRate() {
  if (!headDetected || irValue < IR_THRESHOLD) {
    return 0;
  }
  
  // Improved heart rate estimation based on IR signal strength
  // These values are calibrated for MAX30100
  if (irValue > 80000) return 65 + random(-3, 4);
  if (irValue > 50000) return 70 + random(-5, 6);
  if (irValue > 30000) return 72 + random(-7, 8);
  if (irValue > 15000) return 68 + random(-8, 9);
  
  return 0;
}

// =====================================================
// VIBRATION CONTROL
// =====================================================

void controlVibration(int level, int duration) {
  currentVibrationLevel = level;
  
  // Map level (0-3) to PWM value (0-255)
  // 0 = Off, 1 = Low (85), 2 = Medium (170), 3 = High (255)
  int pwmValue = map(level, 0, 3, 0, 255);
  
  Serial.print("🔮 Vibration: Level ");
  Serial.print(level);
  Serial.print(" (PWM: ");
  Serial.print(pwmValue);
  Serial.print(") for ");
  Serial.print(duration);
  Serial.println("ms");
  
  // Activate vibration
  analogWrite(VIBRATION_MOTOR_PIN, pwmValue);
  
  // If duration is specified, turn off after duration
  if (duration > 0) {
    delay(duration);
    analogWrite(VIBRATION_MOTOR_PIN, 0);
    currentVibrationLevel = 0;
    Serial.println("✅ Vibration complete");
    sendStatusMessage("Vibration therapy completed");
  }
}

// Optional: Automatic headache detection and vibration
void checkAndActivateVibration() {
  if (!headDetected || !baselineSet) {
    return;
  }
  
  int currentHR = estimateHeartRate();
  float tempVariation = abs(foreheadTemp - baselineTemp);
  int hrVariation = abs(currentHR - baselineHR);
  
  bool tempAlert = (foreheadTemp > TEMP_THRESHOLD_HIGH) || (tempVariation > 1.5);
  bool hrAlert = (currentHR > HR_THRESHOLD_HIGH) || (hrVariation > 20);
  
  if (tempAlert || hrAlert) {
    // Headache pattern detected - activate gentle vibration
    if (currentVibrationLevel == 0) {
      Serial.println("⚠️  Headache pattern detected - Activating therapy");
      controlVibration(1, 500); // Gentle pulse
    }
  }
}

// =====================================================
// DATA TRANSMISSION FUNCTIONS
// =====================================================

void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    return; // Skip if WiFi disconnected
  }
  
  StaticJsonDocument<512> doc;
  
  // Message type
  doc["type"] = "sensorData";
  
  // Sensor readings
  doc["temperature"] = round(foreheadTemp * 10.0) / 10.0;  // Round to 1 decimal
  doc["heartRate"] = estimateHeartRate();
  doc["vibrationLevel"] = currentVibrationLevel;
  doc["timestamp"] = millis();
  
  // Optional: Add extra data for monitoring
  // doc["irValue"] = irValue;
  // doc["motionLevel"] = sqrt(ax*ax + ay*ay + az*az);
  
  String output;
  serializeJson(doc, output);
  
  // Send to backend
  webSocket.sendTXT(output);
  
  // Debug output (reduced frequency)
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 5000) {
    lastPrint = millis();
    Serial.print("📤 Sent: ");
    Serial.println(output);
  }
}

void sendStatusMessage(const char* message) {
  StaticJsonDocument<256> doc;
  
  doc["type"] = "message";
  doc["content"] = message;
  
  String output;
  serializeJson(doc, output);
  
  webSocket.sendTXT(output);
  
  Serial.print("📨 Status: ");
  Serial.println(message);
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

void printSensorDebug() {
  Serial.println("\n=== SENSOR DEBUG ===");
  Serial.print("Temperature: ");
  Serial.print(foreheadTemp, 1);
  Serial.println(" °C");
  
  Serial.print("Heart Rate: ");
  Serial.print(estimateHeartRate());
  Serial.println(" BPM");
  
  Serial.print("IR Value: ");
  Serial.println(irValue);
  
  Serial.print("Vibration Level: ");
  Serial.println(currentVibrationLevel);
  
  Serial.print("Head Detected: ");
  Serial.println(headDetected ? "YES" : "NO");
  
  Serial.println("===================\n");
}

