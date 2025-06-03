import React from "react";

interface CurveAdjustmentProps {
  brightness: number;
  contrast: number;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
}

export const CurveAdjustment: React.FC<CurveAdjustmentProps> = ({
  brightness,
  contrast,
  onBrightnessChange,
  onContrastChange,
}) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold">曲线调节</h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          亮度 ({brightness})
        </label>
        <input
          type="range"
          min="-100"
          max="100"
          value={brightness}
          onChange={(e) => onBrightnessChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          对比度 ({contrast})
        </label>
        <input
          type="range"
          min="-100"
          max="100"
          value={contrast}
          onChange={(e) => onContrastChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
