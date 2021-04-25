<script lang="ts">
    import { onMount, tick } from "svelte";
    import type { MQTTMessage } from "./types";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let messages: Array<MQTTMessage> = [];
    let autoScroll: boolean = true;
    let list: Element;
    let selectedItemIndex: Number;

    function scrollToBottom() {
        if (list.scrollHeight - list.scrollTop >= list.clientHeight * 3) {
            list.scroll({ top: list.scrollHeight, left: 0, behavior: "auto" });
        } else {
            list.scroll({
                top: list.scrollHeight,
                left: 0,
                behavior: "smooth",
            });
        }
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

<div class="root">
    <h2 class="title">Messages</h2>

    <div class="list" bind:this={list}>
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
                <div class="color-marker"></div>
                <div class="topic">{message.topic}</div>
                <div class="qos">QoS {message.qos}</div>
                {#if message.retain}
                    <div class="retain">Retained</div>
                {/if}
                <div class="payload">{message.payload}</div>
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
                    scrollToBottom();
                }
            }}
        />
        <span
            class="clear-button"
            on:click={() => {
                messages = [];
                dispatch("listCleared", null);
            }}>Clear list</span
        >
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

    .list {
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
            "color-marker topic qos retain"
            "color-marker payload payload payload";
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
</style>
