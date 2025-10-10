<script lang="ts">
  import { ColorManager } from "./utilities/ColorManager"
  import { subscriptions, savedSubscriptions } from "./utilities/stores"
  import { onMount } from "svelte"
  import SubscriptionElement from "./SubscriptionElement.svelte"
  import ExtensionHostBridge from "./utilities/extensionBridge"

  export let profileName: string

  onMount(() => {
    $savedSubscriptions?.forEach((subscription) => {
      ExtensionHostBridge.subscribeToTopic(subscription.topic, subscription.qos)

      $subscriptions = $subscriptions.set(subscription.topic, {
        topic: subscription.topic,
        qos: subscription.qos,
        color: ColorManager.getColor(subscription.topic),
        messageCount: 0,
      })
    })
  })
</script>

<h2>Subscriptions</h2>

{#each Array.from($subscriptions.values()) as subscription}
  <SubscriptionElement {profileName} {subscription} />
{/each}
