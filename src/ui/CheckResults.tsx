import { Info, formatDuration, getExpirationTimestamp } from "@/model";
import styles from "./CheckResults.module.css";

interface CheckResultsProps {
  info: Info;
}

export function CheckResults({ info }: CheckResultsProps) {
  const formattedAge = formatDuration(info.age);
  const formattedTimeLeft = formatDuration(info.timeLeft);
  const formattedMaxServerLifetime = formatDuration(info.maxServerLifetime);
  const formattedMaxBrowserLifetime = formatDuration(info.maxBrowserLifetime);

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
            {formattedAge
              ? `${formattedAge.minutes}m ${formattedAge.seconds}s`
              : "-"}
          </dd>
        </div>
        <div className={styles.resultRow}>
          <dt>Time left</dt>
          <dd>
            {formattedTimeLeft
              ? `${formattedTimeLeft.minutes}m ${formattedTimeLeft.seconds}s`
              : "-"}
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
            {formattedMaxServerLifetime
              ? `${formattedMaxServerLifetime.minutes}m ${formattedMaxServerLifetime.seconds}s`
              : "-"}
          </dd>
        </div>
        <div className={styles.resultRow}>
          <dt>Max browser lifetime</dt>
          <dd>
            {formattedMaxBrowserLifetime
              ? `${formattedMaxBrowserLifetime.minutes}m ${formattedMaxBrowserLifetime.seconds}s`
              : "-"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
