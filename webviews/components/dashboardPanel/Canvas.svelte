<script lang="ts">
    import { onMount } from "svelte";
    import Draggable from "./Draggable.svelte";
    import interact from "interactjs";
    import { editingDashboard } from "../stores";

    let canvas: Interact.Interactable = interact('#canvas');

    editingDashboard.subscribe((value)=> {
        if (value) {
            enableDrag();
        } else {
            disableDrag();
        }
    });

    onMount(() => {
        if ($editingDashboard) {
            enableDrag();
        }
    });

    function enableDrag() {
        canvas.resizable({
            edges: { left: false, top: false, right: true, bottom: true },
            listeners: {
                move(event) {
                    let target = event.target;
                    let x = (parseFloat(target.getAttribute('data-x')) || 0);
                    let y = (parseFloat(target.getAttribute('data-y')) || 0)

                    target.style.width = event.rect.width + 'px';
                    target.style.height = event.rect.height + 'px';

                    x += event.deltaRect.left;
                    y += event.deltaRect.top;

                    target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                }
            },
            modifiers: [
                interact.modifiers.restrictEdges({
                    outer: 'parent'
                }),
                interact.modifiers.restrictSize({
                    min: { width: 100, height: 50 }
                })
            ],

            inertia: true
        });
    }

    function disableDrag() {
        canvas.resizable(false);
    }
</script>

<div id="canvas">
    <Draggable>
        <div>asd</div>
    </Draggable>
</div>

<style>
    #canvas {
        border: 2px solid var(--vscode-textLink-activeForeground);
        height: 80%;
    }
</style>