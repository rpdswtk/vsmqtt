<script lang="ts">
  export let value: string | boolean

  const VALUE_ATTRIBUTE = "current-value"
  const CHECKBOX_VALUE_ATTRIBUTE = "aria-checked"

  $: {
    if (element && observableAttribute) {
      if (value) {
        element.setAttribute(observableAttribute, value.toString())
      } else {
        element.removeAttribute(observableAttribute)
      }
    }
  }

  let element: HTMLElement
  let observableAttribute: string

  const createObserver = (
    vsCodeElement: HTMLElement,
    initialValueAttributeName: string,
    observableAttributeName: string
  ): MutationObserver => {
    if (value) {
      vsCodeElement.setAttribute(initialValueAttributeName, value.toString())
    }

    observableAttribute = initialValueAttributeName
    element = vsCodeElement

    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation: MutationRecord) => {
        if (mutation.type === "attributes" && mutation.attributeName === observableAttributeName) {
          const newValue = (mutation.target as HTMLElement).getAttribute(observableAttributeName)

          value = newValue
        }
      })
    })

    observer.observe(vsCodeElement, { attributes: true })

    return observer
  }

  const initObserver = (element: HTMLElement) => {
    const vsCodeElement = element.firstChild as HTMLElement

    const isCheckbox = vsCodeElement.getAttribute("role") === "checkbox"

    const observableAttribute = isCheckbox ? CHECKBOX_VALUE_ATTRIBUTE : VALUE_ATTRIBUTE
    const initialValueAttribute = isCheckbox ? "current-checked" : VALUE_ATTRIBUTE

    const observer = createObserver(vsCodeElement, initialValueAttribute, observableAttribute)

    return {
      destroy() {
        observer.disconnect()
      },
    }
  }
</script>

<div use:initObserver>
  <slot />
</div>
