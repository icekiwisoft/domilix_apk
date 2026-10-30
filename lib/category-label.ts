// The API stores category names in English (backend prisma.service.ts default
// categories, plus office, co-working and building in production) and neither
// the website nor the app had a French mapping: French labels for the known
// names, the API name otherwise (QA-05, UI-08).
const CATEGORY_LABELS: Record<string, string> = {
  apartment: 'Appartement',
  room: 'Chambre',
  house: 'Maison',
  studio: 'Studio',
  sofas: 'Canapés',
  tables: 'Tables',
  chairs: 'Chaises',
  beds: 'Lits',
  office: 'Bureau',
  'co-working': 'Coworking',
  building: 'Immeuble',
};

/** French label of a listing category. */
export function categoryLabel(name: string) {
  return CATEGORY_LABELS[name.trim().toLowerCase()] ?? name;
}
