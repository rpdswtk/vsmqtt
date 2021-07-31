<script lang="ts">
    import { onMount } from "svelte";
    import Draggable from "./Draggable.svelte";


</script>

<div id="canvas">
    <Draggable>
        <div>asd</div>
    </Draggable>
</div>

<style>
    #canvas {
        border: 1.5px solid var(--vscode-input-background);
        height: 80%;
    }
</style>