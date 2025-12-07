<script lang="ts">
  import "@vscode-elements/elements/dist/vscode-button/index.js"
  import "@vscode-elements/elements/dist/vscode-single-select/index.js"
  import "@vscode-elements/elements/dist/vscode-textfield/index.js"
  import { ColorManager } from "./utilities/ColorManager"
  import ExtensionHostBridge from "./utilities/extensionBridge"
  import { isConnected, subscriptions } from "./utilities/stores"
  import VSCodeBindableWrapper from "./utilities/VSCodeBindableWrapper.svelte"

  import "./styles.css"

  let subscribeTopic: string
  let selectedQos = "0"

  function subscribe(_: Event) {
    if (!subscribeTopic) {
      return
    }

    ExtensionHostBridge.subscribeToTopic(subscribeTopic, parseInt(selectedQos))

    $subscriptions = $subscriptions.set(subscribeTopic, {
      topic: subscribeTopic,
      qos: parseInt(selectedQos),
      color: ColorManager.getColor(subscribeTopic),
      messageCount: 0,
    })

    subscribeTopic = ""
  }
</script>

<h2 class="section-title user-select-none">Subscribe</h2>
<form on:submit|preventDefault={subscribe}>
  <div class="d-flex justify-content-start gap-2 m-1 subscription-options">
    <VSCodeBindableWrapper bind:value={subscribeTopic} innerClass="w-50">
      <vscode-textfield id="subscribe-topic-input" type="text" placeholder="Topic" class="w-100" />
    </VSCodeBindableWrapper>
    <VSCodeBindableWrapper bind:value={selectedQos}>
      <vscode-single-select id="qos-select" class="qos-select">
        <vscode-option value="0">QoS 0</vscode-option>
        <vscode-option value="1">QoS 1</vscode-option>
        <vscode-option value="2">QoS 2</vscode-option>
      </vscode-single-select>
    </VSCodeBindableWrapper>
  </div>
  <vscode-button class="ms-1 mt-1" type="submit" disabled={!$isConnected}>Subscribe</vscode-button>
</form>

<style>
</style>
