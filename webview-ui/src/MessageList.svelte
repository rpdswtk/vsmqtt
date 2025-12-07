<script lang="ts">
  import "@vscode-elements/elements/dist/vscode-button/index.js"
  import "@vscode-elements/elements/dist/vscode-checkbox/index.js"
  import "@vscode-elements/elements/dist/vscode-context-menu/index.js"
  import type { VscodeContextMenu } from "@vscode-elements/elements/dist/vscode-context-menu/index.js"
  import "@vscode-elements/elements/dist/vscode-scrollable/index.js"
  import type { VscodeScrollable } from "@vscode-elements/elements/dist/vscode-scrollable/index.js"
  import { onDestroy, onMount, tick } from "svelte"
  import MessageElement from "./MessageElement.svelte"
  import { showContextMenu } from "./utilities/contextMenu"
  import "./utilities/contextMenu.css"
  import ExtensionHostBridge from "./utilities/extensionBridge"
  import { messages, selectedMessage } from "./utilities/stores"
  import VSCodeBindableWrapper from "./utilities/VSCodeBindableWrapper.svelte"

  let autoScroll = true
  let list: VscodeScrollable
  let contextMenu: VscodeContextMenu

  const handleContextMenuSelect = (_: CustomEvent) => {
    if ($selectedMessage) {
      ExtensionHostBridge.openMessage($selectedMessage)
    }
  }

  const handleRightClick = (event: MouseEvent) => {
    event.preventDefault()
    showContextMenu(event.clientX, event.clientY, contextMenu)
  }

  const scrollToBottom = () => {
    list.scrollPos = list.scrollMax
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
  <h2 class="title section-title user-select-none">Messages</h2>

  <div class="message-list" on:contextmenu={(e) => e.preventDefault()}>
    <vscode-scrollable class="pe-3" bind:this={list} alwaysVisible>
      {#each $messages as message}
        <div
          on:contextmenu={(event) => {
            event.preventDefault()
            $selectedMessage = message
            handleRightClick(event)
          }}>
          <MessageElement {message} />
        </div>
      {/each}
    </vscode-scrollable>
  </div>

  <div class="options">
    <VSCodeBindableWrapper bind:value={autoScroll}>
      <vscode-checkbox label="Autoscroll"></vscode-checkbox>
    </VSCodeBindableWrapper>
    <vscode-button
      secondary
      class="clear-button"
      on:click={() => {
        $messages = []
      }}>Clear list</vscode-button>
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
    min-height: 0;
  }

  .options {
    grid-row-start: 3;
    grid-row-end: 4;
  }

  .clear-button {
    cursor: pointer;
    float: right;
    margin-right: 15px;
  }

  vscode-scrollable {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
  }
</style>
