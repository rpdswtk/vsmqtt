<script lang="ts">
  import "@vscode-elements/elements/dist/vscode-badge/index.js"
  import "@vscode-elements/elements/dist/vscode-checkbox/index.js"
  import "@vscode-elements/elements/dist/vscode-toolbar-button/index.js"
  import { derived } from "svelte/store"
  import ExtensionHostBridge from "./utilities/extensionBridge"
  import { formatPayload } from "./utilities/formatPayload"
  import { selectedMessage } from "./utilities/stores"
  import VSCodeBindableWrapper from "./utilities/VSCodeBindableWrapper.svelte"

  const clearRetainedTopic = () => {
    if (!$selectedMessage) {
      return
    }

    ExtensionHostBridge.clearRetainedTopic($selectedMessage.topic)
  }

  const formatted = derived(selectedMessage, ($msg) => ($msg ? formatPayload($msg.payload) : null))

  let showFormatted = $state(true)

  const payloadText = $derived(
    showFormatted
      ? ($formatted?.pretty ?? $selectedMessage?.payload ?? "")
      : ($selectedMessage?.payload ?? ""),
  )
</script>

{#if $selectedMessage}
  <div class="message-details">
    <div class="timestamp">{$selectedMessage.timestamp}</div>
    <div class="topic-container">
      <div class="topic">{$selectedMessage.topic}</div>
      <VSCodeBindableWrapper bind:value={showFormatted}>
        <vscode-checkbox label={showFormatted ? "Raw" : "Pretty"} toggle></vscode-checkbox>
      </VSCodeBindableWrapper>
    </div>
    <div class="qos user-select-none">QoS {$selectedMessage.qos}</div>
    <div class="retained user-select-none" class:invisible={!$selectedMessage.retain}>Retained</div>
    <vscode-toolbar-button
      class="clear-retained"
      class:invisible={!$selectedMessage.retain}
      onclick={clearRetainedTopic}>Clear</vscode-toolbar-button>
    <vscode-badge class="format-badge">{$formatted?.format.toUpperCase() ?? ""}</vscode-badge>
    <textarea class="payload" readonly>{payloadText}</textarea>
  </div>
{/if}

<style>
  .message-details {
    display: grid;
    grid-template-rows: min-content min-content auto;
    grid-template-columns: 1fr 5em 4.5em;
    height: 100%;
  }

  .timestamp {
    grid-area: 1 / 1 / 2 / 2;
    margin-bottom: 2px;
  }

  .retained {
    grid-area: 1 / 2 / 2 / 3;
    margin-bottom: 2px;
  }

  .clear-retained {
    grid-area: 2 / 2 / 3 / 3;
    margin-bottom: 2px;
    text-decoration: none;
  }

  .topic-container {
    grid-area: 2 / 1 / 3 / 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
    min-width: 0;
  }

  .topic {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .qos {
    grid-area: 1 / 3 / 2 / 4;
    margin-bottom: 2px;
    text-align: center;
  }

  .format-badge {
    grid-area: 2 / 3 / 3 / 4;
    align-self: center;
  }

  .payload {
    grid-area: 3 / 1 / 4 / 4;
    resize: none;
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: var(--vscode-editor-font-size, 13px);
  }

  .payload:focus {
    outline: none;
  }

  .invisible {
    visibility: hidden;
  }
</style>
