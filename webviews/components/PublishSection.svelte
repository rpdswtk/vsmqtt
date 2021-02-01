<script lang="ts">
    let publishText: string;
    let publishTopic: string;
    let selectedQos: string = "0";
    let retain: boolean = false;
</script>

<div class="clr" />
<h2>Publish</h2>

<div class="container">
    <div class="publish-options">
        <input type="text" placeholder="Topic" bind:value={publishTopic} />
        <select bind:value={selectedQos}>
            <option value="0">QoS 0</option>
            <option value="1">QoS 1</option>
            <option value="2">QoS 2</option>
        </select>
        <h3 class="input-label">Retain:</h3>
        <input type="checkbox" class="checkbox" bind:checked={retain} />
    </div>
    <textarea rows="5" placeholder="Payload" bind:value={publishText} />
    <button
        on:click={() => {
            vscode.postMessage({
                type: "publish",
                value: {
                    topic: publishTopic,
                    payload: publishText,
                    qos: parseInt(selectedQos),
                    retain: retain,
                },
            });
        }}>Publish</button
    >
</div>

<style>
    .clr {
        clear: both;
    }

    textarea {
        resize: none;
        margin-bottom: 5px;
    }

    .container {
        padding: 5px;
        border: 2px solid var(--vscode-input-background);
    }

    .publish-options {
        display: flex;
        margin-bottom: 10px;
    }

    .publish-options input[type="text"] {
        width: 40%;
    }

    .checkbox {
        width: 1.8em;
        height: 1.8em;
    }

    .input-label {
        margin-left: 20px;
        margin-right: 5px;
        margin-top: 6px;
    }

    select {
        margin-left: 15px;
    }
</style>
