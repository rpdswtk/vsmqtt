<script lang="ts">
    let publishText: string;
    let publishTopic: string;
</script>

<div>
    <h3>Publish</h3>
    <input type="text" placeholder="Topic" bind:value={publishTopic} />
    <br />
    <textarea rows="5" placeholder="Payload" bind:value={publishText} />
    <button
        on:click={() => {
            vscode.postMessage({
                type: "publish",
                value: { topic: publishTopic, payload: publishText },
            });
        }}>Publish</button
    >
</div>

<style>
    textarea {
        resize: none;
    }
</style>
