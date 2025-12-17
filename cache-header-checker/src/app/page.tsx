"use client";
import { useState } from "react";
import styles from "./page.module.css";

interface Info {
  url: string;
  isCached: boolean;
  age: number;
  maxServerLifetime: number;
  maxBrowserLifetime: number;
  timeLeft: number;
}

export default function Home() {
  const [info, setInfo] = useState<Info | undefined>();

  const getInfo = async (url: string) => {
    const response = await fetch(`/api/info?url=${url}`);
    const data = await response.json();
    setInfo(data);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>Test</main>
    </div>
  );
}
