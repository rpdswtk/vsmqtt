<script lang="ts">
  import { onDestroy, tick } from "svelte"
  import { messages, selectedMessage } from "./utilities/stores"
  import "@vscode-elements/elements/dist/vscode-context-menu/index.js"
  import type { VscodeContextMenu } from "@vscode-elements/elements/dist/vscode-context-menu/index.js"
  import { onMount } from "svelte"
  import ExtensionHostBridge from "./utilities/extensionBridge"

  let autoScroll = true
  let list: Element
  let contextMenu: VscodeContextMenu

  const handleContextMenuSelect = (_: CustomEvent) => {
    if ($selectedMessage) {
      ExtensionHostBridge.openMessage($selectedMessage)
    }
  }

  const showContextMenu = async (x: number, y: number) => {
    contextMenu.show = true
    await tick()
    let element = contextMenu as HTMLElement
    element.style.left = `${x}px`
    element.style.top = `${y}px`

    let windowWidth = window.innerWidth

    await tick()

    if (x + element.clientWidth >= windowWidth) {
      element.style.left = `${x - element.clientWidth}px`
    }
  }

  const handleRightClick = (event: MouseEvent) => {
    event.preventDefault()
    showContextMenu(event.clientX, event.clientY)
  }

  const scrollToBottom = () => {
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

  onMount(() => {
    messages.subscribe(async () => {
      await tick()
      if (autoScroll) {
        scrollToBottom()
      }
    })

    contextMenu.data = [
      {
        label: "Open in editor",
        value: "openMessage",
      },
    ]

    contextMenu.addEventListener("vsc-context-menu-select", handleContextMenuSelect)
  })

  onDestroy(() => {
    contextMenu.removeEventListener("vsc-context-menu-select", handleContextMenuSelect)
  })
</script>

<vscode-context-menu class="context-menu" bind:this={contextMenu} on:contextmenu|preventDefault
></vscode-context-menu>

<div class="root">
  <h2 class="title">Messages</h2>

  <div class="message-list" bind:this={list} on:contextmenu={(e) => e.preventDefault()}>
    {#each $messages as message}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="list-item"
        class:selected={$selectedMessage === message}
        on:click={() => {
          $selectedMessage = message
        }}
        on:dblclick={() => {
          $selectedMessage = message
          ExtensionHostBridge.openMessage(message)
        }}
        on:contextmenu={(event) => {
          event.preventDefault()
          $selectedMessage = message
          handleRightClick(event)
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
  .context-menu {
    position: absolute;
    z-index: 2;
    width: fit-content;
  }

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
