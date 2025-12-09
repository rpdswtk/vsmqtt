<script lang="ts">
  import { VscodeCheckbox } from "@vscode-elements/elements"
  import type { AssociatedFormControl } from "@vscode-elements/elements/dist/includes/AssociatedFormControl"
  import { onMount } from "svelte"

  export let value: string | string[] | boolean
  export let innerClass: string | undefined = undefined
  let element: HTMLElement
  let vsCodeElement: AssociatedFormControl
  let isCheckbox: boolean

  $: {
    if (value !== null && value !== undefined && vsCodeElement) {
      vsCodeElement.value = value.toString()
    }
  }

  const initObserver = (element: HTMLElement) => {
    vsCodeElement = element.firstChild as unknown as AssociatedFormControl
    isCheckbox = element.firstChild!.nodeName.toUpperCase().includes("CHECKBOX")

    if (value !== null && value !== undefined) {
      vsCodeElement.value = value.toString()
    }

    element.firstChild?.addEventListener("change", onChange)
    if (!isCheckbox) {
      element.firstChild?.addEventListener("input", onChange)
    } else {
      ;(vsCodeElement as VscodeCheckbox).checked = value as boolean
    }

    return () => {
      element.firstChild?.removeEventListener("change", onChange)

      if (!isCheckbox) {
        element.firstChild?.removeEventListener("input", onChange)
      }
    }
  }

  const onChange = (_: Event) => {
    value = isCheckbox ? (vsCodeElement as VscodeCheckbox).checked : vsCodeElement.value
  }

  onMount(() => {
    return initObserver(element)
  })
</script>

<span bind:this={element} class={innerClass}>
  <slot />
</span>
