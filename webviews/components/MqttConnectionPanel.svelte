<script lang="ts">
    import { onMount } from "svelte";
    import type { MqttBrokerConfig } from "../../src/models/MqttBrokerConfig";

    let brokerConfig: MqttBrokerConfig;

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
    <input type="text" />
    <button>Publish</button>
</div>

<div class="subscribe-section">
    <h3>Subscribe</h3>
    <input type="text" />
    <button>Subscribe</button>
</div>

<style scoped>
    input, button {
        vertical-align: middle;
    }
</style>
