<script lang="ts">
    import { onMount } from "svelte";
    import type { MqttBrokerConfig } from "../../src/models/MqttBrokerConfig";
    import PublishSection from "./PublishSection.svelte";
    import SubscribeSection from "./SubscribeSection.svelte";

    let brokerConfig: MqttBrokerConfig;

    onMount(() => {
        brokerConfig = brokerProfile;
    });
</script>

{#if brokerConfig}
    <h1>MQTT connection: {brokerConfig.name}</h1>
    <hr />
{/if}

<PublishSection />
<SubscribeSection />
