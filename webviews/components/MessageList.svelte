<script lang="ts">
    import { onMount } from "svelte";
    import type { MQTTMessage } from "./types";

    let messages: Array<MQTTMessage> = [];

    onMount(() => {
        window.addEventListener("message", (event) => {
            const message = event.data;
            switch (message.type) {
                case "onMqttMessage":
                    messages = [...messages, message.value];
                    break;
            }
        });
    });
</script>

<h2>Messages</h2>

{#each messages as message}
    <div class="list-item">
        <div class="topic">{message.topic}</div>
        <div class="qos">QoS {message.qos}</div>
        {#if message.retain}
            <div class="retain">Retained</div>
        {/if}
        <div class="payload">{message.payload}</div>
    </div>
{/each}

<style>
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
</style>
