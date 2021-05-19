# VSMQTT

Vsmqtt is a simple MQTT client integrated in vscode.

![Alt Text](screen.gif)

## Features

Existing features:

* Create and use multiple mqtt profiles
* Connect to broker
* Support for secure connection
* Publish messages to mqtt brokers
* Subscribe to topics
* Browse details of received messages
* Connect to multiple brokers simultaneously
* Colors to differentiate messages by topics

Future features:

* Support for websocket connection
* Pin topics (pinned topics will be saved to profiles and will be used to subscribe to automatically upon connection)

## Extension Settings

This extension stores mqtt broker profiles in workspace settings.json under: `"vsmqtt.brokerProfiles"`.

### Properties:

| name      | type   | description                                | required |
|-----------|--------|--------------------------------------------|----------|
| name      | string | Profile name                               |     -    |
| host      | string | Broker host                                |     -    |
| port      | number | Broker port                                |     -    |
| username  | string | User name for broker                       |          |
| password  | string | Password for broker                        |          |
| protocol  | string | "mqtt", "mqtts", "tcp", "tls", "ws", "wss" |          |
| ca        | string | Path for cert file or PEM string           |          |
| clientId  | string | Client ID                                  |          |
| keepalive | number | Keepalive interval in seconds.             |          |

### Examples:

Password protected connection:
```json
{
    "name": "client with password",
    "host": "localhost",
    "port": 1884,
    "username": "user01",
    "password": "securepassword"
}
```

Connecting to TLS protected broker:
```json
{
    "name": "client with tls",
    "host": "broker.emqx.io",
    "port": 8883,
    "protocol": "mqtts",
    "ca": "/path_to_crt"
}
```

## Commands

| Name               | Description                       |
|--------------------|-----------------------------------|
| addProfile         | Create new mqtt broker profile    |
| editProfile        | Edit existing mqtt broker profile |
| deleteProfile      | Delete mqtt broker profile        |
| connectToBroker    | Connect to broker                 |
| refreshProfileList | Refresh sidebar view              |

All commands can be invoked also from the ui.

