<script lang="ts">
  import "@vscode-elements/elements/dist/vscode-button/index.js"
  import "@vscode-elements/elements/dist/vscode-checkbox/index.js"
  import "@vscode-elements/elements/dist/vscode-context-menu/index.js"
  import type { VscodeContextMenu } from "@vscode-elements/elements/dist/vscode-context-menu/index.js"
  import { onDestroy, onMount } from "svelte"
  import VirtualList from "svelte-tiny-virtual-list"
  import MessageElement from "./MessageElement.svelte"
  import { showContextMenu } from "./utilities/contextMenu"
  import "./utilities/contextMenu.css"
  import ExtensionHostBridge from "./utilities/extensionBridge"
  import { messages, selectedMessage } from "./utilities/stores"
  import VSCodeBindableWrapper from "./utilities/VSCodeBindableWrapper.svelte"

  let autoScroll = true
  let contextMenu: VscodeContextMenu

  let selectedIndex: number = -1
  let scrollToIndex: number | undefined = undefined
  let listHeight = 400

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      selectedIndex = Math.min(selectedIndex + 1, $messages.length - 1)
      scrollToIndex = selectedIndex
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      selectedIndex = Math.max(selectedIndex - 1, 0)
      scrollToIndex = selectedIndex
    } else {
      return
    }
  }

  $: if (selectedIndex >= 0 && selectedIndex < $messages.length) {
    $selectedMessage = $messages[selectedIndex]
  }

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
    if ($messages.length > 0) {
      scrollToIndex = $messages.length - 1
    }
  }

  let scrollScheduled = false

  const scheduleScrollToBottom = () => {
    if (!autoScroll || scrollScheduled) return
    scrollScheduled = true
    requestAnimationFrame(() => {
      scrollScheduled = false
      scrollToBottom()
    })
  }

  onMount(() => {
    messages.subscribe(() => {
      scheduleScrollToBottom()
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

<vscode-context-menu
  class="context-menu"
  bind:this={contextMenu}
  oncontextmenu={(e: Event) => e.preventDefault()}></vscode-context-menu>

<div class="root">
  <h2 class="title section-title user-select-none">Messages</h2>

  <div
    class="message-list"
    tabindex="0"
    role="listbox"
    aria-label="Received messages"
    bind:offsetHeight={listHeight}
    onkeydown={handleKeydown}
    oncontextmenu={(e) => e.preventDefault()}>
    <VirtualList
      width="100%"
      height={listHeight}
      itemCount={$messages.length}
      itemSize={55}
      {scrollToIndex}
      scrollToAlignment="end">
      {#snippet item({ style, index })}
        <div {style}>
          <div
            class="message-item"
            class:selected={index === selectedIndex}
            role="option"
            aria-selected={index === selectedIndex}
            onclick={() => {
              selectedIndex = index
            }}
            oncontextmenu={(event) => {
              event.preventDefault()
              $selectedMessage = $messages[index]
              handleRightClick(event)
            }}>
            <MessageElement message={$messages[index]} />
          </div>
        </div>
      {/snippet}
    </VirtualList>
  </div>

  <div class="options">
    <VSCodeBindableWrapper bind:value={autoScroll}>
      <vscode-checkbox label="Autoscroll"></vscode-checkbox>
    </VSCodeBindableWrapper>
    <vscode-button
      secondary
      class="clear-button"
      onclick={() => {
        $messages = []
        selectedIndex = -1
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
    outline: none;
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

  .message-item.selected {
    background-color: var(--vscode-list-activeSelectionBackground);
    color: var(--vscode-list-activeSelectionForeground);
    outline: none;
  }
</style>
