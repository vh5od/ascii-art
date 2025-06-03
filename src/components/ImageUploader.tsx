import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AsciiBorder } from "./AsciiBorder";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageUpload(acceptedFiles[0]);
      }
    },
    [onImageUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  return (
    <AsciiBorder title="UPLOAD">
      <div
        {...getRootProps()}
        className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors bg-white"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500 font-mono text-center">
            [ DROP IMAGE HERE ]
          </p>
        ) : (
          <div className="text-center font-mono text-gray-800">
            <p>[ DRAG & DROP IMAGE HERE ]</p>
            <p className="text-sm text-gray-500 mt-2">
              [ PNG, JPG, GIF (max 10MB) ]
            </p>
          </div>
        )}
      </div>
    </AsciiBorder>
  );
};
