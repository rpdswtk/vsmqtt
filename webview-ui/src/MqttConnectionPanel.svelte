<script lang="ts">
  import ExtensionMessages from "@common/constants/ExtensionMessages"
  import type MqttBrokerConfig from "@common/interfaces/MqttBrokerConfig"
  import type { ColorThemeKind } from "@common/interfaces/ThemeInformation"
  import match from "mqtt-match"
  import { onMount } from "svelte"
  import { writable } from "svelte/store"
  import MessageList from "./MessageList.svelte"
  import MessageOverview from "./MessageOverview.svelte"
  import PublishSection from "./PublishSection.svelte"
  import StatusIndicator from "./StatusIndicator.svelte"
  import SubscribeSection from "./SubscribeSection.svelte"
  import SubscriptionList from "./SubscriptionList.svelte"
  import type { SubscriptionItem } from "./types"
  import { ColorManager } from "./utilities/ColorManager"
  import {
    isConnected,
    messages,
    savedSubscriptions,
    selectedMessage,
    subscriptions,
  } from "./utilities/stores"

  let brokerConfig: MqttBrokerConfig
  let themeColorKind = writable<ColorThemeKind | undefined>()

  const getSubscriptionOrNull = (topic: string): SubscriptionItem | undefined => {
    let subscription = $subscriptions.get(topic)
    if (!subscription) {
      let matchedTopic = Array.from($subscriptions.keys()).find((usedTopic) => match(usedTopic, topic))
      if (matchedTopic) {
        subscription = $subscriptions.get(matchedTopic)
      }
    }

    return subscription
  }

  onMount(() => {
    // disable right click
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault()
    })

    // TODO
    // eslint-disable-next-line no-undef
    brokerConfig = brokerProfile
    $savedSubscriptions = new Map()
    brokerConfig.savedSubscriptions?.forEach((subscription) =>
      $savedSubscriptions.set(subscription.topic, subscription)
    )
    window.addEventListener("message", async (event) => {
      const message = event.data
      switch (message.type) {
        case ExtensionMessages.onMqttConnectionChange:
          $isConnected = message.value.connected
          break
        case ExtensionMessages.onMqttMessage: {
          let subscription = getSubscriptionOrNull(message.value.topic)

          if (subscription && !subscription.muted) {
            message.value.color = ColorManager.getColor(subscription.topic)
            $messages = [...$messages, message.value]
            subscription.messageCount += 1
            $subscriptions.set(subscription.topic, subscription)
            $subscriptions = $subscriptions
          }
          break
        }
        case ExtensionMessages.themeInformationChange: {
          ColorManager.clearColors()
          themeColorKind.set(message.value.themeKind)
          break
        }
      }
    })
  })

  messages.subscribe((m) => {
    if (m.length === 0) {
      $selectedMessage = undefined
    }
  })
</script>

{#if $themeColorKind}
  {#key $themeColorKind}
    <div id="content">
      <div id="header" class="user-select-none">
        <h2 class="profile-name">Profile: {brokerConfig.name}</h2>
        <div class="status"><StatusIndicator /></div>
      </div>

      <div id="publish-section" class="container">
        <PublishSection />
      </div>

      <div id="subscribe-section" class="container">
        <SubscribeSection />
      </div>

      {#if brokerConfig}
        <div id="subscription-list-section" class="container">
          <SubscriptionList profileName={brokerConfig.name} />
        </div>
      {/if}

      <div id="message-section" class="container">
        <MessageList />
      </div>

      <div id="message-overview-section" class="container">
        <MessageOverview />
      </div>
    </div>{/key}
{/if}

<style>
  #content {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-template-rows: min-content min-content min-content 40vh 20vh;
  }

  #header {
    grid-area: 1 / 1 / 2 / 3;
    margin-left: 5px;
    margin-right: 5px;
  }

  .profile-name {
    float: left;
    font-weight: 500;
    text-transform: uppercase;
    margin-left: 2px;
  }

  .status {
    float: right;
  }

  #publish-section {
    grid-area: 2 / 1 / 3 / 3;
  }

  #subscribe-section {
    grid-area: 3 / 1 / 4 / 3;
  }

  #subscription-list-section {
    grid-area: 4 / 1 / 6 / 2;
  }

  #message-section {
    grid-area: 4 / 2 / 5 / 3;
    height: 100%;
  }

  #message-overview-section {
    grid-area: 5 / 2 / 6 / 3;
    border-top: None;
  }

  .container {
    padding: 5px;
    border: 1px solid var(--vscode-settings-dropdownBorder);
    margin: 3px;
  }
</style>
