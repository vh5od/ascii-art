import React from "react";
import { AsciiBorder } from "./AsciiBorder";

interface AsciiPreviewProps {
  asciiArt: string;
  color: string;
  useColor: boolean;
  width: number;
  activeCharIndex: number | null;
  customChars: string;
}

export const AsciiPreview = ({
  asciiArt,
  color,
  useColor,
  width,
  activeCharIndex,
  customChars,
}: AsciiPreviewProps) => {
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
              style={{
                display: "inline-block",
                width: `${width}px`,
                height: `${width}px`,
                color: useColor ? undefined : color,
                animation: isActiveChar
                  ? "blink 1s ease-in-out infinite"
                  : "none",
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
          fontSize: `${width}px`,
          lineHeight: `${width}px`,
        }}
      >
        {lines}
      </div>
    );
  };

  return (
    <AsciiBorder title="PREVIEW">
      <div className="relative ascii-preview bg-transparent w-[600px] overflow-x-auto overflow-y-visible">
        <div
          className="select-none bg-transparent inline-block"
          style={{
            fontSize: `${width}px`,
            lineHeight: `${width}px`,
            minWidth: "100%",
          }}
        >
          {renderAsciiArt()}
        </div>
        <style>
          {`
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
            .ascii-preview::-webkit-scrollbar {
              height: 8px;
              width: 8px;
            }
            .ascii-preview::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 4px;
            }
            .ascii-preview::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 4px;
            }
            .ascii-preview::-webkit-scrollbar-thumb:hover {
              background: #666;
            }
            /* Hide vertical scrollbar but keep functionality */
            .ascii-preview::-webkit-scrollbar:vertical {
              display: none;
            }
          `}
        </style>
      </div>
    </AsciiBorder>
  );
};
