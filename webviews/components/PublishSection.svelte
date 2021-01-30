<script lang="ts">
    let publishText: string;
    let publishTopic: string;
    let selectedQos: number = 0;
    let retain: number = 0;
</script>

<div>
    <h3>Publish</h3>
    <input type="text" placeholder="Topic" bind:value={publishTopic} />
    <br />
    <select bind:value={selectedQos}>
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
    </select>
    <label for="">Retain:</label>
    <input type="checkbox" id="retain" bind:value={retain} />
    <textarea rows="5" placeholder="Payload" bind:value={publishText} />
    <button
        on:click={() => {
            var retainFlag = false ? retain === 0 : true;
            vscode.postMessage({
                type: "publish",
                value: {
                    topic: publishTopic,
                    payload: publishText,
                    qos: selectedQos,
                    retain: retainFlag,
                },
            });
        }}>Publish</button
    >
</div>

<style>
    textarea {
        resize: none;
    }
</style>
