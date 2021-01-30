<script lang="ts">
    import { onMount } from "svelte";
    import type { MqttBrokerConfig } from "../../src/models/MqttBrokerConfig";
    import PublishSection from "./PublishSection.svelte";
    import SubscribeSection from "./SubscribeSection.svelte";

    let brokerConfig: MqttBrokerConfig;
    let connected: boolean = false;

    onMount(() => {
        brokerConfig = brokerProfile;
        window.addEventListener("message", (event) => {
            const message = event.data;
            switch (message.type) {
                case "onMqttConnectionChange":
                    connected = message.value.connected;
                    break;
            }
        });
    });
</script>

{#if brokerConfig}
    <h1>MQTT connection: {brokerConfig.name}</h1>
    {#if connected}
        <h3>Connected</h3>
    {:else}
        <h3>Disconnected</h3>
    {/if}
    <hr />
{/if}

<PublishSection />
<SubscribeSection />
