/**
 * "Our other apps" page (Figma `Landing page/Our other apps`, 876:23169).
 * Card art + icons are 3x renders of the Figma cards (`public/assets/other-apps/`).
 * Links: "Explore" → the app's page on trackzio.com; store links follow its app page
 * (developer: https://play.google.com/store/apps/developer?id=Trackzio).
 * TCG / Vinyl / Birds omitted (ClickUp 14yn59xn56c) until they ship links.
 */

export const TRACKZIO_PLAY_URL = "https://play.google.com/store/apps/developer?id=Trackzio";

export type OtherApp = {
  /** Asset prefix in /assets/other-apps/ (`<slug>-header.webp`, `<slug>-icon.webp`). */
  slug: string;
  name: string;
  description: string;
  exploreHref?: string;
  playHref?: string;
  appStoreHref?: string;
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
      "AI identification, value estimates, and marketplaces for coins, banknotes, antiques, and minerals.",
    className: "bg-cream",
    apps: [
      {
        slug: "banknote",
        name: "Banknote AI",
        description: "Identify banknotes using Banknote AI",
        exploreHref: site("banknotes"),
        playHref: play("com.trackzio.banknote"),
        appStoreHref: "https://apps.apple.com/us/app/banknote-identification-ai/id6747063766",
      },
      {
        slug: "coinzy",
        name: "Coinzy AI",
        description: "Identify rare and valuable coins using Coinzy AI",
        exploreHref: site("coinzy"),
        playHref: play("com.coinzy.trackzio"),
        appStoreHref: "https://apps.apple.com/app/id6752857760",
      },
      {
        slug: "antiqzy",
        name: "Antiqzy AI",
        description: "Identify antiques and vintage finds using Antiqzy AI",
        exploreHref: site("antiqzy"),
        playHref: play("com.trackzio.antiquevintage"),
        appStoreHref: "https://apps.apple.com/app/id6791132900",
      },
      {
        slug: "rockzy",
        name: "Rockzy AI",
        description: "Identify rocks, gems & minerals using Rockzy AI",
        exploreHref: site("rockzy"),
        playHref: play("com.trackzio.minerals"),
        appStoreHref: "https://apps.apple.com/us/app/rockzy-ai-rock-identifier/id6758651735",
      },
    ],
  },
  {
    label: "Nature apps",
    title: "Identify anything living or growing",
    description:
      "Instant AI identification for insects, plants, and mushrooms — with safety, care, and habitat details.",
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
      {
        slug: "plantzy",
        name: "Plantzy AI",
        description: "Identify plants using Plantzy AI",
        exploreHref: site("plantzy"),
        playHref: play("com.trackzio.plants"),
        appStoreHref: "https://apps.apple.com/us/app/plantzy-ai-plant-id-and-care/id6770974717",
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
        appStoreHref: "https://apps.apple.com/in/app/habit-eazy-habit-to-do-pal/id6738790392",
      },
    ],
  },
];
