"use client";
import { useState } from "react";
import styles from "./page.module.css";
import {
  Info,
  DependencyResult,
  useIsClient,
  predefinedRoutes,
  type PredefinedRoute,
  calculateGuaranteedFreshSeconds,
} from "@/model";
import { CheckResults } from "@/ui/CheckResults";
import { useHistory } from "@/model/useHistory";
import { useFavorites } from "@/model/useFavorites";
import { IconDelete } from "@/icons/IconDelete";
import { IconStar } from "@/icons/IconStar";

type ResultState = {
  main: Info;
  dependencyResults: DependencyResult[];
  guaranteedFreshSeconds?: number;
};

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [dependencyUrls, setDependencyUrls] = useState<string[]>([]);
  const [info, setInfo] = useState<ResultState | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const { history, pushToHistory, removeFromHistory } = useHistory();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const isClient = useIsClient();

  // Helper funkcija za normalizaciju URL-a (uklanja trailing slash)
  const normalizeUrl = (url: string): string => {
    return url.replace(/\/+$/, "");
  };

  // Pronađi predefined rutu po URL-u
  const findPredefinedRoute = (url: string): PredefinedRoute | undefined => {
    const normalized = normalizeUrl(url);
    return predefinedRoutes.find(
      (route) => normalizeUrl(route.url) === normalized
    );
  };

  // Vrati label za URL (ime predefined rute ako postoji, inače URL)
  const getUrlLabel = (url: string): string => {
    const route = findPredefinedRoute(url);
    return route ? route.name : url;
  };

  const getInfo = async (mainUrl: string, depUrls: string[]) => {
    const trimmed = mainUrl.trim();
    if (!trimmed) {
      setError("Please enter a URL.");
      setInfo(undefined);
      return;
    }

    setError(undefined);
    setInfo(undefined);
    setLoading(true);

    try {
      const mainRes = await fetch(
        `/api/info?url=${encodeURIComponent(trimmed)}`
      );
      if (!mainRes.ok) {
        const d = await mainRes.json();
        setError(d?.error ?? "Failed to fetch info.");
        return;
      }
      const mainInfo: Info = await mainRes.json();

      const depResponses = await Promise.all(
        depUrls.map((u) => fetch(`/api/info?url=${encodeURIComponent(u)}`))
      );
      const depJsons = await Promise.all(
        depResponses.map((r) => r.json().catch(() => ({})))
      );
      const dependencyResults: DependencyResult[] = depUrls.map((url, i) => {
        const r = depResponses[i];
        const j = depJsons[i];
        if (!r.ok) return { url, error: j?.error ?? "Failed to fetch" };
        return { url, info: j };
      });

      const guaranteedFreshSeconds = calculateGuaranteedFreshSeconds(
        mainInfo,
        dependencyResults
      );

      setInfo({
        main: mainInfo,
        dependencyResults,
        guaranteedFreshSeconds,
      });
      pushToHistory(mainInfo.url ?? trimmed);
    } catch (err) {
      console.error(err);
      setError("Unexpected error while fetching info.");
      setInfo(undefined);
    } finally {
      setLoading(false);
    }
  };

  const addDependency = () => setDependencyUrls((prev) => [...prev, ""]);
  const setDependency = (i: number, v: string) =>
    setDependencyUrls((prev) => {
      const n = [...prev];
      n[i] = v;
      return n;
    });
  const removeDependency = (i: number) =>
    setDependencyUrls((prev) => prev.filter((_, j) => j !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const depUrls = dependencyUrls.map((s) => s.trim()).filter(Boolean);
    getInfo(url, depUrls);
  };

  const handleHistoryClick = (itemUrl: string) => {
    setUrl(itemUrl);
    getInfo(itemUrl, []);
  };

  const handleFavoriteClick = (itemUrl: string) => {
    setUrl(itemUrl);
    getInfo(itemUrl, []);
  };

  const handlePredefinedClick = (r: PredefinedRoute) => {
    const depUrls = (r.dependencies ?? []).map((d) => d.url);
    setUrl(r.url);
    setDependencyUrls(depUrls);
    getInfo(r.url, depUrls);
  };

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>PREDEFINED ROUTES</h2>
        <ul className={styles.predefinedList}>
          {predefinedRoutes.map((r, i) => (
            <li key={i} className={styles.predefinedItem}>
              <button
                type="button"
                className={styles.predefinedBtn}
                onClick={() => handlePredefinedClick(r)}
                disabled={loading}
                title={`${r.url}${
                  (r.dependencies ?? []).length
                    ? ` + ${(r.dependencies ?? []).length} ovisnosti`
                    : ""
                }`}
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>

        {isClient && favorites.length > 0 && (
          <section className={styles.favorites}>
            <h2 className={styles.sectionTitle}>Favorites</h2>
            <ul className={styles.list}>
              {(showAllFavorites ? favorites : favorites.slice(0, 5)).map(
                (item) => (
                  <li key={item} className={styles.listItem}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => removeFromFavorites(item)}
                      aria-label="Remove from favorites"
                    >
                      <IconStar filled={true} />
                    </button>
                    <button
                      type="button"
                      className={styles.itemUrl}
                      onClick={() => handleFavoriteClick(item)}
                      title={item}
                    >
                      {getUrlLabel(item)}
                    </button>
                  </li>
                )
              )}
            </ul>
            {favorites.length > 5 && (
              <button
                type="button"
                className={styles.showAllBtn}
                onClick={() => setShowAllFavorites(!showAllFavorites)}
              >
                {showAllFavorites ? "Show less" : "Show all"}
              </button>
            )}
          </section>
        )}

        {isClient && history.length > 0 && (
          <section className={styles.history}>
            <h2 className={styles.sectionTitle}>History</h2>
            <ul className={styles.list}>
              {(showAllHistory ? history : history.slice(0, 5)).map((item) => {
                const isFavorite = favorites.includes(item);
                return (
                  <li key={item} className={styles.listItem}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() =>
                        isFavorite
                          ? removeFromFavorites(item)
                          : addToFavorites(item)
                      }
                      aria-label={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <IconStar filled={isFavorite} />
                    </button>
                    <button
                      type="button"
                      className={styles.itemUrl}
                      onClick={() => handleHistoryClick(item)}
                      title={item}
                    >
                      {getUrlLabel(item)}
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => removeFromHistory(item)}
                      aria-label="Remove from history"
                    >
                      <IconDelete />
                    </button>
                  </li>
                );
              })}
            </ul>
            {history.length > 5 && (
              <button
                type="button"
                className={styles.showAllBtn}
                onClick={() => setShowAllHistory(!showAllHistory)}
              >
                {showAllHistory ? "Show less" : "Show all"}
              </button>
            )}
          </section>
        )}
      </aside>
      <main className={styles.main}>
        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              <span className={styles.labelText}>URL</span>
              <div className={styles.inputRow}>
                <input
                  className={styles.input}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
                <button
                  className={styles.button}
                  type="submit"
                  disabled={loading}
                >
                  Check
                </button>
              </div>
            </label>

            <div className={styles.depsSection}>
              <span className={styles.labelText}>DEPENDENCIES (optional)</span>
              {dependencyUrls.map((val, i) => (
                <div key={i} className={styles.depInputRow}>
                  <input
                    className={styles.depInput}
                    type="text"
                    value={val}
                    onChange={(e) => setDependency(i, e.target.value)}
                    placeholder="https://api.example.com/..."
                  />
                  <button
                    type="button"
                    className={styles.removeDepBtn}
                    onClick={() => removeDependency(i)}
                    aria-label="Ukloni ovisnost"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={styles.addDepBtn}
                onClick={addDependency}
              >
                + Add dependency
              </button>
            </div>
          </form>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        {info && (
          <CheckResults
            info={info.main}
            dependencyResults={info.dependencyResults}
            guaranteedFreshSeconds={info.guaranteedFreshSeconds}
          />
        )}
      </main>
    </div>
  );
}
