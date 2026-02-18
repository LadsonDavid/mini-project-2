/*
 * Smart Headband ESP32 Example Code
 * 
 * This example shows how to connect ESP32 to the backend server
 * and send sensor data via WebSocket.
 * 
 * Required Libraries:
 * - WiFi.h (built-in)
 * - WebSocketsClient.h (install via Library Manager)
 * - ArduinoJson.h (install via Library Manager)
 */

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend server configuration
const char* serverHost = "192.168.1.100";  // Replace with your server IP
const int serverPort = 8080;
const char* serverPath = "/esp32";

// Pin definitions
const int VIBRATION_PIN = 25;
const int TEMP_SENSOR_PIN = 34;
const int HEART_RATE_PIN = 35;

// WebSocket client
WebSocketsClient webSocket;

// Sensor data
float temperature = 36.5;
int heartRate = 75;
int vibrationLevel = 0;
bool massageMode = false;

// Timing
unsigned long lastSensorUpdate = 0;
const unsigned long SENSOR_INTERVAL = 1000;  // Send data every 1 second

void setup() {
  Serial.begin(115200);
  
  // Setup pins
  pinMode(VIBRATION_PIN, OUTPUT);
  pinMode(TEMP_SENSOR_PIN, INPUT);
  pinMode(HEART_RATE_PIN, INPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  // Setup WebSocket
  webSocket.begin(serverHost, serverPort, serverPath);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
  
  // Send sensor data periodically
  if (millis() - lastSensorUpdate >= SENSOR_INTERVAL) {
    lastSensorUpdate = millis();
    readSensors();
    sendSensorData();
  }
  
  // Handle massage mode
  if (massageMode) {
    runMassagePattern();
  }
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WSc] Disconnected!");
      break;
      
    case WStype_CONNECTED:
      Serial.println("[WSc] Connected to backend!");
      sendStatusMessage("ESP32 connected and ready");
      break;
      
    case WStype_TEXT:
      Serial.printf("[WSc] Received: %s\n", payload);
      handleCommand((char*)payload);
      break;
      
    case WStype_ERROR:
      Serial.println("[WSc] Error!");
      break;
  }
}

void handleCommand(char* payload) {
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, payload);
  
  if (error) {
    Serial.println("Failed to parse command");
    return;
  }
  
  const char* type = doc["type"];
  const char* command = doc["command"];
  
  if (strcmp(type, "command") == 0) {
    if (strcmp(command, "vibrate") == 0) {
      int level = doc["level"];
      int duration = doc["duration"];
      controlVibration(level, duration);
    }
    else if (strcmp(command, "display") == 0) {
      const char* message = doc["message"];
      displayMessage(message);
    }
    else if (strcmp(command, "massage") == 0) {
      bool enabled = doc["enabled"];
      massageMode = enabled;
      Serial.printf("Massage mode: %s\n", enabled ? "ON" : "OFF");
      sendStatusMessage(enabled ? "Massage mode started" : "Massage mode stopped");
    }
  }
}

void readSensors() {
  // Read temperature (example using analog sensor)
  int tempReading = analogRead(TEMP_SENSOR_PIN);
  temperature = map(tempReading, 0, 4095, 350, 420) / 10.0;
  
  // Read heart rate (example using analog sensor)
  int hrReading = analogRead(HEART_RATE_PIN);
  heartRate = map(hrReading, 0, 4095, 40, 200);
  
  // Add some variation for testing
  temperature += (random(-10, 10) / 10.0);
  heartRate += random(-5, 5);
  
  // Constrain values
  temperature = constrain(temperature, 35.0, 42.0);
  heartRate = constrain(heartRate, 40, 200);
}

void sendSensorData() {
  StaticJsonDocument<256> doc;
  
  doc["type"] = "sensorData";
  doc["temperature"] = temperature;
  doc["heartRate"] = heartRate;
  doc["vibrationLevel"] = vibrationLevel;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  webSocket.sendTXT(output);
  
  Serial.println("Sent: " + output);
}

void sendStatusMessage(const char* message) {
  StaticJsonDocument<256> doc;
  
  doc["type"] = "message";
  doc["content"] = message;
  
  String output;
  serializeJson(doc, output);
  webSocket.sendTXT(output);
}

void controlVibration(int level, int duration) {
  vibrationLevel = level;
  
  int pwmValue = map(level, 0, 3, 0, 255);
  analogWrite(VIBRATION_PIN, pwmValue);
  
  Serial.printf("Vibration: Level %d for %dms\n", level, duration);
  
  delay(duration);
  analogWrite(VIBRATION_PIN, 0);
  vibrationLevel = 0;
  
  sendStatusMessage("Vibration complete");
}

void displayMessage(const char* message) {
  Serial.printf("Display message: %s\n", message);
  // Add your OLED/LCD display code here
  
  sendStatusMessage("Message displayed");
}

void runMassagePattern() {
  // Simple massage pattern - pulse vibration
  static unsigned long lastPulse = 0;
  static bool pulseState = false;
  
  if (millis() - lastPulse >= 1000) {
    lastPulse = millis();
    pulseState = !pulseState;
    
    if (pulseState) {
      analogWrite(VIBRATION_PIN, 128);  // Medium intensity
      vibrationLevel = 2;
    } else {
      analogWrite(VIBRATION_PIN, 0);
      vibrationLevel = 0;
    }
  }
}

