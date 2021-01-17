<script lang="ts">
    import type { MqttBrokerConfig } from "../models/MqttBrokerConfig";

    let brokerConfig: MqttBrokerConfig = {
        name: "new profile",
        address: "localhost",
        port: 1883,
    };
</script>

<h1>Add new mqtt broker profile</h1>

<form
    on:submit|preventDefault={() => {
        vscode.postMessage({
            type: "add-mqtt-profile",
            value: brokerConfig,
        });
    }}
>
    <label for="name">Name</label>
    <input type="text" id="name" bind:value={brokerConfig.name} />
    <label for="address">Address</label>
    <input type="text" id="address" bind:value={brokerConfig.address} />
    <label for="port">Port</label>
    <input type="number" id="port" bind:value={brokerConfig.port} />
    <button action="submit">Save</button>
</form>

<style scoped>
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>
