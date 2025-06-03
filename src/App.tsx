import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { AsciiPreview } from "./components/AsciiPreview";
import { AsciiSettingsPanel } from "./components/AsciiSettingsPanel";
import {
  imageToAscii,
  CHAR_SETS,
  type CharSetType,
} from "./utils/imageToAscii";
import { ImageDropzone } from "./components/ImageDropzone";
import html2canvas from "html2canvas";

// Throttle function for performance optimization
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeout: number | null = null;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      func(...args);
      lastCall = now;
    } else if (!timeout) {
      // Schedule the update for when the throttle period ends
      timeout = setTimeout(
        () => {
          func(...args);
          lastCall = Date.now();
          timeout = null;
        },
        wait - (now - lastCall),
      );
    }
  };
}

function App() {
  const [asciiArt, setAsciiArt] = useState<string>("");
  const [charSet, setCharSet] = useState<CharSetType>("CUSTOM");
  const [fontFrequency, setFontFrequency] = useState<number>(50);
  const [aspectRatio, setAspectRatio] = useState<number>(0.5);
  const [color, setColor] = useState<string>("#222222");
  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(null);
  const [width, setWidth] = useState<number>(16);
  const [useColor, setUseColor] = useState<boolean>(false);
  const [customChars, setCustomChars] = useState<string>("@#%xo-+:.");
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lastAsciiArtRef = useRef<string>("");
  const processingTimeoutRef = useRef<number | null>(null);
  const charWidth = width; // Use the same value as width for character size

  // Memoize the image processing options to prevent unnecessary recalculations
  const processingOptions = useMemo(
    () => ({
      charSet,
      fontFrequency,
      aspectRatio,
      useColor,
      customChars,
    }),
    [charSet, fontFrequency, aspectRatio, useColor, customChars],
  );

  const processImage = useCallback(
    (img: HTMLImageElement) => {
      try {
        // Create canvas only once and reuse it
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return lastAsciiArtRef.current;

        // Set canvas dimensions only if they've changed
        if (canvas.width !== img.width || canvas.height !== img.height) {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Get image data only once
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        // Apply brightness and contrast in a single pass
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const brightnessValue = brightness;

        // Process pixels in chunks for better performance
        const chunkSize = 1000;
        for (let i = 0; i < data.length; i += chunkSize * 4) {
          const end = Math.min(i + chunkSize * 4, data.length);
          for (let j = i; j < end; j += 4) {
            // Apply brightness and contrast in one step
            const r = Math.min(
              255,
              Math.max(0, factor * (data[j] + brightnessValue - 128) + 128),
            );
            const g = Math.min(
              255,
              Math.max(0, factor * (data[j + 1] + brightnessValue - 128) + 128),
            );
            const b = Math.min(
              255,
              Math.max(0, factor * (data[j + 2] + brightnessValue - 128) + 128),
            );

            data[j] = r;
            data[j + 1] = g;
            data[j + 2] = b;
          }
        }

        ctx.putImageData(imageData, 0, 0);

        const result = imageToAscii(imageData, processingOptions);

        if (typeof result === "string") {
          lastAsciiArtRef.current = result;
          return result;
        }
        return lastAsciiArtRef.current;
      } catch (error) {
        console.error("Error processing image:", error);
        return lastAsciiArtRef.current;
      }
    },
    [processingOptions, brightness, contrast],
  );

  // Optimize throttled update with a more efficient throttle implementation
  const throttledUpdate = useCallback(
    throttle(() => {
      if (imageRef.current && !isProcessing) {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          setIsProcessing(true);
          try {
            const result = processImage(imageRef.current!);
            if (typeof result === "string") {
              setAsciiArt(result);
            }
          } catch (error) {
            console.error("Error updating ASCII art:", error);
          } finally {
            setIsProcessing(false);
          }
        });
      }
    }, 32), // ~30fps for smooth updates
    [processImage, isProcessing],
  );

  // Batch state updates for better performance
  const handleParameterChange = useCallback(
    (setter: (value: number) => void, value: number) => {
      setter(value);
      throttledUpdate();
    },
    [throttledUpdate],
  );

  const handleFontFrequencyChange = useCallback(
    (value: number) => {
      handleParameterChange(setFontFrequency, value);
    },
    [handleParameterChange],
  );

  const handleAspectRatioChange = useCallback(
    (value: number) => {
      handleParameterChange(setAspectRatio, value);
    },
    [handleParameterChange],
  );

  const handleBrightnessChange = useCallback(
    (value: number) => {
      handleParameterChange(setBrightness, value);
    },
    [handleParameterChange],
  );

  const handleContrastChange = useCallback(
    (value: number) => {
      handleParameterChange(setContrast, value);
    },
    [handleParameterChange],
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            // Preprocess image to limit max width to 1024px
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              console.error("Failed to get canvas context");
              setIsProcessing(false);
              return;
            }

            // Calculate new dimensions
            let newWidth = img.width;
            let newHeight = img.height;
            const MAX_WIDTH = 1024;

            if (newWidth > MAX_WIDTH) {
              const ratio = MAX_WIDTH / newWidth;
              newWidth = MAX_WIDTH;
              newHeight = Math.round(img.height * ratio);
            }

            // Resize image
            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Create new image with resized dimensions
            const resizedImg = new Image();
            resizedImg.onload = () => {
              imageRef.current = resizedImg;
              const result = processImage(resizedImg);
              if (typeof result === "string") {
                setAsciiArt(result);
              }
              setIsProcessing(false);
            };
            resizedImg.onerror = () => {
              console.error("Error loading resized image");
              setIsProcessing(false);
            };
            resizedImg.src = canvas.toDataURL("image/png");
          };
          img.onerror = () => {
            console.error("Error loading image");
            setIsProcessing(false);
          };
          img.src = e.target?.result as string;
        };
        reader.onerror = () => {
          console.error("Error reading file");
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error uploading image:", error);
        setIsProcessing(false);
      }
    },
    [processImage],
  );

  const handleReupload = useCallback(() => {
    if (imageRef.current) {
      setIsProcessing(true);
      try {
        const result = processImage(imageRef.current);
        if (typeof result === "string") {
          setAsciiArt(result);
        }
      } catch (error) {
        console.error("Error reprocessing image:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [processImage]);

  const handleSave = useCallback(() => {
    const saveDialog = document.createElement("div");
    saveDialog.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    saveDialog.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-xl font-mono">
        <h3 class="text-lg font-bold mb-4 text-center">[ SAVE FORMAT ]</h3>
        <div class="flex gap-4 justify-center">
          <button id="saveTxt" class="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition">
            [ TXT ]
          </button>
          <button id="savePng" class="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition">
            [ PNG ]
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(saveDialog);

    const saveAsTxt = () => {
      const element = document.createElement("a");
      const file = new Blob([asciiArt], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "ascii-art.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      document.body.removeChild(saveDialog);
    };

    const saveAsPng = async () => {
      const previewElement = document.querySelector(".ascii-preview > div");
      if (!previewElement) return;

      // Get all character spans to find the actual content boundaries
      const spans = previewElement.querySelectorAll("span");
      if (!spans.length) return;

      // Find the rightmost and bottommost characters
      let maxRight = 0;
      let maxBottom = 0;

      spans.forEach((span) => {
        const rect = span.getBoundingClientRect();
        const right = rect.right;
        const bottom = rect.bottom;

        // Get the container's position to calculate relative coordinates
        const containerRect = previewElement.getBoundingClientRect();
        const relativeRight = right - containerRect.left;
        const relativeBottom = bottom - containerRect.top;

        maxRight = Math.max(maxRight, relativeRight);
        maxBottom = Math.max(maxBottom, relativeBottom);
      });

      // Create a canvas with the exact content size
      const canvas = await html2canvas(previewElement as HTMLElement, {
        backgroundColor: null,
        scale: 2,
        width: maxRight,
        height: maxBottom,
        useCORS: true,
        allowTaint: true,
        logging: false,
        // Ensure we only capture the content area
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        // Remove any extra space
        removeContainer: true,
        // Ensure we get the exact content
        foreignObjectRendering: false,
      });

      // Create download link
      const link = document.createElement("a");
      link.download = "ascii-art.png";
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      document.body.removeChild(saveDialog);
    };

    saveDialog.querySelector("#saveTxt")?.addEventListener("click", saveAsTxt);
    saveDialog.querySelector("#savePng")?.addEventListener("click", saveAsPng);
    saveDialog.addEventListener("click", (e) => {
      if (e.target === saveDialog) {
        document.body.removeChild(saveDialog);
      }
    });
  }, [asciiArt, width]);

  useEffect(() => {
    if (imageRef.current) {
      setIsProcessing(true);
      try {
        const result = processImage(imageRef.current);
        if (typeof result === "string") {
          setAsciiArt(result);
        }
      } catch (error) {
        console.error("Error updating ASCII art:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [
    charSet,
    fontFrequency,
    aspectRatio,
    useColor,
    customChars,
    width,
    color,
    brightness,
    contrast,
    processImage,
  ]);

  const renderAsciiArt = () => {
    if (!asciiArt) return null;

    // Split the ASCII art into lines and wrap each character in a span
    const lines = asciiArt.split("\n").map((line, lineIndex) => (
      <div key={lineIndex} className="whitespace-pre font-mono leading-none">
        {line.split("").map((char, charIndex) => {
          // Check if this character matches the active character being edited
          const isActiveChar =
            activeCharIndex !== null &&
            customChars[activeCharIndex] === char &&
            // Only highlight characters that are part of the custom character set
            customChars.includes(char);

          return (
            <span
              key={charIndex}
              className={`inline-block ${isActiveChar ? "animate-[blink_1s_ease-in-out_infinite]" : ""}`}
              style={{
                width: `${charWidth}px`,
                height: `${charWidth}px`,
                color: useColor ? undefined : color,
                animation: isActiveChar
                  ? "blink 1s ease-in-out infinite"
                  : undefined,
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
    ));

    return (
      <div
        className="select-none"
        style={{
          fontSize: `${charWidth}px`,
          lineHeight: `${charWidth}px`,
        }}
      >
        {lines}
      </div>
    );
  };

  // Add keyframes for the blink animation
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span role="img" aria-label="palette" className="text-2xl">
            🎨
          </span>
          <h1 className="text-2xl font-mono font-bold">ASCII Artify</h1>
        </div>
        <p className="text-gray-600 font-mono">
          Convert your images into ASCII art
        </p>
      </header>

      <main className="flex-1 container mx-auto px-4 pb-8 flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <AsciiSettingsPanel
              charSet={charSet}
              onCharSetChange={setCharSet}
              fontFrequency={fontFrequency}
              onFontFrequencyChange={handleFontFrequencyChange}
              aspectRatio={aspectRatio}
              onAspectRatioChange={handleAspectRatioChange}
              color={color}
              onColorChange={setColor}
              activeCharIndex={activeCharIndex}
              setActiveCharIndex={setActiveCharIndex}
              width={width}
              onWidthChange={setWidth}
              useColor={useColor}
              onUseColorChange={setUseColor}
              customChars={customChars}
              onCustomCharsChange={setCustomChars}
              brightness={brightness}
              onBrightnessChange={handleBrightnessChange}
              contrast={contrast}
              onContrastChange={handleContrastChange}
            />
          </div>

          <div className="flex flex-col">
            {!asciiArt && !isProcessing && (
              <ImageDropzone onImageUpload={handleImageUpload} />
            )}
            {(asciiArt || isProcessing) && (
              <div className="flex-1 flex flex-col">
                <AsciiPreview
                  asciiArt={isProcessing ? lastAsciiArtRef.current : asciiArt}
                  color={color}
                  useColor={false}
                  width={width}
                  activeCharIndex={activeCharIndex}
                  customChars={customChars}
                />

                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                    <div className="text-blue-600 font-mono">Processing...</div>
                  </div>
                )}
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      };
                      input.click();
                    }}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reupload
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setAsciiArt("");
                      imageRef.current = null;
                    }}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 transition font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
