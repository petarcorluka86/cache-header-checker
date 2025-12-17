import { Info, formatDuration, getExpirationTimestamp } from "@/model";
import styles from "./CheckResults.module.css";

interface CheckResultsProps {
  info: Info;
}

export function CheckResults({ info }: CheckResultsProps) {
  return (
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
        <div className={styles.divider} />
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
        <div className={styles.divider} />
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
  );
}
