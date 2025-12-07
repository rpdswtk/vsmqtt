<script lang="ts">
  import "@vscode-elements/elements/dist/vscode-badge/index.js"
  import "@vscode-elements/elements/dist/vscode-toolbar-button/index.js"
  import { createEventDispatcher } from "svelte"
  import { Menu, Mute, Pinned } from "svelte-codicons"
  import type { SubscriptionItem } from "./types"
  import { ColorManager } from "./utilities/ColorManager"
  import ExtensionHostBridge from "./utilities/extensionBridge"
  import { isConnected, savedSubscriptions, subscriptions } from "./utilities/stores"

  export let topic: string

  $: subscription = $subscriptions.get(topic)!

  const dispatch = createEventDispatcher()

  const unsubscribe = (subscriptionItem: SubscriptionItem) => {
    $subscriptions.delete(subscriptionItem.topic)
    $subscriptions = $subscriptions

    ExtensionHostBridge.unsubscribeFromTopic(subscriptionItem.topic)
  }

  const handleContextMenuClick = (event: MouseEvent) => {
    dispatch("menuClick", {
      element: event.target as HTMLElement,
      subscription: subscription,
    })
  }
</script>

<div class="list-item">
  <div class="topic-label">
    <vscode-badge style="--vscode-badge-background: {ColorManager.getColor(subscription.topic)};"
      >Topic:&nbsp;&nbsp;&nbsp;{subscription.topic}</vscode-badge>
  </div>
  <div class="menu-icon mt-2 user-select-none" on:click={handleContextMenuClick}>
    <Menu name="menu" />
  </div>
  <div class="qos user-select-none">
    QoS:
    {subscription.qos}
  </div>
  <div class="status-icons user-select-none">
    {#if $savedSubscriptions.has(subscription.topic)}
      <Pinned />
    {/if}
    {#if subscription.muted}
      <Mute />
    {/if}
  </div>
  <div class="msg-cnt user-select-none">
    <vscode-badge variant="counter">{subscription.messageCount}</vscode-badge>
  </div>
  <div class="unsub d-flex justify-content-end">
    {#if $isConnected}
      <vscode-toolbar-button
        on:click={() => {
          unsubscribe(subscription)
        }}>Unsubscribe</vscode-toolbar-button>
    {:else}
      <vscode-toolbar-button disabled>Unsubscribe</vscode-toolbar-button>
    {/if}
  </div>
</div>

<style>
  .list-item {
    display: grid;
    grid-template-rows: auto 30px;
    grid-template-columns: 4em auto 2em 7em;
    grid-template-areas:
      "topic-label topic-label menu-icon unsub"
      "qos pin-icon . message-count";
    background-color: var(--vscode-settings-dropdownBorder);
    margin-bottom: 5px;
    margin-top: 5px;
  }

  .topic-label {
    grid-area: topic-label;
    margin: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .qos {
    grid-area: qos;
    margin: 5px 0px 0px 10px;
    color: var(--vscode-input-placeholderForeground);
  }

  .unsub {
    grid-area: unsub;
  }

  .msg-cnt {
    grid-area: message-count;
    text-align: right;
    margin-right: 4px;
    margin-top: 4px;
  }

  .menu-icon {
    grid-area: menu-icon;
    cursor: pointer;
    margin: 3px;
  }

  .status-icons {
    grid-area: pin-icon;
    margin-top: 6px;
    margin-left: 3px;
    display: flex;
    flex-direction: row;
  }

  vscode-badge {
    box-sizing: border-box;
  }
</style>
