import { useRef } from "react";
import { useDropzone } from "react-dropzone";
import { AsciiBorder } from "./AsciiBorder";
// @ts-ignore: no types for file-saver
import { saveAs } from "file-saver";

interface AsciiUploadPreviewProps {
  image: File | null;
  asciiArt: string;
  fontFrequency: number;
  color?: string;
  activeChar: string | null;
  onImageUpload: (file: File) => void;
  onClear: () => void;
  width: number;
}

export const AsciiUploadPreview = ({
  image,
  asciiArt,
  fontFrequency,
  color = "#222222",
  activeChar,
  onImageUpload,
  onClear,
  width,
}: AsciiUploadPreviewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onImageUpload(acceptedFiles[0]);
      }
    },
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    noClick: !!image,
    noDrag: !!image,
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleReupload = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    const blob = new Blob([asciiArt], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "ascii-art.txt");
  };

  // 渲染 ASCII，激活字符高亮闪烁
  const renderAscii = () => {
    if (!asciiArt) return null;
    if (!activeChar) return asciiArt;
    return asciiArt.split("").map((ch, i) =>
      ch === activeChar ? (
        <span key={i} className="blinking">
          {ch}
        </span>
      ) : (
        ch
      ),
    );
  };

  // 计算显示样式
  const getDisplayStyles = () => {
    return {
      fontSize: `${width}px`,
      lineHeight: "1em",
      letterSpacing: "0em",
      whiteSpace: "pre",
      fontFamily: "monospace",
      padding: "1em",
      display: "inline-block",
      backgroundColor: "white",
      color: color,
    };
  };

  return (
    <AsciiBorder title="PREVIEW">
      <div
        className="relative min-h-[300px] flex items-center justify-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!image && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-gray-500 mb-4">Drag & drop an image or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition"
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
        {image && (
          <div className="relative w-full">
            <div className="absolute top-2 right-2">
              <button
                onClick={onClear}
                className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 transition text-sm"
              >
                Clear
              </button>
            </div>
            <div className="overflow-auto text-center">
              <pre style={getDisplayStyles()}>{renderAscii()}</pre>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="border border-gray-300 bg-white text-gray-800 font-mono px-4 py-1 rounded hover:bg-gray-100 transition"
                onClick={handleReupload}
              >
                Reupload
              </button>
              <button
                className="border border-gray-300 bg-white text-gray-800 font-mono px-4 py-1 rounded hover:bg-gray-100 transition"
                onClick={handleSave}
                disabled={!asciiArt}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </AsciiBorder>
  );
};
