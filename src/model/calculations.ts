import { Info, DependencyResult } from "./interface";

/**
 * Računa za koliko vremena (u sekundama) će se očistiti cache za cijeli lanac
 * (glavna ruta + sve ovisne rute), odnosno kada će sljedeći dohvat vratiti
 * zadnje podatke sa servera.
 *
 * Problem: Glavna ruta ovisi o ovisnim rutama. Kad glavnoj istekne cache,
 * ona se refetcha i poziva ovisne rute. Ako ovisne rute još imaju validan cache,
 * glavna će dobiti stare podatke i novi cache. Tek kad svi cachevi u lancu isteknu
 * i glavna se refetcha, dobivamo svježe podatke sa servera.
 *
 * @param mainInfo - Cache informacije glavne rute
 * @param dependencyResults - Cache informacije ovisnih ruta (može sadržavati i errore)
 * @returns Broj sekundi do trenutka kad će se cijeli lanac očistiti, ili undefined
 *          ako se ne može izračunati (nema ovisnih, nedostaju podaci, itd.)
 *
 * @example
 * // Glavna: timeLeft=20s, TTL=1800s (30min)
 * // Ovisna: timeLeft=60s
 * // Rezultat: 1820s (20 + 1*1800) - prvi refetch glavne nakon što ovisna istekne
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
  const mainTTL = mainInfo.maxServerLifetime ?? mainInfo.maxBrowserLifetime;

  // Izvuci sve timeLeft vrijednosti iz ovisnih ruta (samo uspješne, s brojem)
  const depTimeLefts = dependencyResults
    .map((d) => d.info?.timeLeft)
    .filter((t): t is number => typeof t === "number");

  // Ako nijedna ovisna ruta nema timeLeft, pretpostavljamo da su sve istekle (0)
  const TdepsMax = depTimeLefts.length > 0 ? Math.max(...depTimeLefts) : 0;

  // Ako glavna ruta nema timeLeft, ne možemo znati kad će se refetchati
  if (typeof mainTimeLeft !== "number") {
    return undefined;
  }

  // Slučaj 1: Glavna istekne NAKON svih ovisnih
  // Prvi refetch glavne će već naći sve ovisne istekle → dobivamo svježe podatke
  if (mainTimeLeft >= TdepsMax) {
    return mainTimeLeft;
  }

  // Slučaj 2: Glavna istekne PRIJE ovisnih
  // Glavna će se refetchati prije nego što ovisne isteknu, pa će dobiti stare podatke.
  // Trebamo pronaći prvi refetch glavne koji padne NAKON što su sve ovisne istekle.
  //
  // Refetch glavne se događa u ciklusima:
  //   - Prvi: mainTimeLeft (npr. 20s)
  //   - Drugi: mainTimeLeft + mainTTL (npr. 20 + 1800 = 1820s)
  //   - Treći: mainTimeLeft + 2*mainTTL (npr. 20 + 3600 = 3620s)
  //   - itd.
  //
  // Tražimo najmanji n takav da: mainTimeLeft + n*mainTTL >= TdepsMax

  // Ako glavna nema TTL, ne možemo izračunati sljedeći ciklus
  if (mainTTL == null || mainTTL <= 0) {
    return undefined;
  }

  // Izračunaj koliko ciklusa trebamo pričekati
  // n = ceil((TdepsMax - mainTimeLeft) / mainTTL)
  // Primjer: (60 - 20) / 1800 = 40/1800 = 0.022... → ceil = 1
  const n = Math.max(1, Math.ceil((TdepsMax - mainTimeLeft) / mainTTL));

  // Vrati vrijeme prvog refetcha glavne koji padne nakon što su sve ovisne istekle
  return mainTimeLeft + n * mainTTL;
}
