<script lang="ts">
    import { onMount, tick } from "svelte";
    import type { MQTTMessage } from "./types";
    import { createEventDispatcher, afterUpdate } from "svelte";

    const dispatch = createEventDispatcher();

    let messages: Array<MQTTMessage> = [];
    let autoScroll: boolean = true;
    let list: Element;
    let selectedItemIndex: Number;

    function scrollToBottom() {
        //list.scroll(0, list.scrollHeight, );
        list.scroll({ top: list.scrollHeight, left: 0, behavior: "smooth" });
    }

    onMount(() => {
        window.addEventListener("message", async (event) => {
            const message = event.data;
            switch (message.type) {
                case "onMqttMessage":
                    messages = [...messages, message.value];
                    await tick();
                    if (autoScroll) {
                        scrollToBottom();
                    }
                    break;
            }
        });
    });
</script>

<h2>Messages</h2>

<div class="root" bind:this={list}>
    {#each messages as message, index}
        <div
            class="list-item"
            class:selected={selectedItemIndex === index}
            on:click={() => {
                selectedItemIndex = index;
                dispatch("messageSelected", {
                    selectedMessage: message,
                });
            }}
        >
            <div class="topic">{message.topic}</div>
            <div class="qos">QoS {message.qos}</div>
            {#if message.retain}
                <div class="retain">Retained</div>
            {/if}
            <div class="payload">{message.payload}</div>
        </div>
    {/each}
</div>

<span>Autoscroll</span>
<input
    type="checkbox"
    class="checkbox"
    bind:checked={autoScroll}
    on:change={() => {
        if (autoScroll) {
            scrollToBottom();
        }
    }}
/>

<style>
    .root {
        height: 90%;
        overflow: scroll;
    }

    .list-item {
        display: grid;
        grid-template-rows: auto 2em;
        grid-template-columns: auto 60px 50px;
        background-color: var(--vscode-input-background);
        margin: 5px;
        padding: 5px;
        cursor: pointer;
    }

    .topic {
        grid-area: 1 / 1 / 2 / 2;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .qos {
        grid-area: 1 / 3 / 2 / 4;
    }

    .retain {
        grid-area: 1 / 2 / 2 / 3;
    }

    .payload {
        grid-area: 2 / 1 / 3 / 4;
        margin-top: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .selected {
        outline: solid 1px var(--vscode-focusBorder);
    }
</style>
