import React, { useState, useEffect, useRef } from "react";

interface CharInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (char: string) => void;
  initialChar: string;
  position: { top: number; left: number };
}

export const CharInputDialog: React.FC<CharInputDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialChar,
  position,
}) => {
  const [inputValue, setInputValue] = useState(initialChar);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialChar);
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(0, 0);
      }
    }
  }, [isOpen, initialChar]);

  const handleConfirm = () => {
    onConfirm(inputValue.charAt(0) || " ");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="bg-white border-2 border-gray-400 font-mono">
        <div className="border-b-2 border-gray-400 bg-gray-100 px-4 py-2">
          <h3 className="text-sm font-bold">[ INPUT CHARACTER ]</h3>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-12 h-12 text-center text-xl border-2 border-gray-400 focus:outline-none focus:border-blue-400"
              style={{ borderRadius: 0 }}
            />

            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 transition text-sm"
              >
                OK
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
