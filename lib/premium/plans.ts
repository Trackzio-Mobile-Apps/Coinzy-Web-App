/** Test Premium plans (interim until real web payments). Any option grants pro via cookie. */

export type PremiumPlan = {
  id: string;
  label: string;
  priceLabel: string;
  detail: string;
  popular?: boolean;
};

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: "monthly",
    label: "Monthly",
    priceLabel: "$19/mo",
    detail: "Billed monthly · Cancel anytime",
  },
  {
    id: "yearly",
    label: "Yearly",
    priceLabel: "$19/mo",
    detail: "Billed yearly · Best value · Cancel anytime",
    popular: true,
  },
  {
    id: "weekly",
    label: "Weekly",
    priceLabel: "$6.99/wk",
    detail: "Billed weekly · Cancel anytime",
  },
];

export const DEFAULT_PREMIUM_PLAN_ID = "yearly";

export const PREMIUM_COOKIE = "coinzy_premium";

export function isPremiumPlanId(value: unknown): value is string {
  return typeof value === "string" && PREMIUM_PLANS.some((p) => p.id === value);
}
