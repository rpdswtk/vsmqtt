<script lang="ts">
  import "../node_modules/bootstrap/dist/css/bootstrap-utilities.min.css"
  import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeCheckbox,
    vsCodeDropdown,
    vsCodeOption,
    vsCodeTextField,
    vsCodeTextArea,
  } from "@vscode/webview-ui-toolkit"
  import MqttConnectionPanel from "./MqttConnectionPanel.svelte"
  import "./styles.css"

  provideVSCodeDesignSystem().register(
    vsCodeButton(),
    vsCodeCheckbox(),
    vsCodeDropdown(),
    vsCodeOption(),
    vsCodeTextField(),
    vsCodeTextArea()
  )
</script>

<main>
  <MqttConnectionPanel />
</main>

<style>
</style>
