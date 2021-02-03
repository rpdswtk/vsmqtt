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

<div>
    {#each messages as message}
        <h3>{message.topic} - {message.payload}</h3>
    {/each}
</div>
