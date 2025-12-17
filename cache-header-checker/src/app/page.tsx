"use client";
import { useState } from "react";
import styles from "./page.module.css";
import {
  formatDuration,
  getExpirationTimestamp,
  Info,
  useIsClient,
} from "@/model";
import { useHistory } from "@/model/useHistory";
import { useFavorites } from "@/model/useFavorites";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [info, setInfo] = useState<Info | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const { history, pushToHistory, removeFromHistory } = useHistory();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const isClient = useIsClient();
  const getInfo = async (inputUrl: string) => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setError("Please enter a URL.");
      setInfo(undefined);
      return;
    }

    setError(undefined);
    setInfo(undefined);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/info?url=${encodeURIComponent(trimmed)}`
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data?.error ?? "Failed to fetch info.");
        return;
      }

      const data: Info = await response.json();
      setInfo(data);
      pushToHistory(data.url ?? trimmed);
    } catch (err) {
      console.error(err);
      setError("Unexpected error while fetching info.");
      setInfo(undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getInfo(url);
  };

  const handleHistoryClick = (itemUrl: string) => {
    setUrl(itemUrl);
    getInfo(itemUrl);
  };

  const handleFavoriteClick = (itemUrl: string) => {
    setUrl(itemUrl);
    getInfo(itemUrl);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <header className={styles.header}>
            <h1 className={styles.title}>Cache header checker</h1>
            <p className={styles.subtitle}>
              Enter a URL and see basic cache information returned by the API.
            </p>
          </header>

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
          </form>

          {error && <p className={styles.error}>{error}</p>}

          {info && (
            <section className={styles.result}>
              <h2 className={styles.resultTitle}>Result</h2>
              <dl className={styles.resultList}>
                <div className={styles.resultRow}>
                  <dt>URL</dt>
                  <dd>{info.url}</dd>
                </div>
                <div className={styles.resultRow}>
                  <dt>Is cached</dt>
                  <dd>{info.isCached ? "Yes" : "No"}</dd>
                </div>
                <div
                  style={{ borderTop: "1px solid #4b5563", margin: "10px 0" }}
                />
                <div className={styles.resultRow}>
                  <dt>Age</dt>
                  <dd>
                    {formatDuration(info.age).minutes}m{" "}
                    {formatDuration(info.age).seconds}s
                  </dd>
                </div>
                <div className={styles.resultRow}>
                  <dt>Time left</dt>
                  <dd>
                    {formatDuration(info.timeLeft).minutes}m{" "}
                    {formatDuration(info.timeLeft).seconds}s
                  </dd>
                </div>
                <div className={styles.resultRow}>
                  <dt>Expires at</dt>
                  <dd>{getExpirationTimestamp(info.timeLeft)}</dd>
                </div>
                <div
                  style={{ borderTop: "1px solid #4b5563", margin: "10px 0" }}
                />
                <div className={styles.resultRow}>
                  <dt>Max server lifetime</dt>
                  <dd>
                    {formatDuration(info.maxServerLifetime).minutes}m{" "}
                    {formatDuration(info.maxServerLifetime).seconds}s
                  </dd>
                </div>
                <div className={styles.resultRow}>
                  <dt>Max browser lifetime</dt>
                  <dd>
                    {formatDuration(info.maxBrowserLifetime).minutes}m{" "}
                    {formatDuration(info.maxBrowserLifetime).seconds}s
                  </dd>
                </div>
              </dl>
            </section>
          )}
        </div>

        {isClient && favorites.length > 0 && (
          <section className={styles.favorites}>
            <h2 className={styles.sectionTitle}>Favorites</h2>
            <ul className={styles.list}>
              {favorites.map((item) => (
                <li key={item} className={styles.listItem}>
                  <button
                    type="button"
                    className={styles.itemUrl}
                    onClick={() => handleFavoriteClick(item)}
                  >
                    {item}
                  </button>
                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => removeFromFavorites(item)}
                      aria-label="Remove from favorites"
                    >
                      ✘
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {isClient && history.length > 0 && (
          <section className={styles.history}>
            <h2 className={styles.sectionTitle}>History</h2>
            <ul className={styles.list}>
              {history.map((item) => {
                const isFavorite = favorites.includes(item);
                return (
                  <li key={item} className={styles.listItem}>
                    <button
                      type="button"
                      className={styles.itemUrl}
                      onClick={() => handleHistoryClick(item)}
                    >
                      {item}
                    </button>
                    <div className={styles.itemActions}>
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
                        {isFavorite ? "★" : "☆"}
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => removeFromHistory(item)}
                        aria-label="Remove from history"
                      >
                        ✘
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
