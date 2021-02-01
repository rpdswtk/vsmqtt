<script lang="ts">
    import MessageList from "./MessageList.svelte";
    import SubscriptionList from "./SubscriptionList.svelte";
    import type { SubscriptionItem } from "./types";

    let subscribeTopic: string;
    let subscriptions: Array<SubscriptionItem> = [];

    let selectedQos: string = "0";

    function subscribe() {
        vscode.postMessage({
            type: "subscribe",
            value: {
                topic: subscribeTopic,
                qos: selectedQos,
            },
        });
        subscriptions = [
            ...subscriptions,
            { topic: subscribeTopic, qos: parseInt(selectedQos) },
        ];
        subscribeTopic = "";
    }
</script>

<h2 class="title">Subscribe</h2>

<div class="container">
    <div class="subscription-options">
        <input type="text" bind:value={subscribeTopic} placeholder="Topic" />
        <select value={selectedQos}>
            <option value="0">QoS 0</option>
            <option value="1">QoS 1</option>
            <option value="2">QoS 2</option>
        </select>
    </div>
    <button on:click={subscribe}>Subscribe</button>
</div>

<table>
    <td class="subscription-column">
        <SubscriptionList {subscriptions} />
    </td>
    <td>
        <MessageList />
    </td>
</table>

<style>
    .title {
        margin-top: 25px;
    }

    .container {
        padding: 5px;
        border: 2px solid var(--vscode-input-background);
    }

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
