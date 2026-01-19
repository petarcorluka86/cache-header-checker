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
  const formattedMaxServerLifetime = formatDuration(info.maxServerLifetime);
  const formattedMaxBrowserLifetime = formatDuration(info.maxBrowserLifetime);
  const formattedGuaranteed = formatDuration(guaranteedFreshSeconds);

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

      {guaranteedFreshSeconds != null && (
        <>
          <div className={styles.divider} />
          <div className={styles.guaranteedFresh}>
            <span className={styles.guaranteedFreshLabel}>
              Za koliko istječe cache (ruta + ovisnosti):
            </span>{" "}
            {formattedGuaranteed
              ? `${formattedGuaranteed.minutes}m ${formattedGuaranteed.seconds}s`
              : "-"}
            <br />
            <span className={styles.guaranteedFreshSublabel}>
              Zadnji podaci sa servera nakon:{" "}
              {getExpirationTimestamp(guaranteedFreshSeconds)}
            </span>
          </div>
        </>
      )}

      {dependencyResults != null && dependencyResults.length > 0 && (
        <>
          <div className={styles.divider} />
          <h3 className={styles.depsTitle}>Ovisne rute</h3>
          <div className={styles.depsList}>
            {dependencyResults.map((dr, i) => (
              <div key={i} className={styles.depBlock}>
                <div className={styles.depUrl}>{dr.url}</div>
                {dr.error && (
                  <div className={styles.depError}>{dr.error}</div>
                )}
                {dr.info && (() => {
                  const fa = formatDuration(dr.info!.age);
                  const ft = formatDuration(dr.info!.timeLeft);
                  return (
                    <dl className={styles.depResultList}>
                      <div className={styles.resultRow}>
                        <dt>Is cached</dt>
                        <dd>{dr.info!.isCached ? "Yes" : "No"}</dd>
                      </div>
                      <div className={styles.resultRow}>
                        <dt>Age</dt>
                        <dd>{fa ? `${fa.minutes}m ${fa.seconds}s` : "-"}</dd>
                      </div>
                      <div className={styles.resultRow}>
                        <dt>Time left</dt>
                        <dd>{ft ? `${ft.minutes}m ${ft.seconds}s` : "-"}</dd>
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
