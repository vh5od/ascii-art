import { useState, useEffect, useRef } from "react";
import { AsciiBorder } from "./AsciiBorder";
import { CHAR_SETS, type CharSetType } from "../utils/imageToAscii";
import { CharInputDialog } from "./CharInputDialog";
import { CurveAdjustment } from "./CurveAdjustment";

interface AsciiSettingsPanelProps {
  charSet: CharSetType;
  onCharSetChange: (value: CharSetType) => void;
  fontFrequency: number;
  onFontFrequencyChange: (value: number) => void;
  aspectRatio: number;
  onAspectRatioChange: (value: number) => void;
  color?: string;
  onColorChange?: (value: string) => void;
  activeCharIndex?: number | null;
  setActiveCharIndex?: (idx: number | null) => void;
  width: number;
  onWidthChange: (value: number) => void;
  useColor: boolean;
  onUseColorChange: (value: boolean) => void;
  customChars: string;
  onCustomCharsChange: (value: string) => void;
  brightness: number;
  onBrightnessChange: (value: number) => void;
  contrast: number;
  onContrastChange: (value: number) => void;
}

const DEFAULT_COLOR = "#222222";
const DEFAULT_CHARS = "@#%xo-+:.";

export const AsciiSettingsPanel = ({
  charSet,
  onCharSetChange,
  fontFrequency,
  onFontFrequencyChange,
  aspectRatio,
  onAspectRatioChange,
  color = DEFAULT_COLOR,
  onColorChange,
  activeCharIndex,
  setActiveCharIndex,
  width,
  onWidthChange,
  useColor,
  onUseColorChange,
  customChars,
  onCustomCharsChange,
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
}: AsciiSettingsPanelProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(
    null,
  );
  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });
  const charButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const settingsRef = useRef<HTMLDivElement>(null);

  // 初始化按钮引用数组
  useEffect(() => {
    charButtonRefs.current = Array(9).fill(null);
  }, []);

  // 当font frequency改变时重新计算弹窗位置
  useEffect(() => {
    if (isDialogOpen && selectedCharIndex !== null) {
      const button = charButtonRefs.current[selectedCharIndex];
      const settings = settingsRef.current;
      if (button && settings) {
        const settingsRect = settings.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        setDialogPosition({
          top: settingsRect.top + window.scrollY - 4,
          left: buttonRect.left + window.scrollX,
        });
      }
    }
  }, [fontFrequency, isDialogOpen, selectedCharIndex]);

  const handleCharClick = (index: number) => {
    const button = charButtonRefs.current[index];
    const settings = settingsRef.current;
    if (button && settings) {
      const settingsRect = settings.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      setDialogPosition({
        top: settingsRect.top + window.scrollY - 4,
        left: buttonRect.left + window.scrollX,
      });
    }
    setSelectedCharIndex(index);
    setIsDialogOpen(true);
    setActiveCharIndex && setActiveCharIndex(index);
  };

  const handleConfirmChar = (char: string) => {
    if (selectedCharIndex !== null) {
      const newChars = [...customChars];
      newChars[selectedCharIndex] = char;
      onCustomCharsChange(newChars.join(""));
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCharIndex(null);
    setActiveCharIndex && setActiveCharIndex(null);
  };

  return (
    <AsciiBorder title="SETTINGS">
      <div
        ref={settingsRef}
        className="space-y-6 font-mono max-w-md mx-auto text-gray-800"
      >
        <div>
          <label className="block text-sm font-medium mb-2 text-center">
            [ BRIGHTNESS & CONTRAST ]
          </label>
          <div className="px-4 space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">[ BRIGHTNESS: {brightness} ]</span>
              </div>
              <input
                type="range"
                min="-255"
                max="255"
                value={brightness}
                onChange={(e) => onBrightnessChange(Number(e.target.value))}
                className="w-full accent-blue-400"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">[ CONTRAST: {contrast} ]</span>
              </div>
              <input
                type="range"
                min="-255"
                max="255"
                value={contrast}
                onChange={(e) => onContrastChange(Number(e.target.value))}
                className="w-full accent-blue-400"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-center">
            [ CHARACTER SET ]
          </label>
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex flex-wrap justify-center gap-1">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="relative">
                  <button
                    ref={(el: HTMLButtonElement | null) => {
                      charButtonRefs.current[index] = el;
                    }}
                    onClick={() => handleCharClick(index)}
                    className={`w-12 h-12 border-2 flex items-center justify-center text-xl transition-colors ${
                      index === activeCharIndex
                        ? "bg-blue-100 border-blue-400 text-blue-700"
                        : "border-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {customChars[index] || " "}
                  </button>
                  {activeCharIndex === index && (
                    <div
                      className="absolute inset-0 border-2 border-blue-400"
                      style={{
                        animation:
                          "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition text-sm font-mono"
                onClick={() => onCustomCharsChange(DEFAULT_CHARS)}
                type="button"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-center">
            [ DISPLAY SIZE: {width}px ]
          </label>
          <div className="px-4">
            <input
              type="range"
              min="8"
              max="32"
              value={width}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              className="w-full accent-blue-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-center">
            [ FONT FREQUENCY: {fontFrequency} ]
          </label>
          <div className="px-4">
            <input
              type="range"
              min="5"
              max="200"
              step="10"
              value={fontFrequency}
              onChange={(e) => onFontFrequencyChange(Number(e.target.value))}
              className="w-full accent-blue-400"
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium mb-2 text-center">
            [ ASPECT RATIO: {aspectRatio.toFixed(1)} ]
          </label>
          <div className="w-3/4">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={aspectRatio}
              onChange={(e) => onAspectRatioChange(Number(e.target.value))}
              className="w-full accent-blue-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-center">
            [ ASCII COLOR ]
          </label>
          <div className="flex justify-center">
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange && onColorChange(e.target.value)}
              className="w-10 h-10 border-2 border-blue-300 rounded-lg cursor-pointer"
              style={{ background: "none" }}
            />
          </div>
        </div>

        <CharInputDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onConfirm={handleConfirmChar}
          initialChar={
            selectedCharIndex !== null ? customChars[selectedCharIndex] : " "
          }
          position={dialogPosition}
        />
      </div>
    </AsciiBorder>
  );
};
