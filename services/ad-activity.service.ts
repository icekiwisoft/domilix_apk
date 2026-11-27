import { client } from './api.client';
import type { AdType } from '@/types/announce';

export type PrivateListingInfo = { owner_name: string; owner_phone: string; notes: string };
export type AdComment = { id: string; author: string; body: string; created_at: string };
export type AdOrder = {
  id: string;
  ad_id: string;
  status: 'cart' | 'pending_payment';
  price: string;
  devise: string;
  ad_type: AdType;
  period: string | null;
  title: string;
  city: string;
};

export const AdActivityService = {
  privateInfo: (id: string) =>
    client.get<PrivateListingInfo>(`/announces/${id}/private-info`).then(({ data }) => data),
  comments: (id: string, before?: string) =>
    client.get<{ items: AdComment[]; next_cursor: string | null }>(`/announces/${id}/comments`, {
      params: { before },
    }).then(({ data }) => data),
  postComment: (id: string, body: string) =>
    client.post(`/announces/${id}/comments`, { body }),
  orders: () => client.get<AdOrder[]>('/ad-orders/me').then(({ data }) => data),
  addToCart: (id: string) => client.post<AdOrder>(`/announces/${id}/cart`).then(({ data }) => data),
  prepare: (id: string) => client.post<AdOrder>(`/ad-orders/${id}/prepare`).then(({ data }) => data),
  remove: (id: string) => client.delete(`/ad-orders/${id}`),
};
