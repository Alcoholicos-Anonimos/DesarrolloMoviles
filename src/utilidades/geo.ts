import { Coordenadas } from '../tipos';

// Distancia aproximada en metros entre dos puntos (fórmula de Haversine)
export function distanciaEnMetros(a: Coordenadas, b: Coordenadas): number {
  const R = 6371000; // radio de la Tierra en metros
  const rad = (grados: number) => (grados * Math.PI) / 180;
  const dLat = rad(b.latitud - a.latitud);
  const dLon = rad(b.longitud - a.longitud);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitud)) * Math.cos(rad(b.latitud)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// "12 m" o "1,3 km"
export function formatearDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1).replace('.', ',')} km`;
}
