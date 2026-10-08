import Link from "next/link";
import type { UserCoinRow } from "@/lib/api/coinzy-session";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { withFrom } from "@/lib/backNav";

function labelLines(coin: UserCoinRow): [string, string] {
  const name = coin.name.trim();
  const extra = [coin.issuer, coin.yearOfMinting].filter(Boolean).join(" · ");
  if (!extra) return [name, ""];
  const first = name.length > 14 ? `${name.slice(0, 14)}…` : name;
  return [first, extra];
}

/** Right rail on collections home (Figma `1341:262520`). */
export function CollectionRecentlyIdentified({ coins }: { coins: UserCoinRow[] }) {
  return (
    <div className="w-[268px] rounded-xl border border-[#c2c2c4] bg-white p-4">
      <p className="text-sm font-medium leading-5 text-ink">Recently identified</p>
      <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-4">
        {coins.map((coin) => {
          const [line1, line2] = labelLines(coin);
          const href = withFrom(`/collection/coin/${coin.coinId}`, "identified");
          return (
            <li key={coin.coinId} className="w-[70px]">
              <Link href={href} className="flex flex-col items-center gap-1">
                <div className="relative size-[46px] overflow-hidden rounded-full bg-[#f5f5f5]">
                  {coin.imageUrls?.[0] ? (
                    <FallbackImage
                      src={coin.imageUrls[0]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="46px"
                      fallback={<CoinPlaceholder className="size-full" />}
                    />
                  ) : (
                    <CoinPlaceholder className="size-full" />
                  )}
                </div>
                <span className="flex h-8 flex-col items-center justify-center text-center text-xs leading-4 text-[#606062]">
                  {line1 && <span className="line-clamp-1 w-full">{line1}</span>}
                  {line2 && <span className="line-clamp-1 w-full">{line2}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
