<script lang="ts">
  import { vscode } from "./utilities/vscode"
  import { ColorManager } from "./utilities/ColorManager"
  import { subscriptions, savedSubscriptions } from "./utilities/stores"
  import { onMount } from "svelte"
  import SubscriptionElement from "./SubscriptionElement.svelte"

  export let profileName: string

  onMount(() => {
    $savedSubscriptions?.forEach((subscription) => {
      vscode.postMessage({
        type: "subscribe",
        value: {
          topic: subscription.topic,
          qos: subscription.qos,
        },
      })

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
