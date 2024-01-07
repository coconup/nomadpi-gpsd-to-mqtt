# VanPi GPSD to MQTT Bridge

This Node.js server connects to a GPSD (GPS Daemon) service, captures TPV (Time, Position, Velocity) events, and publishes them to an MQTT topic.

## Prerequisites

- Node.js installed on your machine.
- GPSD service running and accessible.
- MQTT broker running and accessible.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/gpsd-mqtt-bridge.git
cd gpsd-mqtt-bridge
```

2. Install dependencies:

```bash
npm install
```

## Configuration

Set the environment variables in the `.env` file or directly in the code:

* `GPSD_HOST`: Hostname or IP address of the GPSD service.
* `MQTT_BROKER`: URL of the MQTT broker.

## Usage

Run the server:

```bash
node server.js
```

The server will connect to the GPSD service and MQTT broker, listening for TPV events and publishing them to the specified MQTT topic.