const gpsd = require('node-gpsd');
const mqtt = require('mqtt');

const GPSD_HOST = process.env.GPSD_HOST;
const MQTT_BROKER = process.env.MQTT_BROKER;
const MQTT_TOPIC = process.env.MQTT_TOPIC;

const modes = {
    0: 'unknown',
    1: 'no_fix',
    2: '2d',
    3: '3d'
};

let gpsListener;
let mqttClient;
let reconnectInterval = 3000; // Initial reconnect interval in milliseconds
const maxReconnectInterval = 60000; // Maximum reconnect interval in milliseconds

function connectToMQTT() {
  // Connect to the MQTT broker
  mqttClient = mqtt.connect(MQTT_BROKER);

  // Handle MQTT connection events
  mqttClient.on('connect', () => {
    console.log(`Connected to MQTT broker at ${MQTT_BROKER}`);
  });

  mqttClient.on('error', (error) => {
    console.error(`MQTT Error: ${error}`);
    process.exit(1);
  });
};

function connectToGPSD() {
  // Create a GPSD connection
  gpsListener = new gpsd.Listener({
    hostname: GPSD_HOST,
    port: 2947,
    parse: true,
    logger: {
      info: s => console.log(`GPSD info:`, s),
      warn: s => console.log(`GPSD warn:`, s),
      error: s => console.log(`GPSD error:`, s)
    },
  });

  // Handle TPV events from GPSD and publish to MQTT
  gpsListener.on('TPV', (tpvData) => {
    const gpsMessage = {
      mode: modes[tpvData.mode],
      time: tpvData.time,
      longitude: tpvData.lon,
      latitude: tpvData.lat,
      altitude_hae: tpvData.altHAE,
      altitude_msl: tpvData.altMSL,
      speed: tpvData.speed,
      direction: tpvData.track,
      climb: tpvData.climb,
      estimated_errors: {
        longitude: tpvData.epx,
        latitude: tpvData.epy,
        altitude: tpvData.epv,
        speed: tpvData.eps,
        direction: tpvData.epd,
        climb: tpvData.epc
      }
    };

    mqttClient.publish(MQTT_TOPIC, JSON.stringify(gpsMessage));
  });

  // Handle GPSD socket error
  gpsListener.on('error', (error) => {
    console.error(`GPSD Error: ${error}`);
    gpsListener.disconnect();
    attemptReconnect();
  });

  gpsListener.on('disconnected', () => {
    console.error('Disconnected from GPSD');
    attemptReconnect();
  });

  // Connect to the GPSD service
  gpsListener.connect(() => {
    console.log(`Connected to GPSD at ${GPSD_HOST}`);
    reconnectInterval = 3000; // Reset reconnect interval on successful connection
    gpsListener.watch();
  });
};

function attemptReconnect() {
  console.log(`Attempting to reconnect to GPSD in ${reconnectInterval / 1000} seconds...`);
  
  setTimeout(() => {
    if (reconnectInterval < maxReconnectInterval) {
      reconnectInterval *= 2; // Double the reconnect interval
    }

    connectToGPSD();
  }, reconnectInterval);
}

// Initial connections
connectToMQTT();
connectToGPSD();

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  gpsListener.disconnect();
  mqttClient.end();
  process.exit(0);
});
