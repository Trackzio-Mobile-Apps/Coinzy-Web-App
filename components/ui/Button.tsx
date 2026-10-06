import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";

type ButtonVariant = "solid" | "outline" | "ghost";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  icon?: string;
  iconAlt?: string;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<ButtonVariant, string> = {
  solid:
    "bg-primary-500 text-primary-50 hover:bg-primary-700 transition-colors",
  outline:
    "bg-outline-bg border border-primary-200 text-primary-500 hover:bg-primary-50 transition-colors",
  ghost: "text-primary-500 hover:text-primary-700 transition-colors",
};

export function Button({
  children,
  href,
  variant = "solid",
  icon,
  iconAlt = "",
  className = "",
  onClick,
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium leading-5 ${variantClasses[variant]} ${className}`;

  const content = (
    <>
      {icon && (
        <Image src={icon} alt={iconAlt} width={16} height={16} className="shrink-0" />
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
