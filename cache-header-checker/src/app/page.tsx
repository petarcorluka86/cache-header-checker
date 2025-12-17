"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { Info } from "@/model";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [info, setInfo] = useState<Info | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

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
    void getInfo(url);
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
                <div className={styles.resultRow}>
                  <dt>Age</dt>
                  <dd>{info.age} s</dd>
                </div>
                <div className={styles.resultRow}>
                  <dt>Max server lifetime</dt>
                  <dd>{info.maxServerLifetime} s</dd>
                </div>
                <div className={styles.resultRow}>
                  <dt>Max browser lifetime</dt>
                  <dd>{info.maxBrowserLifetime} s</dd>
                </div>
                <div className={styles.resultRow}>
                  <dt>Time left</dt>
                  <dd>{info.timeLeft} s</dd>
                </div>
              </dl>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
