import Image from "next/image";

interface ParchmentBackgroundProps {
  variant?: "hero" | "section" | "cta";
  className?: string;
}

export function ParchmentBackground({
  variant = "section",
  className = "",
}: ParchmentBackgroundProps) {
  if (variant === "hero") {
    return (
      <div className={`pointer-events-none absolute inset-0 ${className}`}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(-50.81deg, #ffffff 31.19%, #f3f5f7 82.08%)",
          }}
        />
        <div className="absolute left-0 top-0 h-[813px] w-[calc(100%+16px)]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(119.51deg, #fff7ee 10.08%, #f6e6d8 84.22%)",
            }}
          />
          <Image
            src="/assets/landing-page/02-hero/background-texture-layer-1.png"
            alt=""
            fill
            className="object-cover opacity-80"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(255,255,255,0.2) 21.16%, rgba(255,249,243,0.2) 86.53%)",
            }}
          />
          <Image
            src="/assets/landing-page/02-hero/background-texture-layer-2.jpeg"
            alt=""
            fill
            className="object-cover mix-blend-multiply"
          />
        </div>
      </div>
    );
  }

  if (variant === "cta") {
    return (
      <div className={`pointer-events-none absolute inset-0 ${className}`}>
        <Image
          src="/assets/landing-page/08-cta/background-texture.png"
          alt=""
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[rgba(250,245,238,0.6)]" />
      </div>
    );
  }

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <Image
        src="/assets/landing-page/02-hero/background-texture-layer-1.png"
        alt=""
        fill
        className="object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-[rgba(246,233,231,0.6)]" />
    </div>
  );
}
