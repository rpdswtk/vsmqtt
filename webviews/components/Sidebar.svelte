<script lang="ts">
    import { onMount } from "svelte";

    interface MqttBrokerModel {
        address?: string;
        port?: number;
    }

    let brokers: Array<MqttBrokerModel> = [];
    let broker: MqttBrokerModel = {};

    function click() {
        console.log("click");
    }

    function save() {
        console.log("save");
        brokers = [...brokers, { address: broker.address, port: broker.port }];
        broker.address = undefined;
        broker.port = undefined;
        console.log(brokers);
    }

    onMount(() => {
        window.addEventListener("message", (event) => {
            const message = event.data; // The json data that the extension sent
            switch (message.type) {
                case "new-todo":
                    console.log({ message });
                    break;
            }
        });
    });
</script>

<div>
    <ul>
        {#each brokers as broker}
            <li on:click={click}>{broker.address} {broker.port}</li>
        {/each}
    </ul>
</div>

<input type="text" bind:value={broker.address} />
<input type="number" bind:value={broker.port} />
<button on:click={save}>Save</button>

<button
    on:click={() => {
        vscode.postMessage({
            type: "onInfo",
            value: "Info message",
        });
    }}>Click me</button
>

<button
    on:click={() => {
        vscode.postMessage({
            type: "onError",
            value: "Error message",
        });
    }}>Click me for error</button
>

<style>
    li:hover {
        cursor: pointer;
    }

    li {
        font-size: large;
    }
</style>
