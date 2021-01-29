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

{#each subscriptions as subscription}
    <div class="">
        <h3>{subscription.topic} - qos {subscription.qos}</h3>
        <a
            href="#"
            on:click={() => {
                unsubscribe(subscription);
            }}><h3>unsubscribe</h3></a
        >
    </div>
{/each}

<style>
</style>
