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
        grid-template-columns: 4em auto 7em;
        background-color: var(--vscode-input-background);
        margin-bottom: 5px;
        margin-top: 5px;
    }

    .topic-label {
        grid-area: 1 / 1 / 2 / 2;
        margin: 5px;
    }

    .topic {
        grid-area: 1 / 2 / 2 /3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 5px;
    }

    .qos {
        grid-area: 2 / 1/ 3/ 2;
        margin: 2px 5px 5px 5px;
    }

    .unsub {
        grid-area: 1 / 3 / 2 / 4;
    }
</style>
