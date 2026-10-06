interface CoinPlaceholderProps {
  size?: "sm" | "md" | "category" | "lg" | "listing" | "xl" | "hero";
  className?: string;
}

const sizeMap = {
  sm: "h-9 w-9",
  md: "h-16 w-16",
  category: "h-[88px] w-[88px]",
  lg: "h-24 w-24",
  listing: "h-[116px] w-[116px]",
  xl: "h-[136px] w-[136px]",
  hero: "h-[200px] w-[200px]",
};

export function CoinPlaceholder({
  size = "md",
  className = "",
}: CoinPlaceholderProps) {
  return (
    <div
      className={`${sizeMap[size]} shrink-0 rounded-full bg-gradient-to-br from-[#d5b785] via-[#bfa37f] to-[#7a543a] shadow-inner ${className}`}
      aria-hidden
    />
  );
}
