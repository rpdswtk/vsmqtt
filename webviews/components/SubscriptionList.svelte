<script lang="ts">
    import type { SubscriptionItem } from "./types";

    export let subscriptions: Array<SubscriptionItem> = [];
</script>

{#each subscriptions as subscription}
    <div>
        <h3>{subscription.topic} - {subscription.qos}</h3>
    </div>
{/each}
