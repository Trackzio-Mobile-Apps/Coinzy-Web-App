import {
  EXPERT_TOKEN_PRODUCT_ID,
  EXPERT_TOKEN_PRODUCT_ID_3,
  EXPERT_TOKEN_PRODUCT_ID_5,
} from "@/lib/experts/mediaRules";

/** Figma `1500:289177` credit packs (INR display; web purchase still stubs to Play Store). */
export type ExpertCreditPack = {
  id: string;
  productId: string;
  credits: number;
  label: string;
  priceLabel: string;
  perCreditLabel: string;
  popular?: boolean;
};

export const EXPERT_CREDIT_PACKS: ExpertCreditPack[] = [
  {
    id: "1",
    productId: EXPERT_TOKEN_PRODUCT_ID,
    credits: 1,
    label: "1 credit",
    priceLabel: "₹ 300.00",
    perCreditLabel: "₹ 300.00/Credit",
  },
  {
    id: "3",
    productId: EXPERT_TOKEN_PRODUCT_ID_3,
    credits: 3,
    label: "3 credits",
    priceLabel: "₹ 799.00",
    perCreditLabel: "₹ 266.33/Credit",
    popular: true,
  },
  {
    id: "5",
    productId: EXPERT_TOKEN_PRODUCT_ID_5,
    credits: 5,
    label: "5 credits",
    priceLabel: "₹ 1,199.00",
    perCreditLabel: "₹ 238.80/Credit",
  },
];

export const DEFAULT_CREDIT_PACK_ID = "3";
