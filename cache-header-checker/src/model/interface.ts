export interface Info {
  url: string;
  isCached: boolean | undefined;
  age: number | undefined;
  maxServerLifetime: number | undefined;
  maxBrowserLifetime: number | undefined;
  timeLeft: number | undefined;
}
