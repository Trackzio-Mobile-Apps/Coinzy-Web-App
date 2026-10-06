import { type ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer";
  id?: string;
}

export function Container({
  children,
  className = "",
  as: Tag = "div",
  id,
}: ContainerProps) {
  return (
    <Tag id={id} className={`mx-auto w-full max-w-[1120px] px-6 xl:px-0 ${className}`}>
      {children}
    </Tag>
  );
}
