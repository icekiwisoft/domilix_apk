export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// A subscription is one purchased Domicoin pack. Users can hold several
// simultaneously (each a separate top-up with its own remaining credits and
// expiry) — there is no single "current plan" like a SaaS tier.
export interface Subscription {
  id: string;
  plan_name: string;
  credits: number;
  price: number;
  duration: number;
  start_date?: string | null;
  end_date?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

// The internal DB plan name (English, sometimes misspelled — e.g. "Standart")
// used as the wire-format identifier for both GET /subscriptions/plans and
// the plan_name sent to POST /subscriptions.
export type SubscriptionPlanName = 'Standart' | 'Advantage' | 'Premium' | 'Ultimate';

export interface SubscriptionPlan {
  id: number;
  name: SubscriptionPlanName;
  price: number;
  duration: number;
  credits: number;
  active: boolean;
}
