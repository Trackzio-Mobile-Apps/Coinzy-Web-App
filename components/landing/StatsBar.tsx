import { HERO_STATS } from "@/lib/constants";

export function StatsBar() {
  return (
    <section className="bg-headline">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-8 px-6 py-8 md:flex md:justify-between lg:px-[160px]">
        {HERO_STATS.map((stat) => (
          <div key={stat.label} className="space-y-1">
            <p className="text-2xl font-semibold leading-8 text-[#fff9f3]">
              {stat.value}
            </p>
            <p className="text-sm leading-5 text-[#dccac4]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
