<script lang="ts">
    import { onMount } from "svelte";
    import type { MqttBrokerConfig } from "../../src/models/MqttBrokerConfig";

    let brokerConfig: MqttBrokerConfig = {
        name: "new profile",
        address: "localhost",
        port: 1883,
    };

    onMount(() => {
        brokerConfig = brokerProfile;
        window.addEventListener("message", (event) => {
            const message = event.data;
            switch (message.type) {
                case "update-broker-profile":
                    console.log(message.data);
                    brokerConfig = {
                        name: message.data.name,
                        address: message.data.address,
                        port: message.data.port,
                    };
                    break;
            }
        });
    });
</script>

<h1>Mqtt broker profile configuration</h1>

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
