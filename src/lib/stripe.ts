import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: ["Limited quiz access", "1 audio demo lesson", "Basic flashcards"],
  },
  standard: {
    name: "Standard",
    price: 7900, // cents
    priceId: process.env.STRIPE_STANDARD_PRICE_ID,
    features: [
      "Full study guide with audio",
      "All flashcards with spaced repetition",
      "Full quiz bank",
      "Performance tracking",
      "Readiness score",
    ],
  },
  premium: {
    name: "Premium",
    price: 12900, // cents
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      "Everything in Standard",
      "AI tutor (explain any question)",
      "Teach-it-back mode",
      "Adaptive study plans",
      "Simulated exam environment",
      "Priority support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
