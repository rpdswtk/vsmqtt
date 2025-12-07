export class ColorManager {
  private static topicColors = new Map<string, string>()

  public static getColor(topic: string): string {
    if (ColorManager.topicColors.has(topic)) {
      return ColorManager.topicColors.get(topic)!
    }

    const newColor = generateRandomColorWithContrast(document)

    ColorManager.topicColors.set(topic, newColor)

    return newColor
  }

  public static clearColors(): void {
    ColorManager.topicColors.clear()
  }
}

const getLuminance = (r: number, g: number, b: number): number => {
  // Convert RGB to linear RGB values
  const [lr, lg, lb] = [r, g, b].map((c) => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

const getContrastRatio = (color1: string, color2: string): number => {
  // Convert hex to RGB
  const getRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return [r, g, b]
  }

  const [r1, g1, b1] = getRGB(color1)
  const [r2, g2, b2] = getRGB(color2)

  const l1 = getLuminance(r1, g1, b1)
  const l2 = getLuminance(r2, g2, b2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

const generateRandomColorWithContrast = (document: Document, minContrast: number = 4.5): string => {
  const textColor = getComputedStyle(document.documentElement).getPropertyValue(`--vscode-foreground`).trim()

  let attempts = 0
  const maxAttempts = 50

  while (attempts < maxAttempts) {
    // Generate random RGB values
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)

    // Convert to hex
    const color = "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")

    // Check contrast
    const contrast = getContrastRatio(color, textColor)

    if (contrast >= minContrast) {
      return color
    }

    attempts++
  }

  // Fallback to a safe color if we couldn't find one with good contrast
  const closerToBlack = isCloserToBlack(textColor)

  return closerToBlack ? "#ffffff" : "#000000"
}

const isCloserToBlack = (hex: string): boolean => {
  const r = parseInt(hex.substring(1, 2), 16)
  const g = parseInt(hex.substring(3, 2), 16)
  const b = parseInt(hex.substring(5, 2), 16)

  const brightness = 0.299 * r + 0.587 * g + 0.114 * b

  return brightness < 128
}
