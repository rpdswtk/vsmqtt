# VSMQTT

[![](https://img.shields.io/visual-studio-marketplace/v/rpdswtk.vsmqtt)](https://marketplace.visualstudio.com/items?itemName=rpdswtk.vsmqtt)
[![](https://img.shields.io/visual-studio-marketplace/i/rpdswtk.vsmqtt)](https://marketplace.visualstudio.com/items?itemName=rpdswtk.vsmqtt)
![Open VSX Downloads](https://img.shields.io/open-vsx/dt/rpdswtk/vsmqtt?color=c160ef&label=Open%20VSX%20installs)

<a href="https://www.buymeacoffee.com/rpdswtk" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

Vsmqtt is a simple MQTT client integrated in vscode.

![Alt Text](screen.gif)

## Features

* Create and use multiple mqtt profiles
* Connect to broker
* Support for secure connection
* Publish messages to mqtt brokers
* Subscribe to topics
* Browse details of received messages
* Connect to multiple brokers simultaneously
* Colors to differentiate messages by topics
* Pin topics (pinned topics are saved to settings and are used to subscribe to automatically upon connection)
* Export to csv
* Support for websocket connection

## Extension Settings

This extension stores mqtt broker profiles in workspace settings.json under: `"vsmqtt.brokerProfiles"`.

### Properties:

| name      | type   | description                                                       | required |
|-----------|--------|-------------------------------------------------------------------|----------|
| name      | string | Profile name                                                      |     -    |
| host      | string | Broker host                                                       |     -    |
| port      | number | Broker port                                                       |     -    |
| path      | string | Broker path                                                       |     -    |
| username  | string | Client username                                                   |          |
| password  | string | Client pasword                                                    |          |
| promptCredentials  | boolean | Ask for username and password before connecting to the broker |          |
| protocol  | string | "mqtt", "mqtts", "tcp", "tls", "ws", "wss"                        |          |
| ca        | string | Absolute path for cert file or cert string in PEM format          |          |
| key       | string | Absolute path for client cert file or cert string in PEM format   |          |
| cert      | string | Absolute path for client key file or cert string in PEM format    |          |
| clientId  | string | Client ID                                                         |          |
| keepalive | number | Keepalive interval in seconds.                                    |          |
| insecure  | boolean | Disable verification of the server hostname in the server certificate. This option makes it possible for a malicious third party to impersonate your server through DNS spoofing. Use it in testing environment only.                                    |          |
| rejectUnauthorized | boolean | Skip server certificate validation |          |

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

Connecting to broker using websocket:
```json
{
    "name": "broker.emqx.io",
    "host": "ws://broker.emqx.io",
    "port": 8083,
    "clientId": "vsmqtt_client_test",
    "protocol":"ws",
    "path": "/mqtt"
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

