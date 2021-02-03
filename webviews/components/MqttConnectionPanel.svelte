<script lang="ts">
    import { onMount } from "svelte";
    import type { MqttBrokerConfig } from "../../src/models/MqttBrokerConfig";
    import PublishSection from "./PublishSection.svelte";
    import SubscribeSection from "./SubscribeSection.svelte";
    import MessageList from "./MessageList.svelte";
    import SubscriptionList from "./SubscriptionList.svelte";
    import type { SubscriptionItem } from "./types";

    let brokerConfig: MqttBrokerConfig;
    let connected: boolean = false;

    let subscriptions: Array<SubscriptionItem> = [];

    function handleSubscribe(event: any) {
        subscriptions = event.detail.subscriptions;
    }

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

    <div class="container">
        <PublishSection />
    </div>

    <div class="container">
        <SubscribeSection on:subscribe={handleSubscribe} />
    </div>

    <div class="container subscription-section">
        <SubscriptionList {subscriptions} />
    </div>

    <div class="container message-section">
        <MessageList />
    </div>
</div>

<style>
    #content {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        padding-top: 30px;
        padding-left: 10px;
        padding-right: 10px;
    }

    #header {
        height: 75px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        margin-left: 10px;
        margin-right: 10px;
    }

    .profile-name {
        float: left;
    }

    .state {
        float: right;
    }

    .subscription-section {
        overflow: scroll;
        height: 55%;
        width: 49%;
        float: left;
        margin-right: 8px;
    }

    .message-section {
        overflow: scroll;
        height: 55%;
        width: 49%;
        float: right;
    }

    .container {
        margin-top: 10px;
        padding: 5px;
        border: 2px solid var(--vscode-input-background);
    }
</style>
