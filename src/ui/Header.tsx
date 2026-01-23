"use client";
import styles from "./Header.module.css";

export function Header() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className={styles.header} onClick={scrollToTop}>
      <div className={styles.headerContent}>
        <img
          src="/favicon.ico"
          alt="Cache header checker"
          className={styles.icon}
        />
        <h1 className={styles.title}>Cache header checker</h1>
      </div>
    </header>
  );
}
