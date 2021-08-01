<script lang="ts">
    import Canvas from "./Canvas.svelte";
    import View from "../View.svelte";
    import { editingDashboard } from "../stores";
</script>

<div>
    <View>
        <Canvas />
        <label for="edit">Edit</label>
        <input id="edit" type=checkbox bind:checked={$editingDashboard}>
    </View>
</div>
