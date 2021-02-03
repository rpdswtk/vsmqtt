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
        <span class="topic">Topic: {subscription.topic} QoS: {subscription.qos}</span>
        <button
            on:click={() => {
                unsubscribe(subscription);
            }}>Unsubscribe</button
        >
    </div>
{/each}

<style>
    .list-item {
        background-color: var(--vscode-input-background);
        margin-top: 10px;
        height: 30px;
        padding: 1px;
    }

    button {
        width: 20%;
        float: right;
    }

    .topic {
        float: left;
        margin-top: 5px;
        margin-left: 5px;
    }
</style>
