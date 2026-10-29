import Image from "next/image";

/** The one app-download QR: encodes `<prod site>/get-app`, which opens the App Store / Google Play by device. */
export const APP_QR_SRC = "/assets/coin-details/qr-coinzy.svg";

export function AppQrCode({ size = 142, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src={APP_QR_SRC}
      alt="QR code to download the Coinzy AI app"
      width={size}
      height={size}
      className={className}
    />
  );
}
