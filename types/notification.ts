export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  plan_name: string;
  method: string;
  payment_info: Record<string, unknown>;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  created_at: string;
  expires_at?: string;
}
