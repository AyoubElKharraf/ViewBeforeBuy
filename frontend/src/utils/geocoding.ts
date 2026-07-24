export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Casablanca: { lat: 33.5731, lng: -7.5898 },
  Rabat: { lat: 34.0209, lng: -6.8416 },
  Marrakech: { lat: 31.6295, lng: -7.9811 },
  Agadir: { lat: 30.4278, lng: -9.5981 },
  Oujda: { lat: 34.6814, lng: -1.9086 },
  Fès: { lat: 34.0181, lng: -5.0078 },
  Tanger: { lat: 35.7595, lng: -5.834 },
};

export function coordsForCity(city: string): { lat: number; lng: number } | null {
  return CITY_COORDS[city] ?? null;
}
