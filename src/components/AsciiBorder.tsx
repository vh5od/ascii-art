interface AsciiBorderProps {
  children: React.ReactNode;
  title?: string;
}

export const AsciiBorder = ({ children, title }: AsciiBorderProps) => {
  return (
    <div className="relative border-2 border-gray-300 p-4 bg-white text-gray-800 font-mono">
      {/* Top border */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 bg-white">
        {title || "┌─┐"}
      </div>

      {/* Content */}
      <div className="pt-2">{children}</div>

      {/* Bottom border */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 bg-white">
        {"└─┘"}
      </div>
    </div>
  );
};
