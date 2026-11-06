import { OtherAppDownloadButton } from "@/components/ui/OtherAppDownloadButton";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/constants";

const COINZY_APP = {
  name: "Coinzy AI",
  description: "Identify coins using your phone camera.",
  icon: "/assets/other-apps/coinzy-icon.webp",
  qr: "/assets/coin-details/qr-coinzy.svg",
  playHref: PLAY_STORE_URL,
  appStoreHref: APP_STORE_URL,
};

export function CoinzyDownloadButton({ className, label = "Get app", icon }: { className?: string; label?: string; icon?: string }) {
  return <OtherAppDownloadButton app={COINZY_APP} className={className} label={label} icon={icon} />;
}
