<script lang="ts">
  import type { DefaultsForPublish } from "@common/interfaces/MqttBrokerConfig"
  import "@vscode-elements/elements/dist/vscode-button/index.js"
  import "@vscode-elements/elements/dist/vscode-checkbox/index.js"
  import "@vscode-elements/elements/dist/vscode-single-select/index.js"
  import "@vscode-elements/elements/dist/vscode-textarea/index.js"
  import "@vscode-elements/elements/dist/vscode-textfield/index.js"
  import "@vscode-elements/elements/dist/vscode-toolbar-button/index.js"
  import { Save } from "svelte-codicons"
  import "./styles.css"
  import ExtensionHostBridge from "./utilities/extensionBridge"
  import { isConnected } from "./utilities/stores"
  import VSCodeBindableWrapper from "./utilities/VSCodeBindableWrapper.svelte"

  export let defaultsForPublish: DefaultsForPublish | undefined

  let publishText: string = defaultsForPublish?.payload ?? ""
  let publishTopic: string = defaultsForPublish?.topic ?? ""
  let selectedQos: string = defaultsForPublish?.qos.toString() ?? "0"
  let retain: boolean = defaultsForPublish?.retain ?? false
</script>

<h2 class="section-title user-select-none">Publish</h2>

<div class="d-flex justify-content-start align-items-center gap-2 m-1 publish-options">
  <VSCodeBindableWrapper bind:value={publishTopic} innerClass="w-50">
    <vscode-textfield id="publish-topic-input" type="text" placeholder="Topic" class="w-100"
    ></vscode-textfield>
  </VSCodeBindableWrapper>

  <VSCodeBindableWrapper bind:value={selectedQos}>
    <vscode-single-select id="qos-select" class="qos-select">
      <vscode-option value="0">QoS 0</vscode-option>
      <vscode-option value="1">QoS 1</vscode-option>
      <vscode-option value="2">QoS 2</vscode-option>
    </vscode-single-select>
  </VSCodeBindableWrapper>

  <VSCodeBindableWrapper bind:value={retain}>
    <vscode-checkbox label="Retain"></vscode-checkbox>
  </VSCodeBindableWrapper>
  <vscode-toolbar-button
    title="Save as default"
    on:click={() =>
      ExtensionHostBridge.saveDefaultPublishValues(publishTopic, publishText, parseInt(selectedQos), retain)}
    ><Save /></vscode-toolbar-button>
</div>

<div class="d-flex justify-content-start align-items-center gap-2 ms-1 mt-2">
  <VSCodeBindableWrapper bind:value={publishText} innerClass="w-75">
    <vscode-textarea id="payload-input" placeholder="Payload" class="w-100"></vscode-textarea>
  </VSCodeBindableWrapper>
</div>
<vscode-button
  class="ms-1 mt-1"
  id="publish-button"
  on:click={() => {
    if (publishTopic) {
      ExtensionHostBridge.publishMessage(publishTopic, publishText, parseInt(selectedQos), retain)
    }
  }}
  disabled={!$isConnected}>Publish</vscode-button>

<style>
  vscode-textarea {
    height: 90px;
  }
</style>
