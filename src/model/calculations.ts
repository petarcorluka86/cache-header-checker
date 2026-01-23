import { Info, DependencyResult } from "./interface";

/**
 * Računa za koliko vremena (u sekundama) će se očistiti cache za cijeli lanac
 * (glavna ruta + sve ovisne rute), odnosno kada će sljedeći dohvat vratiti
 * zadnje podatke sa servera.
 *
 * Logika:
 * - Ako je timeLeft glavne rute >= max(timeLeft svih dependencija):
 *   → Rezultat = timeLeft glavne rute (glavna će isteći nakon što su svi depovi već istekli)
 *
 * - Ako je timeLeft glavne rute < max(timeLeft dependencija):
 *   → Rezultat = max(timeLeft dependencija) + timeLeft glavne rute
 *   (prvo čekamo da najduži dependency istekne, pa još toliko koliko glavna ima)
 *
 * @param mainInfo - Cache informacije glavne rute
 * @param dependencyResults - Cache informacije ovisnih ruta (može sadržavati i errore)
 * @returns Broj sekundi do trenutka kad će se cijeli lanac očistiti, ili undefined
 *          ako se ne može izračunati (nema ovisnih, nedostaju podaci, itd.)
 *
 * @example
 * // Glavna: timeLeft=60s
 * // Ovisna: timeLeft=20s
 * // Rezultat: 60s (glavna istekne nakon što ovisna već istekla)
 *
 * @example
 * // Glavna: timeLeft=20s
 * // Ovisna: timeLeft=60s
 * // Rezultat: 80s (60 + 20 - čekamo da ovisna istekne, pa još 20s)
 */
export function calculateGuaranteedFreshSeconds(
  mainInfo: Info,
  dependencyResults: DependencyResult[]
): number | undefined {
  // Ako nema ovisnih ruta, ne računamo (nema lanca)
  if (dependencyResults.length === 0) {
    return undefined;
  }

  const mainTimeLeft = mainInfo.timeLeft;

  // Izvuci sve timeLeft vrijednosti iz ovisnih ruta (samo uspješne, s brojem)
  const depTimeLefts = dependencyResults
    .map((d) => d.info?.timeLeft)
    .filter((t): t is number => typeof t === "number");

  // Ako nijedna ovisna ruta nema timeLeft, pretpostavljamo da su sve istekle (0)
  const maxDepTimeLeft = depTimeLefts.length > 0 ? Math.max(...depTimeLefts) : 0;

  // Ako glavna ruta nema timeLeft, ne možemo izračunati
  if (typeof mainTimeLeft !== "number") {
    return undefined;
  }

  // Slučaj 1: Glavna istekne NAKON svih ovisnih
  // Glavna će isteći nakon što su svi depovi već istekli → rezultat je timeLeft glavne
  if (mainTimeLeft >= maxDepTimeLeft) {
    return mainTimeLeft;
  }

  // Slučaj 2: Glavna istekne PRIJE ovisnih
  // Prvo čekamo da najduži dependency istekne, pa još toliko koliko glavna ima timeLeft
  return maxDepTimeLeft + mainTimeLeft;
}
