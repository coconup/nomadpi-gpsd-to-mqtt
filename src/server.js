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

// Create a GPSD connection
const gpsListener = new gpsd.Listener({
  hostname: GPSD_HOST,
  port: 2947,
  parse: true,
  logger: {
    info: s => console.log(`GPSD info:`, s),
    warn: s => console.log(`GPSD warn:`, s),
    error: s => console.log(`GPSD error:`, s)
  },
});

// Connect to the MQTT broker
const mqttClient = mqtt.connect(MQTT_BROKER);

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

  console.log('tpv', JSON.stringify(gpsMessage))
  mqttClient.publish(MQTT_TOPIC, JSON.stringify(gpsMessage));
});

// Handle GPSD socket error
gpsListener.on('error', (error) => {
  console.error(`GPSD Error: ${error}`);
  gpsListener.disconnect();
  process.exit(1);
});

// Connect to the GPSD service
gpsListener.connect(() => {
  console.log(`Connected to GPSD at ${GPSD_HOST}`);
});

// Handle MQTT connection events
mqttClient.on('connect', () => {
  console.log(`Connected to MQTT broker at ${MQTT_BROKER}`);
});

mqttClient.on('error', (error) => {
  console.error(`MQTT Error: ${error}`);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  gpsListener.disconnect();
  mqttClient.end();
  process.exit(0);
});
