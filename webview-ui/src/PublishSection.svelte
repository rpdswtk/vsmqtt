<script lang="ts">
  import { vscode } from "./utilities/vscode"
  import VSCodeBindableWrapper from "./VSCodeBindableWrapper.svelte"

  let publishText: string
  let publishTopic: string
  let selectedQos: string
  let retain: boolean

  const publish = () => {
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
  }
</script>

<h2>Publish</h2>

<form on:submit|preventDefault={publish}>
  <div class="d-flex">
    <VSCodeBindableWrapper bind:value={publishTopic}>
      <vscode-text-field id="topic-input">Topic</vscode-text-field>
    </VSCodeBindableWrapper>
    <div class="dropdown-container">
      <label for="my-dropdown">QoS</label>
      <VSCodeBindableWrapper bind:value={selectedQos}>
        <vscode-dropdown>
          <vscode-option value="0">0</vscode-option>
          <vscode-option value="1">1</vscode-option>
          <vscode-option value="2">2</vscode-option>
        </vscode-dropdown>
      </VSCodeBindableWrapper>
    </div>
    <VSCodeBindableWrapper bind:value={retain}>
      <vscode-checkbox>Retain</vscode-checkbox>
    </VSCodeBindableWrapper>
  </div>
  <VSCodeBindableWrapper bind:value={publishText}>
    <vscode-text-area id="payload-input">Payload</vscode-text-area>
  </VSCodeBindableWrapper>
  <vscode-button id="publish-button" type="submit">Publish</vscode-button>
</form>
