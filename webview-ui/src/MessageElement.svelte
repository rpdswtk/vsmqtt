<script lang="ts">
  import type MQTTMessage from "@common/interfaces/MqttMessage"
  import "@vscode-elements/elements/dist/vscode-badge/index.js"
  import { ColorManager } from "./utilities/ColorManager"
  import ExtensionHostBridge from "./utilities/extensionBridge"
  import { selectedMessage } from "./utilities/stores"

  export let message: MQTTMessage
</script>

<div
  class="list-item"
  class:selected={$selectedMessage === message}
  on:click={() => {
    $selectedMessage = message
  }}
  on:dblclick={() => {
    $selectedMessage = message
    ExtensionHostBridge.openMessage(message)
  }}>
  <div class="topic">
    <vscode-badge style="--vscode-badge-background: {ColorManager.getColor(message.topic)};"
      >{message.topic}</vscode-badge>
  </div>
  <div class="qos user-select-none">QoS {message.qos}</div>
  <div class="payload">{message.payload}</div>
  {#if message.retain}
    <div class="retain user-select-none">
      <vscode-badge>Retained</vscode-badge>
    </div>
  {/if}
  <div class="id user-select-none">#{message.id}</div>
</div>

<style>
  .list-item {
    display: grid;
    grid-template-rows: auto 2em;
    grid-template-columns: auto 45px 50px;
    background-color: var(--vscode-settings-dropdownBorder);
    margin-top: 5px;
    margin-bottom: 5px;
    margin-left: 1px;
    margin-right: 1px;
    cursor: pointer;
    grid-template-areas:
      "topic retain qos"
      "payload payload id";
  }

  .topic {
    margin: 3px;
    grid-area: topic;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .qos {
    grid-area: qos;
    text-align: right;
    padding-right: 4px;
    margin-top: 4px;
    color: var(--vscode-input-placeholderForeground);
  }

  .retain {
    margin-top: 3px;
    grid-area: retain;
  }

  .payload {
    grid-area: payload;
    margin-top: 3px;
    margin-left: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .selected {
    outline: solid 1px var(--vscode-focusBorder);
  }

  .id {
    grid-area: id;
    text-align: right;
    padding-right: 4px;
    margin-top: 3px;
    padding-right: 4px;
  }
</style>
