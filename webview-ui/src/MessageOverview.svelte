<script lang="ts">
  import { vscode } from "./utilities/vscode"
  import { selectedMessage } from "./utilities/stores"

  const clearRetainedTopic = () => {
    if (!$selectedMessage) {
      return
    }

    vscode.postMessage({
      type: "clearRetainedTopic",
      value: {
        topic: $selectedMessage.topic,
      },
    })
  }
</script>

{#if $selectedMessage}
  <div class="message-details">
    <div class="timestamp">{$selectedMessage.timestamp}</div>
    <div class="topic">{$selectedMessage.topic}</div>
    <div class="qos">QoS {$selectedMessage.qos}</div>
    {#if $selectedMessage.retain}
      <div class="retained">Retained</div>
      <a on:click={clearRetainedTopic} href="foo" class="clear-retained">Clear</a>
    {/if}
    <textarea class="payload" readonly>{$selectedMessage.payload}</textarea>
  </div>
{/if}

<style>
  .message-details {
    display: grid;
    grid-template-rows: min-content min-content auto;
    grid-template-columns: auto 5em 3em;
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

  .topic {
    grid-area: 2 / 1 / 3 / 2;
    margin-bottom: 2px;
  }

  .qos {
    grid-area: 1 / 3 / 2 / 4;
    margin-bottom: 2px;
  }

  .payload {
    grid-area: 3 / 1 / 4 / 4;
    resize: none;
  }

  .payload:focus {
    outline: none;
  }
</style>
