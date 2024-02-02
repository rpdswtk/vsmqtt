<script lang="ts">
  import { vscode } from "./utilities/vscode"
  import { ColorManager } from "./utilities/ColorManager"
  import { subscriptions } from "./utilities/stores"
  import VSCodeBindableWrapper from "./VSCodeBindableWrapper.svelte"

  let subscribeTopic: string
  let selectedQos: string

  const subscribe = () => {
    if (!subscribeTopic) {
      return
    }

    vscode.postMessage({
      type: "subscribe",
      value: {
        topic: subscribeTopic,
        qos: parseInt(selectedQos),
      },
    })

    $subscriptions = $subscriptions.set(subscribeTopic, {
      topic: subscribeTopic,
      qos: parseInt(selectedQos),
      color: ColorManager.getColor(subscribeTopic),
      messageCount: 0,
    })

    subscribeTopic = ""
  }
</script>

<h2>Subscribe</h2>
<form on:submit|preventDefault={subscribe}>
  <div class="subscription-options">
    <VSCodeBindableWrapper bind:value={subscribeTopic}>
      <vscode-text-field id="subscribe-topic-input">Topic</vscode-text-field>
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
  </div>
  <vscode-button type="submit">Subscribe</vscode-button>
</form>
