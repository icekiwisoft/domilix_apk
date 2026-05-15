import type { Category } from '@/types/announce';

export const MOCK_CATEGORIES: Category[] = [
  // Immobilier (type: 'house' per API schema)
  { id: 'cat-1', name: 'Appartement', type: 'house', created_at: '2022-01-01T00:00:00.000Z' },
  { id: 'cat-2', name: 'Villa', type: 'house', created_at: '2022-01-01T00:00:00.000Z' },
  { id: 'cat-3', name: 'Studio', type: 'house', created_at: '2022-01-01T00:00:00.000Z' },
  { id: 'cat-4', name: 'Duplex', type: 'house', created_at: '2022-01-01T00:00:00.000Z' },
  { id: 'cat-5', name: 'Bureau', type: 'house', created_at: '2022-01-01T00:00:00.000Z' },
  { id: 'cat-6', name: 'Terrain', type: 'house', created_at: '2022-01-01T00:00:00.000Z' },
  { id: 'cat-7', name: 'Immeuble', type: 'house', created_at: '2022-01-01T00:00:00.000Z' },
  // Mobilier
  { id: 'cat-8', name: 'Salon & Canapés', type: 'furniture', created_at: '2022-01-01T00:00:00.000Z' },
  { id: 'cat-9', name: 'Chambre', type: 'furniture', created_at: '2022-01-01T00:00:00.000Z' },
  { id: 'cat-10', name: 'Cuisine & Équipement', type: 'furniture', created_at: '2022-01-01T00:00:00.000Z' },
  { id: 'cat-11', name: 'Décoration', type: 'furniture', created_at: '2022-01-01T00:00:00.000Z' },
];
