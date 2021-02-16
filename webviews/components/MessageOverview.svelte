<script lang="ts">
    import type { MQTTMessage } from "./types";
    export let message: MQTTMessage | undefined;
</script>

{#if message}
    <div class="list-item">
        <div class="timestamp">{message.timestamp}</div>
        <div class="topic">{message.topic}</div>
        <div class="qos">QoS {message.qos}</div>
        {#if message.retain}
            <div class="retained">Retained</div>
        {/if}
        <textarea class="payload" readonly>{message.payload}</textarea>
    </div>
{/if}

<style>
    .list-item {
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
        grid-area: 2 / 2 / 3 / 3;
        margin-bottom: 2px;
    }

    .topic {
        grid-area: 2 / 1 / 3 / 2;
        margin-bottom: 2px;
    }

    .qos {
        grid-area: 2 / 3 / 3 / 4;
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
