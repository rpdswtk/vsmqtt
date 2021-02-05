<script lang="ts">
    import type { SubscriptionItem } from "./types";
    import { createEventDispatcher } from "svelte";

    let subscribeTopic: string;
    let subscriptions: Array<SubscriptionItem> = [];

    let selectedQos: string = "0";

    const dispatch = createEventDispatcher();

    function subscribe() {
        if (!subscribeTopic) {
            return;
        }
        vscode.postMessage({
            type: "subscribe",
            value: {
                topic: subscribeTopic,
                qos: parseInt(selectedQos),
            },
        });
        subscriptions = [
            ...subscriptions,
            { topic: subscribeTopic, qos: parseInt(selectedQos) },
        ];
        dispatch("subscribe", {
            subscriptions: subscriptions,
        });
        subscribeTopic = "";
    }
</script>

<h2 class="title">Subscribe</h2>

<form action="">
    <div class="subscription-options">
        <input type="text" bind:value={subscribeTopic} placeholder="Topic" />
        <select bind:value={selectedQos}>
            <option value="0">QoS 0</option>
            <option value="1">QoS 1</option>
            <option value="2">QoS 2</option>
        </select>
    </div>
    <button on:click={subscribe}>Subscribe</button>
</form>

<style>
    .subscription-options {
        display: flex;
        margin-bottom: 10px;
    }

    .subscription-options input {
        width: 40%;
    }

    select {
        margin-left: 15px;
    }
</style>
