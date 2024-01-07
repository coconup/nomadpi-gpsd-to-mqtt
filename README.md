# VanPi MQTT Hub Server

This Node.js server connects to an MQTT broker and a MariaDB database to manage devices. Each device is associated with an MQTT topic, and the server listens for messages sent to each device's topic. Received messages are then broadcasted to a central MQTT hub topic, enriched with device information. This single topic can then be consumed by the rest of the stack (for example by the [VanPi Automation API](https://github.com/coconup/vanpi-automation-api)) in order to build functionalities on a flexible set of devices.

## Prerequisites

Before running the server, make sure you have the following:

* Node.js installed on your machine
* Access to an MQTT broker (e.g., [Mosquitto](https://mosquitto.org/))
* A MariaDB database with a table named `mqtt_devices` containing columns: `name`, `type`, `mqtt_topic`

## Installation

1. Clone this repository:

```bash
git clone https://github.com/your-username/mqtt-hub-server.git
```

2. Navigate to the project directory:

```bash
cd mqtt-hub-server
```

3. Install the required dependencies:

```bash
npm install
```

4. Set up your environment variables. Example:

```env
MQTT_BROKER_URL=mqtt://broker.example.com
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=your_database_name
```

## Configuration

Adjust the environment variables to match your specific MQTT broker and MariaDB configuration. You may also need to modify the database query and MQTT topic names in the server code based on your requirements.

## Usage

Run the server using the following command:

```bash
npm start
```

The server will connect to the MQTT broker, query devices from the database, and listen for messages on each device's MQTT topic. Received messages will be broadcasted to the central MQTT hub topic.

## License

This project is licensed under the MIT License - see the LICENSE file for details.