// Character sets ordered by density
export const CHAR_SETS = {
  SIMPLE: '@#%xo-+:.',
  DETAILED: '@%#*+=-:. ',
  BLOCK: '█▓▒░ ',
  MINIMAL: '#. ',
  CUSTOM: '',
} as const;

export type CharSetType = keyof typeof CHAR_SETS;

interface AsciiOptions {
  charSet: CharSetType;
  fontFrequency: number;
  aspectRatio: number;
  useColor: boolean;
  customChars: string;
}

// Helper function to convert RGB to hex color
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

export function imageToAscii(
  imageData: ImageData,
  options: {
    charSet: CharSetType
    fontFrequency: number
    aspectRatio: number
    useColor: boolean
    customChars: string
  }
): string {
  const { charSet, fontFrequency, aspectRatio, useColor, customChars } = options
  const { width, height, data } = imageData

  // Calculate sampling interval based on font frequency
  // fontFrequency range: 5-200
  // Convert to sampling interval range: 1-200 pixels
  // Higher frequency = smaller interval = more characters
  const samplingInterval = Math.max(1, Math.ceil(200 * (1 - (fontFrequency - 5) / 195)))

  // Apply aspect ratio to image dimensions
  // aspectRatio: -1 to 1
  // -1: half height
  // 0: original ratio
  // 1: double height
  const heightScale = 1 + aspectRatio
  const scaledHeight = Math.round(height * heightScale)

  const chars = CHAR_SETS[charSet] || customChars
  const charLength = chars.length

  // Pre-calculate grayscale values and create a lookup table for better performance
  const grayscale = new Uint8Array(width * height)
  const brightnessToChar = new Uint8Array(256)
  
  // Initialize brightness to character lookup table
  for (let i = 0; i < 256; i++) {
    const normalizedBrightness = i / 255
    brightnessToChar[i] = Math.min(
      charLength - 1,
      Math.floor(normalizedBrightness * (charLength - 1))
    )
  }

  // Pre-calculate grayscale values
  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4
    grayscale[idx] = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3)
  }

  // Use a more efficient block sampling approach for high frequencies
  const isHighFrequency = fontFrequency > 100
  const blockSize = isHighFrequency ? 2 : 1 // Use smaller blocks for high frequencies
  const result: string[] = []

  for (let y = 0; y < scaledHeight; y += samplingInterval) {
    const originalY = Math.min(height - 1, Math.floor(y / heightScale))
    let line = ''
    
    for (let x = 0; x < width; x += samplingInterval) {
      // Calculate block boundaries
      const endX = Math.min(x + samplingInterval, width)
      const endY = Math.min(originalY + samplingInterval, height)
      
      let brightness = 0
      let r = 0, g = 0, b = 0
      let count = 0

      // Optimize sampling for high frequencies
      if (isHighFrequency) {
        // Sample fewer pixels for high frequencies
        for (let blockY = originalY; blockY < endY; blockY += blockSize) {
          for (let blockX = x; blockX < endX; blockX += blockSize) {
            const idx = blockY * width + blockX
            if (idx < grayscale.length) {
              brightness += grayscale[idx]
              if (useColor) {
                const pixelIdx = idx * 4
                r += data[pixelIdx]
                g += data[pixelIdx + 1]
                b += data[pixelIdx + 2]
              }
              count++
            }
          }
        }
      } else {
        // Full sampling for normal frequencies
        for (let blockY = originalY; blockY < endY; blockY++) {
          for (let blockX = x; blockX < endX; blockX++) {
            const idx = blockY * width + blockX
            brightness += grayscale[idx]
            if (useColor) {
              const pixelIdx = idx * 4
              r += data[pixelIdx]
              g += data[pixelIdx + 1]
              b += data[pixelIdx + 2]
            }
            count++
          }
        }
      }

      if (count > 0) {
        const avgBrightness = brightness / count
        const charIndex = brightnessToChar[Math.round(avgBrightness)]
        const char = chars[charIndex]

        if (useColor) {
          const color = rgbToHex(
            Math.round(r / count),
            Math.round(g / count),
            Math.round(b / count)
          )
          line += `<span style="color: ${color}">${char}</span>`
        } else {
          line += char
        }
      }
    }
    result.push(line)
  }

  return result.join('\n')
} 