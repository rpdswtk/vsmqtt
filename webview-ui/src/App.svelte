<script lang="ts">
  import "../node_modules/bootstrap/dist/css/bootstrap-utilities.min.css"
  import MqttConnectionPanel from "./MqttConnectionPanel.svelte"
</script>

<main>
  <MqttConnectionPanel />
</main>

<style>
  :global(html),
  :global(body) {
    height: 100%;
  }

  main {
    height: 100%;
    margin: 0;
  }
</style>
