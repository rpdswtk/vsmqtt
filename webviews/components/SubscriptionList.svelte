<script lang="ts">
    import type { SubscriptionItem } from "./types";

    export let subscriptions: Array<SubscriptionItem> = [];

    function unsubscribe(subscriptionItem: SubscriptionItem) {
        const index = subscriptions.findIndex((subscription) => {
            return subscription.topic === subscriptionItem.topic;
        });
        if (index > -1) {
            subscriptions.splice(index, 1);
            subscriptions = subscriptions;
        }
        vscode.postMessage({
            type: "unsubscribe",
            value: { topic: subscriptionItem.topic },
        });
    }
</script>

<h2>Subscriptions</h2>

{#each subscriptions as subscription}
    <div class="list-item">
        <div class="color-marker"></div>
        <div class="topic-label">Topic: </div>
        <div class="topic">{subscription.topic}</div>
        <div class="qos">QoS {subscription.qos}</div>
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
            "color-marker qos . .";
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
</style>
