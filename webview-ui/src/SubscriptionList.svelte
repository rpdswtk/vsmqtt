<script lang="ts">
  import type MQTTMessage from "@common/interfaces/MqttMessage"
  import type { VscodeContextMenu } from "@vscode-elements/elements/dist/vscode-context-menu/index.js"
  import "@vscode-elements/elements/dist/vscode-scrollable/index.js"
  import match from "mqtt-match"
  import { onDestroy, onMount } from "svelte"
  import "./styles.css"
  import SubscriptionElement from "./SubscriptionElement.svelte"
  import type { SubscriptionItem } from "./types"
  import { ColorManager } from "./utilities/ColorManager"
  import { showContextMenu } from "./utilities/contextMenu"
  import "./utilities/contextMenu.css"
  import ExtensionHostBridge from "./utilities/extensionBridge"
  import { messages, savedSubscriptions, subscriptions } from "./utilities/stores"

  export let profileName: string
  let selectedSubscription: SubscriptionItem
  let contextMenu: VscodeContextMenu

  const handleContextMenuSelect = (event: CustomEvent) => {
    switch (event.detail.value) {
      case "mute":
        mute()
        break
      case "pin":
        handlePin($savedSubscriptions.has(selectedSubscription.topic) ? false : true)
        break
      case "export":
        exportLog()
        break
    }
  }

  const handlePin = (pin = true) => {
    if (pin) {
      $savedSubscriptions.set(selectedSubscription.topic, selectedSubscription)
      ExtensionHostBridge.saveSubscription(profileName, {
        topic: selectedSubscription.topic,
        qos: selectedSubscription.qos,
      })
    } else {
      $savedSubscriptions.delete(selectedSubscription.topic)
      ExtensionHostBridge.removeSavedSubscription(profileName, selectedSubscription)
    }

    $savedSubscriptions = $savedSubscriptions
  }

  const mute = () => {
    selectedSubscription.muted = !selectedSubscription.muted
    $subscriptions = $subscriptions.set(selectedSubscription.topic, selectedSubscription)
  }

  const exportLog = () => {
    var messagesToExport = $messages.filter(
      (message: MQTTMessage) =>
        message.topic === selectedSubscription.topic || match(selectedSubscription.topic, message.topic)
    )

    ExtensionHostBridge.exportMessages(selectedSubscription.topic, messagesToExport)
  }

  const onMenuClick = (event: CustomEvent) => {
    if (contextMenu.show) {
      contextMenu.show = false
      return
    }

    const element = event.detail.element as HTMLElement
    selectedSubscription = event.detail.subscription as SubscriptionItem

    contextMenu.data = [
      {
        label: selectedSubscription.muted ? "Unmute" : "Mute",
        value: "mute",
      },
      {
        label: $savedSubscriptions.has(selectedSubscription.topic) ? "Unpin" : "Pin",
        value: "pin",
      },
      {
        label: "Export csv",
        value: "export",
      },
    ]

    const rect = element.getBoundingClientRect()

    showContextMenu(rect.left, rect.top, contextMenu)
  }

  onMount(() => {
    contextMenu.addEventListener("vsc-context-menu-select", handleContextMenuSelect)

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

  onDestroy(() => {
    contextMenu.removeEventListener("vsc-context-menu-select", handleContextMenuSelect)
  })
</script>

<vscode-context-menu class="context-menu" bind:this={contextMenu} on:contextmenu|preventDefault
></vscode-context-menu>

<div class="d-flex flex-column h-100">
  <h2 class="section-title user-select-none">Subscriptions</h2>

  <div class="wrapper d-flex flex-column flex-fill">
    <vscode-scrollable class="flex-fill pe-3" alwaysVisible style="min-height: 0; height: 100%;">
      {#each Array.from($subscriptions.values()) as subscription}
        <SubscriptionElement topic={subscription.topic} on:menuClick={onMenuClick} />
      {/each}
    </vscode-scrollable>
  </div>
</div>

<style>
  .wrapper {
    min-height: 0;
  }

  vscode-scrollable {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
  }
</style>
