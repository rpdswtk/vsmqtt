<script lang="ts">
    import { ColorManager } from "./ColorManager";
    import type { SubscriptionItem } from "./types";
    import { subscriptions } from './stores';

    function unsubscribe(subscriptionItem: SubscriptionItem) {
        $subscriptions.delete(subscriptionItem.topic);
        $subscriptions = $subscriptions;

        vscode.postMessage({
            type: "unsubscribe",
            value: { topic: subscriptionItem.topic },
        });
    }
</script>

<h2>Subscriptions</h2>

{#each Array.from($subscriptions.values()) as subscription}
    <div class="list-item">
        <div class="color-marker" style="background-color: {ColorManager.getColor(subscription.topic)};"></div>
        <div class="topic-label">Topic: </div>
        <div class="topic">{subscription.topic}</div>
        <div class="qos">QoS {subscription.qos}</div>
        <div class="msg-cnt">{subscription.messageCount}</div>
        <button class="unsub"
            on:click={() => {
                unsubscribe(subscription);
            }}>Unsubscribe</button
        >
    </div>
{/each}

<style>
    .list-item {
        display: grid;
        grid-template-rows: auto auto;
        grid-template-columns: 4px 4em auto 7em;
        grid-template-areas: 
            "color-marker topic-label topic unsub"
            "color-marker qos . message-count";
        background-color: var(--vscode-input-background);
        margin-bottom: 5px;
        margin-top: 5px;
    }

    .topic-label {
        grid-area: topic-label;
        margin: 5px;
    }

    .topic {
        grid-area: topic;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 5px;
    }

    .qos {
        grid-area: qos;
        margin: 2px 5px 5px 5px;
    }

    .unsub {
        grid-area: unsub;
    }

    .color-marker {
        grid-area: color-marker;
        width: 3px;
        margin: 3px;
    }

    .msg-cnt {
        grid-area: message-count;
        text-align: right;
        margin-right: 5px;
        margin-top: 2px;
    }
</style>
