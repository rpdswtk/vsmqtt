<script lang="ts">
    import { onMount } from "svelte";
    import { getNonce } from "../../src/getNonce";
    import type { MqttBrokerConfig } from "../../src/models/MqttBrokerConfig";

    let brokers: Array<MqttBrokerConfig> = [];

    onMount(() => {
        brokers = brokerProfiles;
        window.addEventListener("message", (event) => {
            const message = event.data;
            switch (message.type) {
                case "update-profile-list":
                    brokers = message.value;
                    break;
            }
        });
    });

    function clickHander(command: string, broker: MqttBrokerConfig) {
        switch (command) {
            case "edit":
                vscode.postMessage({
                    type: "edit-mqtt-profile",
                    value: broker,
                });
                break;
            case "connect":
                vscode.postMessage({
                    type: "use-mqtt-profile",
                    value: broker,
                });
                break;
            case "delete":
                vscode.postMessage({
                    type: "delete-mqtt-profile",
                    value: broker,
                });
                break;
        }
    }
</script>

<!-- <div>
    <ul>
        {#each brokers as broker}
            <li
                on:click={() => {
                    vscode.postMessage({
                        type: "edit-mqtt-profile",
                        value: broker,
                    });
                }}
            >{broker.address} {broker.port}</li>
        {/each}
    </ul>
</div> -->

<div>
    {#each brokers as broker}
        <table>
            <tr>
                <td>{broker.name}</td>
                <td
                    class="clickable"
                    on:click={() => clickHander("edit", broker)}>
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        ><path
                            d="M9.1 4.4L8.6 2H7.4l-.5 2.4-.7.3-2-1.3-.9.8 1.3 2-.2.7-2.4.5v1.2l2.4.5.3.8-1.3 2 .8.8 2-1.3.8.3.4 2.3h1.2l.5-2.4.8-.3 2 1.3.8-.8-1.3-2 .3-.8 2.3-.4V7.4l-2.4-.5-.3-.8 1.3-2-.8-.8-2 1.3-.7-.2zM9.4 1l.5 2.4L12 2.1l2 2-1.4 2.1 2.4.4v2.8l-2.4.5L14 12l-2 2-2.1-1.4-.5 2.4H6.6l-.5-2.4L4 13.9l-2-2 1.4-2.1L1 9.4V6.6l2.4-.5L2.1 4l2-2 2.1 1.4.4-2.4h2.8zm.6 7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM8 9c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z"
                        /></svg
                    >
                </td>
                <td
                    class="clickable"
                    on:click={() => clickHander("connect", broker)}>
                    <svg
                        width="18"
                        height="18"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        ><path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M4 2v12.48l8.915-6.24L4 2zm7.18 6.24l-6.185 4.328V3.912l6.186 4.328z"
                        /></svg
                    >
                </td>
                <td
                    class="clickable"
                    on:click={() => clickHander("delete", broker)}>
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        ><path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"
                        /></svg
                    >
                </td>
            </tr>
        </table>
    {/each}
</div>

<button
    on:click={() => {
        vscode.postMessage({
            type: "edit-mqtt-profile",
            value: {
                id: getNonce(),
                name: "New profile",
                address: "localhost",
                port: 1883,
            },
        });
    }}>Create new profile</button
>

<style>
    li:hover {
        cursor: pointer;
    }

    li {
        font-size: large;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .clickable {
        text-align: left;
        cursor: pointer;
        width: 18px;
        height: 18px;
    }

    .clickable:hover {
        background-color: var(--vscode-button-secondaryBackground);
    }

    table {
        width: 100%;
        border: none;
        padding: 0;
        margin: 0;
        border-spacing: 0;
    }
</style>
