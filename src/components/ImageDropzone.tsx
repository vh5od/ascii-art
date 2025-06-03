import React from "react";

interface ImageDropzoneProps {
  onImageUpload: (file: File) => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageUpload,
}) => {
  return (
    <div
      className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center bg-white cursor-pointer hover:border-blue-400 transition-colors"
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            onImageUpload(file);
          }
        };
        input.click();
      }}
    >
      <span role="img" aria-label="upload" className="text-4xl mb-4">
        📷
      </span>
      <p className="text-gray-600 text-center font-mono">
        Click to upload an image
        <br />
        <span className="text-sm text-gray-400">or drag and drop</span>
      </p>
    </div>
  );
};
