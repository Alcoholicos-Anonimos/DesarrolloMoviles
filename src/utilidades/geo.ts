import { Coordenadas, Zona } from '../tipos';

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

const EPSILON = 1e-12;

// ¿El punto está sobre el segmento a–b?
function sobreSegmento(
  p: Coordenadas,
  a: Coordenadas,
  b: Coordenadas,
): boolean {
  const cruz =
    (b.longitud - a.longitud) * (p.latitud - a.latitud) -
    (b.latitud - a.latitud) * (p.longitud - a.longitud);
  if (Math.abs(cruz) > EPSILON) return false;
  return (
    p.latitud >= Math.min(a.latitud, b.latitud) - EPSILON &&
    p.latitud <= Math.max(a.latitud, b.latitud) + EPSILON &&
    p.longitud >= Math.min(a.longitud, b.longitud) - EPSILON &&
    p.longitud <= Math.max(a.longitud, b.longitud) + EPSILON
  );
}

// Trazado de rayo (par-impar). Un punto sobre el borde o un vértice cuenta como adentro.
export function puntoEnPoligono(
  punto: Coordenadas,
  poligono: readonly Coordenadas[],
): boolean {
  if (poligono.length < 3) return false;
  let adentro = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const a = poligono[i];
    const b = poligono[j];
    if (sobreSegmento(punto, a, b)) return true;
    const cruza =
      a.latitud > punto.latitud !== b.latitud > punto.latitud &&
      punto.longitud <
        ((b.longitud - a.longitud) * (punto.latitud - a.latitud)) /
          (b.latitud - a.latitud) +
          a.longitud;
    if (cruza) adentro = !adentro;
  }
  return adentro;
}

// La zona que contiene el punto, o null si cae fuera de todas.
// Ante un empate en el borde, gana la de menor id (igual que la API).
export function zonaDe(
  punto: Coordenadas,
  zonas: readonly Zona[],
): Zona | null {
  const ordenadas = [...zonas].sort((a, b) => a.id.localeCompare(b.id));
  return ordenadas.find((zona) => puntoEnPoligono(punto, zona.limite)) ?? null;
}