"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { formSofascoreNewsFrontendUrl, Info } from "@/model";
import { CheckResults } from "@/ui/CheckResults";

const LANGUAGES = ["en", "it", "pt"];
const CATEGORIES = [
  "all",
  "football",
  "other-sports",
  "sofascore-editor",
  "fantasy",
  "business",
  "product",
];

export default function SofascoreNews() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
    if (!selectedLanguage && !selectedCategory) {
      setError("Please select a language or category.");
      return;
    }
    const language = selectedLanguage || "en";
    const category = selectedCategory || "all";
    const constructedUrl = formSofascoreNewsFrontendUrl(language, category);
    getInfo(constructedUrl);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <header className={styles.header}>
            <h1 className={styles.title}>
              Cache header checker for Sofascore News
            </h1>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.selectRow}>
              <label className={styles.label}>
                <span className={styles.labelText}>Language</span>
                <select
                  className={styles.select}
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="">Select language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                <span className={styles.labelText}>Category</span>
                <select
                  className={styles.select}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                type="submit"
                disabled={loading || (!selectedLanguage && !selectedCategory)}
              >
                Check
              </button>
            </div>
          </form>

          {error && <p className={styles.error}>{error}</p>}

          {info && <CheckResults info={info} />}
          {loading && <p className={styles.loading}>Loading...</p>}
        </div>
      </main>
    </div>
  );
}
