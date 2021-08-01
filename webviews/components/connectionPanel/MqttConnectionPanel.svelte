<script lang="ts">
    import { onMount } from "svelte";
    import type { MqttBrokerConfig } from "../../../src/interfaces/MqttBrokerConfig";
    import PublishSection from "./PublishSection.svelte";
    import SubscribeSection from "./SubscribeSection.svelte";
    import MessageList from "./MessageList.svelte";
    import SubscriptionList from "./SubscriptionList.svelte";
    import MessageOverview from "./MessageOverview.svelte";
    import { messages, selectedMessage, subscriptions, savedSubscriptions } from ".././stores";
    import View from '../View.svelte';

    let brokerConfig: MqttBrokerConfig;

    onMount(() => {
        brokerConfig = brokerProfile;
        $savedSubscriptions = new Map();
        brokerConfig.savedSubscriptions?.forEach((subscription) => $savedSubscriptions.set(subscription.topic, subscription));
        window.addEventListener("message", (event) => {
            const message = event.data;
            switch (message.type) {
                case "onMqttMessage":
                    let subscription = $subscriptions.get(message.value.topic);
                    if (subscription && !subscription.muted) {
                        $messages = [...$messages, message.value];
                        subscription.messageCount += 1;
                        $subscriptions.set(subscription.topic, subscription);
                        $subscriptions = $subscriptions;
                    }
                    break;
            }
        });
    });

    messages.subscribe((m) => {
        if (m.length === 0) {
            $selectedMessage = undefined;
        }
    });
</script>

<View>
    <div id="content">
        <div id="publish-section" class="container">
            <PublishSection />
        </div>
    
        <div id="subscribe-section" class="container">
            <SubscribeSection />
        </div>
    
        {#if brokerConfig}
            <div id="subscription-list-section" class="container">
                <SubscriptionList profileName={brokerConfig.name} />
            </div>
        {/if}
    
        <div id="message-section" class="container">
            <MessageList />
        </div>
    
        <div id="message-overview-section" class="container">
            <MessageOverview />
        </div>
    </div>
</View>

<style>
    #content {
        height: 100%;
        display: grid;
        grid-template-columns: 1fr 2fr;
        grid-template-rows: min-content min-content 40vh 20vh;
        grid-template-areas:
            "publish publish"
            "subscribe subscribe"
            "subscription messages"
            "subscription message-overview";
    }

    #publish-section {
        grid-area: publish;
    }

    #subscribe-section {
        grid-area: subscribe;
    }

    #subscription-list-section {
        grid-area: subscription;
        overflow: scroll;
    }

    #message-section {
        grid-area: messages;
        height: 100%;
    }

    #message-overview-section {
        grid-area: message-overview;
        border-top: None;
    }

    .container {
        padding: 5px;
        border: 1.5px solid var(--vscode-input-background);
        margin: 5px;
    }
</style>
