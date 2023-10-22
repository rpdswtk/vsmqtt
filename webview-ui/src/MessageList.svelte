<script lang="ts">
  import { tick } from "svelte"
  import { messages, selectedMessage } from "./utilities/stores"

  let autoScroll = true
  let list: Element

  function scrollToBottom() {
    if (list.scrollHeight - list.scrollTop >= list.clientHeight * 3) {
      list.scroll({ top: list.scrollHeight, left: 0, behavior: "auto" })
    } else {
      list.scroll({
        top: list.scrollHeight,
        left: 0,
        behavior: "smooth",
      })
    }
  }

  messages.subscribe(async () => {
    await tick()
    if (autoScroll) {
      scrollToBottom()
    }
  })
</script>

<div class="root">
  <h2 class="title">Messages</h2>

  <div class="message-list" bind:this={list}>
    {#each $messages as message}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="list-item"
        class:selected={$selectedMessage === message}
        on:click={() => {
          $selectedMessage = message
        }}>
        <div class="color-marker" style="background-color: {message.color}" />
        <div class="topic">{message.topic}</div>
        <div class="qos">QoS {message.qos}</div>
        <div class="payload">{message.payload}</div>
        {#if message.retain}
          <div class="retain">Retained</div>
        {/if}
        <div class="id">{message.id}</div>
      </div>
    {/each}
  </div>

  <div class="options">
    <span class="scroll">Autoscroll</span>
    <input
      type="checkbox"
      class="checkbox"
      bind:checked={autoScroll}
      on:change={() => {
        if (autoScroll) {
          scrollToBottom()
        }
      }} />
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span
      class="clear-button"
      on:click={() => {
        $messages = []
      }}>Clear list</span>
  </div>
</div>

<style>
  .root {
    display: grid;
    grid-template-rows: min-content auto min-content;
    height: 100%;
  }

  .title {
    grid-row-start: 1;
    grid-row-end: 2;
  }

  .message-list {
    grid-row-start: 2;
    grid-row-end: 3;
    height: 100%;
    overflow: scroll;
  }

  .list-item {
    display: grid;
    grid-template-rows: auto 2em;
    grid-template-columns: 6px auto 60px 50px;
    background-color: var(--vscode-input-background);
    margin-top: 5px;
    margin-bottom: 5px;
    margin-right: 5px;
    margin-left: 1px;
    padding: 2px;
    cursor: pointer;
    grid-template-areas:
      "color-marker topic retain qos"
      "color-marker payload payload id";
  }

  .options {
    grid-row-start: 3;
    grid-row-end: 4;
  }

  .topic {
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
  }

  .retain {
    grid-area: retain;
    margin-right: 5px;
  }

  .payload {
    grid-area: payload;
    margin-top: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .selected {
    outline: solid 1px var(--vscode-focusBorder);
  }

  .scroll {
    float: left;
    margin-left: 2px;
  }

  .clear-button {
    cursor: pointer;
    float: right;
    margin-right: 15px;
  }

  .color-marker {
    grid-area: color-marker;
    margin-right: 3px;
  }

  .id {
    grid-area: id;
    text-align: right;
    padding-right: 4px;
    margin-top: 3px;
  }
</style>
