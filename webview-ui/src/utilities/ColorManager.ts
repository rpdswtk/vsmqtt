import { COLORS } from "./colors"

function shuffle(array: Array<string>) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

export class ColorManager {
  private static topicColors = new Map<string, string>()
  private static colors = shuffle(COLORS)
  private static index = 0

  public static getColor(topic: string): string {
    if (ColorManager.topicColors.has(topic)) {
      const color = ColorManager.topicColors.get(topic)

      return color ? color : ""
    }

    const newColor = ColorManager.colors[ColorManager.index]
    ColorManager.index++
    if (ColorManager.index > ColorManager.colors.length - 1) {
      ColorManager.index = 0
    }
    ColorManager.topicColors.set(topic, newColor)

    return newColor
  }
}
