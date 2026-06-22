// Calcul de distance géographique (formule de Haversine).
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function filtrerParRayon<T extends { lat: number; lng: number }>(
  items: T[],
  centre: { lat: number; lng: number },
  rayonKm: number
): T[] {
  return items.filter((i) => haversine(centre.lat, centre.lng, i.lat, i.lng) <= rayonKm);
}
