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

<div>
    <h3>Subscribe</h3>
    <table>
        <td>
            <input
                type="text"
                bind:value={subscribeTopic}
                placeholder="Topic"
            />
        </td>
        <td>
            <select value={selectedQos}>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
            </select>
        </td>
    </table>
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
    .subscription-column {
        width: 70%;
    }
</style>
