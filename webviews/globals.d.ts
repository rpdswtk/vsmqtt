import * as _vscode from "vscode";
import type { MqttBrokerConfig } from "../src/models/MqttBrokerConfig";

declare global {
    const vscode: {
        postMessage: ({type: string, value: any}) => void
    };
    const brokerProfiles: Array<MqttBrokerConfig>;
    const brokerProfile: MqttBrokerConfig;
}