"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { Info } from "@/model";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [info, setInfo] = useState<Info | undefined>();
  const [error, setError] = useState<string | undefined>();

  const getInfo = async (inputUrl: string) => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setError("Please enter a URL.");
      setInfo(undefined);
      return;
    }

    setError(undefined);
    setInfo(undefined);

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
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>
          <label>
            URL:
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </label>
          <button type="button" onClick={() => getInfo(url)}>
            Check
          </button>
        </div>

        {error && <p>{error}</p>}

        {info && (
          <div>
            <h2>Result</h2>
            <ul>
              <li>URL: {info.url}</li>
              <li>Is cached: {info.isCached ? "yes" : "no"}</li>
              <li>Age: {info.age}s</li>
              <li>Max server lifetime: {info.maxServerLifetime}s</li>
              <li>Max browser lifetime: {info.maxBrowserLifetime}s</li>
              <li>Time left: {info.timeLeft}s</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
