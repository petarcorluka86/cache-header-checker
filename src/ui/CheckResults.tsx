import {
  Info,
  DependencyResult,
  formatDuration,
  getExpirationTimestamp,
} from "@/model";
import styles from "./CheckResults.module.css";

interface CheckResultsProps {
  info: Info;
  dependencyResults?: DependencyResult[];
  guaranteedFreshSeconds?: number;
}

export function CheckResults({
  info,
  dependencyResults,
  guaranteedFreshSeconds,
}: CheckResultsProps) {
  const formattedAge = formatDuration(info.age);
  const formattedTimeLeft = formatDuration(info.timeLeft);
  const formattedGuaranteed = formatDuration(guaranteedFreshSeconds);

  return (
    <section className={styles.result}>
      {guaranteedFreshSeconds != null && (
        <>
          <div className={styles.guaranteedFresh}>
            <span className={styles.guaranteedFreshLabel}>
              In worst case scenario, current database state will be visible
              after {getExpirationTimestamp(guaranteedFreshSeconds)}:
            </span>{" "}
            <br />
            <span className={styles.guaranteedFreshSublabel}>
              {formattedGuaranteed
                ? `${formattedGuaranteed.minutes}m ${formattedGuaranteed.seconds}s`
                : "-"}
            </span>
          </div>
        </>
      )}
      <h2 className={styles.depsTitle}>MAIN URL</h2>
      <div className={styles.depBlock}>
        <div className={styles.depUrl}>{info.url}</div>
        <dl className={styles.depResultList}>
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
        </dl>
      </div>
      {dependencyResults != null && dependencyResults.length > 0 && (
        <>
          <h3 className={styles.depsTitle}>DEPENDENCIES</h3>
          <div className={styles.depsList}>
            {dependencyResults.map((dr, i) => (
              <div key={i} className={styles.depBlock}>
                <div className={styles.depUrl}>{dr.url}</div>
                {dr.error && <div className={styles.depError}>{dr.error}</div>}
                {dr.info &&
                  (() => {
                    const fa = formatDuration(dr.info!.age);
                    const ft = formatDuration(dr.info!.timeLeft);
                    return (
                      <dl className={styles.depResultList}>
                        <div className={styles.resultRow}>
                          <dt>Age</dt>
                          <dd>{fa ? `${fa.minutes}m ${fa.seconds}s` : "-"}</dd>
                        </div>
                        <div className={styles.resultRow}>
                          <dt>Time left</dt>
                          <dd>{ft ? `${ft.minutes}m ${ft.seconds}s` : "-"}</dd>
                        </div>
                        <div className={styles.resultRow}>
                          <dt>Expires at</dt>
                          <dd>{getExpirationTimestamp(dr.info!.timeLeft)}</dd>
                        </div>
                      </dl>
                    );
                  })()}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
