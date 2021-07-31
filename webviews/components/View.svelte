<script lang="ts">
    import { onMount } from "svelte";
    import type { MqttBrokerConfig } from "../../src/interfaces/MqttBrokerConfig";

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

<div id="content">
    <div id="header">
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
    <div id="body">
        <slot />
    </div>
</div>


<style>
    #content {
        height: 100%;
        display: grid;
        grid-template-rows: 4vh 94vh;
        grid-template-areas: 
            "header"
            "body";
    }

    #header {
        grid-area: header;
        height: 100%;
    }

    #body {
        grid-area: body;
        width: 100%;
        height: 100%;
    }

    .profile-name {
        float: left;
    }

    .state {
        float: right;
    }
</style>