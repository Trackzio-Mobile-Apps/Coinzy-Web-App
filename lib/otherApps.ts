/**
 * "Our other apps" page (Figma `Landing page/Our other apps`, 876:23169).
 * Card art + icons are 3x renders of the Figma cards (`public/assets/other-apps/`).
 * Links: "Explore" → the app's page on trackzio.com, "Get the app" → Google Play
 * (developer: https://play.google.com/store/apps/developer?id=Trackzio). TCG, Vinyl and Birds
 * have neither yet (checked 5 Oct 2026), so their buttons render as "Coming soon".
 */

export const TRACKZIO_PLAY_URL = "https://play.google.com/store/apps/developer?id=Trackzio";

export type OtherApp = {
  /** Asset prefix in /assets/other-apps/ (`<slug>-header.webp`, `<slug>-icon.png`). */
  slug: string;
  name: string;
  description: string;
  exploreHref?: string;
  playHref?: string;
};

const play = (id: string) => `https://play.google.com/store/apps/details?id=${id}`;
const site = (slug: string) => `https://trackzio.com/apps/${slug}`;

export const OTHER_APP_SECTIONS: {
  label: string;
  title: string;
  description: string;
  /** Section background (Figma: nature section sits on a warmer cream). */
  className: string;
  apps: OtherApp[];
}[] = [
  {
    label: "Trade apps",
    title: "Know what your collectibles are worth",
    description:
      "AI identification, value estimates, and marketplaces for coins, banknotes, antiques, trading cards, and vinyl records.",
    className: "bg-cream",
    apps: [
      {
        slug: "banknote",
        name: "Banknote AI",
        description: "Identify banknotes using Banknote AI",
        exploreHref: site("banknotes"),
        playHref: play("com.trackzio.banknote"),
      },
      {
        slug: "coinzy",
        name: "Coinzy AI",
        description: "Identify rare and valuable coins using Coinzy AI",
        exploreHref: site("coinzy"),
        playHref: play("com.coinzy.trackzio"),
      },
      {
        slug: "antiqzy",
        name: "Antiqzy AI",
        description: "Identify antiques and vintage finds using Antiqzy AI",
        exploreHref: site("antiqzy"),
        playHref: play("com.trackzio.antiquevintage"),
      },
      {
        slug: "rockzy",
        name: "Rockzy AI",
        description: "Identify rocks, gems & minerals using Rockzy AI",
        exploreHref: site("rockzy"),
        playHref: play("com.trackzio.minerals"),
      },
      { slug: "tcg", name: "TCG AI", description: "Identify trading cards using TCG AI" },
      { slug: "vinyl", name: "Vinyl AI", description: "Identify vinyl records using Vinyl AI" },
    ],
  },
  {
    label: "Nature apps",
    title: "Identify anything living or growing",
    description:
      "Instant AI identification for insects, plants, mushrooms, birds, and minerals — with safety, care, and habitat details.",
    className: "bg-[#faf5ee]",
    apps: [
      {
        slug: "shroomzy",
        name: "Shroomzy AI",
        description: "Identify mushrooms using Shroomzy AI",
        exploreHref: site("shroomzy"),
        playHref: play("com.trackzio.mushrooms"),
      },
      {
        slug: "insecto",
        name: "Insecto AI",
        description: "Identify insects using Insecto AI",
        exploreHref: site("insecto"),
        playHref: play("com.insect.trackzio"),
      },
      { slug: "birds", name: "Birds AI", description: "Identify birds using Birds AI" },
      {
        slug: "plantzy",
        name: "Plantzy AI",
        description: "Identify plants using Plantzy AI",
        exploreHref: site("plantzy"),
        playHref: play("com.trackzio.plants"),
      },
    ],
  },
  {
    label: "Productivity apps",
    title: "Learn how to be productive",
    description:
      "Achieve your best self with Habit Eazy, the ultimate habit tracker and to-do app to build positive habits, quit bad habits, and manage tasks effortlessly.",
    className: "bg-cream",
    apps: [
      {
        slug: "habit-eazy",
        name: "Habit Eazy",
        description: "Your personal friend and Pal helping you with your Habits",
        exploreHref: site("habiteazy"),
        playHref: play("com.progresspal"),
      },
    ],
  },
];
