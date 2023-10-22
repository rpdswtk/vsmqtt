<script lang="ts">
  import { vscode } from "./utilities/vscode"

  let publishText: string
  let publishTopic: string
  let selectedQos = "0"
  let retain: boolean
</script>

<h2>Publish</h2>

<div class="publish-options">
  <input id="topic-input" type="text" placeholder="Topic" bind:value={publishTopic} />
  <select bind:value={selectedQos}>
    <option value="0">QoS 0</option>
    <option value="1">QoS 1</option>
    <option value="2">QoS 2</option>
  </select>
  <h3 class="input-label">Retain:</h3>
  <input type="checkbox" class="checkbox" bind:checked={retain} />
</div>

<textarea id="payload-input" rows="5" placeholder="Payload" bind:value={publishText} />

<button
  id="publish-button"
  on:click={() => {
    if (publishTopic) {
      vscode.postMessage({
        type: "publish",
        value: {
          topic: publishTopic,
          payload: publishText,
          qos: parseInt(selectedQos),
          retain: retain,
        },
      })
    }
  }}>Publish</button>

<style>
  textarea {
    resize: none;
    margin-bottom: 5px;
  }

  .publish-options {
    display: flex;
    height: 30px;
    margin-bottom: 5px;
    margin-top: 5px;
  }

  input[type="text"] {
    width: 50%;
    margin-right: 5px;
  }

  input[type="checkbox"] {
    width: 25px;
    height: 25px;
  }

  select {
    margin-left: 5px;
    margin-right: 5px;
  }

  .input-label {
    margin-top: 6px;
  }
</style>
