<script lang="ts">
  import "@vscode-elements/elements/dist/vscode-badge/index.js"
  import { isConnected } from "./utilities/stores"

  $: statusText = $isConnected ? "online" : "offline"
  $: statusColor = $isConnected ? "var(--vscode-charts-green)" : "var(--vscode-charts-red)"
</script>

<vscode-badge class="label"
  >{statusText}
  <span class="status-dot" style="background: {statusColor};"></span>
</vscode-badge>

<style>
  .label {
    font-weight: 500;
    text-transform: uppercase;
  }

  .status-dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 0.75em;
    height: 0.75em;
    margin-left: 0.1rem;
    vertical-align: middle;
    border-radius: 50%;
    transform: translateY(-0.08em);
  }
</style>
