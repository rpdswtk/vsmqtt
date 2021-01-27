<script lang="ts">
    import { onMount } from "svelte";
    import type { MqttBrokerConfig } from "../../src/models/MqttBrokerConfig";

    let brokerConfig: MqttBrokerConfig;
    let publishText: string;
    let publishTopic: string;
    let subscribeTopic: string;

    onMount(() => {
        brokerConfig = brokerProfile;
    });
</script>

{#if brokerConfig}
    <h1>MQTT connection: {brokerConfig.name}</h1>
    <hr />
{/if}

<div class="publish-section">
    <h3>Publish</h3>
    <input type="text" placeholder="Topic" bind:value={publishTopic} />
    <br />
    <textarea rows="5" placeholder="Payload" bind:value={publishText} />
    <button
        on:click={() => {
            vscode.postMessage({
                type: "publish",
                value: { topic: publishTopic, payload: publishText },
            });
        }}>Publish</button
    >
</div>

<div class="subscribe-section">
    <h3>Subscribe</h3>
    <input type="text" bind:value={subscribeTopic} placeholder="Topic"/>
    <button on:click={() => {
        vscode.postMessage({
            type: "subscribe",
            value: subscribeTopic
        });
        subscribeTopic = "";
    }}>Subscribe</button>
</div>

<style scoped>
    input,
    button {
        vertical-align: middle;
    }

    textarea {
        resize: none;
    }
</style>
