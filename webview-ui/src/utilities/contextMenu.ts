import type { VscodeContextMenu } from "@vscode-elements/elements/dist/vscode-context-menu/index.js"
import { tick } from "svelte"

export const showContextMenu = async (x: number, y: number, contextMenu: VscodeContextMenu) => {
  contextMenu.show = true
  await tick()
  let element = contextMenu as HTMLElement
  element.style.left = `${x}px`
  element.style.top = `${y}px`

  let windowWidth = window.innerWidth

  await tick()

  if (x + element.clientWidth >= windowWidth) {
    element.style.left = `${x - element.clientWidth}px`
  }
}
