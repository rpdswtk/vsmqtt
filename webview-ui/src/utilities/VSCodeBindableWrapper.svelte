<script lang="ts">
  import { VscodeCheckbox } from "@vscode-elements/elements"
  import type { AssociatedFormControl } from "@vscode-elements/elements/dist/includes/AssociatedFormControl"
  import type { Snippet } from "svelte"
  import { onMount } from "svelte"
  let {
    value = $bindable(),
    innerClass,
    children,
  }: {
    value: string | string[] | boolean
    innerClass?: string
    children?: Snippet
  } = $props()

  let element: HTMLElement
  let vsCodeElement: AssociatedFormControl
  let isCheckbox: boolean

  $effect(() => {
    if (value !== null && value !== undefined && vsCodeElement) {
      if (isCheckbox) {
        ;(vsCodeElement as VscodeCheckbox).checked = Boolean(value)
      } else {
        const incoming = value.toString()
        if (vsCodeElement.value !== incoming) {
          vsCodeElement.value = incoming
        }
      }
    }
  })

  const initObserver = (element: HTMLElement) => {
    const target = (element.firstElementChild || element.firstChild) as HTMLElement
    vsCodeElement = target as unknown as AssociatedFormControl
    isCheckbox = target?.nodeName?.toUpperCase().includes("CHECKBOX") ?? false

    if (value !== null && value !== undefined) {
      if (isCheckbox) {
        ;(vsCodeElement as VscodeCheckbox).checked = Boolean(value)
      } else {
        vsCodeElement.value = value.toString()
      }
    }

    target?.addEventListener("change", onChange)
    if (!isCheckbox) {
      target?.addEventListener("input", onChange)
    }

    return () => {
      target?.removeEventListener("change", onChange)

      if (!isCheckbox) {
        target?.removeEventListener("input", onChange)
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
  {@render children?.()}
</span>
