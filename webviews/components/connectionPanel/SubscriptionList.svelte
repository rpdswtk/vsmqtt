<script lang="ts">
    import { ColorManager } from ".././ColorManager";
    import { subscriptions, savedSubscriptions } from '.././stores';
    import { onMount } from "svelte";
    import SubscriptionElement from './SubscriptionElement.svelte';

    export let profileName: string;

    onMount(() => {
        $savedSubscriptions?.forEach((subscription => {
            vscode.postMessage({
                type: "subscribe",
                value: {
                    topic: subscription.topic,
                    qos: subscription.qos
                },
            });

            $subscriptions = $subscriptions.set(
            subscription.topic, 
            {
                topic: subscription.topic, 
                qos: subscription.qos, 
                color: ColorManager.getColor(subscription.topic),
                messageCount: 0
            }
        );
        }));
    });
</script>

<h2>Subscriptions</h2>

{#each Array.from($subscriptions.values()) as subscription}
    <SubscriptionElement profileName={profileName} subscription={subscription} />
{/each}