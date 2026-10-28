// Private search alert — GET/POST /alerts. The user is notified (in-app and by
// email) when a new listing matches the saved filters.
export interface AlertFilters {
  search?: string;
  city?: string;
  address?: string;
  ad_type?: string;
  category_id?: string[];
  budget_min?: string;
  budget_max?: string;
  budget_currency?: string;
  bedroom_min?: string;
  bedroom_max?: string;
  standing?: string;
  condition?: string;
  amenities?: string[];
}

export interface SearchAlert {
  id: number;
  request_type: 'realestate' | 'furniture';
  description?: string | null;
  filters: AlertFilters;
  status: 'active' | 'inactive';
  last_notified_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
