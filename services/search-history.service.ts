import { client } from './api.client';

export const SearchHistoryService = {
  // Fire-and-forget analytics: a failure must never affect the search UX.
  log: (data: {
    type: 'realestate' | 'furniture' | 'land';
    search_text?: string;
    filters?: Record<string, unknown>;
    results_count?: number;
  }) => client.post('/search-history', data).catch(() => undefined),
};
