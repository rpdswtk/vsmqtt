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

    <div id="publish-section" class="container">
        <PublishSection />
    </div>

    <div id="subscribe-section" class="container">
        <SubscribeSection on:subscribe={handleSubscribe} />
    </div>

    <div id="subscription-list-section" class="container">
        <SubscriptionList {subscriptions} />
    </div>

    <div id="message-section" class="container">
        <MessageList />
    </div>

    <div id="message-overview-section" class="container">
        <h1>Message details</h1>
    </div>
</div>

<style>
    #content {
        display: grid;
        grid-template-columns: 1fr 2fr;
        grid-template-rows: 3em 1fr 0.2fr 40vh 20vh;
    }

    #header {
        grid-area: 1 / 1 / 2 / 3;
        margin-left: 5px;
        margin-right: 5px;
    }

    .profile-name {
        float: left;
    }

    .state {
        float: right;
    }

    #publish-section {
        grid-area: 2 / 1 / 3 / 3;
    }

    #subscribe-section {
        grid-area: 3 / 1 / 4 / 3;
    }

    #subscription-list-section {
        grid-area: 4 / 1 / 6 / 2;
        overflow: scroll;
    }

    #message-section {
        grid-area: 4 / 2 / 5 / 3;
        overflow: scroll;
    }

    #message-overview-section {
        grid-area: 5 / 2 / 6 / 3;
    }

    .container {
        padding: 5px;
        border: 2px solid var(--vscode-input-background);
        margin: 5px;
    }
</style>