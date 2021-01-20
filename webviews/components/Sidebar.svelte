<script lang="ts">
    import { onMount } from "svelte";
    import type { MqttBrokerConfig } from "../../src/models/MqttBrokerConfig";

    let brokers: Array<MqttBrokerConfig> = [];

    onMount(() => {
        brokers = brokerProfiles;
        window.addEventListener("message", (event) => {
            const message = event.data;
            switch (message.type) {
                case "update-profile-list":
                    brokers = message.value;
                    break;
            }
        });
    });
</script>

<div>
    <ul>
        {#each brokers as broker}
            <li
                on:click={() => {
                    vscode.postMessage({
                        type: "edit-mqtt-profile",
                        value: broker,
                    });
                }}
            >{broker.address} {broker.port}</li>
        {/each}
    </ul>
</div>

<button
    on:click={() => {
        vscode.postMessage({
            type: "edit-mqtt-profile",
            value: { name: "New profile", address: "localhost", port: 1883 },
        });
    }}>Create new profile</button
>

<style>
    li:hover {
        cursor: pointer;
    }

    li {
        font-size: large;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>
