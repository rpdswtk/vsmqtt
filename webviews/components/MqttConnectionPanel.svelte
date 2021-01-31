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

<div id="title-bar">
    {#if brokerConfig}
        <h1 class="profile-name">MQTT profile: {brokerConfig.name}</h1>
        {#if connected}
            <h1 class="state">Connected</h1>
        {:else}
            <h1 class="state">Disconnected</h1>
        {/if}
        <br />
    {/if}
</div>

<PublishSection />
<SubscribeSection />

<style>
    .profile-name {
        float: left;
    }

    .state {
        float: right;
    }

    #title-bar {
        width: 100%;
        margin-bottom: 50px;
    }
</style>
