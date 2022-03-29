import type { MqttSubscription } from './MqttSubscription';

export interface MqttBrokerConfig {
    name: string;
    host: string;
    port: number;
    protocol?: string;
    clientId?: string;
    path?: string;
    keepalive?: number;
    username?: string;
    password?: string;
    ca?: Buffer|string;
    caString?: string;
    key?: Buffer|string;
    keytring?: string;
    cert?: Buffer|string;
    certString?: string;
    passphrase?: string;
    savedSubscriptions?: Array<MqttSubscription>;
}