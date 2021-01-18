<script lang="ts">
    import { onMount } from "svelte";
    import type { MqttBrokerConfig } from "../models/MqttBrokerConfig";

    let brokers: Array<MqttBrokerConfig> = [];
    let broker: MqttBrokerConfig = { name: "profile name" };

    onMount(() => {
        window.addEventListener("message", (event) => {
            const message = event.data; // The json data that the extension sent
            console.log(message);
            switch (message.type) {
                case "update-profile-list":
                    brokers = message.value;
                    console.log(message.value);
                    break;
            }
        });
    });
</script>

<div>
    <ul>
        {#each brokers as broker}
            <li>{broker.address} {broker.port}</li>
        {/each}
    </ul>
</div>

<button
    on:click={() => {
        vscode.postMessage({
            type: "create-mqtt-profile",
            value: broker,
        });
    }}>Create new profile</button
>

<!-- 
<button
    on:click={() => {
        vscode.postMessage({
            type: "onInfo",
            value: "Info message",
        });
    }}>Click me</button
>

<button
    on:click={() => {
        vscode.postMessage({
            type: "onError",
            value: "Error message",
        });
    }}>Click me for error</button
> -->
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
